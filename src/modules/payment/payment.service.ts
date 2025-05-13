import mongoose from "mongoose";
import { Payment, PaymentStatus } from "./payment.schema";
import {
  InitiatePaymentDto,
  WebhookPayloadDto,
  RefundPaymentDto,
  PaymentQueryParams,
} from "./payment.types";
import * as orderService from "../order/order.service";
import { createLogger } from "../../utils/logger";

const logger = createLogger("PaymentService");

// Initiate a payment
export const initiatePayment = async (
  userId: string,
  paymentData: InitiatePaymentDto
): Promise<any> => {
  try {
    // Get the order
    const order = await orderService.getOrderById(paymentData.order_id);

    // Check if order belongs to user
    if (order.user_id !== userId) {
      throw new Error("Order does not belong to user");
    }

    // Check if order is pending
    if (order.status !== "pending") {
      throw new Error(
        `Cannot initiate payment for order in ${order.status} state`
      );
    }

    // Get appropriate payment gateway handler
    const gatewayHandler = getPaymentGatewayHandler(paymentData.gateway);

    // Initiate payment with gateway
    const gatewayResponse = await gatewayHandler.initiatePayment({
      amount: order.final_amount,
      currency: order.currency,
      order_id: paymentData.order_id,
      user_id: userId,
      return_url: paymentData.return_url,
      method: paymentData.method,
      metadata: paymentData.metadata || {},
    });

    // Create payment record
    const payment = new Payment({
      order_id: new mongoose.Types.ObjectId(paymentData.order_id),
      user_id: new mongoose.Types.ObjectId(userId),
      amount_paid: order.final_amount,
      method: paymentData.method,
      payment_type: paymentData.payment_type || "full",
      gateway: paymentData.gateway,
      payment_ref: gatewayResponse.payment_ref,
      status: "pending",
      gst_number: paymentData.gst_number || order.gst_number,
      gst_amount: order.gst_amount,
      metadata: {
        ...paymentData.metadata,
        gateway_data: gatewayResponse.metadata,
      },
    });

    await payment.save();

    // Update order status to processing
    await orderService.updateOrderStatus(paymentData.order_id, {
      status: "processing",
      comment: "Payment initiated",
    });

    return {
      payment_id: payment._id,
      order_id: paymentData.order_id,
      amount: order.final_amount,
      currency: order.currency,
      payment_url: gatewayResponse.payment_url,
      //   gateway_data: gatewayResponse.gateway_data,
      expiry_time: gatewayResponse.expiry_time,
      method: paymentData.method,
    };
  } catch (error) {
    logger.error(`Error initiating payment: ${error.message}`, { error });
    throw error;
  }
};

