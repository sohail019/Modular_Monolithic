// Request DTOs
export interface AddToCartDto {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity?: number;
  status?: "active" | "removed" | "saved_for_later";
}

// Response DTOs
export interface CartItemResponseDto {
  id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  discount_type: "percentage" | "fixed";
  gst_amount: number;
  subtotal: number; // calculated field: (unit_price * quantity) - discount
  status: string;
  added_at: Date;
}

export interface CartSummaryDto {
  total_items: number;
  subtotal: number;
  total_discount: number;
  total_gst: number;
  total: number;
}

export interface CartResponseDto {
  id: string;
  user_id: string;
  items: CartItemResponseDto[];
  summary: CartSummaryDto;
  created_at: Date;
  updated_at: Date;
}

export interface CartMetricsDto {
  total_carts: number;
  abandoned_carts: number;
  average_items: number;
  average_value: number;
}
