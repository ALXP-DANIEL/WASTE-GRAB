import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { AuthService } from '@/services/auth.service';
import { PickupRequestService } from '@/services/pickup-request.service';
import { AppHeaderComponent } from '@/ui/header/header.component';
import { FetchStateComponent } from '@/ui/fetch-state/fetch-state.component';
import { RouteMapComponent, type RouteMapPoint, type RouteMapStop } from '@/ui/route-map/route-map.component';
import { ZardDialogService } from '@/ui/zard/dialog/dialog.service';
import { Z_MODAL_DATA } from '@/ui/zard/dialog/dialog.service';
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
type AcceptPickupDialogData = {
  pickup: PickupDetail;
  origin: CollectorLocation;
  stops: AcceptPickupRouteStop[];
  title: string;
  category: string;
  distance: string;
  weight: string;
  points: number;
  routeUrl: string;
};
type AcceptPickupRouteStop = {
  id: string;
  title: string;
  addressText: string;
  latitude: string;
  longitude: string;
  distanceKm: string | null;
  isCandidate: boolean;
};

const PICKUP_STATUS_FLOW = [
  PickupStatus.PENDING,
  PickupStatus.ACCEPTED,
  PickupStatus.ARRIVED,
  PickupStatus.VERIFIED,
  PickupStatus.COMPLETED,
] as const;

