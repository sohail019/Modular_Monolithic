import User from "../modules/user/user.schema";
import { CreateUserDto } from "../modules/user/user.types";
import mongoose from "mongoose";

import * as userService from "../modules/user/user.service";
import * as orderService from "../modules/order/order.service";
import * as paymentService from "../modules/payment/payment.service";

/**
 * Add a new user to the database.
 * This service can be reused across modules.
 * @param userData - Data for creating a new user
 */
export const addUser = async (userData: CreateUserDto) => {
  const user = new User({
    ...userData,
    auth_id: new mongoose.Types.ObjectId(userData.auth_id),
    created_at: new Date(),
    updated_at: new Date(),
  });

  return await user.save();
};

export const getUserDetailsAndOrders = async (userId: string) => {
  try {
    console.log(userId);
    // Fetch user details from the user module
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Fetch orders of the user from the order module
    const orders = await orderService.getOrdersByUserId(userId, {
      page: 1,
      limit: 10, // Default pagination
      sort: "-created_at", // Sort by most recent orders
    });

    // Extract all order IDs
    const orderIds = orders.orders.map((order) => order.id);

    // Fetch all payments for the orders in a single query
    const payments = await paymentService.getPaymentsByOrderIds(orderIds);

    // Map payments to their corresponding orders
    const paymentMap = payments.reduce((map, payment) => {
      map[payment.order_id.toString()] = payment;
      return map;
    }, {} as Record<string, any>);

    // Attach payment details to each order
    const ordersWithPayments = orders.orders.map((order) => ({
      ...order,
      payment: paymentMap[order.id] || null, // Attach payment or null if not found
    }));

    return {
      user,
      orders: ordersWithPayments,
      total: orders.total,
      page: orders.page,
      limit: orders.limit,
      pages: orders.pages,
    };
  } catch (error) {
    throw new Error(`Error fetching user details and orders: ${error.message}`);
  }
};
