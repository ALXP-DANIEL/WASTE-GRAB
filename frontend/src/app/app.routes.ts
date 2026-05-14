import { Routes } from '@angular/router';
import { AppLayout } from './layouts/app-layout.component';
import { AuthPage } from './pages/auth/auth.component';
import { HomePage } from './pages/home/home.component';
import { TodosPage } from './pages/todos/todos.component';
import { ProfilePage } from './pages/customer/profile/profile.component';
import { SettingsPage } from './pages/customer/settings/settings.component';
import { AdminPage } from './pages/admin/admin.component';
import { CollectorPage } from './pages/collector/collector.component';
import { CustomerNewPickupPage } from './pages/customer/new-pickup/new-pickup.component';
import { CustomerPickupsPage } from './pages/customer/pickups/pickups.component';
import { CustomerPickupDetailPage } from './pages/customer/pickups/pickup-detail.component';
import { CustomerVouchersPage } from './pages/customer/vouchers/vouchers.component';
import { AdminCollectorsPage } from './pages/admin/collectors/collectors.component';
import { AdminPickupsPage } from './pages/admin/pickups/pickups.component';
import { AdminUsersPage } from './pages/admin/users/users.component';
import { AdminVouchersPage } from './pages/admin/vouchers/vouchers.component';
import { CollectorEarningsPage } from './pages/collector/earnings/earnings.component';
import { CollectorPickupsPage } from './pages/collector/pickups/pickups.component';
import { UserRole } from '@wastegrab/shared';
import { authGuard, guestGuard } from './services/auth.guard';
import { CustomerPage } from './pages/customer/customer.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        component: HomePage,
        data: { title: 'Home' },
      },

      {
        path: 'auth',
        component: AuthPage,
        canActivate: [guestGuard],
        data: { title: 'Login' },
      },

      {
        path: 'todos',
        component: TodosPage,
        canActivate: [authGuard],
        data: { title: 'Todos' },
      },

      {
        path: 'profile',
        component: ProfilePage,
        canActivate: [authGuard],
        data: { title: 'Profile' },
      },

      {
        path: 'settings',
        component: SettingsPage,
        canActivate: [authGuard],
        data: { title: 'Settings' },
      },

      // Customer Routes
      {
        path: 'customer',
        canActivate: [authGuard],
        data: { roles: [UserRole.CUSTOMER] },
        children: [
          {
            path: '',
            component: CustomerPage,
            data: { title: 'Dashboard' },
          },

          {
            path: 'new-pickup',
            component: CustomerNewPickupPage,
            data: { title: 'New Pickup' },
          },

          {
            path: 'pickups',
            component: CustomerPickupsPage,
            data: { title: 'My Pickups' },
          },

          {
            path: 'pickups/:pickupId',
            component: CustomerPickupDetailPage,
            data: { title: 'Pickup Details' },
          },

          {
            path: 'vouchers',
            component: CustomerVouchersPage,
            data: { title: 'My Vouchers' },
          },

          {
            path: 'my-requests',
            component: CustomerPickupsPage,
            data: { title: 'My Requests' },
          },

          {
            path: 'rewards',
            component: CustomerVouchersPage,
            data: { title: 'Rewards' },
          },

          {
            path: 'profile',
            component: ProfilePage,
            data: { title: 'Profile' },
          },

          {
            path: 'settings',
            component: ProfilePage,
            data: { title: 'Settings' },
          },
        ],
      },

      // Admin Routes
      {
        path: 'admin',
        canActivate: [authGuard],
        data: { roles: [UserRole.ADMIN] },
        children: [
          {
            path: '',
            component: AdminPage,
            data: { title: 'Admin Dashboard' },
          },
          {
            path: 'collectors',
            component: AdminCollectorsPage,
            data: { title: 'Admin Collectors' },
          },
          {
            path: 'pickups',
            component: AdminPickupsPage,
            data: { title: 'Admin Pickups' },
          },
          {
            path: 'users',
            component: AdminUsersPage,
            data: { title: 'Admin Users' },
          },
          {
            path: 'vouchers',
            component: AdminVouchersPage,
            data: { title: 'Admin Vouchers' },
          },
        ],
      },

      // Collector Routes
      {
        path: 'collector',
        canActivate: [authGuard],
        data: { roles: [UserRole.COLLECTOR] },
        children: [
          {
            path: '',
            component: CollectorPage,
            data: { title: 'Collector Dashboard' },
          },
          {
            path: 'earnings',
            component: CollectorEarningsPage,
            data: { title: 'Collector Earnings' },
          },
          {
            path: 'pickups',
            component: CollectorPickupsPage,
            data: { title: 'Collector Pickups' },
          },
        ],
      },
    ],
  },
];
