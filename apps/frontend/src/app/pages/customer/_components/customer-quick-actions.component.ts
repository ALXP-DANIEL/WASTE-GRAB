import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight, lucidePlus, lucideTicket, lucideTrophy, lucideTruck } from '@ng-icons/lucide';

import type { CustomerQuickAction } from './customer-dashboard.models';

@Component({
  selector: 'app-customer-quick-actions',
  imports: [CommonModule, RouterLink, NgIcon],
  template: `
    <section>
      <h2 class="mb-2 text-sm font-semibold text-muted-foreground">Quick actions</h2>
      <div class="grid grid-cols-2 gap-3">
        @for (action of actions(); track action.label) {
          <a
            [routerLink]="action.route"
            class="card-lift flex min-h-24 flex-col justify-between gap-3 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
            [ngClass]="action.primary ? 'brand-hero' : 'border border-border/60 bg-card hover:bg-muted/40'"
          >
            <span class="flex items-center justify-between gap-2">
              <span
                class="grid size-9 place-items-center rounded-full"
                [ngClass]="action.primary ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary'"
              >
                <ng-icon [name]="action.icon" class="size-4.5!" />
              </span>
              <ng-icon name="lucideChevronRight" class="size-4!" [ngClass]="action.primary ? 'text-white/80' : 'text-muted-foreground'" />
            </span>
            <span>
              <span class="block text-sm font-semibold">{{ action.label }}</span>
              <span class="mt-1 block line-clamp-2 text-xs" [ngClass]="action.primary ? 'text-white/80' : 'text-muted-foreground'">
                {{ action.description }}
              </span>
            </span>
          </a>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideChevronRight, lucidePlus, lucideTicket, lucideTrophy, lucideTruck })],
})
export class CustomerQuickActionsComponent {
  readonly actions = input.required<readonly CustomerQuickAction[]>();
}
