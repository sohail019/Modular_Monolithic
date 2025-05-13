import mongoose, { Schema, Document } from "mongoose";

// Payment Status Type
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "cancelled";

// Payment Method Type
export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "upi"
  | "net_banking"
  | "wallet"
  | "cash_on_delivery"
  | "other";

// Payment Type
export type PaymentType = "full" | "partial" | "installment";

// Payment Gateway
export type PaymentGateway =
  | "razorpay"
  | "stripe"
  | "paypal"
  | "paytm"
  | "manual"
  | "other";

// Payment Interface
export interface IPayment extends Document {
  id: string;
  order_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  amount_paid: number;
  method: PaymentMethod;
  payment_type: PaymentType;
  gateway: PaymentGateway;
  payment_ref: string;
  status: PaymentStatus;
  gst_number: string;
  gst_amount: number;
  metadata: Record<string, any>;
  refund_details?: {
    amount: number;
    reason: string;
    reference: string;
    created_at: Date;
  }[];
  created_at: Date;
  updated_at: Date;
}

// Payment Schema
const PaymentSchema = new Schema<IPayment>(
  {
    order_id: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount_paid: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: [
        "credit_card",
        "debit_card",
        "upi",
        "net_banking",
        "wallet",
        "cash_on_delivery",
        "other",
      ],
      required: true,
    },
    payment_type: {
      type: String,
      enum: ["full", "partial", "installment"],
      default: "full",
    },
    gateway: {
      type: String,
      enum: ["razorpay", "stripe", "paypal", "paytm", "manual", "other"],
      required: true,
    },
    payment_ref: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "partially_refunded",
        "cancelled",
      ],
      default: "pending",
    },
    gst_number: {
      type: String,
      default: "",
    },
    
    gst_amount: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    refund_details: [
      {
        amount: Number,
        reason: String,
        reference: String,
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Indexes for better query performance
PaymentSchema.index({ order_id: 1 });
PaymentSchema.index({ user_id: 1 });
PaymentSchema.index({ payment_ref: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ created_at: 1 });

// Create Payment model
const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);

export { Payment };
