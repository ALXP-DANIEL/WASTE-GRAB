import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.component';
import { TodosPage } from './pages/todos/todos.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'todos',
    component: TodosPage,
  },
];
