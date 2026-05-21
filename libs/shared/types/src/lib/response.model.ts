export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export type HealthResponse = {
  status: 'ok';
  service: 'wastegrab-api';
};

export type ApiErrorResponse = {
  error: string;
};

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
