import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="app-shell">
      <header class="app-navbar">
        <a routerLink="/" class="app-brand" aria-label="WasteGrab home">
          <span class="app-brand-mark">WG</span>
          <span class="app-brand-text">WasteGrab</span>
        </a>

        <div class="app-status">
          @if (!authService.hasLoadedSession()) {
            <span class="status-pill status-pill--loading">Loading session</span>
          } @else if (authService.currentUser(); as user) {
            <div class="status-card" aria-label="Signed in user">
              <span class="status-card__label">Signed in</span>
              <strong class="status-card__name">{{ user.name }}</strong>
              <span class="status-card__role">{{ user.role }}</span>
            </div>
            <button type="button" class="app-action app-action--ghost" (click)="logout()">
              Logout
            </button>
          } @else {
            <a routerLink="/auth" class="app-action">Sign in</a>
          }
        </div>
      </header>

      <main class="app-main">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (!this.authService.hasLoadedSession()) {
      void this.authService.loadSession().subscribe();
    }
  }

  protected logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        void this.router.navigateByUrl('/');
      },
    });
  }
}
