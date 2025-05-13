import {
  PaymentStatus,
  PaymentMethod,
  PaymentType,
  PaymentGateway,
} from "./payment.schema";

// Request DTOs
export interface InitiatePaymentDto {
  order_id: string;
  method: PaymentMethod;
  payment_type?: PaymentType;
  gateway: PaymentGateway;
  gst_number?: string;
  return_url?: string;
  metadata?: Record<string, any>;
}

export interface WebhookPayloadDto {
  event: string;
  payment_ref: string;
  status: string;
  metadata?: Record<string, any>;
}

export interface RefundPaymentDto {
  amount?: number; // If not specified, full amount is refunded
  reason: string;
}

// Response DTOs
export interface PaymentResponseDto {
  id: string;
  order_id: string;
  user_id: string;
  amount_paid: number;
  method: PaymentMethod;
  payment_type: PaymentType;
  gateway: PaymentGateway;
  payment_ref: string;
  status: PaymentStatus;
  gst_number: string;
  gst_amount: number;
  refund_details?: {
    amount: number;
    reason: string;
    reference: string;
    created_at: Date;
  }[];
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentInitiationResponseDto {
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_url?: string; // Redirect URL for payment gateway
  gateway_data?: Record<string, any>; // Additional data from the gateway
  expiry_time?: Date;
}

export interface PaymentListResponseDto {
  payments: PaymentResponseDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Query params
export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  gateway?: PaymentGateway;
  start_date?: Date;
  end_date?: Date;
  sort?: string;
}
