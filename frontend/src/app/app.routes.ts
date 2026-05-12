import { Routes } from '@angular/router';
import { AppLayout } from './layouts/app-layout.component';
import { AuthPage } from './pages/auth/auth.component';
import { HomePage } from './pages/home/home.component';
import { TodosPage } from './pages/todos/todos.component';
import { authGuard, guestGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        component: HomePage,
      },
      {
        path: 'auth',
        component: AuthPage,
        canActivate: [guestGuard],
      },
      {
        path: 'todos',
        component: TodosPage,
        canActivate: [authGuard],
      },
    ],
  },
];
