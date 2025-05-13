// Request DTOs
export interface CreateBrandDto {
  name: string;
  logo_url?: string;
  description?: string;
}

export interface UpdateBrandDto {
  name?: string;
  logo_url?: string;
  description?: string;
}

// Query parameters
export interface BrandQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  name?: string;
}

// Response DTOs
export interface BrandResponseDto {
  id: string;
  name: string;
  logo_url: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface BrandsListResponse {
  brands: BrandResponseDto[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
