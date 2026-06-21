import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ZardButtonComponent } from '@/ui/zard/button/button.component';

export type FilterOption<T extends string = string> = {
  value: T;
  label: string;
};

@Component({
  selector: 'app-table-header',
  standalone: true,
  imports: [
    CommonModule,
    ZardButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h2 class="text-lg font-semibold">{{ title() }}</h2>
        <p class="text-sm text-muted-foreground">
          {{ description() }}
        </p>
      </div>

      @if (filters().length > 0) {
        <div class="flex flex-wrap gap-2">
          @for (filter of filters(); track filter.value) {
            <button
              z-button
              type="button"
              zSize="sm"
              [zType]="
                activeFilter() === filter.value ? 'default' : 'outline'
              "
              (click)="filterChange.emit(filter.value)"
            >
              {{ filter.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class TableHeaderComponent<T extends string = string> {
  // Inputs
  readonly title = input('');
  readonly description = input('');
  readonly filters = input<FilterOption<T>[]>([]);
  readonly activeFilter = input<T | string>('');

  // Outputs
  readonly filterChange = output<T>();
}
