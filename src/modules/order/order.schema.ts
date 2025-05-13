import mongoose, { Schema, Document } from "mongoose";

// Order Status Type
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

// Order Item Status Type
export type OrderItemStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

// Order Status Log
export interface IStatusLog {
  status: OrderStatus;
  timestamp: Date;
  comment?: string;
  user_id?: mongoose.Types.ObjectId;
}

// Order Item Interface
export interface IOrderItem extends Document {
  id: string;
  order_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  discount_type: "percentage" | "fixed";
  gst_amount: number;
  status: OrderItemStatus;
}

// Order Interface
export interface IOrder extends Document {
  id: string;
  user_id: mongoose.Types.ObjectId;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  discount_type: "percentage" | "fixed";
  gst_number: string;
  gst_amount: number;
  final_amount: number;
  currency: string;
  created_at: Date;
  status_log: IStatusLog[];
}

// Order Item Schema
const OrderItemSchema = new Schema<IOrderItem>({
  order_id: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unit_price: {
    type: Number,
    required: true,
  },
  discount_amount: {
    type: Number,
    default: 0,
  },
  discount_type: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "fixed",
  },
  gst_amount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ],
    default: "pending",
  },
});

// Status Log Schema
const StatusLogSchema = new Schema({
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  comment: String,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// Order Schema
const OrderSchema = new Schema<IOrder>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ],
    default: "pending",
  },
  total_amount: {
    type: Number,
    required: true,
  },
  discount_amount: {
    type: Number,
    default: 0,
  },
  discount_type: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "fixed",
  },
  gst_number: {
    type: String,
    default: "",
  },
  gst_amount: {
    type: Number,
    default: 0,
  },
  final_amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  status_log: [StatusLogSchema],
});

// Indexes for better query performance
OrderSchema.index({ user_id: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ created_at: 1 });
OrderItemSchema.index({ order_id: 1 });
OrderItemSchema.index({ product_id: 1 });
OrderItemSchema.index({ status: 1 });

// Models
const Order = mongoose.model<IOrder>("Order", OrderSchema);
const OrderItem = mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);

export { Order, OrderItem };
