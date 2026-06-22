import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideCalendarCheck,
  lucidePackageCheck,
  lucideScale,
  lucideTruck,
} from '@ng-icons/lucide';
import { firstValueFrom } from 'rxjs';

import { PickupStatus, type CollectorPickupRequest } from '@wastegrab/shared';
import { ROUTE_PATHS } from '@/app-route-paths';
import { CollectorPickupService } from '@/services/collector-pickup.service';
import { AppHeaderComponent } from '@/ui/header/header.component';
import { EmptyStateComponent } from '@/ui/empty-state/empty-state.component';
import { StatGridComponent } from '@/ui/stat-card/stat-grid.component';
import type { StatCardItem } from '@/ui/stat-card/stat-card.models';

type MonthlySummary = {
  key: string;
  label: string;
  pickupCount: number;
  weightKg: number;
  /** 0-100, relative to the heaviest month shown */
  barPercent: number;
};

@Component({
  selector: 'app-collector-earnings-page',
  templateUrl: './earnings.html',
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    AppHeaderComponent,
    EmptyStateComponent,
    StatGridComponent,
  ],
  viewProviders: [
    provideIcons({
      lucideArrowRight,
      lucideCalendarCheck,
      lucidePackageCheck,
      lucideScale,
      lucideTruck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectorEarningsPage {
  private readonly pickupService = inject(CollectorPickupService);

  protected readonly myPickupsPath = ['/', ROUTE_PATHS.collector.base, ROUTE_PATHS.collector.myPickups];

  protected readonly pickups = signal<CollectorPickupRequest[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');

  protected readonly completedPickups = computed(() =>
    this.pickups()
      .filter((pickup) => pickup.status === PickupStatus.COMPLETED)
      .sort((a, b) => this.completionTime(b) - this.completionTime(a)),
  );

  protected readonly activePickups = computed(() =>
    this.pickups().filter(
      (pickup) => pickup.status !== PickupStatus.COMPLETED && pickup.status !== PickupStatus.CANCELLED,
    ),
  );

  protected readonly totalWeightKg = computed(() =>
    this.completedPickups().reduce((total, pickup) => total + this.pickupWeight(pickup), 0),
  );

  protected readonly completedThisMonth = computed(() => {
    const now = new Date();
    return this.completedPickups().filter((pickup) => {
      const date = new Date(pickup.completedAt ?? pickup.createdAt);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }).length;
  });

  protected readonly stats = computed<StatCardItem[]>(() => [
    { icon: 'lucidePackageCheck', label: 'Completed Pickups', value: this.completedPickups().length },
    { icon: 'lucideScale', label: 'Collected Weight', value: this.totalWeightKg().toFixed(1), unit: 'kg' },
    { icon: 'lucideCalendarCheck', label: 'This Month', value: this.completedThisMonth() },
    { icon: 'lucideTruck', label: 'Active Assignments', value: this.activePickups().length },
  ]);

  protected readonly monthlySummaries = computed<MonthlySummary[]>(() => {
    const groups = new Map<string, { label: string; pickupCount: number; weightKg: number }>();

    for (const pickup of this.completedPickups()) {
      const date = new Date(pickup.completedAt ?? pickup.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      const group = groups.get(key) ?? { label, pickupCount: 0, weightKg: 0 };
      group.pickupCount += 1;
      group.weightKg += this.pickupWeight(pickup);
      groups.set(key, group);
    }

    const summaries = [...groups.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6);
    const maxWeight = Math.max(...summaries.map(([, group]) => group.weightKg), 1);

    return summaries.map(([key, group]) => ({
      key,
      ...group,
      barPercent: Math.max(4, Math.round((group.weightKg / maxWeight) * 100)),
    }));
  });

  protected readonly recentCompleted = computed(() => this.completedPickups().slice(0, 6));

  constructor() {
    void this.loadEarnings();
  }

  protected pickupWeight(pickup: CollectorPickupRequest): number {
    return pickup.items.reduce(
      (total, item) => total + Number(item.actualWeight ?? item.estimatedWeight ?? 0),
      0,
    );
  }

  protected completedDateLabel(pickup: CollectorPickupRequest): string {
    return new Date(pickup.completedAt ?? pickup.createdAt).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  protected customerLabel(pickup: CollectorPickupRequest): string {
    return pickup.user?.name || 'Customer pickup';
  }

  protected shortId(id: string): string {
    return id.slice(0, 8);
  }

  private completionTime(pickup: CollectorPickupRequest): number {
    return new Date(pickup.completedAt ?? pickup.createdAt).getTime();
  }

  private async loadEarnings(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');
    try {
      const response = await firstValueFrom(this.pickupService.listPickups({ scope: 'my' }));
      this.pickups.set(response.pickupRequests);
    } catch (err) {
      console.error('Failed to load collector earnings:', err);
      this.loadError.set('Unable to load earnings data.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
