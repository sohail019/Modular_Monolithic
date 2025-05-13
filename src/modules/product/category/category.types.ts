// Request DTOs
export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
}

// Query parameters
export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  name?: string;
}

// Response DTOs
export interface CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CategoriesListResponse {
  categories: CategoryResponseDto[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
