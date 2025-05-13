import mongoose, { Schema, Document } from "mongoose";

// Cart item interface
export interface ICartItem extends Document {
  _id: string;
  cart_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  quantity: number;
  metadata: Record<string, any>;
  status: string;
  added_at: Date;
}

// Cart interface
export interface ICart extends Document {
  _id: string;
  user_id: mongoose.Types.ObjectId;
  items: ICartItem[];
  created_at: Date;
  updated_at: Date;
}

// Cart item schema
const CartItemSchema = new Schema<ICartItem>({
  cart_id: {
    type: Schema.Types.ObjectId,
    ref: "Cart",
    required: true,
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },

  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ["active", "removed", "saved_for_later"],
    default: "active",
  },
  added_at: {
    type: Date,
    default: Date.now,
  },
});

// Cart schema
const CartSchema = new Schema<ICart>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Create indexes for better performance
CartItemSchema.index({ cart_id: 1, product_id: 1 }, { unique: true });
CartItemSchema.index({ status: 1 });
CartSchema.index({ user_id: 1 }, { unique: true });

// Create models without risking overwrite errors
const Cart = mongoose.model<ICart>("Cart", CartSchema);
const CartItem = mongoose.model<ICartItem>("CartItem", CartItemSchema);

export { Cart, CartItem };
