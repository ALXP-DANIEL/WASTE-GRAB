import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowUpRight,
  lucideCheckCircle2,
  lucideClock3,
  lucideCoins,
  lucideImage,
  lucideLoaderCircle,
  lucideMapPin,
  lucideNavigation,
  lucidePackageCheck,
  lucideRefreshCw,
  lucideScale,
  lucideTruck,
  lucideXCircle,
} from '@ng-icons/lucide';
import { ImageType, PickupStatus, type CollectorPickupRequest } from '@wastegrab/shared';
import { firstValueFrom } from 'rxjs';

import { CollectorPickupService, type CollectorLocation, type CollectorPickupScope } from '@/services/collector-pickup.service';
import { AppHeaderComponent } from '@/ui/header/header.component';
import { FetchStateComponent } from '@/ui/fetch-state/fetch-state.component';
import { TableHeaderComponent } from '@/ui/table-header/table-header.component';
import { ZardButtonComponent } from '@/ui/zard/button/button.component';
import { ZardTableImports } from '@/ui/zard/table';

type PickupFilter = 'all' | 'available' | 'assigned' | 'completed' | 'cancelled';
type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';

@Component({
  selector: 'app-collector-pickups-page',
  templateUrl: './pickups.html',
  imports: [CommonModule, RouterLink, AppHeaderComponent, FetchStateComponent, ZardButtonComponent, TableHeaderComponent, NgIcon, ...ZardTableImports],
  viewProviders: [
    provideIcons({
      lucideArrowUpRight,
      lucideCheckCircle2,
      lucideClock3,
      lucideCoins,
      lucideImage,
      lucideLoaderCircle,
      lucideMapPin,
      lucideNavigation,
      lucidePackageCheck,
      lucideRefreshCw,
      lucideScale,
      lucideTruck,
      lucideXCircle,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectorPickupsPage {
  private readonly pickupService = inject(CollectorPickupService);
  private readonly route = inject(ActivatedRoute);

  protected readonly pickupScope = this.readPickupScope();
  protected readonly pickups = signal<CollectorPickupRequest[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly activeFilter = signal<PickupFilter>('all');
  protected readonly collectorLocation = signal<CollectorLocation | null>(null);
  protected readonly locationStatus = signal<LocationStatus>('idle');
  protected readonly collectorLocationAccuracy = signal<number | null>(null);
  protected readonly PickupStatus = PickupStatus;

  protected readonly filters = computed<Array<{ value: PickupFilter; label: string }>>(() => {
    if (this.pickupScope === 'my') {
      return [
        { value: 'all', label: 'All' },
        { value: 'assigned', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ];
    }

    return [
      { value: 'all', label: 'All' },
      { value: 'available', label: 'Available' },
    ];
  });

  protected readonly availablePickups = computed(() => this.pickups().filter((pickup) => pickup.collectorId === null && this.isActiveStatus(pickup.status)));
  protected readonly assignedPickups = computed(() => this.pickups().filter((pickup) => pickup.collectorId !== null && this.isActiveStatus(pickup.status)));
  protected readonly completedPickups = computed(() => this.pickups().filter((pickup) => pickup.status === PickupStatus.COMPLETED));
  protected readonly totalPotentialPoints = computed(() => this.pickups().reduce((total, pickup) => total + this.potentialPoints(pickup), 0));
  protected readonly tableTitle = computed(() => this.pickupScope === 'my' ? 'My Pickups' : 'Available Pickup Requests');
  protected readonly tableDescription = computed(() => this.pickupScope === 'my'
    ? 'Review pickup requests assigned to you.'
    : 'Review available customer pickup requests sorted by nearest known location.');

  protected readonly filteredPickups = computed(() => {
    const filter = this.activeFilter();
    const pickups = this.pickups();

    if (filter === 'available') return pickups.filter((pickup) => pickup.collectorId === null && this.isActiveStatus(pickup.status));
    if (filter === 'assigned') return pickups.filter((pickup) => pickup.collectorId !== null && this.isActiveStatus(pickup.status));
    if (filter === 'completed') return pickups.filter((pickup) => pickup.status === PickupStatus.COMPLETED);
    if (filter === 'cancelled') return pickups.filter((pickup) => pickup.status === PickupStatus.CANCELLED);
    return pickups;
  });

  protected readonly locationStatusLabel = computed(() => {
    switch (this.locationStatus()) {
      case 'requesting':
        return 'Requesting collector location...';
      case 'granted': {
        const accuracy = this.collectorLocationAccuracy();
        return this.collectorLocation()
          ? `Sorted from your browser location${accuracy === null ? '' : `, accuracy +/- ${Math.round(accuracy)} m`}.`
          : 'Sorted by nearest known pickup location.';
      }
      case 'denied':
        return 'Location blocked. Showing newest pickups first.';
      case 'unsupported':
        return 'Location unavailable. Showing newest pickups first.';
      default:
        return 'Use location to sort nearest pickups first.';
    }
  });

  constructor() {
    void this.loadPickups();
  }

  protected setFilter(filter: PickupFilter): void {
    this.activeFilter.set(filter);
  }

  protected refresh(): void {
    void this.loadPickups();
  }

  protected async requestLocationAndRefresh(): Promise<void> {
    const location = await this.requestCollectorLocation();
    this.collectorLocation.set(location);
    await this.loadPickups(false);
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

  protected shortId(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  protected requestWeight(pickup: CollectorPickupRequest): number {
    return pickup.items.reduce(
      (total, item) => total + Number(item.actualWeight ?? item.estimatedWeight ?? 0),
      0,
    );
  }

  protected potentialPoints(pickup: CollectorPickupRequest): number {
    return pickup.items.reduce((total, item) => {
      const weight = Number(item.actualWeight ?? item.estimatedWeight ?? 0);
      return total + Math.round(weight * (item.category?.pointsPerKg ?? 0));
    }, 0);
  }

  protected categoryLabel(pickup: CollectorPickupRequest): string {
    return pickup.aiClassificationLabel || `${pickup.items.length} waste item${pickup.items.length === 1 ? '' : 's'}`;
  }

  protected primaryImage(pickup: CollectorPickupRequest): string | null {
    return pickup.images.find((image) => image.imageType === ImageType.USER_UPLOAD)?.imageUrl ?? null;
  }

  protected distanceLabel(pickup: CollectorPickupRequest): string {
    return pickup.distanceKm === null ? '-' : `${pickup.distanceKm} km`;
  }

  private async loadPickups(requestLocation = true): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');

    try {
      const location = this.collectorLocation() ?? (requestLocation ? await this.requestCollectorLocation() : null);
      this.collectorLocation.set(location);
      const response = await firstValueFrom(this.pickupService.listPickups({
        location,
        scope: this.pickupScope,
      }));
      this.pickups.set(response.pickupRequests);
    } catch {
      this.loadError.set('Unable to load pickup requests.');
      this.pickups.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async requestCollectorLocation(): Promise<CollectorLocation | null> {
    if (!('geolocation' in navigator)) {
      this.locationStatus.set('unsupported');
      return null;
    }

    this.locationStatus.set('requesting');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10_000,
        });
      });

      this.locationStatus.set('granted');
      this.collectorLocationAccuracy.set(position.coords.accuracy);
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      this.locationStatus.set('denied');
      this.collectorLocationAccuracy.set(null);
      return null;
    }
  }

  private isActiveStatus(status: PickupStatus): boolean {
    return ![PickupStatus.COMPLETED, PickupStatus.CANCELLED].includes(status);
  }

  private readPickupScope(): CollectorPickupScope {
    const scope = this.route.snapshot.data['pickupScope'];

    return scope === 'my' ? 'my' : 'available';
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
