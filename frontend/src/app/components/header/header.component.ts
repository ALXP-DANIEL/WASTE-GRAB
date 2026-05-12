import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUser, lucideSettings, lucideLogOut } from '@ng-icons/lucide';
import { ZardAvatarComponent } from '@/components/avatar/avatar.component';
import { ZardButtonComponent } from '@/components/button/button.component';
import { ZardDropdownMenuComponent } from '@/components/dropdown/dropdown.component';
import { ZardDropdownMenuContentComponent } from '@/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownMenuItemComponent } from '@/components/dropdown/dropdown-item.component';
import { ZardDropdownDirective } from '@/components/dropdown/dropdown-trigger.directive';
import { ZardDividerComponent } from '@/components/divider/divider.component';
import { ZardDialogService, Z_MODAL_DATA } from '@/components/dialog/dialog.service';
import { AuthService } from '@/services/auth.service';

@Component({
  selector: 'user-header',
  imports: [RouterLink, ZardAvatarComponent, ZardButtonComponent, ZardDropdownMenuComponent, ZardDropdownMenuContentComponent, ZardDropdownMenuItemComponent, ZardDropdownDirective, ZardDividerComponent, NgIcon],
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
            <z-dropdown-menu>
              <div dropdown-trigger z-dropdown [zDropdownMenu]="menuContent" class="cursor-pointer">
                <z-avatar
                  [zFallback]="user.name.slice(0, 2).toUpperCase()"
                  [zAlt]="user.name + ' avatar'"
                  zSize="md"
                  class="ring-2 ring-white shadow-sm"
                />
              </div>

              <z-dropdown-menu-content #menuContent>
                <z-dropdown-menu-item (click)="goToProfile()" class="flex items-center gap-2"><ng-icon name="lucideUser" class="size-4" /> Profile</z-dropdown-menu-item>
                <z-dropdown-menu-item (click)="goToSettings()" class="flex items-center gap-2"><ng-icon name="lucideSettings" class="size-4" /> Settings</z-dropdown-menu-item>
                <z-divider class="my-1"></z-divider>
                <z-dropdown-menu-item (click)="confirmLogout()" class="bg-red-50 hover:bg-red-100 text-red-700 flex items-center gap-2"><ng-icon name="lucideLogOut" class="size-4" /> Logout</z-dropdown-menu-item>
              </z-dropdown-menu-content>
            </z-dropdown-menu>
          } @else {
            <a z-button zType="default" routerLink="/auth" class="px-3 py-1 text-xs h-auto bg-emerald-900 hover:bg-emerald-800">Sign in</a>
          }
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideUser, lucideSettings, lucideLogOut })],
})
export class UserHeaderComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  protected readonly dialogService = inject(ZardDialogService);
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

  goToProfile(): void {
    void this.router.navigate(['/profile']);
  }

  goToSettings(): void {
    void this.router.navigate(['/settings']);
  }

  confirmLogout(): void {
    this.dialogService.create({
      zTitle: 'Confirm Logout',
      zDescription: 'Are you sure you want to logout?',
      zContent: LogoutConfirmDialog,
      zOkText: 'Logout',
      zOkDestructive: true,
      zCancelText: 'Cancel',
      zWidth: 'max-w-sm',
      zOnOk: () => {
        void this.authService.logout().subscribe({
          next: () => {
            void this.router.navigate(['/auth']);
          },
          error: () => {
            void this.router.navigate(['/auth']);
          },
        });
      },
    });
  }
}

// Logout confirmation dialog component
@Component({
  selector: 'logout-confirm-dialog',
  template: `
    <!-- Dialog content is handled by ZardDialogComponent, this is empty -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LogoutConfirmDialog {}
