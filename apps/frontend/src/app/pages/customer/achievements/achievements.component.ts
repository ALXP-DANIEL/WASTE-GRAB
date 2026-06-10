import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarCheck, lucideCoins, lucideScale, lucideTrophy, lucideTruck } from '@ng-icons/lucide';
import { AchievementMetric, type UserAchievement } from '@wastegrab/shared';
import { AchievementService } from '@/services/achievement.service';
import { AppHeaderComponent } from '@/ui/header/header.component';
import { FetchStateComponent } from '@/ui/fetch-state/fetch-state.component';
import { EmptyStateComponent } from '@/ui/empty-state/empty-state.component';
import { StatCardComponent } from '@/ui/stat-card/stat-card.component';

@Component({
  selector: 'app-customer-achievements-page',
  templateUrl: './achievements.html',
  imports: [CommonModule, AppHeaderComponent, FetchStateComponent, EmptyStateComponent, StatCardComponent, NgIcon],
  viewProviders: [
    provideIcons({ lucideCalendarCheck, lucideCoins, lucideScale, lucideTrophy, lucideTruck }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerAchievementsPage implements OnInit {
  private readonly achievementService = inject(AchievementService);

  protected readonly achievements = signal<UserAchievement[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly totalPoints = computed(() => this.achievements().reduce((total, entry) => total + entry.pointsAwarded, 0));
  protected readonly totalWeightAwards = computed(() => this.achievements().filter((entry) => entry.achievement.metric === AchievementMetric.TOTAL_WEIGHT_KG).length);
  protected readonly pickupAwards = computed(() => this.achievements().filter((entry) => entry.achievement.metric === AchievementMetric.COMPLETED_PICKUPS).length);

  ngOnInit(): void {
    this.loadAchievements();
  }

  protected metricIcon(entry: UserAchievement): string {
    return entry.achievement.metric === AchievementMetric.COMPLETED_PICKUPS ? 'lucideTruck' : 'lucideScale';
  }

  protected metricLabel(entry: UserAchievement): string {
    return entry.achievement.metric === AchievementMetric.COMPLETED_PICKUPS
      ? `${Number(entry.metricValue).toFixed(0)} completed pickups`
      : `${Number(entry.metricValue).toFixed(1)} kg contributed`;
  }

  protected dateLabel(value: string): string {
    return new Intl.DateTimeFormat('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }

  private loadAchievements(): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.achievementService.listCustomerAchievements().subscribe({
      next: (response) => this.achievements.set(response.achievements),
      error: () => {
        this.achievements.set([]);
        this.loadError.set('Unable to load achievements.');
      },
      complete: () => this.isLoading.set(false),
    });
  }
}
