import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  Input,
  signal,
} from '@angular/core';

import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';

import { filter } from 'rxjs';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUser, lucideSettings, lucideLogOut } from '@ng-icons/lucide';

import { ZardAvatarComponent } from '@/components/avatar/avatar.component';
import { ZardButtonComponent } from '@/components/button/button.component';
import { ZardDropdownMenuComponent } from '@/components/dropdown/dropdown.component';
import { ZardDropdownMenuContentComponent } from '@/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownMenuItemComponent } from '@/components/dropdown/dropdown-item.component';
import { ZardDropdownDirective } from '@/components/dropdown/dropdown-trigger.directive';
import { ZardDividerComponent } from '@/components/divider/divider.component';
import { ZardDialogService } from '@/components/dialog/dialog.service';

import { AuthService } from '@/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    ZardButtonComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuItemComponent,
    ZardDropdownDirective,
    ZardDividerComponent,
    NgIcon,
  ],
  template: `
    <header class="flex items-center justify-between pointer-events-auto">

      <!-- LEFT SIDE -->
      <div class="flex-1">

        @if (mode === 'welcome') {

          @if (authService.currentUser(); as user) {
            <h1 class="text-2xl font-bold text-slate-900">
              Welcome back, {{ user.name }}! 👋
            </h1>
          } @else {
            <h1 class="text-2xl font-bold text-slate-900">
              Welcome! 👋
            </h1>
          }

        } @else {

          <h1 class="text-2xl font-bold text-slate-900">
            {{ activeRouteTitle }}
          </h1>

        }

        <!-- ✨ ANIMATED QUOTE -->
        <p class="text-sm text-slate-500 mt-1 min-h-6 leading-relaxed">

          @for (word of visibleWords(); track $index) {
            <span class="inline-block mr-1 animate-wordFade">
              {{ word }}
            </span>
          }

        </p>

      </div>

      <!-- RIGHT SIDE -->
      <div class="flex items-center gap-2 shrink-0">

        @if (authService.currentUser(); as user) {

          <z-dropdown-menu>

            <button
              dropdown-trigger
              z-dropdown
              [zDropdownMenu]="menuContent"
              type="button"
              class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <ng-icon name="lucideUser" class="size-4" />
              Account
            </button>

            <z-dropdown-menu-content #menuContent>

              <div class="px-3 py-2 border-b border-slate-100">
                <p class="text-sm font-semibold text-slate-900 truncate">{{ user.name }}</p>
                <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
              </div>

              <z-dropdown-menu-item (click)="goToProfile()" class="flex items-center gap-2">
                <ng-icon name="lucideUser" class="size-4" />
                Profile
              </z-dropdown-menu-item>

              <z-dropdown-menu-item (click)="goToSettings()" class="flex items-center gap-2">
                <ng-icon name="lucideSettings" class="size-4" />
                Settings
              </z-dropdown-menu-item>

              <z-divider class="my-1"></z-divider>

              <z-dropdown-menu-item
                (click)="confirmLogout()"
                class="bg-red-50 hover:bg-red-100 text-red-700 flex items-center gap-2"
              >
                <ng-icon name="lucideLogOut" class="size-4" />
                Logout
              </z-dropdown-menu-item>

            </z-dropdown-menu-content>

          </z-dropdown-menu>

        } @else {

          <a
            z-button
            zType="default"
            routerLink="/auth"
            class="px-3 py-1 text-xs h-auto bg-emerald-900 hover:bg-emerald-800"
          >
            Sign in
          </a>

        }

      </div>

    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideUser, lucideSettings, lucideLogOut })],
})
export class AppHeaderComponent implements OnInit {
  @Input() mode: 'welcome' | 'route' = 'welcome';

  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly dialogService = inject(ZardDialogService);

  // -----------------------------
  // ROUTE TITLE
  // -----------------------------
  activeRouteTitle = '';

  // -----------------------------
  // QUOTES STATE
  // -----------------------------
  private quotes = [
    "Let's make our environment cleaner together.",
    'Every piece of waste recycled makes a difference.',
    'Together we can build a sustainable future.',
    "Reduce, reuse, recycle – that's the way.",
    'Your actions today shape tomorrow\'s world.',
    'Make waste management easy and rewarding.',
    'Join the movement towards zero waste.',
    'Small steps lead to big environmental changes.',
  ];

  visibleWords = signal<string[]>([]);

  // -----------------------------
  // INIT
  // -----------------------------
  ngOnInit(): void {
    if (!this.authService.hasLoadedSession()) {
      void this.authService.loadSession().subscribe();
    }

    this.updateRouteTitle();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateRouteTitle();
      });

    this.playQuoteAnimation();

    setInterval(() => {
      this.playQuoteAnimation();
    }, 7000);
  }

  // -----------------------------
  // MAIN ANIMATION (FIXED)
  // -----------------------------
  private playQuoteAnimation(): void {
    const newQuote = this.getRandomQuote();
    const newWords = newQuote.split(' ');

    // STEP 1: fade OUT old words (smooth shrink)
    const current = [...this.visibleWords()];
    let i = current.length;

    const fadeOut = setInterval(() => {
      if (i <= 0) {
        clearInterval(fadeOut);

        // STEP 2: reset then animate in new words
        this.visibleWords.set([]);
        this.animateWordsIn(newWords);
        return;
      }

      i--;
      this.visibleWords.set(current.slice(0, i));
    }, 50);
  }

  // STEP 3: animate IN words
  private animateWordsIn(words: string[]): void {
    let index = 0;

    const interval = setInterval(() => {
      if (index >= words.length) {
        clearInterval(interval);
        return;
      }

      this.visibleWords.update(v => [...v, words[index]]);
      index++;
    }, 160);
  }

  // -----------------------------
  // ROUTE TITLE
  // -----------------------------
  private updateRouteTitle(): void {
    let r = this.route;

    while (r.firstChild) {
      r = r.firstChild;
    }

    this.activeRouteTitle =
      r.snapshot.data?.['title'] ?? 'Untitled Page';
  }

  // -----------------------------
  // HELPERS
  // -----------------------------
  private getRandomQuote(): string {
    return this.quotes[
      Math.floor(Math.random() * this.quotes.length)
    ];
  }

  // -----------------------------
  // NAVIGATION
  // -----------------------------
  goToProfile(): void {
    void this.router.navigate(['/profile']);
  }

  goToSettings(): void {
    void this.router.navigate(['/settings']);
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  confirmLogout(): void {
    this.dialogService.create({
      zTitle: 'Confirm Logout',
      zDescription: 'Are you sure you want to logout?',
      zOkText: 'Logout',
      zOkDestructive: true,
      zCancelText: 'Cancel',
      zWidth: 'max-w-sm',

      zOnOk: () => {
        void this.authService.logout().subscribe({
          next: () => void this.router.navigate(['/auth']),
          error: () => void this.router.navigate(['/auth']),
        });
      },
    });
  }
}