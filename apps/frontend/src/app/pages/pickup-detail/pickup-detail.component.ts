import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCheckCircle2,
  lucideClock3,
  lucideCoins,
  lucideImage,
  lucideLoaderCircle,
  lucideMapPin,
  lucideNavigation,
  lucidePackage,
  lucidePackageCheck,
  lucideScale,
  lucideSparkles,
  lucideTruck,
  lucideUser,
  lucideXCircle,
} from '@ng-icons/lucide';
import { AdminPickupService } from '@/services/admin-pickup.service';
import { CollectorPickupService, type CollectorLocation, type CollectorPickupScope } from '@/services/collector-pickup.service';
import { PickupRequestService } from '@/services/pickup-request.service';
import { AppHeaderComponent } from '@/ui/header/header.component';
import { FetchStateComponent } from '@/ui/fetch-state/fetch-state.component';
import { ZardDialogService } from '@/ui/zard/dialog/dialog.service';
import { PickupStatus, type AdminPickupRequest, type CollectorPickupRequest, type PickupItem, type PickupRequestWithDetails } from '@wastegrab/shared';
import { firstValueFrom, map } from 'rxjs';

type PickupDetailContext = 'admin' | 'collector' | 'customer';
type PickupDetail = PickupRequestWithDetails | AdminPickupRequest | CollectorPickupRequest;
type TimelineStepState = 'completed' | 'current' | 'upcoming' | 'cancelled';
type TimelineStep = {
  status: PickupStatus;
  label: string;
  description: string;
  icon: string;
  state: TimelineStepState;
  time: string;
};
type AiSuggestedPayload = {
  items: Array<{
    categoryId: string;
    estimatedWeight: number | string | null;
  }>;
};

const PICKUP_STATUS_FLOW = [
  PickupStatus.PENDING,
  PickupStatus.ACCEPTED,
  PickupStatus.ARRIVED,
  PickupStatus.VERIFIED,
  PickupStatus.COMPLETED,
] as const;

