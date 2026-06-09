import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideTrophy } from '@ng-icons/lucide';

import type { CustomerLeaderboardRow } from './customer-dashboard.models';

@Component({
  selector: 'app-customer-rank-panel',
  imports: [CommonModule, RouterLink, NgIcon],
  template: `
    <section>
      <h2 class="text-sm font-semibold text-muted-foreground mb-2">
        Leaderboard
      </h2>
      <div class="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-sm font-semibold">
            <ng-icon name="lucideTrophy" class="size-4! text-amber-600" />
            Top recyclers
          </h2>
        </div>

        @if (rows().length) {
          <ul class="mt-3 space-y-1.5">
            @for (row of rows(); track row.rank + row.name) {
              <li>
                <a
                  [routerLink]="row.route"
                  class="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/40"
                  [ngClass]="
                    row.isCurrentUser
                      ? 'bg-primary/10 text-primary hover:bg-primary/15'
                      : ''
                  "
                >
                  <span
                    class="w-5 text-center text-xs font-semibold text-muted-foreground"
                    >{{ row.rank }}</span
                  >
                  <span class="min-w-0 flex-1 truncate font-medium">
                    {{ row.name }}
                    @if (row.isCurrentUser) {
                      <span> (You)</span>
                    }
                  </span>
                  <span class="text-xs font-semibold">{{ row.value }}</span>
                </a>
              </li>
            }
          </ul>
        } @else {
          <a
            [routerLink]="leaderboardRoute()"
            class="mt-3 flex items-center justify-between rounded-lg border border-dashed border-border bg-background p-3 text-sm text-muted-foreground"
          >
            Complete a pickup to join the rankings.
            <ng-icon name="lucideArrowRight" class="size-4!" />
          </a>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideArrowRight, lucideTrophy })],
})
export class CustomerRankPanelComponent {
  readonly rows = input.required<readonly CustomerLeaderboardRow[]>();
  readonly leaderboardRoute = input.required<readonly string[]>();
}
