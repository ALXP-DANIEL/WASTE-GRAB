import { AppHeaderComponent } from '@/ui/header/header.component';
import { FetchStateComponent } from '@/ui/fetch-state/fetch-state.component';
import { CollectorPickupService } from '@/services/collector-pickup.service';
import { ROUTE_PATHS } from '@/app.routes';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideCheckCircle2,
  lucideClock3,
  lucideMapPin,
  lucideNavigation,
  lucidePackage,
  lucidePackageCheck,
  lucideRecycle,
  lucideScale,
  lucideTruck,
} from '@ng-icons/lucide';
import { firstValueFrom } from 'rxjs';
import { PickupStatus, type CollectionLocation, type CollectorPickupRequest } from '@wastegrab/shared';

type CollectorStat = {
  label: string;
  value: string;
  icon: string;
  accentClass: string;
};

@Component({
  selector: 'app-collector-page',
  templateUrl: './collector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AppHeaderComponent, FetchStateComponent, RouterLink, NgIcon],
  viewProviders: [
    provideIcons({
      lucideArrowRight,
      lucideCheckCircle2,
      lucideClock3,
      lucideMapPin,
      lucideNavigation,
      lucidePackage,
      lucidePackageCheck,
      lucideRecycle,
      lucideScale,
      lucideTruck,
    }),
  ],
})
export class CollectorPage {
  private readonly pickupService = inject(CollectorPickupService);

  protected readonly pickupsPath = ['/', ROUTE_PATHS.collector.base, ROUTE_PATHS.collector.pickups];
  protected readonly myPickupsPath = ['/', ROUTE_PATHS.collector.base, ROUTE_PATHS.collector.myPickups];
  protected readonly earningsPath = ['/', ROUTE_PATHS.collector.base, ROUTE_PATHS.collector.earnings];

  protected readonly availablePickups = signal<CollectorPickupRequest[]>([]);
  protected readonly myPickups = signal<CollectorPickupRequest[]>([]);
  protected readonly collectionLocations = signal<CollectionLocation[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');

  protected readonly activeMyPickups = computed(() => this.myPickups().filter((pickup) => this.isActiveStatus(pickup.status)));
  protected readonly completedPickups = computed(() => this.myPickups().filter((pickup) => pickup.status === PickupStatus.COMPLETED));
  protected readonly nextPickup = computed(() => this.activeMyPickups()[0] ?? this.availablePickups()[0] ?? null);
  protected readonly nearbyPickups = computed(() => this.availablePickups().slice(0, 3));
  protected readonly nearestLocations = computed(() => this.collectionLocations().slice(0, 3));

  protected readonly stats = computed<CollectorStat[]>(() => [
    {
      label: 'Available',
      value: String(this.availablePickups().length),
      icon: 'lucidePackage',
      accentClass: 'bg-primary/10 text-primary',
    },
    {
      label: 'In Progress',
      value: String(this.activeMyPickups().length),
      icon: 'lucideTruck',
      accentClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    },
    {
      label: 'Completed',
      value: String(this.completedPickups().length),
      icon: 'lucideCheckCircle2',
      accentClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
    {
      label: 'Est. Weight',
      value: `${this.totalWeight(this.myPickups()).toFixed(1)} kg`,
      icon: 'lucideScale',
      accentClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
  ]);

  constructor() {
    void this.loadDashboard();
  }

  protected shortId(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }

  protected customerLabel(pickup: CollectorPickupRequest): string {
    return pickup.user?.name || pickup.user?.email || 'Customer';
  }

  protected categoryLabel(pickup: CollectorPickupRequest): string {
    return pickup.aiClassificationLabel || `${pickup.items.length} item${pickup.items.length === 1 ? '' : 's'}`;
  }

  protected pickupWeight(pickup: CollectorPickupRequest): number {
    return pickup.items.reduce((total, item) => total + Number(item.actualWeight ?? item.estimatedWeight ?? 0), 0);
  }

  protected distanceLabel(pickup: CollectorPickupRequest): string {
    const distance = Number(pickup.distanceKm);
    return Number.isFinite(distance) ? `${distance.toFixed(distance < 10 ? 1 : 0)} km` : 'Route pending';
  }

  protected statusLabel(status: PickupStatus): string {
    return status.toLowerCase().replace(/_/g, ' ');
  }

  protected statusClass(status: PickupStatus): string {
    switch (status) {
      case PickupStatus.PENDING:
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
      case PickupStatus.ACCEPTED:
      case PickupStatus.ARRIVED:
      case PickupStatus.VERIFIED:
        return 'bg-sky-500/10 text-sky-700 dark:text-sky-300';
      case PickupStatus.COMPLETED:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }

  protected locationSlug(location: CollectionLocation): string {
    const slug = location.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'location';

    return `${slug}--${location.id}`;
  }

  private async loadDashboard(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');
    try {
      const [availableResponse, myResponse, locations] = await Promise.all([
        firstValueFrom(this.pickupService.listPickups({ scope: 'available' })),
        firstValueFrom(this.pickupService.listPickups({ scope: 'my' })),
        firstValueFrom(this.pickupService.listCollectionLocations()),
      ]);
      this.availablePickups.set(availableResponse.pickupRequests);
      this.myPickups.set(myResponse.pickupRequests);
      this.collectionLocations.set(locations);
    } catch (err) {
      console.error('Failed to load collector dashboard:', err);
      this.loadError.set('Unable to load collector dashboard data.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private isActiveStatus(status: PickupStatus): boolean {
    return status !== PickupStatus.COMPLETED && status !== PickupStatus.CANCELLED;
  }

  private totalWeight(pickups: CollectorPickupRequest[]): number {
    return pickups.reduce((total, pickup) => total + this.pickupWeight(pickup), 0);
  }
}
