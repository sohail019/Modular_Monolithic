import mongoose from "mongoose";
import { Cart, CartItem } from "./cart.schema";
import { AddToCartDto, UpdateCartItemDto, CartSummaryDto } from "./cart.types";
import * as productService from "../product/product.service";

// Get user's cart details with items
export const getUserCart = async (userId: string): Promise<any> => {
  // Find or create cart
  let cart = await Cart.findOne({
    user_id: new mongoose.Types.ObjectId(userId),
  });

  if (!cart) {
    cart = await new Cart({
      user_id: new mongoose.Types.ObjectId(userId),
    }).save();
  }

  // Get all active items in the cart
  const cartItems = await CartItem.find({
    cart_id: cart._id,
    status: "active",
  })
    .populate({
      path: "product_id",
      select: "name price image",
      model: "Product", // Ensure the correct model name is used
    })
    .exec(); // Ensure proper population of product_id

  // Calculate cart summary
  const summary = calculateCartSummary(cartItems);

  // Format cart response
  return {
    id: cart._id,
    user_id: userId,
    items: cartItems.map((item) => ({
      id: item._id,
      product_id: item.product_id._id,
      product_name: (item.product_id as any).name,
      product_image: (item.product_id as any).image, // Cast to any to avoid type errors
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount,
      discount_type: item.discount_type,
      gst_amount: item.gst_amount,
      subtotal: calculateItemSubtotal(item),
      status: item.status,
      added_at: item.added_at,
    })),
    summary,
    created_at: cart.created_at,
    updated_at: cart.updated_at,
  };
};

// Add item to cart
export const addToCart = async (
  userId: string,
  item: AddToCartDto
): Promise<any> => {
  // Find or create user's cart
  let cart = await Cart.findOne({
    user_id: new mongoose.Types.ObjectId(userId),
  });

  if (!cart) {
    cart = await new Cart({
      user_id: new mongoose.Types.ObjectId(userId),
    }).save();
  }

  // Get product details to store price and validate
  const product = await productService.getProductById(item.product_id);

  if (!product.is_available || product.available_stock < item.quantity) {
    throw new Error("Product is not available in the requested quantity");
  }

  // Check if item already exists in cart
  const existingItem = await CartItem.findOne({
    cart_id: cart._id,
    product_id: new mongoose.Types.ObjectId(item.product_id),
  });

  if (existingItem) {
    // Update existing item quantity if it's active
    if (existingItem.status === "active") {
      existingItem.quantity += item.quantity;
      existingItem.unit_price = product.price; // Always update to latest price
      await existingItem.save();
      return await getUserCart(userId);
    } else {
      // If item exists but not active, update status and quantity
      existingItem.status = "active";
      existingItem.quantity = item.quantity;
      existingItem.unit_price = product.price;
      await existingItem.save();
      return await getUserCart(userId);
    }
  }

  // Add new item to cart
  const cartItem = new CartItem({
    cart_id: cart._id,
    product_id: new mongoose.Types.ObjectId(item.product_id),
    quantity: item.quantity,
    unit_price: product.price,
    discount: product.discount_amount || 0,
    discount_type: product.discount_type || "percentage",
    gst_amount: calculateGST(product.price),
    status: "active",
  });

  await cartItem.save();

  // Return updated cart
  return await getUserCart(userId);
};

// Update cart item
export const updateCartItem = async (
  userId: string,
  itemId: string,
  updateData: UpdateCartItemDto
): Promise<any> => {
  // Find user's cart
  const cart = await Cart.findOne({
    user_id: new mongoose.Types.ObjectId(userId),
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  // Find the cart item
  const cartItem = await CartItem.findOne({
    _id: new mongoose.Types.ObjectId(itemId),
    cart_id: cart._id,
  });

  if (!cartItem) {
    throw new Error("Item not found in cart");
  }

  // If updating quantity, validate against available stock
  if (updateData.quantity) {
    const product = await productService.getProductById(
      cartItem.product_id.toString()
    );

    if (
      !product.is_available ||
      product.available_stock < updateData.quantity
    ) {
      throw new Error("Product is not available in the requested quantity");
    }

    cartItem.quantity = updateData.quantity;
  }

  // Update status if provided
  if (updateData.status) {
    cartItem.status = updateData.status;
  }

  await cartItem.save();

  // Return updated cart
  return await getUserCart(userId);
};

// Remove item from cart
export const removeFromCart = async (
  userId: string,
  itemId: string
): Promise<any> => {
  // Find user's cart
  const cart = await Cart.findOne({
    user_id: new mongoose.Types.ObjectId(userId),
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  // Find the cart item
  const cartItem = await CartItem.findOne({
    _id: new mongoose.Types.ObjectId(itemId),
    cart_id: cart._id,
  });

  if (!cartItem) {
    throw new Error("Item not found in cart");
  }

  // Mark as removed
  cartItem.status = "removed";
  await cartItem.save();

  // Return updated cart
  return await getUserCart(userId);
};

// Clear cart
export const clearCart = async (userId: string): Promise<any> => {
  // Find user's cart
  const cart = await Cart.findOne({
    user_id: new mongoose.Types.ObjectId(userId),
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  // Update all items to removed status
  await CartItem.updateMany(
    { cart_id: cart._id, status: "active" },
    { status: "removed" }
  );

  return { message: "Cart cleared successfully" };
};

// Helper functions
function calculateItemSubtotal(item: any): number {
  const baseAmount = item.unit_price * item.quantity;

  if (item.discount_type === "percentage") {
    return baseAmount - baseAmount * (item.discount / 100);
  } else {
    return baseAmount - item.discount;
  }
}

function calculateGST(price: number): number {
  // Assuming a GST rate of 18%
  return price * 0.18;
}

function calculateCartSummary(items: any[]): CartSummaryDto {
  const summary: CartSummaryDto = {
    total_items: 0,
    subtotal: 0,
    total_discount: 0,
    total_gst: 0,
    total: 0,
  };

  items.forEach((item) => {
    const quantity = item.quantity;
    const baseAmount = item.unit_price * quantity;
    let discount = 0;

    if (item.discount_type === "percentage") {
      discount = baseAmount * (item.discount / 100);
    } else {
      discount = item.discount;
    }

    summary.total_items += quantity;
    summary.subtotal += baseAmount;
    summary.total_discount += discount;
    summary.total_gst += item.gst_amount * quantity;
  });

  summary.total = summary.subtotal - summary.total_discount + summary.total_gst;

  return summary;
}
export function getCartById(cart_id: string) {
  return Cart.findById(cart_id);
}

export function getCartItems(cart_id: string) {
  return CartItem.find({ cart_id }).populate("product_id");
}
