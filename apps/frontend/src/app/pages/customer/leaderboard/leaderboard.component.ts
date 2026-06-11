import { AppHeaderComponent } from '@/ui/header/header.component';
import { FetchStateComponent } from '@/ui/fetch-state/fetch-state.component';
import { EmptyStateComponent } from '@/ui/empty-state/empty-state.component';
import { PickupRequestService } from '@/services/pickup-request.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAward,
  lucideChevronRight,
  lucideCrown,
  lucideMedal,
  lucideRecycle,
  lucideScale,
  lucideTrophy,
  lucideUser,
} from '@ng-icons/lucide';
import { firstValueFrom } from 'rxjs';
import type { LeaderboardEntry } from '@wastegrab/shared';

@Component({
  selector: 'app-customer-leaderboard-page',
  templateUrl: './leaderboard.html',
  imports: [CommonModule, AppHeaderComponent, FetchStateComponent, EmptyStateComponent, NgIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideAward,
      lucideChevronRight,
      lucideCrown,
      lucideMedal,
      lucideRecycle,
      lucideScale,
      lucideTrophy,
      lucideUser,
    }),
  ],
})
export class CustomerLeaderboardPage {
  private readonly pickupRequests = inject(PickupRequestService);

  protected readonly leaderboard = signal<LeaderboardEntry[]>([]);
  protected readonly currentUserRank = signal<LeaderboardEntry | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');

  protected readonly topThree = computed(() => this.leaderboard().slice(0, 3));
  protected readonly remainingEntries = computed(() => this.leaderboard().slice(3));
  protected readonly currentUserIsVisible = computed(() => (
    this.currentUserRank() ? this.leaderboard().some((entry) => entry.userId === this.currentUserRank()?.userId) : true
  ));
  protected readonly totalVisibleWeight = computed(() => (
    this.leaderboard().reduce((total, entry) => total + Number(entry.totalWeightKg), 0)
  ));

  constructor() {
    void this.loadLeaderboard();
  }

  protected initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'U';
  }

  protected rankClass(rank: number): string {
    switch (rank) {
      case 1:
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
      case 2:
        return 'bg-muted text-muted-foreground';
      case 3:
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-primary/10 text-primary';
    }
  }

  protected weightLabel(entry: LeaderboardEntry): string {
    return `${Number(entry.totalWeightKg).toFixed(1)} kg`;
  }

  /** Bar width relative to the #1 contributor, floored so small values stay visible. */
  protected barPercent(entry: LeaderboardEntry): number {
    const top = Number(this.leaderboard()[0]?.totalWeightKg ?? 0);
    if (!top) return 0;
    return Math.max(4, Math.round((Number(entry.totalWeightKg) / top) * 100));
  }

  protected medalIcon(rank: number): string {
    return rank === 1 ? 'lucideCrown' : 'lucideMedal';
  }

  protected podiumCardClass(rank: number): string {
    switch (rank) {
      case 1:
        return 'border-amber-400/50 sm:order-2 sm:-translate-y-4';
      case 2:
        return 'border-border sm:order-1';
      default:
        return 'border-orange-400/40 sm:order-3';
    }
  }

  protected podiumRingClass(rank: number): string {
    switch (rank) {
      case 1:
        return 'ring-4 ring-amber-400/60';
      case 2:
        return 'ring-2 ring-border';
      default:
        return 'ring-2 ring-orange-400/50';
    }
  }

  protected podiumStripClass(rank: number): string {
    switch (rank) {
      case 1:
        return 'bg-linear-to-r from-amber-400 to-yellow-300';
      case 2:
        return 'bg-linear-to-r from-muted-foreground/40 to-muted-foreground/20';
      default:
        return 'bg-linear-to-r from-orange-400 to-amber-300';
    }
  }

  private async loadLeaderboard(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');

    try {
      const response = await firstValueFrom(this.pickupRequests.getLeaderboard());
      this.leaderboard.set(response.leaderboard);
      this.currentUserRank.set(response.currentUser);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      this.loadError.set('Unable to load leaderboard.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
