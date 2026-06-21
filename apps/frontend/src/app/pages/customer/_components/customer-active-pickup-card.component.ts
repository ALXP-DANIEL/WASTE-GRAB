import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarCheck,
  lucideCheckCircle2,
  lucideChevronRight,
  lucideClock3,
  lucideImage,
  lucideMapPin,
  lucidePackageCheck,
  lucidePlus,
  lucideTruck,
} from '@ng-icons/lucide';

import { PickupStatus } from '@wastegrab/shared';
import type { CustomerPickupSummary } from './customer-dashboard.models';

const pickupSteps: Array<{ status: PickupStatus; label: string; icon: string }> = [
  { status: PickupStatus.PENDING, label: 'Pending', icon: 'lucideClock3' },
  { status: PickupStatus.ACCEPTED, label: 'Accepted', icon: 'lucideTruck' },
  { status: PickupStatus.ARRIVED, label: 'Arrived', icon: 'lucideMapPin' },
  { status: PickupStatus.VERIFIED, label: 'Verified', icon: 'lucideCheckCircle2' },
  { status: PickupStatus.COMPLETED, label: 'Completed', icon: 'lucidePackageCheck' },
];

@Component({
  selector: 'app-customer-active-pickup-card',
  imports: [CommonModule, RouterLink, NgIcon],
  template: `
    @if (pickup(); as current) {
      <a
        [routerLink]="current.detailRoute"
        class="block rounded-xl border border-primary/30 bg-card p-4 shadow-sm transition-colors hover:border-primary/60"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2">
            <span class="font-mono text-sm font-semibold"
              >#{{ current.shortId }}</span
            >
            <span
              class="rounded-md px-2.5 py-1 text-xs font-bold capitalize"
              [class]="current.statusClass"
            >
              {{ current.statusLabel }}
            </span>
          </div>
          <ng-icon
            name="lucideChevronRight"
            class="size-4! shrink-0 text-muted-foreground"
          />
        </div>

        <div
          class="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
        >
          <ng-icon name="lucideTruck" class="size-4!" />
          <span class="min-w-0 flex-1 truncate font-medium">{{
            current.statusMessage
          }}</span>
          <span class="shrink-0 text-xs text-primary/80">{{
            current.createdAtLabel
          }}</span>
        </div>

        <div class="mt-4 grid gap-5 md:grid-cols-[7rem_1fr] md:items-stretch">
          <div
            class="aspect-square overflow-hidden rounded-lg border border-border bg-muted"
          >
            @if (current.imageUrl) {
              <img
                [src]="current.imageUrl"
                alt="Active pickup image"
                class="size-full object-cover"
              />
            } @else {
              <div
                class="grid size-full place-items-center text-muted-foreground"
              >
                <ng-icon name="lucideImage" class="size-7!" />
              </div>
            }
          </div>

          <div class="min-w-0">
            <h2 class="truncate text-xl font-semibold">{{ current.title }}</h2>
            <p
              class="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground"
            >
              {{ current.address }}
            </p>

            <div class="mt-3 grid grid-cols-3 gap-2 text-center">
              <div class="rounded-lg bg-muted/60 px-2 py-2">
                <p class="text-xs text-muted-foreground">Weight</p>
                <p class="truncate text-sm font-semibold">
                  {{ current.weightKg | number: '1.1-1' }} kg
                </p>
              </div>
              <div class="rounded-lg bg-muted/60 px-2 py-2">
                <p class="text-xs text-muted-foreground">Potential Points</p>
                <p class="truncate text-sm font-semibold">
                  {{ current.points }}
                </p>
              </div>
              <div class="rounded-lg bg-muted/60 px-2 py-2">
                <p class="text-xs text-muted-foreground">Items</p>
                <p class="truncate text-sm font-semibold">
                  {{ current.itemCount }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 rounded-lg border border-border bg-card p-3">
          <ol class="flex items-center">
            @for (step of steps; track step.status) {
              <li class="flex flex-1 items-center last:flex-none">
                <div class="flex flex-col items-center gap-1.5">
                  <span
                    class="flex size-7 items-center justify-center rounded-full border text-xs font-semibold"
                    [ngClass]="stepDotClass(current.status, step.status)"
                  >
                    <ng-icon [name]="step.icon" class="size-3.5!" />
                  </span>
                  <span
                    class="text-[11px] font-medium"
                    [ngClass]="
                      isStepReached(current.status, step.status)
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    "
                  >
                    {{ step.label }}
                  </span>
                </div>

                @if (!$last) {
                  <span
                    class="mx-1 mb-5 h-0.5 flex-1 rounded-full"
                    [ngClass]="
                      isStepComplete(current.status, steps[$index + 1].status)
                        ? 'bg-primary'
                        : 'bg-border'
                    "
                  ></span>
                }
              </li>
            }
          </ol>
        </div>
      </a>
    } @else {
      <section class="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-start gap-3">
            <span
              class="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
            >
              <ng-icon name="lucideCalendarCheck" class="size-5!" />
            </span>
            <div>
              <h2 class="text-base font-semibold">No active pickup request</h2>
              <p class="mt-1 text-sm text-muted-foreground">
                Create a new request when your recyclables are ready.
              </p>
            </div>
          </div>
          <a
            [routerLink]="newPickupRoute()"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-background shadow-sm transition-colors hover:bg-primary/90"
          >
            <ng-icon name="lucidePlus" class="size-4!" />
            Request pickup
          </a>
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideCalendarCheck,
      lucideCheckCircle2,
      lucideChevronRight,
      lucideClock3,
      lucideImage,
      lucideMapPin,
      lucidePackageCheck,
      lucidePlus,
      lucideTruck,
    }),
  ],
})
export class CustomerActivePickupCardComponent {
  readonly pickup = input<CustomerPickupSummary | null>(null);
  readonly newPickupRoute = input.required<readonly string[]>();

  protected readonly steps = pickupSteps;

  protected isStepComplete(current: PickupStatus, step: PickupStatus): boolean {
    return this.statusIndex(current) >= this.statusIndex(step);
  }

  protected isStepReached(current: PickupStatus, step: PickupStatus): boolean {
    return this.statusIndex(current) >= this.statusIndex(step);
  }

  protected stepDotClass(current: PickupStatus, step: PickupStatus): string {
    if (this.isStepComplete(current, step)) {
      return 'border-primary bg-primary text-primary-foreground';
    }

    if (this.statusIndex(current) === this.statusIndex(step)) {
      return 'border-primary bg-primary/10 text-primary';
    }

    return 'border-border bg-card text-muted-foreground';
  }

  private statusIndex(status: PickupStatus): number {
    const index = pickupSteps.findIndex((step) => step.status === status);
    return index === -1 ? 0 : index;
  }
}
