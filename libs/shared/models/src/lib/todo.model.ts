export interface Todo {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTodoInput {
  title: string;
  notes: string;
}

export type UpdateTodoInput = Partial<CreateTodoInput> & {
  completed?: boolean;
};

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}
