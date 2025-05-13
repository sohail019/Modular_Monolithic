import * as userService from "../modules/user/user.service";
import * as orderService from "../modules/order/order.service";
import * as paymentService from "../modules/payment/payment.service";

export const getUserDetailsAndOrdersWithPayment = async (userId: string) => {
  try {
    // Fetch user details
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Fetch user orders
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
      user: {
        id: user._id,
        full_name: user.full_name,
        // email: user.email,
        phone: user.phone,
        address: user.address,
      },
      orders: ordersWithPayments,
    };
  } catch (error) {
    throw new Error(`Error fetching user details and orders: ${error.message}`);
  }
};
