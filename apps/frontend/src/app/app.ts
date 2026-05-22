import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    @if (showEnvironmentBanner) {
      <div class="sticky top-0 z-50 w-full bg-red-600 text-white text-xs font-bold leading-4 px-3 py-1 text-center uppercase">
        Running on {{ environmentLabel }}
      </div>
    }

    <router-outlet />
  `,
})
export class App {
  protected readonly showEnvironmentBanner = environment.showEnvironmentBanner;
  protected readonly environmentLabel = environment.environmentLabel;
}
