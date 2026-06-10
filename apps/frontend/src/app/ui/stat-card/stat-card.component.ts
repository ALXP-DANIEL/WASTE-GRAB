import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

export type StatCardTone = 'brand' | 'info' | 'success' | 'warning' | 'neutral';

const TONE_CLASSES: Record<StatCardTone, string> = {
  brand: 'bg-primary/10 text-primary',
  info: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  neutral: 'bg-muted text-muted-foreground',
};

/**
 * Shared dashboard stat card. The icon is resolved against the icon registry
 * of the consuming page, so register lucide icons via provideIcons there.
 */
@Component({
  selector: 'app-stat-card',
  imports: [NgIcon],
  template: `
    <article class="card-lift rounded-2xl border border-border/60 bg-card p-4 lg:p-5">
      <div class="flex items-center gap-2.5">
        <span class="grid size-9 shrink-0 place-items-center rounded-full" [class]="toneClass()">
          <ng-icon [name]="icon()" class="size-4.5!" />
        </span>
        <p class="min-w-0 truncate text-xs font-semibold text-muted-foreground">{{ label() }}</p>
      </div>
      <p class="mt-2.5 truncate text-2xl font-bold tracking-tight lg:text-3xl">
        {{ value() }}
        @if (unit()) {
          <span class="ml-1 text-sm font-semibold text-muted-foreground">{{ unit() }}</span>
        }
      </p>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string | number | null>();
  readonly unit = input('');
  readonly tone = input<StatCardTone>('brand');

  protected readonly toneClass = computed(() => TONE_CLASSES[this.tone()]);
}
