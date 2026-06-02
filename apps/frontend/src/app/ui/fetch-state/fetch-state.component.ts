import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-fetch-state',
  standalone: true,
  template: `
    @if (isLoading()) {
      <section class="rounded-lg border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        <p class="font-semibold">{{ loadingText() }}</p>
      </section>
    } @else if (loadError()) {
      <section class="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p class="font-semibold text-destructive">{{ loadError() }}</p>
      </section>
    } @else {
      <ng-content />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FetchStateComponent {
  readonly isLoading = input(false);
  readonly loadError = input('');
  readonly loadingText = input('Loading data...');
}
