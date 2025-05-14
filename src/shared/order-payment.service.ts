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

export const getOrderDetailWithItemsAndPayments = async (orderId: string) => {
  try {
    // Fetch order details
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Fetch payments for the order
    const payments = await paymentService.getPaymentsByOrderId(orderId);

    return {
      order,
      payments,
    };
  } catch (error) {
    throw new Error(`Error fetching order details: ${error.message}`);
  }
};

export const getOrderStatusWithUser = async (orderId: string) => {
  try {
    // Fetch order details
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Fetch user details associated with the order
    const user = await userService.getUserById(order.user_id);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      order_status: order.status,
      user: {
        id: user._id,
        full_name: user.full_name,
        // email: user.email,
        phone: user.phone,
        address: user.address,
      },
    };
  } catch (error) {
    throw new Error(`Error fetching order status with user: ${error.message}`);
  }
};

export const getOrderDetailsWithShippingAddress = async (orderId: string) => {
  try {
    // Fetch order details
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Fetch user details associated with the order
    const user = await userService.getUserById(order.user_id);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      order: {
        id: order._id,
        status: order.status,
        total_amount: order.total_amount,
        discount_amount: order.discount_amount,
        final_amount: order.final_amount,
        created_at: order.created_at,
        items: order.items, // Include order items if needed
      },
      shipping_address: user.address, // Return the user's address
    };
  } catch (error) {
    throw new Error(
      `Error fetching order details with shipping address: ${error.message}`
    );
  }
};
