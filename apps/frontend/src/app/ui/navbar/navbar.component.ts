import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronRight,
  lucideHistory,
  lucideImage,
  lucideGift,
  lucideLayoutDashboard,
  lucideTrophy,
  lucidePackage,
  lucidePlus,
  lucideLogOut,
  lucideSettings,
  lucideTruck,
  lucideUsers,
  lucideRecycle,
  lucideBell,
  lucideChartNoAxesColumn,
} from '@ng-icons/lucide';

import { UserRole, type User } from '@wastegrab/shared';
import { ROUTE_PATHS, routePath } from '@/app-route-paths';
import { AuthService } from '@/services/auth.service';
import { BrandLogoComponent } from '@/ui/brand/brand-logo.component';
import { ZardAvatarComponent } from '@/ui/zard/avatar/avatar.component';
import { ZardDialogService } from '@/ui/zard/dialog/dialog.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  showOnMobile: boolean;
  primary?: boolean;
}

type Role = User['role'];

const ROLE_NAV = {
  [UserRole.CUSTOMER]: [
    {
      label: 'Dashboard',
      route: routePath(ROUTE_PATHS.customer.base),
      icon: 'lucideLayoutDashboard',
      showOnMobile: true,
    },
    {
      label: 'New Request',
      route: routePath(
        ROUTE_PATHS.customer.base,
        ROUTE_PATHS.customer.newPickup,
      ),
      icon: 'lucidePlus',
      showOnMobile: true,
      primary: true,
    },
    {
      label: 'My Pickups',
      route: routePath(ROUTE_PATHS.customer.base, ROUTE_PATHS.customer.pickups),
      icon: 'lucideHistory',
      showOnMobile: true,
    },
    {
      label: 'Rewards',
      route: routePath(
        ROUTE_PATHS.customer.base,
        ROUTE_PATHS.customer.vouchers,
      ),
      icon: 'lucideGift',
      showOnMobile: true,
    },
    {
      label: 'Achievements',
      route: routePath(
        ROUTE_PATHS.customer.base,
        ROUTE_PATHS.customer.achievements,
      ),
      icon: 'lucideTrophy',
      showOnMobile: false,
    },
    {
      label: 'Ranks',
      route: routePath(
        ROUTE_PATHS.customer.base,
        ROUTE_PATHS.customer.leaderboard,
      ),
      icon: 'lucideChartNoAxesColumn',
      showOnMobile: false,
    },
  ],
  [UserRole.ADMIN]: [
    {
      label: 'Dashboard',
      route: routePath(ROUTE_PATHS.admin.base),
      icon: 'lucideLayoutDashboard',
      showOnMobile: true,
    },
    {
      label: 'Users',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.users),
      icon: 'lucideUsers',
      showOnMobile: true,
    },
    {
      label: 'Locations',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.collectors),
      icon: 'lucideTruck',
      showOnMobile: true,
    },
    {
      label: 'Categories',
      route: routePath(
        ROUTE_PATHS.admin.base,
        ROUTE_PATHS.admin.wasteCategories,
      ),
      icon: 'lucideRecycle',
      showOnMobile: true,
    },
    {
      label: 'Pickups',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.pickups),
      icon: 'lucidePackage',
      showOnMobile: true,
    },
    {
      label: 'Vouchers',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.vouchers),
      icon: 'lucideGift',
      showOnMobile: false,
    },
    {
      label: 'Notifications',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.notifications),
      icon: 'lucideBell',
      showOnMobile: false,
    },
    {
      label: 'Auth Slides',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.authSlides),
      icon: 'lucideImage',
      showOnMobile: false,
    },
    {
      label: 'Achievements',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.achievements),
      icon: 'lucideTrophy',
      showOnMobile: false,
    },
  ],
  [UserRole.COLLECTOR]: [
    {
      label: 'Dashboard',
      route: routePath(ROUTE_PATHS.collector.base),
      icon: 'lucideLayoutDashboard',
      showOnMobile: true,
    },
    {
      label: 'Available',
      route: routePath(
        ROUTE_PATHS.collector.base,
        ROUTE_PATHS.collector.pickups,
      ),
      icon: 'lucideRecycle',
      showOnMobile: true,
    },
    {
      label: 'My Pickups',
      route: routePath(
        ROUTE_PATHS.collector.base,
        ROUTE_PATHS.collector.myPickups,
      ),
      icon: 'lucideTruck',
      showOnMobile: true,
    },
    {
      label: 'Earnings',
      route: routePath(
        ROUTE_PATHS.collector.base,
        ROUTE_PATHS.collector.earnings,
      ),
      icon: 'lucideGift',
      showOnMobile: true,
    },
  ],
} as Record<Role, readonly NavItem[]>;

