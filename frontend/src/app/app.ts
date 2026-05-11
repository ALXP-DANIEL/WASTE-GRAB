import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/todos`;

  protected readonly todos = signal<Todo[]>([]);
  protected readonly newTitle = signal('');
  protected readonly error = signal('');
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly busyTodoId = signal<string | null>(null);

  protected readonly remainingCount = computed(
    () => this.todos().filter((todo) => !todo.completed).length,
  );

  protected readonly completedCount = computed(
    () => this.todos().filter((todo) => todo.completed).length,
  );

  ngOnInit(): void {
    this.loadTodos();
  }

  protected loadTodos(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.http.get<Todo[]>(this.apiUrl).subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Could not load todos. Make sure the backend API is running.');
        this.isLoading.set(false);
      },
    });
  }

  protected addTodo(): void {
    const title = this.newTitle().trim();

    if (!title || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.error.set('');

    this.http.post<Todo>(this.apiUrl, { title }).subscribe({
      next: (todo) => {
        this.todos.update((todos) => [todo, ...todos]);
        this.newTitle.set('');
        this.isSaving.set(false);
      },
      error: () => {
        this.error.set('Could not add the todo.');
        this.isSaving.set(false);
      },
    });
  }

  protected toggleTodo(todo: Todo): void {
    this.busyTodoId.set(todo.id);
    this.error.set('');

    this.http
      .patch<Todo>(`${this.apiUrl}/${todo.id}`, {
        completed: !todo.completed,
      })
      .subscribe({
        next: (updatedTodo) => {
          this.replaceTodo(updatedTodo);
          this.busyTodoId.set(null);
        },
        error: () => {
          this.error.set('Could not update the todo.');
          this.busyTodoId.set(null);
        },
      });
  }

  protected deleteTodo(todo: Todo): void {
    this.busyTodoId.set(todo.id);
    this.error.set('');

    this.http.delete<void>(`${this.apiUrl}/${todo.id}`).subscribe({
      next: () => {
        this.todos.update((todos) => todos.filter((item) => item.id !== todo.id));
        this.busyTodoId.set(null);
      },
      error: () => {
        this.error.set('Could not delete the todo.');
        this.busyTodoId.set(null);
      },
    });
  }

  private replaceTodo(updatedTodo: Todo): void {
    this.todos.update((todos) =>
      todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)),
    );
  }
}
