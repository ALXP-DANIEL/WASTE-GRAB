import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideCalendarDays,
  lucideCopy,
  lucideGift,
  lucideTicket,
  lucideStar,
} from '@ng-icons/lucide';

import type { CustomerVoucherSummary } from './customer-dashboard.models';
import { AppPanelComponent } from '@/ui/panel/panel.component';

@Component({
  selector: 'app-customer-voucher-panel',
  imports: [CommonModule, RouterLink, NgIcon, AppPanelComponent],
  template: `
    <app-panel
      title="Active Vouchers"
      icon="lucideTicket"
      sectionId="rewards"
      [actionRoute]="vouchersRoute()"
    >
      <div class="grid gap-2">
        @for (voucher of vouchers(); track voucher.title + voucher.code) {
          <a
            [routerLink]="voucher.route"
            class="grid gap-2 rounded-2xl border border-border/70 bg-background/40 p-2.5 transition-colors hover:bg-muted/40 sm:grid-cols-[auto_1fr_auto] sm:gap-3"
          >
            <span
              class="hidden size-14 shrink-0 place-items-center rounded-xl border border-border/70 bg-card text-primary shadow-sm sm:grid"
            >
              <ng-icon name="lucideGift" class="size-4!" />
            </span>

            <span class="min-w-0">
              <span class="flex min-w-0 items-start justify-between gap-2">
                <span
                  class="min-w-0 truncate text-sm font-semibold text-foreground"
                >
                  {{ voucher.title }}
                </span>
                <span
                  class="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary sm:hidden"
                >
                  <ng-icon name="lucideCalendarDays" class="size-3!" />
                  {{ voucher.expiryLabel }}
                </span>
              </span>

              <span class="mt-2 flex min-w-0 items-center gap-2">
                <span
                  class="inline-flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1 font-mono text-xs font-semibold text-foreground sm:max-w-full sm:flex-none"
                >
                  <span class="truncate">{{ voucher.code }}</span>
                  <ng-icon
                    name="lucideCopy"
                    class="size-3.5! shrink-0 text-muted-foreground"
                  />
                </span>
                <span
                  class="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground sm:hidden"
                >
                  <ng-icon name="lucideStar" class="size-3.5! text-primary" />
                  {{ voucher.pointsSpent }} pts
                </span>
              </span>
            </span>

            <span
              class="hidden gap-1.5 sm:col-span-1 sm:grid sm:text-right"
            >
              <span
                class="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              >
                <ng-icon name="lucideCalendarDays" class="size-3.5!" />
                {{ voucher.expiryLabel }}
              </span>
              <span
                class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
              >
                <ng-icon name="lucideStar" class="size-3.5! text-primary" />
                Spent: {{ voucher.pointsSpent }} Points
              </span>
            </span>
          </a>
        } @empty {
          <a
            [routerLink]="vouchersRoute()"
            class="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-background/40 p-3 text-sm text-muted-foreground transition-colors hover:bg-muted/40"
          >
            Browse reward vouchers
            <ng-icon name="lucideArrowRight" class="size-4!" />
          </a>
        }
      </div>
    </app-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideArrowRight,
      lucideCalendarDays,
      lucideCopy,
      lucideGift,
      lucideStar,
      lucideTicket,
    }),
  ],
})
export class CustomerVoucherPanelComponent {
  readonly vouchers = input.required<readonly CustomerVoucherSummary[]>();
  readonly vouchersRoute = input.required<readonly string[]>();
}
