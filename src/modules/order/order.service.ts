import mongoose from "mongoose";
import { Order, OrderItem, OrderStatus } from "./order.schema";
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdateOrderItemDto,
  ApplyDiscountDto,
  OrderQueryParams,
} from "./order.types";
import * as cartService from "../cart/cart.service";
import * as productService from "../product/product.service";

// Create a new order
export const createOrder = async (orderData: CreateOrderDto): Promise<any> => {
  let items = [];
  let totalAmount = 0;
  let gstAmount = 0;

  // Validate required fields
  if (!orderData.user_id) {
    throw new Error("User ID is required");
  }
  if (
    !orderData.cart_id &&
    (!orderData.items || orderData.items.length === 0)
  ) {
    throw new Error("Either cart_id or items array is required");
  }
  if (orderData.cart_id && orderData.items) {
    throw new Error("Cannot provide both cart_id and items array");
  }

  // Create order from cart
  if (orderData.cart_id) {
    const cart = await cartService.getCartById(orderData.cart_id);
    if (!cart) {
      throw new Error("Cart not found");
    }

    if (cart.user_id.toString() !== orderData.user_id) {
      throw new Error("Cart does not belong to user");
    }

    const cartItems = await cartService.getCartItems(orderData.cart_id);
    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    items = await Promise.all(
      cartItems.map(async (item: any) => {
        const product = await productService.getProductById(item.product_id);

        if (!product.is_available || product.available_stock < item.quantity) {
          throw new Error(
            `Product ${product.name} is not available in the requested quantity`
          );
        }

        const gstRate = 0.18; // Assuming 18% GST
        const itemGst = product.price * gstRate;
        const itemTotal = product.price * item.quantity;

        totalAmount += itemTotal;
        gstAmount += itemGst * item.quantity;

        return {
          product_id: item.product_id,
          product_name: product.name,
          quantity: item.quantity,
          unit_price: product.price,
          discount_amount: product.discount_amount || 0,
          discount_type: product.discount_type || "fixed",
          gst_amount: itemGst,
        };
      })
    );

    // Optionally clear the cart after order creation
    // await cartService.clearCart(orderData.cart_id);
  } else if (orderData.items && orderData.items.length > 0) {
    items = await Promise.all(
      orderData.items.map(async (item) => {
        const product = await productService.getProductById(item.product_id);

        if (!product.is_available || product.available_stock < item.quantity) {
          throw new Error(
            `Product ${product.name} is not available in the requested quantity`
          );
        }

        const gstRate = 0.18; // Assuming 18% GST
        const itemGst = product.price * gstRate;
        const itemTotal = product.price * item.quantity;

        totalAmount += itemTotal;
        gstAmount += itemGst * item.quantity;

        return {
          product_id: item.product_id,
          product_name: product.name,
          quantity: item.quantity,
          unit_price: product.price,
          discount_amount: product.discount_amount || 0,
          discount_type: product.discount_type || "fixed",
          gst_amount: itemGst,
        };
      })
    );
  } else {
    throw new Error("Either cart_id or items array is required");
  }

  // Calculate discount if provided
  let discountAmount = orderData.discount_amount || 0;
  let finalAmount = totalAmount;

  if (discountAmount > 0) {
    if (orderData.discount_type === "percentage") {
      discountAmount = (totalAmount * discountAmount) / 100;
    }
    finalAmount = totalAmount - discountAmount;
  }

  // Add GST to final amount
  finalAmount += gstAmount;

  // Create order
  const order = new Order({
    user_id: new mongoose.Types.ObjectId(orderData.user_id),
    status: "pending",
    total_amount: totalAmount,
    discount_amount: discountAmount,
    discount_type: orderData.discount_type || "fixed",
    gst_number: orderData.gst_number || "",
    gst_amount: gstAmount,
    final_amount: finalAmount,
    currency: orderData.currency || "USD",
    status_log: [
      {
        status: "pending",
        timestamp: new Date(),
        comment: "Order created",
      },
    ],
  });

  const savedOrder = await order.save();

  // Create order items
  const orderItems = items.map((item: any) => ({
    order_id: savedOrder._id,
    ...item,
  }));

  await OrderItem.insertMany(orderItems);

  // Update product stock
  await Promise.all(
    items.map(async (item: any) => {
      console.log("decres");
      await productService.decreaseStock(item.product_id, item.quantity);
    })
  );

  console.log("savedOrder", savedOrder);
  return await getOrderById(savedOrder._id as string);
};

