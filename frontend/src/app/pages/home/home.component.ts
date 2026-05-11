import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="home-shell">
      <div class="home-content">
        <h1 class="home-title">WasteGrab</h1>
        <button type="button" routerLink="/todos" class="home-button">
          Todos
        </button>
      </div>
    </main>
  `,
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
