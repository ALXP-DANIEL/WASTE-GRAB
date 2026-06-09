import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight, lucideImage, lucideMapPin } from '@ng-icons/lucide';

import type { CustomerPickupSummary } from './customer-dashboard.models';

@Component({
  selector: 'app-customer-recent-requests',
  imports: [CommonModule, RouterLink, NgIcon],
  template: `
    <section>
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-muted-foreground">Recent requests</h2>
        <a [routerLink]="pickupsRoute()" class="text-xs font-semibold text-primary">View all</a>
      </div>

      <div class="space-y-2">
        @for (request of requests(); track request.id) {
          <a [routerLink]="request.detailRoute" class="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:bg-muted/40">
            <span class="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
              @if (request.imageUrl) {
                <img [src]="request.imageUrl" alt="Pickup image" class="size-full object-cover" />
              } @else {
                <span class="grid size-full place-items-center text-muted-foreground">
                  <ng-icon name="lucideImage" class="size-5!" />
                </span>
              }
            </span>

            <span class="min-w-0 flex-1">
              <span class="flex min-w-0 items-center gap-2">
                <span class="truncate font-mono text-xs font-semibold">#{{ request.shortId }}</span>
                <span class="rounded-md px-2 py-0.5 text-[10px] font-bold capitalize" [class]="request.statusClass">
                  {{ request.statusLabel }}
                </span>
              </span>
              <span class="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <ng-icon name="lucideMapPin" class="size-3.5! shrink-0" />
                <span class="truncate">{{ request.address }}</span>
              </span>
            </span>

            <span class="shrink-0 text-right">
              <span class="block text-sm font-semibold">{{ request.weightKg | number:'1.1-1' }} kg</span>
              <span class="block text-xs text-muted-foreground">{{ request.points }} pts</span>
            </span>
            <ng-icon name="lucideChevronRight" class="size-4! shrink-0 text-muted-foreground" />
          </a>
        } @empty {
          <div class="rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
            Pickup requests will appear here after you create one.
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideChevronRight, lucideImage, lucideMapPin })],
})
export class CustomerRecentRequestsComponent {
  readonly requests = input.required<readonly CustomerPickupSummary[]>();
  readonly pickupsRoute = input.required<readonly string[]>();
}
