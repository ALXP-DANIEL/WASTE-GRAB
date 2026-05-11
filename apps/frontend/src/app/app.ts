import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CreateTodoInput, Todo, UpdateTodoInput } from '@wastegrab/models';
import { TodosApiService } from './todos-api.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly todosApi = inject(TodosApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly todos = signal<Todo[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly todoCount = computed(() => this.todos().length);
  protected readonly remainingCount = computed(
    () => this.todos().filter((todo) => !todo.completed).length
  );
  protected readonly isEditing = computed(() => this.selectedId() !== null);
  protected readonly formTitle = computed(() =>
    this.isEditing() ? 'Edit task' : 'Add task'
  );
  protected readonly submitLabel = computed(() =>
    this.isEditing() ? 'Update task' : 'Add task'
  );

  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    notes: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      void this.loadTodos();
    }
  }

  protected async loadTodos(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const todos = await firstValueFrom(this.todosApi.getTodos());
      this.todos.set(todos);
    } catch (error) {
      this.error.set(this.resolveErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  protected startEdit(todo: Todo): void {
    this.selectedId.set(todo.id);
    this.form.setValue({
      title: todo.title,
      notes: todo.notes,
    });
  }

  protected cancelEdit(): void {
    this.selectedId.set(null);
    this.form.reset({
      title: '',
      notes: '',
    });
  }

  protected async saveTodo(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as CreateTodoInput;

    this.saving.set(true);
    this.error.set(null);

    try {
      if (this.isEditing()) {
        const updatedTodo = await firstValueFrom(
          this.todosApi.updateTodo(this.selectedId()!, payload)
        );

        this.todos.update((currentTodos) =>
          currentTodos.map((todo) =>
            todo.id === updatedTodo.id ? updatedTodo : todo
          )
        );
      } else {
        const createdTodo = await firstValueFrom(
          this.todosApi.createTodo(payload)
        );

        this.todos.update((currentTodos) => [createdTodo, ...currentTodos]);
      }

      this.cancelEdit();
    } catch (error) {
      this.error.set(this.resolveErrorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }

  protected async toggleComplete(todo: Todo): Promise<void> {
    const payload: UpdateTodoInput = {
      completed: !todo.completed,
    };

    this.saving.set(true);
    this.error.set(null);

    try {
      const updatedTodo = await firstValueFrom(
        this.todosApi.updateTodo(todo.id, payload)
      );

      this.todos.update((currentTodos) =>
        currentTodos.map((item) =>
          item.id === updatedTodo.id ? updatedTodo : item
        )
      );
    } catch (error) {
      this.error.set(this.resolveErrorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }

  protected async removeTodo(todo: Todo): Promise<void> {
    if (typeof window !== 'undefined' && !window.confirm(`Delete ${todo.title}?`)) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.todosApi.deleteTodo(todo.id));
      this.todos.update((currentTodos) =>
        currentTodos.filter((current) => current.id !== todo.id)
      );

      if (this.selectedId() === todo.id) {
        this.cancelEdit();
      }
    } catch (error) {
      this.error.set(this.resolveErrorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Something went wrong while saving the todo.';
  }
}