function getInitials(name?: string | null): string {
  const initials = name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || 'U';
}

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    BrandLogoComponent,
    ZardAvatarComponent,
  ],
  viewProviders: [
    provideIcons({
      lucideRecycle,
      lucideBell,
      lucideTrophy,
      lucideChartNoAxesColumn,
      lucideGift,
      lucideImage,
      lucideLayoutDashboard,
      lucidePlus,
      lucideHistory,
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
    <aside
      class="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-dvh lg:w-64 lg:bg-background lg:border-r lg:border-border z-40 overflow-y-auto"
    >
      <div class="flex flex-col h-full">
        <!-- Brand -->
        <div class="border-b border-border px-6 py-3">
          <app-brand-logo size="lg" />
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-4 py-6">
          @for (item of navItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-primary text-primary-foreground shadow-sm"
              [routerLinkActiveOptions]="{ exact: true }"
              ariaCurrentWhenActive="page"
              class="group mb-1 flex items-center gap-3 rounded-full text-sm font-semibold text-muted-foreground"
            >
              <span
                class="flex w-full items-center gap-3 rounded-full px-4 py-2.5 transition-colors group-hover:bg-primary/10"
              >
                <ng-icon [name]="item.icon" class="size-4!" />
                <span>{{ item.label }}</span>
              </span>
            </a>
          }
        </nav>

        <!-- Bottom -->
        <div class="space-y-3 border-t border-border p-4">
          <a
            [routerLink]="profileRoute"
            class="card-lift block rounded-2xl border border-border/60 bg-card p-3 transition-colors hover:border-primary/40"
          >
            <div class="flex items-center gap-3">
              <z-avatar
                [zSrc]="user()?.avatarUrl || ''"
                [zFallback]="userInitials()"
                [zAlt]="avatarAlt()"
                zSize="md"
                class="ring-2 ring-primary/20"
              />

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-foreground">
                  {{ user()?.name }}
                </p>
                <p class="truncate text-xs text-muted-foreground">
                  {{ user()?.role | titlecase }}
                </p>
              </div>

              <ng-icon
                name="lucideChevronRight"
                class="size-4! text-muted-foreground"
              />
            </div>
          </a>

          <div class="flex gap-2">
            <a
              [routerLink]="settingsRoute"
              class="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-secondary py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-accent"
            >
              <ng-icon
                name="lucideSettings"
                class="size-3.5!"
                aria-hidden="true"
              />
              <span>Settings</span>
            </a>

            <button
              type="button"
              (click)="confirmLogout()"
              class="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-destructive/10 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
            >
              <ng-icon
                name="lucideLogOut"
                class="size-3.5!"
                aria-hidden="true"
              />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile Bottom Nav -->
    <nav class="lg:hidden mx-3 mb-2 mt-0 z-40">
      <div class="flex h-18 items-center gap-1 rounded-3xl border border-border/60 bg-card/95 px-2 shadow-lg backdrop-blur">
        @for (item of mobileNavItems(); track item.route) {
          @if (item.primary) {
            <!-- Primary CTA pill -->
            <a
              [routerLink]="item.route"
              routerLinkActive="opacity-90"
              [routerLinkActiveOptions]="{ exact: true }"
              ariaCurrentWhenActive="page"
              class="mx-1 flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary p-3 text-primary-foreground shadow-md transition-all active:scale-95"
            >
              <ng-icon [name]="item.icon" class="size-5! shrink-0" />
              <span class="text-xs font-bold">{{ item.label }}</span>
            </a>
          } @else {
            <a
              [routerLink]="item.route"
              routerLinkActive="text-primary"
              [routerLinkActiveOptions]="{ exact: true }"
              ariaCurrentWhenActive="page"
              class="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-muted-foreground transition-all active:scale-95 hover:text-primary"
            >
              <ng-icon [name]="item.icon" class="size-5!" />
              <span class="text-[10px] font-semibold leading-none">{{ item.label }}</span>
            </a>
          }
        }
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppNavbarComponent {
  protected readonly authService = inject(AuthService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly router = inject(Router);

  protected readonly user = computed(() => this.authService.currentUser());
  protected readonly userInitials = computed(() =>
    getInitials(this.user()?.name),
  );
  protected readonly avatarAlt = computed(
    () => `${this.user()?.name?.trim() || 'User'} avatar`,
  );

  protected readonly roleNav = ROLE_NAV;

  protected readonly navItems = computed(() => {
    const role = this.user()?.role;
    return role ? (this.roleNav[role] ?? []) : [];
  });

  protected readonly mobileNavItems = computed(() =>
    this.navItems().filter((item) => item.showOnMobile),
  );

  protected readonly profileRoute = routePath(ROUTE_PATHS.profile);
  protected readonly settingsRoute = routePath(ROUTE_PATHS.settings);

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
          next: () => this.redirectToAuth(),
          error: () => this.redirectToAuth(),
        });
      },
    });
  }

  private redirectToAuth(): void {
    void this.router.navigateByUrl(routePath(ROUTE_PATHS.auth));
  }
}
