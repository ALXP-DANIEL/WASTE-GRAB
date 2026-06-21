import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronRight,
  lucidePlus,
  lucideTicket,
  lucideTrophy,
  lucideTruck,
} from '@ng-icons/lucide';

import type { CustomerQuickAction } from './customer-dashboard.models';
import { AppPanelComponent } from '@/ui/panel/panel.component';

@Component({
  selector: 'app-customer-quick-actions',
  imports: [CommonModule, RouterLink, NgIcon, AppPanelComponent],
  template: `
    <app-panel title="Quick Actions" icon="lucidePlus">
      <div class="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
        @for (action of actions(); track action.label) {
          <a
            [routerLink]="action.route"
<<<<<<< HEAD
            class="card-lift flex min-h-16 flex-col justify-between gap-2 rounded-xl p-3 transition-all hover:-translate-y-0.5 lg:min-h-20 lg:gap-3 lg:rounded-2xl lg:p-4"
            [ngClass]="
              action.primary
                ? 'brand-hero'
                : 'border border-border/60 bg-card hover:bg-muted/40'
            "
          >
            <span class="flex items-center justify-between gap-2">
              <span
                class="grid size-7 place-items-center rounded-lg lg:size-9 lg:rounded-full"
                [ngClass]="
                  action.primary
                    ? 'bg-white/15 text-white'
                    : 'bg-primary/10 text-primary'
                "
              >
                <ng-icon [name]="action.icon" class="size-3.5! lg:size-4.5!" />
              </span>
              <ng-icon
                name="lucideChevronRight"
                class="size-3.5! lg:size-4!"
                [ngClass]="
                  action.primary ? 'text-white/80' : 'text-muted-foreground'
                "
              />
            </span>
            <span>
              <span class="block truncate text-xs font-semibold lg:text-sm">{{
                action.label
              }}</span>
=======
            class="flex min-h-24 flex-col justify-between gap-3 rounded-xl p-4 transition-colors"
            [ngClass]="action.primary ? 'bg-primary text-background hover:bg-primary/90' : 'border border-border bg-card hover:bg-muted/40'"
          >
            <span class="flex items-center justify-between gap-2">
              <ng-icon [name]="action.icon" class="size-5!" [ngClass]="action.primary ? '' : 'text-primary'" />
              <ng-icon name="lucideChevronRight" class="size-4!" [ngClass]="action.primary ? 'text-background' : 'text-muted-foreground'" />
            </span>
            <span>
              <span class="block text-sm font-semibold">{{ action.label }}</span>
              <span class="mt-1 block line-clamp-2 text-xs" [ngClass]="action.primary ? 'text-background' : 'text-muted-foreground'">
                {{ action.description }}
              </span>
>>>>>>> 3a9c682 (Updated customer pages styling)
            </span>
          </a>
        }
      </div>
    </app-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideChevronRight,
      lucidePlus,
      lucideTicket,
      lucideTrophy,
      lucideTruck,
    }),
  ],
})
export class CustomerQuickActionsComponent {
  readonly actions = input.required<readonly CustomerQuickAction[]>();
}
