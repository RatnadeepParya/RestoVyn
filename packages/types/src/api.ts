export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string | null;
  requestId: string;
  timestamp: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  requestId: string;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UserContext {
  userId: string;
  username: string;
  email?: string;
  restaurantId: string;
  staffId?: string;
  role: string;
  permissions: string[];
}