// Handle payment webhook
export const handleWebhook = async (
  webhookData: WebhookPayloadDto
): Promise<any> => {
  try {
    // Find payment by reference
    const payment = await Payment.findOne({
      payment_ref: webhookData.payment_ref,
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Get the appropriate gateway handler
    const gatewayHandler = getPaymentGatewayHandler(payment.gateway);

    // Verify webhook data
    const verifiedData = gatewayHandler.verifyWebhook(webhookData);

    // Update payment status
    payment.status = mapGatewayStatus(verifiedData.status);
    payment.metadata = {
      ...payment.metadata,
      webhook_data: verifiedData,
    };

    await payment.save();

    // Update order status based on payment status
    if (payment.status === "completed") {
      await orderService.updateOrderStatus(payment.order_id.toString(), {
        status: "processing",
        comment: "Payment completed, order is being processed",
      });
    } else if (payment.status === "failed") {
      await orderService.updateOrderStatus(payment.order_id.toString(), {
        status: "pending",
        comment: "Payment failed, order is pending payment",
      });
    } else if (payment.status === "cancelled") {
      await orderService.cancelOrder(
        payment.order_id.toString(),
        "system",
        "Payment cancelled"
      );
    }

    return { success: true, message: "Webhook processed successfully" };
  } catch (error) {
    logger.error(`Error processing webhook: ${error.message}`, {
      error,
      webhookData,
    });
    throw error;
  }
};

// Get payment by ID
export const getPaymentById = async (id: string): Promise<any> => {
  try {
    const payment = await Payment.findById(id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    return formatPaymentResponse(payment);
  } catch (error) {
    logger.error(`Error getting payment: ${error.message}`, { error });
    throw error;
  }
};

// Get payments by order ID
export const getPaymentsByOrderId = async (orderId: string): Promise<any> => {
  try {
    const payments = await Payment.find({
      order_id: new mongoose.Types.ObjectId(orderId),
    }).sort({ created_at: -1 });

    return payments.map((payment) => formatPaymentResponse(payment));
  } catch (error) {
    logger.error(`Error getting payments for order: ${error.message}`, {
      error,
    });
    throw error;
  }
};

// Get payments by user ID
export const getPaymentsByUserId = async (
  userId: string,
  query: PaymentQueryParams = {}
): Promise<any> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      method,
      gateway,
      start_date,
      end_date,
      sort = "-created_at",
    } = query;

    const filter: any = {
      user_id: new mongoose.Types.ObjectId(userId),
    };

    // Apply filters
    if (status) {
      filter.status = status;
    }

    if (method) {
      filter.method = method;
    }

    if (gateway) {
      filter.gateway = gateway;
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

    const payments = await Payment.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Payment.countDocuments(filter);

    return {
      payments: payments.map((payment) => formatPaymentResponse(payment)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error(`Error getting payments for user: ${error.message}`, {
      error,
    });
    throw error;
  }
};

// Refund payment
export const refundPayment = async (
  id: string,
  refundData: RefundPaymentDto
): Promise<any> => {
  try {
    const payment = await Payment.findById(id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Check if payment can be refunded
    if (payment.status !== "completed") {
      throw new Error(`Cannot refund payment with status ${payment.status}`);
    }

    // Get the refund amount
    const refundAmount = refundData.amount || payment.amount_paid;

    // Check if refund amount is valid
    if (refundAmount <= 0 || refundAmount > payment.amount_paid) {
      throw new Error("Invalid refund amount");
    }

    // Get appropriate payment gateway handler
    const gatewayHandler = getPaymentGatewayHandler(payment.gateway);

    // Process refund with gateway
    const refundResponse = await gatewayHandler.processRefund({
      payment_ref: payment.payment_ref,
      amount: refundAmount,
      reason: refundData.reason,
    });

    // Update payment record
    if (!payment.refund_details) {
      payment.refund_details = [];
    }

    payment.refund_details.push({
      amount: refundAmount,
      reason: refundData.reason,
      reference: refundResponse.refund_reference,
      created_at: new Date(),
    });

    // Update payment status
    if (refundAmount === payment.amount_paid) {
      payment.status = "refunded";
    } else {
      payment.status = "partially_refunded";
    }

    await payment.save();

    // If fully refunded, update order status
    if (payment.status === "refunded") {
      await orderService.updateOrderStatus(payment.order_id.toString(), {
        status: "refunded",
        comment: `Payment refunded: ${refundData.reason}`,
      });
    }

    return formatPaymentResponse(payment);
  } catch (error) {
    logger.error(`Error refunding payment: ${error.message}`, { error });
    throw error;
  }
};

// Abort/Cancel payment
export const abortPayment = async (id: string): Promise<any> => {
  try {
    const payment = await Payment.findById(id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Check if payment can be aborted
    if (!["pending", "processing"].includes(payment.status)) {
      throw new Error(`Cannot abort payment with status ${payment.status}`);
    }

    // Get appropriate payment gateway handler
    const gatewayHandler = getPaymentGatewayHandler(payment.gateway);

    // Abort payment with gateway
    const abortResponse = await gatewayHandler.abortPayment({
      payment_ref: payment.payment_ref,
    });

    // Update payment record
    payment.status = "cancelled";
    payment.metadata = {
      ...payment.metadata,
      abort_data: abortResponse,
    };

    await payment.save();

    // Update order status
    await orderService.updateOrderStatus(payment.order_id.toString(), {
      status: "pending",
      comment: "Payment aborted, order is pending payment",
    });

    return formatPaymentResponse(payment);
  } catch (error) {
    logger.error(`Error aborting payment: ${error.message}`, { error });
    throw error;
  }
};

// Mock implementation of payment gateway handlers
// In a real application, these would be separate service modules
const getPaymentGatewayHandler = (gateway: string) => {
  // This is just a mock implementation
  // In a real application, you would have separate handlers for each gateway
  return {
    initiatePayment: async (data: any) => {
      // Simulate successful payment initiation
      return {
        payment_ref: `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        payment_url: `https://pay.example.com/${data.order_id}`,
        metadata: { initiated_at: new Date() },
        expiry_time: new Date(Date.now() + 3600000), // 1 hour from now
      };
    },
    verifyWebhook: (data: any) => {
      // In a real implementation, you would verify signatures, etc.
      return {
        ...data,
        verified: true,
      };
    },
    processRefund: async (data: any) => {
      // Simulate successful refund
      return {
        refund_reference: `refund_${Date.now()}_${Math.floor(
          Math.random() * 1000
        )}`,
        status: "success",
      };
    },
    abortPayment: async (data: any) => {
      // Simulate successful abort
      return {
        status: "aborted",
        timestamp: new Date(),
      };
    },
  };
};

// Map gateway-specific status to our payment status
const mapGatewayStatus = (gatewayStatus: string): PaymentStatus => {
  // This mapping would be specific to each payment gateway
  const statusMap: Record<string, PaymentStatus> = {
    success: "completed",
    successful: "completed",
    completed: "completed",
    authorized: "completed",
    captured: "completed",
    paid: "completed",
    pending: "pending",
    processing: "processing",
    failed: "failed",
    error: "failed",
    declined: "failed",
    cancelled: "cancelled",
    refunded: "refunded",
    partially_refunded: "partially_refunded",
  };

  return statusMap[gatewayStatus.toLowerCase()] || "processing";
};

// Helper function to format payment response
function formatPaymentResponse(payment: any) {
  return {
    id: payment._id,
    order_id: payment.order_id,
    user_id: payment.user_id,
    amount_paid: payment.amount_paid,
    method: payment.method,
    payment_type: payment.payment_type,
    gateway: payment.gateway,
    payment_ref: payment.payment_ref,
    status: payment.status,
    gst_number: payment.gst_number,
    gst_amount: payment.gst_amount,
    refund_details: payment.refund_details,
    metadata: payment.metadata,
    created_at: payment.created_at,
    updated_at: payment.updated_at,
  };
}

export const getPaymentsByOrderIds = async (orderIds: string[]) => {
  return await Payment.find({ order_id: { $in: orderIds } });
};
