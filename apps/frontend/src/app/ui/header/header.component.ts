import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnDestroy,
  OnInit,
  inject,
  Input,
  signal,
} from '@angular/core';

import {
  ActivatedRoute,
  NavigationEnd,
  Router,
} from '@angular/router';

import { filter } from 'rxjs';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideTrash2, lucideUser, lucideSettings, lucideLogOut } from '@ng-icons/lucide';

import { ZardBadgeComponent } from '@/ui/zard/badge/badge.component';
import { ZardButtonComponent } from '@/ui/zard/button/button.component';
import { ZardDialogService } from '@/ui/zard/dialog/dialog.service';
import {
  ZardDropdownDirective,
  ZardDropdownMenuContentComponent,
  ZardDropdownMenuItemComponent,
} from '@/ui/zard/dropdown';

import { AuthService } from '@/services/auth.service';
import { NotificationService } from '@/services/notification.service';
import type { Notification } from '@wastegrab/shared';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardDropdownDirective,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuItemComponent,
    NgIcon,
  ],
  template: `
    <header class="flex items-center justify-between pointer-events-auto">

      <!-- LEFT SIDE -->
      <div class="">

        @if (mode === 'welcome') {

          @if (authService.currentUser(); as user) {
            <h1 class="text-2xl font-bold text-foreground">
              Welcome back, {{ user.name }}! 👋
            </h1>
          } @else {
            <h1 class="text-2xl font-bold text-foreground">
              Welcome! 👋
            </h1>
          }

        } @else {

          <h1 class="text-2xl font-bold text-foreground">
            {{ activeRouteTitle }}
          </h1>

        }

        <!-- ✨ ANIMATED QUOTE -->
        <p class="text-sm text-muted-foreground mt-1 min-h-6 leading-relaxed">

          @for (word of visibleWords(); track $index) {
            <span class="inline-block mr-1 animate-wordFade">
              {{ word }}
            </span>
          }

        </p>

      </div>

      <!-- RIGHT SIDE -->
      <div class="flex items-center gap-2 shrink-0">
        <ng-content select="[rightSide]" />

        <button
          z-button
          #notificationTrigger
          zDropdown
          [zDropdownMenu]="notificationMenu"
          zTrigger="click"
          type="button"
          zType="outline"
          zSize="icon"
          zShape="circle"
          class="relative"
          aria-label="Notifications"
        >
          <ng-icon name="lucideBell" class="size-5!" />

          @if (notificationCount() > 0) {
            <z-badge
              zType="default"
              zShape="pill"
              class="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] font-semibold leading-none shadow-sm pointer-events-none"
            >
              {{ notificationCount() }}
            </z-badge>
          }
        </button>
      </div>

      <z-dropdown-menu-content #notificationMenu="zDropdownMenuContent" class="w-80 overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-xl">
        <div class="border-b border-border px-4 py-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-foreground">Notifications</p>
              <p class="text-xs text-slate-500">
                @if (notificationCount() > 0) {
                  {{ notificationCount() }} updates waiting for you
                } @else {
                  No updates right now
                }
              </p>
            </div>

            <button
              type="button"
              class="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
              (click)="markAllNotificationsRead()"
            >
              Mark read
            </button>
          </div>
          @if (notificationItems().length > 0) {
            <button
              type="button"
              class="mt-3 w-full rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
              (click)="clearAllNotifications($event)"
            >
              Clear notifications
            </button>
          }
          @if (notificationService.canEnablePush()) {
            <button
              type="button"
              class="mt-3 w-full rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
              (click)="enablePushNotifications()"
            >
              Enable device notifications
            </button>
          }
        </div>

        @if (notificationItems().length > 0) {
          <div class="max-h-72 divide-y divide-slate-100 overflow-y-auto">
            @for (item of notificationItems(); track item.id) {
              <button
                z-dropdown-menu-item
                type="button"
                class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                (click)="openNotification(item)"
              >
                <span
                  class="mt-1 h-2.5 w-2.5 rounded-full"
                  [class.bg-emerald-500]="!item.readAt"
                  [class.bg-slate-300]="item.readAt"
                ></span>

                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-medium text-slate-900">{{ item.title }}</span>
                  <span class="mt-0.5 block text-xs leading-5 text-slate-500">{{ item.message }}</span>
                  <span class="mt-1 block text-[11px] text-slate-400">{{ notificationTime(item) }}</span>
                </span>

                @if (item.isClearable) {
                  <button
                    type="button"
                    class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Clear notification"
                    (click)="clearNotification($event, item)"
                  >
                    <ng-icon name="lucideTrash2" class="size-4!" />
                  </button>
                } @else {
                  <span class="mt-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    Pinned
                  </span>
                }
              </button>
            }
          </div>
        } @else {
          <div class="px-4 py-8 text-center">
            <p class="text-sm font-medium text-slate-900">You're all caught up.</p>
            <p class="mt-1 text-xs text-slate-500">New notifications will appear here.</p>
          </div>
        }
      </z-dropdown-menu-content>

    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideBell, lucideTrash2, lucideUser, lucideSettings, lucideLogOut })],
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  @Input() mode: 'welcome' | 'route' = 'welcome';

  protected readonly authService = inject(AuthService);
  protected readonly notificationService = inject(NotificationService);
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly dialogService = inject(ZardDialogService);

  protected readonly notificationItems = computed(() => this.notificationService.notifications());
  protected readonly notificationCount = computed(() => this.notificationService.unreadCount());

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
      void this.authService.loadSession().subscribe({
        next: () => this.loadNotifications(),
      });
    } else {
      this.loadNotifications();
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

  ngOnDestroy(): void {
    this.notificationService.stopRealtime();
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

  protected markAllNotificationsRead(): void {
    void this.notificationService.markAllRead().subscribe();
  }

  protected clearAllNotifications(event: Event): void {
    event.stopPropagation();
    void this.notificationService.clearAllNotifications().subscribe();
  }

  protected clearNotification(event: Event, notification: Notification): void {
    event.stopPropagation();
    void this.notificationService.clearNotification(notification).subscribe();
  }

  protected openNotification(notification: Notification): void {
    this.notificationService.markRead(notification);
  }

  protected enablePushNotifications(): void {
    void this.notificationService.enablePushNotifications().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Unable to enable device notifications.';
      this.dialogService.create({
        zTitle: 'Notifications unavailable',
        zDescription: message,
        zOkText: 'OK',
        zWidth: 'max-w-sm',
      });
    });
  }

  protected notificationTime(notification: Notification): string {
    return new Date(notification.createdAt).toLocaleString();
  }

  private loadNotifications(): void {
    if (!this.authService.currentUser()) {
      return;
    }

    this.notificationService.startRealtime();
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  confirmLogout(): void {
    this.dialogService.create({
      zTitle: 'Confirm Logout',
      zDescription: 'Are you sure you want to logout?',
      zOkText: 'Logout',
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
