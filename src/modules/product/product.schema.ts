import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: mongoose.Types.ObjectId;
  brand_id: mongoose.Types.ObjectId;
  price: number;
  subtotal: number;
  discount_amount: number;
  discount_type: "percentage" | "fixed";
  available_stock: number;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  brand_id: {
    type: Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  price: {
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
    default: "percentage",
  },
  available_stock: {
    type: Number,
    default: 0,
  },
  is_available: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Create indexing for faster queries
productSchema.index({ name: 1 });
// productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category_id: 1 });
productSchema.index({ brand_id: 1 });
productSchema.index({ price: 1 });
productSchema.index({ is_available: 1 });

// Check if model exists before compiling
const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
