
// Common API response structure
export interface ApiResponse<T> {
  isSuccess: boolean;
  errors: string[];
  validationErrors: Record<string, string[]>;
  successes: string[];
  value: T | null;
}

// Paginated response structure
export interface PaginatedResponse<T> {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  data: T[];
}

// API headers
export const getDefaultHeaders = (tenantId: string = 'tenant1') => ({
  'X-Tenant-ID': tenantId,
});

export const getPaginationHeaders = (
  page: number,
  pageSize: number,
  searchQuery?: Record<string, any>
) => ({
  ...getDefaultHeaders(),
  'X-Page-Number': page.toString(),
  'X-Page-Size': pageSize.toString(),
  ...(searchQuery && { 'X-Search-Query': JSON.stringify(searchQuery) }),
});
