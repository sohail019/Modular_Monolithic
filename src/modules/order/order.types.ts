import { OrderStatus, OrderItemStatus } from "./order.schema";

// Request DTOs
export interface CreateOrderDto {
  user_id: string;
  cart_id?: string;
  items?: CreateOrderItemDto[];
  discount_amount?: number;
  discount_type?: "percentage" | "fixed";
  gst_number?: string;
  currency?: string;
}

export interface CreateOrderItemDto {
  product_id: string;
  quantity: number;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  comment?: string;
  user_id?: string;
}

export interface UpdateOrderItemDto {
  quantity?: number;
  status?: OrderItemStatus;
}

export interface ApplyDiscountDto {
  discount_amount: number;
  discount_type: "percentage" | "fixed";
}

// Response DTOs
export interface OrderItemResponseDto {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  discount_type: "percentage" | "fixed";
  gst_amount: number;
  subtotal: number;
  status: OrderItemStatus;
}

export interface StatusLogDto {
  status: OrderStatus;
  timestamp: Date;
  comment?: string;
}

export interface OrderResponseDto {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  discount_type: "percentage" | "fixed";
  gst_number: string;
  gst_amount: number;
  final_amount: number;
  currency: string;
  created_at: Date;
  items?: OrderItemResponseDto[];
  status_log?: StatusLogDto[];
}

export interface OrdersListResponseDto {
  orders: OrderResponseDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Query params
export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  start_date?: Date;
  end_date?: Date;
  sort?: string;
}