@Component({
  selector: 'app-accept-pickup-dialog',
  imports: [CommonModule, NgIcon, RouteMapComponent],
  template: `
    <div class="grid gap-4">
      <div class="overflow-hidden rounded-lg border border-border">
        <app-route-map
          class="block h-64"
          [origin]="data.origin"
          [stops]="routeStops()"
        />
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-border bg-background p-3">
          <p class="text-xs text-muted-foreground">Pickup</p>
          <p class="mt-1 font-semibold">{{ data.title }}</p>
        </div>
        <div class="rounded-lg border border-border bg-background p-3">
          <p class="text-xs text-muted-foreground">Distance</p>
          <p class="mt-1 font-semibold">{{ data.distance }}</p>
        </div>
        <div class="rounded-lg border border-border bg-background p-3">
          <p class="text-xs text-muted-foreground">Estimated weight</p>
          <p class="mt-1 font-semibold">{{ data.weight }}</p>
        </div>
        <div class="rounded-lg border border-border bg-background p-3">
          <p class="text-xs text-muted-foreground">Potential points</p>
          <p class="mt-1 font-semibold">{{ data.points }} pts</p>
        </div>
      </div>

      <div class="rounded-lg border border-border bg-background p-3">
        <p class="text-xs text-muted-foreground">Customer address</p>
        <p class="mt-1 text-sm font-semibold">{{ data.pickup.addressText }}</p>
      </div>

      <div class="rounded-lg border border-border bg-background p-3">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-semibold">Route stops</p>
          <p class="text-xs text-muted-foreground">{{ data.stops.length }} stop{{ data.stops.length === 1 ? '' : 's' }}</p>
        </div>
        <div class="mt-3 grid max-h-40 gap-2 overflow-y-auto pr-1">
          @for (stop of data.stops; track stop.id; let index = $index) {
          <div class="flex gap-3 rounded-md border border-border bg-card p-2">
            <span class="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              {{ stopLabel(index) }}
            </span>
            <span class="min-w-0">
              <span class="block truncate text-sm font-semibold">
                {{ stop.title }}
                @if (stop.isCandidate) {
                <span class="text-primary"> · new</span>
                }
              </span>
              <span class="block truncate text-xs text-muted-foreground">{{ stop.addressText }}</span>
            </span>
          </div>
          }
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-muted-foreground">Confirm only after the full stop route looks right.</p>
        <a
          [href]="data.routeUrl"
          target="_blank"
          rel="noreferrer"
          class="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-semibold transition-colors hover:bg-muted"
        >
          <ng-icon name="lucideNavigation" class="size-4!" />
          Open route
        </a>
      </div>
    </div>
  `,
  viewProviders: [provideIcons({ lucideNavigation })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcceptPickupDialogComponent {
  protected readonly data = inject<AcceptPickupDialogData>(Z_MODAL_DATA);

  protected routeStops(): RouteMapStop[] {
    return this.data.stops.map((stop, index) => ({
      ...stop,
      label: this.stopLabel(index),
      title: `${stop.title}${stop.isCandidate ? ' · new' : ''}`,
      subtitle: stop.addressText,
    }));
  }

  protected stopLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }
}

@Component({
  selector: 'app-pickup-detail-page',
  templateUrl: './pickup-detail.html',
  imports: [CommonModule, FormsModule, AppHeaderComponent, FetchStateComponent, RouterLink, NgIcon, RouteMapComponent],
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
  private readonly auth = inject(AuthService);
  private readonly dialogService = inject(ZardDialogService);

  protected readonly pickup = signal<PickupDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly isCancelling = signal(false);
  protected readonly isCollectorActionRunning = signal(false);
  protected readonly isPreparingAcceptRoute = signal(false);
  protected readonly collectorActionError = signal('');
  protected readonly verificationWeights = signal<Record<string, number | null>>({});
  protected readonly collectorLocation = signal<CollectorLocation | null>(null);
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
  protected readonly currentCollectorId = computed(() => this.auth.currentUser()?.id ?? null);
  protected readonly isCollectorDetail = computed(() => this.context === 'collector');
  protected readonly isAssignedToCurrentCollector = computed(() => {
    const pickup = this.pickup();
    const collectorId = this.currentCollectorId();
    return Boolean(pickup && collectorId && pickup.collectorId === collectorId);
  });
  protected readonly canAcceptPickup = computed(() => {
    const pickup = this.pickup();
    return Boolean(this.isCollectorDetail() && pickup?.status === PickupStatus.PENDING && pickup.collectorId === null && !this.isCollectorActionRunning());
  });
  protected readonly canMarkArrived = computed(() => {
    const pickup = this.pickup();
    return Boolean(this.isCollectorDetail() && this.isAssignedToCurrentCollector() && pickup?.status === PickupStatus.ACCEPTED && !this.isCollectorActionRunning());
  });
  protected readonly canVerifyPickup = computed(() => {
    const pickup = this.pickup();
    return Boolean(this.isCollectorDetail() && this.isAssignedToCurrentCollector() && pickup?.status === PickupStatus.ARRIVED && !this.isCollectorActionRunning());
  });
  protected readonly canCompletePickup = computed(() => {
    const pickup = this.pickup();
    return Boolean(this.isCollectorDetail() && this.isAssignedToCurrentCollector() && pickup?.status === PickupStatus.VERIFIED && !this.isCollectorActionRunning());
  });

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

  protected verificationWeight(item: PickupItem): number | null {
    return this.verificationWeights()[item.id] ?? null;
  }

  protected setVerificationWeight(itemId: string, value: number | string | null): void {
    const parsed = value === null || value === '' ? null : Number(value);
    this.verificationWeights.update((weights) => ({
      ...weights,
      [itemId]: Number.isFinite(parsed) && parsed !== null ? parsed : null,
    }));
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

  protected routeUrl(pickup: PickupDetail): string | null {
    const origin = this.routeOrigin(pickup);
    if (!pickup.latitude || !pickup.longitude || !origin) {
      return null;
    }

    const destination = `${pickup.latitude},${pickup.longitude}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${origin.latitude},${origin.longitude}`)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  }

  protected routeMapOrigin(pickup: PickupDetail): RouteMapPoint | null {
    return this.routeOrigin(pickup);
  }

  protected routeMapStops(pickup: PickupDetail): RouteMapStop[] {
    if (!pickup.latitude || !pickup.longitude) {
      return [];
    }

    return [{
      label: 'A',
      title: `#${this.shortId(pickup.id)}`,
      subtitle: pickup.addressText,
      latitude: pickup.latitude,
      longitude: pickup.longitude,
    }];
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

  protected acceptPickup(): void {
    void this.confirmAcceptPickup();
  }

  protected markArrived(): void {
    void this.runCollectorAction(() => this.collectorPickups.markArrived(this.pickupId()));
  }

  protected verifyPickup(): void {
    const pickup = this.pickup();
    if (!pickup) {
      return;
    }

    const items = pickup.items.map((item) => ({
      itemId: item.id,
      actualWeight: Number(this.verificationWeight(item)),
    }));

    if (items.some((item) => !Number.isFinite(item.actualWeight) || item.actualWeight <= 0)) {
      this.collectorActionError.set('Enter a verified weight for every item.');
      return;
    }

    void this.runCollectorAction(() => this.collectorPickups.verifyPickup(this.pickupId(), items));
  }

  protected completePickup(): void {
    void this.runCollectorAction(() => this.collectorPickups.completePickup(this.pickupId()));
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
      this.setPickup(response.pickupRequest);
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

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      this.collectorLocation.set(location);
      return location;
    } catch {
      return null;
    }
  }

  private async confirmAcceptPickup(): Promise<void> {
    const pickup = this.pickup();
    this.collectorActionError.set('');

    if (!pickup || !pickup.latitude || !pickup.longitude) {
      this.dialogService.create({
        zTitle: 'Route unavailable',
        zDescription: 'This pickup does not have a saved pickup location, so it cannot be accepted yet.',
        zOkText: 'OK',
        zCancelText: null,
        zWidth: 'max-w-sm',
      });
      return;
    }

    this.isPreparingAcceptRoute.set(true);
    try {
      const location = this.collectorLocation() ?? await this.requestCollectorLocation();
      if (!location) {
        this.dialogService.create({
          zTitle: 'Location required',
          zDescription: 'Allow location access first so you can check the route before accepting this pickup.',
          zOkText: 'OK',
          zCancelText: null,
          zWidth: 'max-w-sm',
        });
        return;
      }

      const stops = await this.acceptanceRouteStops(pickup, location);
      this.dialogService.create<AcceptPickupDialogComponent, AcceptPickupDialogData>({
        zTitle: 'Review route before accepting',
        zDescription: 'Check your active stops and this pickup before claiming the order.',
        zContent: AcceptPickupDialogComponent,
        zData: {
          pickup,
          origin: location,
          stops,
          title: `#${this.shortId(pickup.id)}`,
          category: this.categoryLabel(pickup),
          distance: this.distanceLabel(pickup),
          weight: `${this.requestWeight(pickup).toFixed(2)} kg`,
          points: this.potentialPoints(pickup),
          routeUrl: this.routeUrlForStops(location, stops),
        },
        zOkText: 'Accept Pickup',
        zCancelText: 'Review More',
        zWidth: 'min(44rem, calc(100vw - 2rem))',
        zOnOk: () => {
          void this.runCollectorAction(() => this.collectorPickups.acceptPickup(this.pickupId()));
        },
      });
    } finally {
      this.isPreparingAcceptRoute.set(false);
    }
  }

  private async acceptanceRouteStops(pickup: PickupDetail, location: CollectorLocation): Promise<AcceptPickupRouteStop[]> {
    const candidate = this.toAcceptPickupRouteStop(pickup, true);
    let assignedStops: AcceptPickupRouteStop[] = [];

    try {
      const response = await firstValueFrom(this.collectorPickups.listPickups({
        location,
        scope: 'my',
      }));
      assignedStops = response.pickupRequests
        .filter((assignedPickup) =>
          assignedPickup.id !== pickup.id &&
          this.isActivePickupStatus(assignedPickup.status) &&
          Boolean(assignedPickup.latitude && assignedPickup.longitude),
        )
        .map((assignedPickup) => this.toAcceptPickupRouteStop(assignedPickup, false));
    } catch {
      assignedStops = [];
    }

    return [...assignedStops, candidate].sort((a, b) => this.routeStopSortValue(a) - this.routeStopSortValue(b));
  }

  private toAcceptPickupRouteStop(pickup: PickupDetail, isCandidate: boolean): AcceptPickupRouteStop {
    return {
      id: pickup.id,
      title: `#${this.shortId(pickup.id)}`,
      addressText: pickup.addressText,
      latitude: String(pickup.latitude),
      longitude: String(pickup.longitude),
      distanceKm: 'distanceKm' in pickup ? pickup.distanceKm : null,
      isCandidate,
    };
  }

  private routeUrlForStops(origin: CollectorLocation, stops: AcceptPickupRouteStop[]): string {
    const destinationStop = stops[stops.length - 1];
    const waypoints = stops
      .slice(0, -1)
      .map((stop) => `${stop.latitude},${stop.longitude}`)
      .join('|');
    const waypointParam = waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : '';

    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${origin.latitude},${origin.longitude}`)}&destination=${encodeURIComponent(`${destinationStop.latitude},${destinationStop.longitude}`)}${waypointParam}&travelmode=driving`;
  }

  private routeStopSortValue(stop: AcceptPickupRouteStop): number {
    return stop.distanceKm === null ? Number.POSITIVE_INFINITY : Number(stop.distanceKm);
  }

  private isActivePickupStatus(status: PickupStatus): boolean {
    return ![PickupStatus.COMPLETED, PickupStatus.CANCELLED].includes(status);
  }

  private async cancelPickup(): Promise<void> {
    const id = this.pickupId();
    if (!id) {
      return;
    }

    this.isCancelling.set(true);
    try {
      const response = await firstValueFrom(this.customerPickups.cancelPickupRequest(id));
      this.setPickup(response.pickupRequest);
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

  private async runCollectorAction(action: () => ReturnType<CollectorPickupService['acceptPickup']>): Promise<void> {
    if (!this.pickupId()) {
      return;
    }

    this.isCollectorActionRunning.set(true);
    this.collectorActionError.set('');

    try {
      const response = await firstValueFrom(action());
      this.setPickup(response.pickupRequest);
    } catch {
      this.collectorActionError.set('Unable to update pickup. Please try again.');
    } finally {
      this.isCollectorActionRunning.set(false);
    }
  }

  private setPickup(pickup: PickupDetail): void {
    this.pickup.set(pickup);
    this.verificationWeights.set(
      Object.fromEntries(
        pickup.items.map((item) => [
          item.id,
          Number(item.actualWeight ?? item.estimatedWeight ?? 0),
        ]),
      ),
    );
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

  private routeOrigin(_pickup: PickupDetail): CollectorLocation | null {
    if (this.context === 'collector') {
      return this.collectorLocation();
    }

    return null;
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
