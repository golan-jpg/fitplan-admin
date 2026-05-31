export type EntityId = string;

export type SortDirection = "asc" | "desc";

export type SortParams<TField extends string = string> = {
  sortBy?: TField;
  sortDirection?: SortDirection;
};

export type DateRangeFilter = {
  from?: string;
  to?: string;
};

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiResponse<TData, TMeta = Record<string, unknown> | null> = {
  data: TData;
  meta: TMeta;
  error: ApiError | null;
};

export type PaginatedResponse<TData> = ApiResponse<TData, PaginationMeta>;

export const API_BASE_URL = "/api/v1";