// Get all orders with pagination and filters
export const getAllOrders = async (
  query: OrderQueryParams = {}
): Promise<any> => {
  const {
    page = 1,
    limit = 10,
    status,
    start_date,
    end_date,
    sort = "-created_at",
  } = query;

  const filter: any = {};

  // Apply filters
  if (status) {
    filter.status = status;
  }

  // Date range filter
  if (start_date || end_date) {
    filter.created_at = {};
    if (start_date) {
      filter.created_at.$gte = new Date(start_date);
    }
    if (end_date) {
      filter.created_at.$lte = new Date(end_date);
    }
  }

  // Sorting
  const sortDirection = sort.startsWith("-") ? -1 : 1;
  const sortField = sort.startsWith("-") ? sort.substring(1) : sort;

  const orders = await Order.find(filter)
    .sort({ [sortField]: sortDirection })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user_id", "full_name");
  // .populate("user_id", "full_name");

  const total = await Order.countDocuments(filter);

  return {
    orders: orders.map((order) => formatOrderResponse(order)),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
};

// Get order by ID
export const getOrderById = async (id: string): Promise<any> => {
  console.log("id", id);
  const order = await Order.findById(id).populate("user_id", "full_name");
  console.log("order by id", order);
  if (!order) {
    throw new Error("Order not found");
  }

  const orderItems = await OrderItem.find({ order_id: order._id });

  return {
    ...formatOrderResponse(order),
    items: orderItems.map((item) => formatOrderItemResponse(item)),
  };
};

// Get orders by user ID
export const getOrdersByUserId = async (
  userId: string,
  query: OrderQueryParams = {}
): Promise<any> => {
  const { page = 1, limit = 10, status, sort = "-created_at" } = query;

  const filter: any = {
    user_id: new mongoose.Types.ObjectId(userId),
  };

  if (status) {
    filter.status = status;
  }

  // Sorting
  const sortDirection = sort.startsWith("-") ? -1 : 1;
  const sortField = sort.startsWith("-") ? sort.substring(1) : sort;

  const orders = await Order.find(filter)
    .sort({ [sortField]: sortDirection })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  return {
    orders: orders.map((order) => formatOrderResponse(order)),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
};

// Update order status
export const updateOrderStatus = async (
  id: string,
  statusData: UpdateOrderStatusDto
): Promise<any> => {
  const order = await Order.findById(id);

  if (!order) {
    throw new Error("Order not found");
  }

  // Prevent status changes for cancelled orders
  if (order.status === "cancelled" && statusData.status !== "refunded") {
    throw new Error("Cannot change status of a cancelled order");
  }

  // Update order status
  order.status = statusData.status;

  // Add to status log
  order.status_log.push({
    status: statusData.status,
    timestamp: new Date(),
    comment: statusData.comment || `Status updated to ${statusData.status}`,
    user_id: statusData.user_id
      ? new mongoose.Types.ObjectId(statusData.user_id)
      : undefined,
  });

  await order.save();

  // Update order items status
  await OrderItem.updateMany(
    { order_id: order._id },
    { status: statusData.status }
  );

  return await getOrderById(id);
};

// Cancel order
export const cancelOrder = async (
  id: string,
  userId: string,
  reason: string = "Cancelled by user"
): Promise<any> => {
  const order = await Order.findById(id);

  if (!order) {
    throw new Error("Order not found");
  }

  // Can only cancel pending or processing orders
  if (!["pending", "processing"].includes(order.status)) {
    throw new Error(`Cannot cancel order in ${order.status} state`);
  }

  // Update order status
  order.status = "cancelled";

  // Add to status log
  order.status_log.push({
    status: "cancelled",
    timestamp: new Date(),
    comment: reason,
    user_id: new mongoose.Types.ObjectId(userId),
  });

  await order.save();

  // Update order items status
  await OrderItem.updateMany({ order_id: order._id }, { status: "cancelled" });

  // Restore product stock
  const orderItems = await OrderItem.find({ order_id: order._id });
  await Promise.all(
    orderItems.map(async (item) => {
      await productService.increaseStock(
        item.product_id.toString(),
        item.quantity
      );
    })
  );

  return await getOrderById(id);
};

// Cancel order item
export const cancelOrderItem = async (
  orderId: string,
  itemId: string,
  userId: string,
  reason: string = "Item cancelled by user"
): Promise<any> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  // Can only cancel items in pending or processing orders
  if (!["pending", "processing"].includes(order.status)) {
    throw new Error(`Cannot cancel items in order with ${order.status} state`);
  }

  const orderItem = await OrderItem.findOne({
    _id: new mongoose.Types.ObjectId(itemId),
    order_id: order._id,
  });

  if (!orderItem) {
    throw new Error("Order item not found");
  }

  // Skip if already cancelled
  if (orderItem.status === "cancelled") {
    return await getOrderById(orderId);
  }

  // Calculate refund amount
  const itemTotal = orderItem.unit_price * orderItem.quantity;
  const itemDiscount =
    orderItem.discount_type === "percentage"
      ? itemTotal * (orderItem.discount_amount / 100)
      : orderItem.discount_amount;
  const refundAmount =
    itemTotal - itemDiscount + orderItem.gst_amount * orderItem.quantity;

  // Update order amounts
  order.total_amount -= itemTotal;
  order.gst_amount -= orderItem.gst_amount * orderItem.quantity;

  // Recalculate discount if percentage
  if (order.discount_type === "percentage") {
    order.discount_amount =
      (order.total_amount * Number(order.discount_amount)) / 100;
  }

  // Recalculate final amount
  order.final_amount =
    order.total_amount - order.discount_amount + order.gst_amount;

  // Add to status log
  order.status_log.push({
    status: order.status,
    timestamp: new Date(),
    comment: `Item ${orderItem.product_name} cancelled: ${reason}`,
    user_id: new mongoose.Types.ObjectId(userId),
  });

  // If all items are cancelled, cancel the order
  const remainingItems = await OrderItem.find({
    order_id: order._id,
    status: { $ne: "cancelled" },
    _id: { $ne: orderItem._id },
  });

  if (remainingItems.length === 0) {
    order.status = "cancelled";
    order.status_log.push({
      status: "cancelled",
      timestamp: new Date(),
      comment: "All items cancelled, order automatically cancelled",
      user_id: new mongoose.Types.ObjectId(userId),
    });
  }

  await order.save();

  // Update item status
  orderItem.status = "cancelled";
  await orderItem.save();

  // Restore product stock
  await productService.increaseStock(
    orderItem.product_id.toString(),
    orderItem.quantity
  );

  return await getOrderById(orderId);
};

// Get order status log
export const getOrderStatusLog = async (id: string): Promise<any> => {
  const order = await Order.findById(id);

  if (!order) {
    throw new Error("Order not found");
  }

  return order.status_log;
};

// Apply discount to order
export const applyDiscount = async (
  id: string,
  discountData: ApplyDiscountDto
): Promise<any> => {
  const order = await Order.findById(id);

  if (!order) {
    throw new Error("Order not found");
  }

  // Can only modify pending orders
  if (order.status !== "pending") {
    throw new Error("Can only apply discount to pending orders");
  }

  // Calculate discount amount
  let discountAmount = discountData.discount_amount;
  if (discountData.discount_type === "percentage") {
    discountAmount = (order.total_amount * discountAmount) / 100;

    // Prevent discount greater than order amount
    if (discountAmount > order.total_amount) {
      discountAmount = order.total_amount;
    }
  } else {
    // Prevent discount greater than order amount
    if (discountAmount > order.total_amount) {
      throw new Error("Discount amount cannot be greater than order total");
    }
  }

  // Update order
  order.discount_amount =
    discountData.discount_type === "percentage"
      ? discountData.discount_amount // Store percentage for percentage type
      : discountAmount;
  order.discount_type = discountData.discount_type;

  // Recalculate final amount
  order.final_amount =
    order.total_amount -
    (discountData.discount_type === "percentage"
      ? (order.total_amount * discountData.discount_amount) / 100
      : discountAmount) +
    order.gst_amount;

  // Add to status log
  order.status_log.push({
    status: order.status,
    timestamp: new Date(),
    comment: `Discount applied: ${discountData.discount_amount}${
      discountData.discount_type === "percentage" ? "%" : " " + order.currency
    }`,
  });

  await order.save();

  return await getOrderById(id);
};

// Get order items
export const getOrderItems = async (orderId: string): Promise<any> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const orderItems = await OrderItem.find({ order_id: order._id });

  return orderItems.map((item) => formatOrderItemResponse(item));
};

