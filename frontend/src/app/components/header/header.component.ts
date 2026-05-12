import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZardAvatarComponent } from '@/components/avatar/avatar.component';
import { ZardButtonComponent } from '@/components/button/button.component';
import { AuthService } from '@/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ZardAvatarComponent, ZardButtonComponent],
  template: `
    <!-- Top Minimal Header (Mobile & Desktop) -->
    <header class="fixed top-0 left-0 right-0 z-50 lg:left-56 pointer-events-none">
      <div class="flex items-center justify-between gap-4 p-6 pointer-events-auto">
        <!-- Left: Greeting & Quote -->
        <div class="flex-1">
          @if (authService.currentUser(); as user) {
            <h1 class="text-2xl font-bold text-slate-900">Welcome back, {{ user.name }}! 👋</h1>
            <p class="text-sm text-slate-500 mt-1">{{ randomQuote }}</p>
          } @else if (!authService.hasLoadedSession()) {
            <span class="text-sm text-slate-500">Loading...</span>
          } @else {
            <h1 class="text-2xl font-bold text-slate-900">Welcome! 👋</h1>
            <p class="text-sm text-slate-500 mt-1">{{ randomQuote }}</p>
          }
        </div>

        <!-- Right: User Avatar -->
        <div class="flex items-center gap-2 shrink-0">
          @if (authService.currentUser(); as user) {
              <z-avatar
                [zFallback]="user.name.slice(0, 2).toUpperCase()"
                [zAlt]="user.name + ' avatar'"
                zSize="md"
                class="ring-2 ring-white shadow-sm"
              />
          } @else {
            <a z-button zType="default" routerLink="/auth" class="px-3 py-1 text-xs h-auto bg-emerald-900 hover:bg-emerald-800">Sign in</a>
          }
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeaderComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  protected randomQuote: string = '';

  private quotes = [
    'Let\'s make our environment cleaner together.',
    'Every piece of waste recycled makes a difference.',
    'Together we can build a sustainable future.',
    'Reduce, reuse, recycle – that\'s the way.',
    'Your actions today shape tomorrow\'s world.',
    'Make waste management easy and rewarding.',
    'Join the movement towards zero waste.',
    'Small steps lead to big environmental changes.',
  ];

  ngOnInit(): void {
    if (!this.authService.hasLoadedSession()) {
      void this.authService.loadSession().subscribe();
    }
    this.randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
  }
}
