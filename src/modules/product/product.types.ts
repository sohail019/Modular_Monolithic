// Request DTOs
export interface CreateProductDto {
  name: string;
  slug?: string;
  description?: string;
  category_id: string;
  brand_id: string;
  price: number;
  discount_amount?: number;
  discount_type?: "percentage" | "fixed";
  available_stock?: number;
  is_available?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  slug?: string;
  description?: string;
  category_id?: string;
  brand_id?: string;
  price?: number;
  discount_amount?: number;
  discount_type?: "percentage" | "fixed";
  available_stock?: number;
  is_available?: boolean;
}

// Query parameters
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  name?: string;
  min_price?: number;
  max_price?: number;
}

// Response DTOs
export interface ProductResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  brand_id: string;
  price: number;
  discount_amount: number;
  discount_type: "percentage" | "fixed";
  final_price: number; // Calculated field
  available_stock: number;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductsListResponse {
  products: ProductResponseDto[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
