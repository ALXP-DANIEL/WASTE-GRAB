import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCoins, lucidePackage, lucideScale } from '@ng-icons/lucide';

import type { CustomerDashboardStat } from './customer-dashboard.models';

@Component({
  selector: 'app-customer-stat-card',
  imports: [CommonModule, NgIcon],
  template: `
    <article class="card-lift rounded-2xl border border-border/60 bg-card p-4 lg:p-5">
      <div class="flex items-center gap-2.5">
        <span class="grid size-9 shrink-0 place-items-center rounded-full" [ngClass]="toneClass()">
          <ng-icon [name]="stat().icon" class="size-4.5!" />
        </span>
        <p class="min-w-0 truncate text-xs font-semibold text-muted-foreground">{{ stat().label }}</p>
      </div>
      <p class="mt-2.5 truncate text-2xl font-bold tracking-tight lg:text-3xl">
        {{ stat().value }}
        @if (stat().unit) {
          <span class="ml-1 text-sm font-semibold text-muted-foreground">{{ stat().unit }}</span>
        }
      </p>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideActivity, lucideCoins, lucidePackage, lucideScale })],
})
export class CustomerStatCardComponent {
  readonly stat = input.required<CustomerDashboardStat>();

  protected toneClass(): string {
    switch (this.stat().tone) {
      case 'brand':
        return 'bg-primary/10 text-primary';
      case 'info':
        return 'bg-sky-500/10 text-sky-700 dark:text-sky-300';
      case 'success':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
      case 'warning':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }
}