@Component({
  selector: 'app-pickup-detail-page',
  templateUrl: './pickup-detail.html',
  imports: [CommonModule, AppHeaderComponent, FetchStateComponent, RouterLink, NgIcon],
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideCheckCircle2,
      lucideClock3,
      lucideCoins,
      lucideImage,
      lucideLoaderCircle,
      lucideMapPin,
      lucideNavigation,
      lucidePackage,
      lucidePackageCheck,
      lucideScale,
      lucideSparkles,
      lucideTruck,
      lucideUser,
      lucideXCircle,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickupDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly adminPickups = inject(AdminPickupService);
  private readonly collectorPickups = inject(CollectorPickupService);
  private readonly customerPickups = inject(PickupRequestService);
  private readonly dialogService = inject(ZardDialogService);

  protected readonly pickup = signal<PickupDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly isCancelling = signal(false);
  protected readonly context = this.readContext();
  protected readonly pickupScope = this.readPickupScope();

  protected readonly pickupId = toSignal(
    this.route.paramMap.pipe(map((paramMap) => paramMap.get('pickupId') ?? '')),
    { initialValue: '' },
  );

  protected readonly pageTitle = computed(() => {
    const pickup = this.pickup();
    return pickup ? `#${this.shortId(pickup.id)}` : 'Pickup Details';
  });
  protected readonly backRoute = computed(() => {
    if (this.context === 'customer') {
      return '/customer/pickups';
    }

    if (this.context === 'admin') {
      return '/admin/pickups';
    }

    return this.pickupScope === 'my' ? '/collector/my-pickups' : '/collector/pickups';
  });
  protected readonly backLabel = computed(() => {
    if (this.context === 'customer') {
      return 'Back to My Pickups';
    }

    return this.context === 'admin' ? 'Back to Pickups' : 'Back to Collector Pickups';
  });
  protected readonly totalWeight = computed(() => {
    const pickup = this.pickup();
    return pickup ? this.requestWeight(pickup) : 0;
  });
  protected readonly totalPoints = computed(() => {
    const pickup = this.pickup();
    return pickup ? this.potentialPoints(pickup) : 0;
  });
  protected readonly timelineSteps = computed<TimelineStep[]>(() => {
    const pickup = this.pickup();
    if (!pickup) {
      return [];
    }

    if (pickup.status === PickupStatus.CANCELLED) {
      return [
        this.timelineStep(PickupStatus.PENDING, 'completed', pickup.createdAt),
        this.timelineStep(PickupStatus.CANCELLED, 'cancelled', pickup.completedAt),
      ];
    }

    const currentIndex = PICKUP_STATUS_FLOW.indexOf(pickup.status);
    const normalizedIndex = currentIndex === -1 ? 0 : currentIndex;

    return PICKUP_STATUS_FLOW.map((status, index) => {
      const state: TimelineStepState =
        index < normalizedIndex
          ? 'completed'
          : index === normalizedIndex
            ? 'current'
            : 'upcoming';

      return this.timelineStep(
        status,
        state,
        status === PickupStatus.PENDING ? pickup.createdAt : status === PickupStatus.COMPLETED ? pickup.completedAt : null,
      );
    });
  });
  protected readonly timelineProgress = computed(() => {
    const steps = this.timelineSteps();
    if (steps.length <= 1) {
      return 100;
    }

    const currentIndex = steps.findIndex((step) => step.state === 'current' || step.state === 'cancelled');
    const safeIndex = currentIndex === -1 ? steps.length - 1 : currentIndex;

    return (safeIndex / (steps.length - 1)) * 100;
  });
  protected readonly timelineProgressWidth = computed(() => `calc((100% - 2.5rem) * ${this.timelineProgress() / 100})`);
  protected readonly timelineGridClass = computed(() => this.timelineSteps().length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-5');

  constructor() {
    void this.loadPickup();
  }

  protected shortId(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }

  protected formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  protected statusLabel(status: PickupStatus): string {
    return this.statusMeta(status).label;
  }

  protected statusClass(status: PickupStatus): string {
    return this.statusMeta(status).className;
  }

  protected statusIcon(status: PickupStatus): string {
    return this.statusMeta(status).icon;
  }

  protected categoryLabel(pickup: PickupDetail): string {
    return pickup.aiClassificationLabel || `${pickup.items.length} waste item${pickup.items.length === 1 ? '' : 's'}`;
  }

  protected itemLabel(item: PickupItem): string {
    return item.category?.name ?? item.categoryId;
  }

  protected itemWeight(item: PickupItem): number {
    return Number(item.actualWeight ?? item.estimatedWeight ?? 0);
  }

  protected estimatedWeight(item: PickupItem): number {
    return Number(item.estimatedWeight ?? 0);
  }

  protected verifiedWeight(item: PickupItem): number | null {
    return item.actualWeight === null ? null : Number(item.actualWeight);
  }

  protected itemPoints(item: PickupItem): number {
    return Math.round(this.itemWeight(item) * (item.category?.pointsPerKg ?? 0));
  }

  protected estimatedPoints(item: PickupItem): number {
    return Math.round(this.estimatedWeight(item) * (item.category?.pointsPerKg ?? 0));
  }

  protected verifiedPoints(item: PickupItem): number | null {
    const weight = this.verifiedWeight(item);
    return weight === null ? null : Math.round(weight * (item.category?.pointsPerKg ?? 0));
  }

  protected estimateSourceLabel(item: PickupItem): string {
    return this.isAiEstimate(item) ? 'AI estimate' : 'Customer estimate';
  }

  protected isAiEstimate(item: PickupItem): boolean {
    const payload = this.pickup()?.aiSuggestedPayload;
    if (!this.hasAiSuggestionItems(payload)) {
      return false;
    }

    const itemWeight = this.roundWeight(item.estimatedWeight);
    return payload.items.some(
      (suggestion) =>
        suggestion.categoryId === item.categoryId &&
        this.roundWeight(suggestion.estimatedWeight) === itemWeight,
    );
  }

  protected distanceLabel(pickup: PickupDetail): string {
    if (!('distanceKm' in pickup) || pickup.distanceKm === null) {
      return '-';
    }

    return `${pickup.distanceKm} km`;
  }

  protected customerName(pickup: PickupDetail): string {
    return 'user' in pickup ? pickup.user.name : 'You';
  }

  protected customerEmail(pickup: PickupDetail): string {
    return 'user' in pickup ? pickup.user.email : '-';
  }

  protected collectorName(pickup: PickupDetail): string {
    return 'collector' in pickup ? pickup.collector?.name ?? '-' : '-';
  }

  protected collectorEmail(pickup: PickupDetail): string {
    return 'collector' in pickup ? pickup.collector?.email ?? 'Unassigned' : 'Unassigned';
  }

  protected showDistance(pickup: PickupDetail): boolean {
    return 'distanceKm' in pickup;
  }

  protected showCategoryId(): boolean {
    return this.context === 'admin';
  }

  protected timelineDotClass(step: TimelineStep): string {
    if (step.state === 'cancelled') {
      return 'border-rose-500 bg-rose-500 text-white';
    }

    if (step.state === 'completed') {
      return 'border-emerald-500 bg-emerald-500 text-white';
    }

    if (step.state === 'current') {
      return 'border-primary bg-primary text-primary-foreground';
    }

    return 'border-border bg-background text-muted-foreground';
  }

  protected timelineTextClass(step: TimelineStep): string {
    if (step.state === 'cancelled') {
      return 'text-rose-700';
    }

    if (step.state === 'upcoming') {
      return 'text-muted-foreground';
    }

    return 'text-foreground';
  }

  protected canCancelPickup(): boolean {
    const pickup = this.pickup();
    return Boolean(
      this.context === 'customer' &&
        pickup &&
        [PickupStatus.PENDING, PickupStatus.ACCEPTED].includes(pickup.status) &&
        !this.isCancelling(),
    );
  }

  protected confirmCancelPickup(): void {
    if (!this.canCancelPickup()) {
      return;
    }

    this.dialogService.create({
      zTitle: 'Cancel pickup request',
      zDescription: 'Are you sure you want to cancel this pickup request? You can create a new request after cancellation.',
      zOkText: 'Cancel Request',
      zOkDestructive: true,
      zCancelText: 'Keep Request',
      zWidth: 'max-w-md',
      zOnOk: () => {
        void this.cancelPickup();
      },
    });
  }

  private async loadPickup(): Promise<void> {
    const id = this.pickupId();
    this.isLoading.set(true);
    this.loadError.set('');

    if (!id) {
      this.pickup.set(null);
      this.loadError.set('Pickup not found.');
      this.isLoading.set(false);
      return;
    }

    try {
      const response = await this.fetchPickup(id);
      this.pickup.set(response.pickupRequest);
    } catch {
      this.pickup.set(null);
      this.loadError.set('Unable to load pickup details.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async fetchPickup(id: string) {
    if (this.context === 'customer') {
      return firstValueFrom(this.customerPickups.getPickupRequest(id));
    }

    if (this.context === 'admin') {
      return firstValueFrom(this.adminPickups.getPickup(id));
    }

    const location = await this.requestCollectorLocation();
    return firstValueFrom(this.collectorPickups.getPickup(id, { location }));
  }

  private async requestCollectorLocation(): Promise<CollectorLocation | null> {
    if (this.context !== 'collector' || !('geolocation' in navigator)) {
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          maximumAge: 60_000,
          timeout: 5_000,
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      return null;
    }
  }

  private async cancelPickup(): Promise<void> {
    const id = this.pickupId();
    if (!id) {
      return;
    }

    this.isCancelling.set(true);
    try {
      const response = await firstValueFrom(this.customerPickups.cancelPickupRequest(id));
      this.pickup.set(response.pickupRequest);
    } catch {
      this.dialogService.create({
        zTitle: 'Unable to cancel',
        zDescription: 'The pickup request could not be cancelled. Please try again.',
        zOkText: 'OK',
        zCancelText: null,
        zWidth: 'max-w-sm',
      });
    } finally {
      this.isCancelling.set(false);
    }
  }

  private requestWeight(pickup: PickupDetail): number {
    return pickup.items.reduce((total, item) => total + this.itemWeight(item), 0);
  }

  private potentialPoints(pickup: PickupDetail): number {
    return pickup.items.reduce((total, item) => total + this.itemPoints(item), 0);
  }

  private timelineStep(status: PickupStatus, state: TimelineStepState, time: string | null): TimelineStep {
    const meta = this.statusMeta(status);

    return {
      status,
      label: meta.label,
      description: this.timelineDescription(status),
      icon: meta.icon,
      state,
      time: time ? this.formatDate(time) : '-',
    };
  }

  private timelineDescription(status: PickupStatus): string {
    switch (status) {
      case PickupStatus.PENDING:
        return 'Pickup request submitted.';
      case PickupStatus.ACCEPTED:
        return 'Collector assigned to the pickup.';
      case PickupStatus.ARRIVED:
        return 'Collector arrived at pickup location.';
      case PickupStatus.VERIFIED:
        return 'Waste items verified.';
      case PickupStatus.COMPLETED:
        return 'Pickup completed and points finalized.';
      case PickupStatus.CANCELLED:
        return 'Pickup request cancelled.';
    }
  }

  private hasAiSuggestionItems(value: unknown): value is AiSuggestedPayload {
    return (
      typeof value === 'object' &&
      value !== null &&
      Array.isArray((value as { items?: unknown }).items)
    );
  }

  private roundWeight(value: number | string | null): number {
    return Number(Number(value ?? 0).toFixed(2));
  }

  private readContext(): PickupDetailContext {
    if (this.route.snapshot.data['pickupContext'] === 'customer') {
      return 'customer';
    }

    return this.route.snapshot.data['pickupContext'] === 'collector' ? 'collector' : 'admin';
  }

  private readPickupScope(): CollectorPickupScope {
    return this.route.snapshot.data['pickupScope'] === 'my' ? 'my' : 'available';
  }

  private statusMeta(status: PickupStatus): { label: string; className: string; icon: string } {
    switch (status) {
      case PickupStatus.PENDING:
        return { label: 'Pending', className: 'bg-amber-100 text-amber-700', icon: 'lucideClock3' };
      case PickupStatus.ACCEPTED:
        return { label: 'Accepted', className: 'bg-blue-100 text-blue-700', icon: 'lucideTruck' };
      case PickupStatus.ARRIVED:
        return { label: 'Arrived', className: 'bg-violet-100 text-violet-700', icon: 'lucideMapPin' };
      case PickupStatus.VERIFIED:
        return { label: 'Verified', className: 'bg-cyan-100 text-cyan-700', icon: 'lucideCheckCircle2' };
      case PickupStatus.COMPLETED:
        return { label: 'Completed', className: 'bg-emerald-100 text-emerald-700', icon: 'lucidePackageCheck' };
      case PickupStatus.CANCELLED:
        return { label: 'Cancelled', className: 'bg-rose-100 text-rose-700', icon: 'lucideXCircle' };
      default:
        return { label: status, className: 'bg-slate-100 text-slate-700', icon: 'lucideLoaderCircle' };
    }
  }
}
