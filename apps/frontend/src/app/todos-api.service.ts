import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse, CreateTodoInput, Todo, UpdateTodoInput } from '@wastegrab/models';

@Injectable({
  providedIn: 'root',
})
export class TodosApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/todos';

  getTodos(): Observable<Todo[]> {
    return this.http
      .get<ApiResponse<Todo[]>>(this.apiUrl)
      .pipe(map((response) => this.unwrap(response)));
  }

  createTodo(payload: CreateTodoInput): Observable<Todo> {
    return this.http
      .post<ApiResponse<Todo>>(this.apiUrl, payload)
      .pipe(map((response) => this.unwrap(response)));
  }

  updateTodo(id: string, payload: UpdateTodoInput): Observable<Todo> {
    return this.http
      .put<ApiResponse<Todo>>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((response) => this.unwrap(response)));
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        this.unwrap(response);
      })
    );
  }

  private unwrap<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.error || 'Request failed');
    }

    return response.data;
  }
}
