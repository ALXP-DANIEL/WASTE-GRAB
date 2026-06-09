import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCoins, lucidePackage, lucideScale } from '@ng-icons/lucide';

import type { CustomerDashboardStat } from './customer-dashboard.models';

@Component({
  selector: 'app-customer-stat-card',
  imports: [CommonModule, NgIcon],
  template: `
    <article class="rounded-xl border border-border bg-card p-3 shadow-sm lg:p-4">
      <div class="flex items-center gap-2">
        <span class="grid size-8 shrink-0 place-items-center rounded-lg" [ngClass]="toneClass()">
          <ng-icon [name]="stat().icon" class="size-4!" />
        </span>
        <p class="min-w-0 truncate text-xs font-medium text-muted-foreground">{{ stat().label }}</p>
      </div>
      <p class="mt-2 truncate text-2xl font-semibold tracking-tight">
        {{ stat().value }}
        @if (stat().unit) {
          <span class="ml-1 text-sm font-medium text-muted-foreground">{{ stat().unit }}</span>
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
