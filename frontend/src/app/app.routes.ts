import { Routes } from '@angular/router';
import { AppLayout } from './layouts/app-layout.component';
import { AuthPage } from './pages/auth/auth.component';
import { HomePage } from './pages/home/home.component';
import { TodosPage } from './pages/todos/todos.component';
import { MyRequestsPage } from './pages/my-requests/my-requests.component';
import { RewardsPage } from './pages/rewards/rewards.component';
import { DashboardPage } from './pages/dashboard/dashboard.component';
import { ProfilePage } from './pages/profile/profile.component';
import { SettingsPage } from './pages/settings/settings.component';
import { authGuard, guestGuard } from './services/auth.guard';

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
        path: 'dashboard',
        component: DashboardPage,
        canActivate: [authGuard],
        data: { title: 'Dashboard' },
      },

      {
        path: 'my-requests',
        component: MyRequestsPage,
        canActivate: [authGuard],
        data: { title: 'My Requests' },
      },

      {
        path: 'rewards',
        component: RewardsPage,
        canActivate: [authGuard],
        data: { title: 'Rewards' },
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
    ],
  },
];
