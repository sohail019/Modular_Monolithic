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
      select: "name price discount_amount discount_type gst_amount image",
      model: "Product",
    })
    .exec();

  // Calculate cart summary
  const summary = calculateCartSummary(cartItems);

  // Format cart response
  return {
    id: cart._id,
    user_id: userId,
    items: cartItems.map((item) => ({
      id: item._id,
      product_id: item.product_id,
      // product_name: item.product_id.name,
      // product_image: item.product_id.image,
      quantity: item.quantity,
      // subtotal: calculateItemSubtotal(item),
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

      await existingItem.save();
      return await getUserCart(userId);
    } else {
      // If item exists but not active, update status and quantity
      existingItem.status = "active";
      existingItem.quantity = item.quantity;

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
    console.log(cartItem);
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
    throw new Error("Cart not wwww");
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
  const product = item.product_id; // Use the populated product details
  const baseAmount = product.price * item.quantity;

  // Calculate discount
  const discount =
    product.discount_type === "percentage"
      ? baseAmount * (product.discount_amount / 100)
      : product.discount_amount;

  // Calculate subtotal (base amount - discount + GST)
  const subtotal = baseAmount - discount + product.gst_amount * item.quantity;

  return subtotal;
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
    const product = item.product_id; // Use the populated product details
    const baseAmount = product.price * item.quantity;

    // Calculate discount
    const discount =
      product.discount_type === "percentage"
        ? baseAmount * (product.discount_amount / 100)
        : product.discount_amount;

    // Update summary fields
    summary.total_items += item.quantity;
    summary.subtotal += baseAmount;
    summary.total_discount += discount * item.quantity;
    // summary.total_gst += product.gst_amount * item.quantity;
  });

  // Calculate total (subtotal - total_discount + total_gst)
  summary.total = summary.subtotal - summary.total_discount;

  return summary;
}
export function getCartById(cart_id: string) {
  return Cart.findById(cart_id);
}

export const getActiveCartByUserId = async (userId: string) => {
  try {
    // Find the most recent cart that is not checked out
    const cart = await Cart.findOne({
      user_id: new mongoose.Types.ObjectId(userId),
      is_checked_out: false,
    }).sort({ updated_at: -1 });

    return cart;
  } catch (error) {
    throw new Error(`Error getting active cart for user: ${error.message}`);
  }
};

export const getCartItems = async (cartId: string) => {
  try {
    const items = await CartItem.find({
      cart_id: new mongoose.Types.ObjectId(cartId),
    });

    return items;
  } catch (error) {
    throw new Error(`Error getting cart items: ${error.message}`);
  }
};
