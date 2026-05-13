import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHome,
  lucideRecycle,
  lucideGift,
  lucideLayoutDashboard,
  lucideUsers,
  lucideTruck,
  lucidePackage,
  lucideLogOut,
  lucideSettings,
  lucideChevronRight,
} from '@ng-icons/lucide';

import { UserRole, type User } from '@wastegrab/shared';
import { AuthService } from '@/services/auth.service';
import { ZardAvatarComponent } from '@/components/avatar/avatar.component';
import { ZardDialogService } from '@/components/dialog/dialog.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  showOnMobile: boolean;
}

type Role = User['role'];

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIcon, ZardAvatarComponent],
  viewProviders: [
    provideIcons({
      lucideHome,
      lucideRecycle,
      lucideGift,
      lucideLayoutDashboard,
      lucideUsers,
      lucideTruck,
      lucidePackage,
      lucideLogOut,
      lucideSettings,
      lucideChevronRight,
    }),
  ],
  template: `
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-dvh lg:w-56 lg:bg-emerald-900 lg:border-r lg:border-emerald-800 z-40 lg:rounded-tr-2xl lg:rounded-br-2xl overflow-y-auto">
      <div class="flex flex-col h-full">

        <!-- Brand -->
        <div class="px-6 py-6 border-b border-emerald-800">
          <a routerLink="/" class="flex items-center gap-3 text-white no-underline hover:opacity-80">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <ng-icon name="lucideRecycle" class="h-6 w-6 text-white" />
            </div>
            <div>
              <div class="font-bold text-lg text-white">WasteGrab</div>
              <p class="text-xs text-emerald-100/70">{{ user()?.role | titlecase }}</p>
            </div>
          </a>
        </div>

        <!-- Nav -->
        <nav class="flex-1 flex flex-col gap-2 px-4 py-6">
          @for (item of navItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-emerald-800 rounded-xl"
              [routerLinkActiveOptions]="{ exact: true }"
              class="group flex items-center gap-3 rounded-xl text-sm font-medium text-emerald-100"
            >
              <span class="flex w-full items-center gap-3 rounded-xl px-4 py-2 group-hover:bg-emerald-700 group-hover:text-white">
                <ng-icon [name]="item.icon" class="size-4!" />
                <span>{{ item.label }}</span>
              </span>
            </a>
          }
        </nav>

        <!-- Bottom -->
        <div class="border-t border-emerald-800 p-4 space-y-3">

          <a [routerLink]="profileRoute" class="block bg-emerald-800/70 rounded-lg p-3 hover:bg-emerald-700">
            <div class="flex items-center gap-3">
              <z-avatar
                [zFallback]="getInitials(user()?.name)"
                [zAlt]="user()?.name + ' avatar'"
                zSize="md"
                class="ring-2 ring-emerald-700"
              />

              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-white truncate">{{ user()?.name }}</p>
                <p class="text-xs text-emerald-100/70 truncate">{{ user()?.role | titlecase }}</p>
              </div>

            </div>
          </a>

          <div class="flex gap-2">
            <a
              [routerLink]="settingsRoute"
              class="flex-1 py-2 text-xs bg-emerald-800 rounded-lg text-center text-white hover:bg-emerald-700 transition-colors"
            >
              Settings
            </a>

            <button
              (click)="confirmLogout()"
              class="flex-1 py-2 text-xs bg-emerald-800 rounded-lg text-red-300 hover:bg-emerald-700 transition-colors"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </aside>

    <!-- Mobile Bottom Nav -->
    <nav class="lg:hidden m-2 mt-0 bg-emerald-900 border border-emerald-800 rounded-2xl shadow-lg z-40">
      <div class="flex h-20 items-stretch gap-2 p-2">

        @for (item of navItems(); track item.route) {
          @if (item.showOnMobile) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-emerald-800 text-white"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl text-emerald-100 hover:bg-emerald-700"
            >
              <ng-icon [name]="item.icon" class="size-5!" />
              <span class="text-xs font-medium">{{ item.label }}</span>
            </a>
          }
        }

        <!-- Profile -->
        <a
          [routerLink]="profileRoute"
          routerLinkActive="bg-emerald-800 text-white"
          class="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl text-emerald-100 hover:bg-emerald-700"
        >
          <z-avatar
            [zFallback]="getInitials(user()?.name)"
            [zAlt]="user()?.name + ' avatar'"
            zSize="md"
            class="ring-2 ring-emerald-700 bg-white text-black"
          />
          <span class="text-xs font-medium">Profile</span>
        </a>

      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppNavbarComponent {
  protected readonly authService = inject(AuthService);
  private readonly dialogService = inject(ZardDialogService);

  protected readonly user = computed(() => this.authService.currentUser());

  protected readonly roleNav: Record<Role, NavItem[]> = {
    [UserRole.CUSTOMER]: [
      { label: 'Dashboard', route: '/customer', icon: 'lucideHome', showOnMobile: true },
      { label: 'New Pickup', route: '/customer/new-pickup', icon: 'lucideRecycle', showOnMobile: true },
      { label: 'Pickups', route: '/customer/pickups', icon: 'lucidePackage', showOnMobile: true },
      { label: 'Vouchers', route: '/customer/vouchers', icon: 'lucideGift', showOnMobile: true },
      { label: 'Profile', route: '/customer/profile', icon: 'lucideHome', showOnMobile: false },
    ],
    [UserRole.ADMIN]: [
      { label: 'Dashboard', route: '/admin', icon: 'lucideLayoutDashboard', showOnMobile: true },
      { label: 'Users', route: '/admin/users', icon: 'lucideUsers', showOnMobile: true },
      { label: 'Collectors', route: '/admin/collectors', icon: 'lucideTruck', showOnMobile: true },
      { label: 'Pickups', route: '/admin/pickups', icon: 'lucidePackage', showOnMobile: true },
      { label: 'Vouchers', route: '/admin/vouchers', icon: 'lucideGift', showOnMobile: false },
    ],
    [UserRole.COLLECTOR]: [
      { label: 'Dashboard', route: '/collector', icon: 'lucideLayoutDashboard', showOnMobile: true },
      { label: 'Pickups', route: '/collector/pickups', icon: 'lucideRecycle', showOnMobile: true },
      { label: 'Earnings', route: '/collector/earnings', icon: 'lucideGift', showOnMobile: true },
    ],
  };

  protected readonly navItems = computed(() => {
    const role = this.user()?.role;
    return role ? this.roleNav[role] ?? [] : [];
  });

  protected readonly profileRoute = '/profile';
  protected readonly settingsRoute = '/settings';

  protected getInitials(name?: string | null): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0]!.toUpperCase())
      .join('');
  }

  protected confirmLogout(): void {
    this.dialogService.create({
      zTitle: 'Confirm Logout',
      zDescription: 'Are you sure you want to logout?',
      zOkText: 'Logout',
      zOkDestructive: true,
      zCancelText: 'Cancel',
      zWidth: 'max-w-sm',
      zOnOk: () => {
        this.authService.logout().subscribe({
          next: () => (window.location.href = '/auth'),
          error: () => (window.location.href = '/auth'),
        });
      },
    });
  }
}