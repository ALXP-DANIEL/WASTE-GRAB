import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCircle2,
  lucideClock3,
  lucideFileText,
  lucideImage,
  lucideScale,
  lucideStar,
} from '@ng-icons/lucide';

import type { CustomerPickupSummary } from './customer-dashboard.models';
import { AppPanelComponent } from '@/ui/panel/panel.component';

@Component({
  selector: 'app-customer-recent-requests',
  imports: [CommonModule, RouterLink, NgIcon, AppPanelComponent],
  template: `
    <app-panel
      title="Recent Requests"
      icon="lucideFileText"
      [actionRoute]="pickupsRoute()"
    >
      <div
        class="overflow-hidden rounded-2xl border border-border/70 bg-background/40"
      >
        @if (requests().length) {
          <div
            class="hidden grid-cols-[1.7fr_1fr_1fr_0.7fr_0.7fr] items-center border-b border-border/70 px-3 py-2 text-xs font-semibold text-muted-foreground md:grid"
          >
            <span>Request / Category</span>
            <span>Date</span>
            <span>Status</span>
            <span class="text-right">Weight</span>
            <span class="text-right">Points</span>
          </div>
        }
        @for (request of requests(); track request.id) {
          <a
            [routerLink]="request.detailRoute"
            class="grid gap-2 border-b border-border/70 px-3 py-2.5 text-sm transition-colors last:border-b-0 hover:bg-muted/40 md:hidden"
          >
            <span class="flex min-w-0 items-center gap-3">
              <span
                class="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/10 text-primary"
              >
                @if (request.imageUrl) {
                  <img
                    [src]="request.imageUrl"
                    alt="Pickup image"
                    class="size-full rounded-lg object-cover"
                  />
                } @else {
                  <ng-icon name="lucideImage" class="size-4!" />
                }
              </span>
              <span class="min-w-0">
                <span class="block truncate font-semibold">
                  {{ request.title }}
                </span>
                <span class="mt-0.5 block truncate text-xs text-muted-foreground">
                  #{{ request.shortId }} · {{ request.createdAtLabel }}
                </span>
              </span>
            </span>

            <span class="flex items-center justify-between gap-3">
              <span
                class="inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold capitalize"
                [class]="request.statusClass"
              >
                <ng-icon
                  [name]="statusIcon(request.statusLabel)"
                  class="size-3.5!"
                />
                {{ request.statusLabel }}
              </span>

              <span class="flex shrink-0 items-center gap-3 text-xs font-semibold">
                <span class="flex items-center gap-1">
                  <ng-icon name="lucideScale" class="size-3.5! text-primary" />
                  {{ request.weightKg | number: '1.1-1' }} kg
                </span>
                <span class="flex items-center gap-1">
                  <ng-icon name="lucideStar" class="size-3.5! text-primary" />
                  {{ request.points }}
                </span>
              </span>
            </span>
          </a>

          <a
            [routerLink]="request.detailRoute"
            class="hidden border-b border-border/70 px-3 py-2.5 text-sm transition-colors last:border-b-0 hover:bg-muted/40 md:grid md:grid-cols-[1.7fr_1fr_1fr_0.7fr_0.7fr] md:items-center md:gap-3"
          >
            <span class="flex min-w-0 items-center gap-3">
              <span
                class="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-primary/10 text-primary"
              >
                @if (request.imageUrl) {
                  <img
                    [src]="request.imageUrl"
                    alt="Pickup image"
                    class="size-full rounded-lg object-cover"
                  />
                } @else {
                  <ng-icon name="lucideImage" class="size-4!" />
                }
              </span>
              <span class="min-w-0">
                <span class="block truncate font-semibold">
                  {{ request.title }}
                </span>
                <span
                  class="block truncate font-mono text-[11px] text-muted-foreground"
                >
                  #{{ request.shortId }}
                </span>
              </span>
            </span>

            <span class="text-sm text-muted-foreground">
              {{ request.createdAtFullLabel }}
            </span>

            <span
              class="inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold capitalize"
              [class]="request.statusClass"
            >
              <ng-icon
                [name]="statusIcon(request.statusLabel)"
                class="size-3.5!"
              />
              {{ request.statusLabel }}
            </span>

            <span class="hidden items-center justify-end gap-1 text-sm font-semibold md:flex">
              <ng-icon name="lucideScale" class="size-3.5! text-primary" />
              {{ request.weightKg | number: '1.1-1' }} kg
            </span>

            <span
              class="flex items-center gap-1 text-sm font-semibold md:justify-end md:text-xs"
            >
              <ng-icon name="lucideStar" class="size-3.5! text-primary" />
              {{ request.points }}
            </span>
          </a>
        } @empty {
          <div class="p-4 text-sm text-muted-foreground">
            Pickup requests will appear here after you create one.
          </div>
        }
      </div>
    </app-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideCheckCircle2,
      lucideClock3,
      lucideFileText,
      lucideImage,
      lucideScale,
      lucideStar,
    }),
  ],
})
export class CustomerRecentRequestsComponent {
  readonly requests = input.required<readonly CustomerPickupSummary[]>();
  readonly pickupsRoute = input.required<readonly string[]>();

  protected statusIcon(statusLabel: string): string {
    return statusLabel === 'completed' ? 'lucideCheckCircle2' : 'lucideClock3';
  }
}