// Update order item
export const updateOrderItem = async (
  orderId: string,
  itemId: string,
  updateData: UpdateOrderItemDto
): Promise<any> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  // Can only modify pending orders
  if (order.status !== "pending") {
    throw new Error("Can only update items in pending orders");
  }

  const orderItem = await OrderItem.findOne({
    _id: new mongoose.Types.ObjectId(itemId),
    order_id: order._id,
  });

  if (!orderItem) {
    throw new Error("Order item not found");
  }

  // Calculate original amount for this item
  const originalItemTotal = orderItem.unit_price * orderItem.quantity;
  const originalItemGst = orderItem.gst_amount * orderItem.quantity;

  // Update quantity if provided
  if (updateData.quantity !== undefined) {
    // Validate quantity
    if (updateData.quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    // Check product stock
    const product = await productService.getProductById(
      orderItem.product_id.toString()
    );
    const additionalQuantity = updateData.quantity - orderItem.quantity;

    if (additionalQuantity > 0) {
      if (
        !product.is_available ||
        product.available_stock < additionalQuantity
      ) {
        throw new Error("Product is not available in the requested quantity");
      }

      // Decrease stock for additional quantity
      await productService.decreaseStock(
        orderItem.product_id.toString(),
        additionalQuantity
      );
    } else if (additionalQuantity < 0) {
      // Increase stock for reduced quantity
      await productService.increaseStock(
        orderItem.product_id.toString(),
        Math.abs(additionalQuantity)
      );
    }

    orderItem.quantity = updateData.quantity;
  }

  // Update status if provided
  if (updateData.status) {
    orderItem.status = updateData.status;
  }

  await orderItem.save();

  // Recalculate order totals
  const newItemTotal = orderItem.unit_price * orderItem.quantity;
  const newItemGst = orderItem.gst_amount * orderItem.quantity;

  // Update order amounts
  order.total_amount = order.total_amount - originalItemTotal + newItemTotal;
  order.gst_amount = order.gst_amount - originalItemGst + newItemGst;

  // Recalculate discount if percentage
  if (order.discount_type === "percentage") {
    order.discount_amount =
      (order.total_amount * Number(order.discount_amount)) / 100;
  }

  // Recalculate final amount
  order.final_amount =
    order.total_amount -
    (order.discount_type === "percentage"
      ? (order.total_amount * Number(order.discount_amount)) / 100
      : order.discount_amount) +
    order.gst_amount;

  await order.save();

  return await getOrderById(orderId);
};

// Delete order item
export const deleteOrderItem = async (
  orderId: string,
  itemId: string
): Promise<any> => {
  // This is essentially the same as cancelling an item
  return await cancelOrderItem(
    orderId,
    itemId,
    "system",
    "Item removed from order"
  );
};

// Helper functions
function formatOrderResponse(order: any) {
  return {
    id: order._id,
    user_id: order.user_id._id || order.user_id,
    status: order.status,
    total_amount: order.total_amount,
    discount_amount: order.discount_amount,
    discount_type: order.discount_type,
    gst_number: order.gst_number,
    gst_amount: order.gst_amount,
    final_amount: order.final_amount,
    currency: order.currency,
    created_at: order.created_at,
    status_log: order.status_log,
  };
}

function formatOrderItemResponse(item: any) {
  const subtotal = item.unit_price * item.quantity;
  const discount =
    item.discount_type === "percentage"
      ? subtotal * (item.discount_amount / 100)
      : item.discount_amount;

  return {
    id: item._id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_amount: item.discount_amount,
    discount_type: item.discount_type,
    gst_amount: item.gst_amount,
    subtotal: subtotal - discount + item.gst_amount * item.quantity,
    status: item.status,
  };
}
