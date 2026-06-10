import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideGift } from '@ng-icons/lucide';

import type { CustomerVoucherSummary } from './customer-dashboard.models';

@Component({
  selector: 'app-customer-voucher-panel',
  imports: [CommonModule, RouterLink, NgIcon],
  template: `
    <section id="rewards" class="scroll-mt-20">
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-muted-foreground">Active vouchers</h2>
        <a [routerLink]="vouchersRoute()" class="text-xs font-semibold text-primary">View all</a>
      </div>

      <div class="space-y-2">
        @for (voucher of vouchers(); track voucher.title + voucher.detail) {
          <a [routerLink]="voucher.route" class="card-lift flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 transition-colors hover:bg-muted/40">
            <span class="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              <ng-icon name="lucideGift" class="size-4!" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-semibold">{{ voucher.title }}</span>
              <span class="mt-0.5 block truncate text-xs text-muted-foreground">{{ voucher.detail }}</span>
            </span>
            <span class="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
              {{ voucher.pointsSpent }} pts
            </span>
          </a>
        } @empty {
          <a [routerLink]="vouchersRoute()" class="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-card p-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted/40">
            Browse reward vouchers
            <ng-icon name="lucideArrowRight" class="size-4!" />
          </a>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideArrowRight, lucideGift })],
})
export class CustomerVoucherPanelComponent {
  readonly vouchers = input.required<readonly CustomerVoucherSummary[]>();
  readonly vouchersRoute = input.required<readonly string[]>();
}
