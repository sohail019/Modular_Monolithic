import { Request, Response } from "express";
import * as orderService from "./order.service";
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdateOrderItemDto,
  ApplyDiscountDto,
  OrderQueryParams,
} from "./order.types";
import * as sharedService from "../../shared/user.service";
import { getUserDetailsAndOrdersWithPayment } from "../../shared/order-payment.service";
// Create a new order
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const orderData: CreateOrderDto = {
      ...req.body,
      user_id: userId,
    };

    const order = await orderService.createOrder(orderData);
    if (!order) {
      res.status(400).json({ message: "Failed to create order" });
      return;
    }
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // TODO: Add role check for admin

    const query: OrderQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      status: req.query.status as any,
      start_date: req.query.start_date
        ? new Date(req.query.start_date as string)
        : undefined,
      end_date: req.query.end_date
        ? new Date(req.query.end_date as string)
        : undefined,
      sort: req.query.sort as string,
    };

    const orders = await orderService.getAllOrders(query);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // TODO: Add authorization check - user can only see their own orders unless admin

    const order = await orderService.getOrderById(id);
    res.status(200).json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get orders by user ID
export const getOrdersByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Users can only see their own orders unless admin
    // TODO: Add role check for admin
    if (userId !== currentUserId) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const query: OrderQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      status: req.query.status as any,
      sort: req.query.sort as string,
    };

    const orders = await orderService.getOrdersByUserId(userId, query);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // TODO: Add role check - only admin or staff can update status

    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const statusData: UpdateOrderStatusDto = {
      ...req.body,
      user_id: userId,
    };

    const order = await orderService.updateOrderStatus(id, statusData);
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel order
export const cancelOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { reason } = req.body;

    // TODO: Add authorization check - user can only cancel their own orders

    const order = await orderService.cancelOrder(id, userId, reason);
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel order item
export const cancelOrderItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, itemId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { reason } = req.body;

    // TODO: Add authorization check

    const order = await orderService.cancelOrderItem(
      id,
      itemId,
      userId,
      reason
    );
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get order status log
export const getOrderStatusLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // TODO: Add authorization check

    const statusLog = await orderService.getOrderStatusLog(id);
    res.status(200).json(statusLog);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Apply discount to order
export const applyOrderDiscount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // TODO: Add role check - only admin can apply discounts

    const { id } = req.params;
    const discountData: ApplyDiscountDto = req.body;

    const order = await orderService.applyDiscount(id, discountData);
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get order items
export const getOrderItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // TODO: Add authorization check

    const orderItems = await orderService.getOrderItems(id);
    res.status(200).json(orderItems);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Update order item
export const updateOrderItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // TODO: Add role check - only admin can update order items

    const { orderId, itemId } = req.params;
    const updateData: UpdateOrderItemDto = req.body;

    const order = await orderService.updateOrderItem(
      orderId,
      itemId,
      updateData
    );
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete order item
export const deleteOrderItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // TODO: Add role check - only admin can delete order items

    const { orderId, itemId } = req.params;

    const order = await orderService.deleteOrderItem(orderId, itemId);
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get current user's orders
export const getMyOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const query: OrderQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      status: req.query.status as any,
      sort: req.query.sort as string,
    };

    // const orders = await orderService.getOrdersByUserId(userId, query);
    const orders = await sharedService.getUserDetailsAndOrders(userId);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserOrdersWithPaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await getUserDetailsAndOrdersWithPayment(userId);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
