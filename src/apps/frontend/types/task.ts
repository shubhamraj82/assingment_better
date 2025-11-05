export interface Task {
  id: string;
  accountId: string;
  title: string;
  description: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
}

export interface PaginationParams {
  page: number;
  size: number;
  offset: number;
}

export interface PaginatedTasksResponse {
  items: Task[];
  pagination_params: PaginationParams;
  total_count: number;
  total_pages: number;
}
