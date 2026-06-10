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
    <article class="rounded-xl border border-border bg-card p-3 shadow-sm lg:p-4">
      <div class="flex items-center gap-2">
        <span class="grid size-8 shrink-0 place-items-center rounded-lg" [class]="toneClass()">
          <ng-icon [name]="icon()" class="size-4!" />
        </span>
        <p class="min-w-0 truncate text-xs font-medium text-muted-foreground">{{ label() }}</p>
      </div>
      <p class="mt-2 truncate text-2xl font-semibold tracking-tight">
        {{ value() }}
        @if (unit()) {
          <span class="ml-1 text-sm font-medium text-muted-foreground">{{ unit() }}</span>
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
