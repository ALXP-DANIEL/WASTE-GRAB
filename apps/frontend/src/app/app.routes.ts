import { CanActivateFn, Route, Routes } from '@angular/router';
import { AppLayout } from './layouts/app-layout.component';
import { UserRole } from '@wastegrab/shared';
import { authGuard, guestGuard } from './services/auth.guard';

type LazyPage = NonNullable<Route['loadComponent']>;

const pages = {
  home: () => import('./pages/home/home.component').then((m) => m.HomePage),
  auth: () => import('./pages/auth/auth.component').then((m) => m.AuthPage),
  profile: () => import('./pages/customer/profile/profile.component').then((m) => m.ProfilePage),
  settings: () => import('./pages/customer/settings/settings.component').then((m) => m.SettingsPage),
  customerDashboard: () => import('./pages/customer/customer.component').then((m) => m.CustomerPage),
  customerNewPickup: () =>
    import('./pages/customer/new-pickup/new-pickup.component').then((m) => m.CustomerNewPickupPage),
  customerPickups: () => import('./pages/customer/pickups/pickups.component').then((m) => m.CustomerPickupsPage),
  customerPickupDetail: () =>
    import('./pages/customer/pickups/pickup-detail.component').then((m) => m.CustomerPickupDetailPage),
  customerVouchers: () => import('./pages/customer/vouchers/vouchers.component').then((m) => m.CustomerVouchersPage),
  adminDashboard: () => import('./pages/admin/admin.component').then((m) => m.AdminPage),
  adminCollectors: () => import('./pages/admin/collectors/collectors.component').then((m) => m.AdminCollectorsPage),
  adminPickups: () => import('./pages/admin/pickups/pickups.component').then((m) => m.AdminPickupsPage),
  adminUsers: () => import('./pages/admin/users/users.component').then((m) => m.AdminUsersPage),
  adminVouchers: () => import('./pages/admin/vouchers/vouchers.component').then((m) => m.AdminVouchersPage),
  collectorDashboard: () => import('./pages/collector/collector.component').then((m) => m.CollectorPage),
  collectorEarnings: () =>
    import('./pages/collector/earnings/earnings.component').then((m) => m.CollectorEarningsPage),
  collectorPickups: () =>
    import('./pages/collector/pickups/pickups.component').then((m) => m.CollectorPickupsPage),
} satisfies Record<string, LazyPage>;

interface RouteConfig {
  path: string;
  title: string;
  loadComponent?: LazyPage;
  guards?: CanActivateFn[];
  roles?: UserRole[];
  children?: RouteConfig[];
}

const ROUTE_CONFIG: RouteConfig[] = [
  {
    path: '',
    title: 'Home',
    loadComponent: pages.home,
  },
  {
    path: 'auth',
    title: 'Login',
    loadComponent: pages.auth,
    guards: [guestGuard],
  },
  {
    path: 'profile',
    title: 'Profile',
    loadComponent: pages.profile,
    guards: [authGuard],
  },
  {
    path: 'settings',
    title: 'Settings',
    loadComponent: pages.settings,
    guards: [authGuard],
  },
  {
    path: 'customer',
    title: 'Customer',
    guards: [authGuard],
    roles: [UserRole.CUSTOMER],
    children: [
      {
        path: '',
        title: 'Dashboard',
        loadComponent: pages.customerDashboard,
      },
      {
        path: 'new-pickup',
        title: 'New Pickup',
        loadComponent: pages.customerNewPickup,
      },
      {
        path: 'pickups',
        title: 'My Pickups',
        loadComponent: pages.customerPickups,
      },
      {
        path: 'pickups/:pickupId',
        title: 'Pickup Details',
        loadComponent: pages.customerPickupDetail,
      },
      {
        path: 'vouchers',
        title: 'My Vouchers',
        loadComponent: pages.customerVouchers,
      },
      {
        path: 'my-requests',
        title: 'My Requests',
        loadComponent: pages.customerPickups,
      },
      {
        path: 'rewards',
        title: 'Rewards',
        loadComponent: pages.customerVouchers,
      },
      {
        path: 'profile',
        title: 'Profile',
        loadComponent: pages.profile,
      },
      {
        path: 'settings',
        title: 'Settings',
        loadComponent: pages.settings,
      },
    ],
  },
  {
    path: 'admin',
    title: 'Admin',
    guards: [authGuard],
    roles: [UserRole.ADMIN],
    children: [
      {
        path: '',
        title: 'Admin Dashboard',
        loadComponent: pages.adminDashboard,
      },
      {
        path: 'locations',
        title: 'Manage Collection Locations',
        loadComponent: pages.adminCollectors,
      },
      {
        path: 'pickups',
        title: 'Manage Pickups',
        loadComponent: pages.adminPickups,
      },
      {
        path: 'users',
        title: 'Manage Users',
        loadComponent: pages.adminUsers,
      },
      {
        path: 'vouchers',
        title: 'Manage Vouchers',
        loadComponent: pages.adminVouchers,
      },
    ],
  },
  {
    path: 'collector',
    title: 'Collector',
    guards: [authGuard],
    roles: [UserRole.COLLECTOR],
    children: [
      {
        path: '',
        title: 'Collector Dashboard',
        loadComponent: pages.collectorDashboard,
      },
      {
        path: 'earnings',
        title: 'Collector Earnings',
        loadComponent: pages.collectorEarnings,
      },
      {
        path: 'pickups',
        title: 'Collector Pickups',
        loadComponent: pages.collectorPickups,
      },
    ],
  },
];

// Extract just the paths for template navigation
export const ROUTE_PATHS = {
  home: '',
  auth: 'auth',
  profile: 'profile',
  settings: 'settings',
  customer: {
    base: 'customer',
    newPickup: 'new-pickup',
    pickups: 'pickups',
    pickupDetail: ':pickupId',
    vouchers: 'vouchers',
    myRequests: 'my-requests',
    rewards: 'rewards',
  },
  admin: {
    base: 'admin',
    collectors: 'locations',
    pickups: 'pickups',
    users: 'users',
    vouchers: 'vouchers',
  },
  collector: {
    base: 'collector',
    earnings: 'earnings',
    pickups: 'pickups',
  },
} as const;

// Convert RouteConfig to Angular Routes
function buildRoutes(configs: RouteConfig[]): Routes {
  return configs.map(config => ({
    path: config.path,
    ...(config.loadComponent && { loadComponent: config.loadComponent }),
    canActivate: config.guards,
    data: {
      title: config.title,
      ...(config.roles && { roles: config.roles }),
    },
    children: config.children ? buildRoutes(config.children) : undefined,
  }));
}

const appRoutes = buildRoutes(ROUTE_CONFIG);

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: appRoutes,
  },
];
