import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { CreateTodoInput, Todo, UpdateTodoInput } from '@wastegrab/shared';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/todos`;

  listTodos() {
    return this.http.get<Todo[]>(this.apiUrl);
  }

  getTodoById(id: string) {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`);
  }

  createTodo(input: CreateTodoInput) {
    return this.http.post<Todo>(this.apiUrl, input);
  }

  updateTodo(id: string, input: Partial<UpdateTodoInput>) {
    return this.http.patch<Todo>(`${this.apiUrl}/${id}`, input);
  }

  deleteTodo(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
