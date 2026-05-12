import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ZardBadgeComponent } from './components/badge/badge.component';
import { ZardButtonComponent } from './components/button/button.component';
import { ZardCardComponent } from './components/card/card.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, ZardBadgeComponent, ZardButtonComponent, ZardCardComponent],
  template: `
    <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] text-slate-900">
      <header class="px-4 pt-4">
        <z-card class="mx-auto max-w-6xl border-slate-200/70 bg-white/85 shadow-sm backdrop-blur-xl">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <a routerLink="/" class="inline-flex items-center gap-3 text-inherit no-underline">
              <span class="grid size-10 place-items-center rounded-full bg-slate-950 text-xs font-extrabold tracking-[0.2em] text-white">WG</span>
              <span class="text-sm font-extrabold uppercase tracking-[0.18em]">WasteGrab</span>
            </a>

            <div class="flex flex-wrap items-center justify-end gap-2">
              @if (!authService.hasLoadedSession()) {
                <z-badge zType="outline" class="border-slate-200 bg-slate-100 text-slate-500">Loading session</z-badge>
              } @else if (authService.currentUser(); as user) {
                <div class="flex items-center gap-2">
                  <z-badge zType="secondary">{{ user.name }}</z-badge>
                  <z-badge zType="outline">{{ user.role }}</z-badge>
                </div>
                <button z-button zType="outline" type="button" (click)="logout()">Logout</button>
              } @else {
                <a z-button zType="default" routerLink="/auth">Sign in</a>
              }
            </div>
          </div>
        </z-card>
      </header>

      <main class="min-h-0">
        <router-outlet />
      </main>
    </div>
  `,
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
