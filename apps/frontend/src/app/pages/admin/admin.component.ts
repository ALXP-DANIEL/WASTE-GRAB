import { AppHeaderComponent } from '@/ui/header/header.component';
import { ROUTE_PATHS, routePath } from '@/app.routes';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideGift,
  lucideMapPin,
  lucidePackageCheck,
  lucideRecycle,
  lucideUsers,
  lucideTrophy,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppHeaderComponent,
    RouterLink,
    NgIcon,
  ],
  viewProviders: [
    provideIcons({
      lucideBell,
      lucideGift,
      lucideMapPin,
      lucidePackageCheck,
      lucideRecycle,
      lucideUsers,
      lucideTrophy,
    }),
  ],
})
export class AdminPage {
  protected readonly shortcuts = [
    {
      label: 'Notifications',
      description: 'Send announcements, manage pinned messages, and review notification logs.',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.notifications),
      icon: 'lucideBell',
    },
    {
      label: 'Vouchers',
      description: 'Create redeemable rewards and audit customer point activity.',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.vouchers),
      icon: 'lucideGift',
    },
    {
      label: 'Achievements',
      description: 'Create milestone rewards for pickup count and contributed weight.',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.achievements),
      icon: 'lucideTrophy',
    },
    {
      label: 'Locations',
      description: 'Maintain collection points where collectors can send waste.',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.collectors),
      icon: 'lucideMapPin',
    },
    {
      label: 'Categories',
      description: 'Manage waste categories, point rewards, AI matching, and restrictions.',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.wasteCategories),
      icon: 'lucideRecycle',
    },
    {
      label: 'Users',
      description: 'Manage customers, collectors, admins, and account access.',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.users),
      icon: 'lucideUsers',
    },
    {
      label: 'Pickups',
      description: 'Review pickup requests, statuses, and collection progress.',
      route: routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.pickups),
      icon: 'lucidePackageCheck',
    },
  ];
}
