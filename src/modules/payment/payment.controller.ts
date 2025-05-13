import { Request, Response } from "express";
import * as paymentService from "./payment.service";
import {
  InitiatePaymentDto,
  RefundPaymentDto,
  PaymentQueryParams,
} from "./payment.types";
import { createLogger } from "../../utils/logger";

const logger = createLogger("PaymentController");

// Initiate a payment
export const initiatePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }



    const paymentData: InitiatePaymentDto = req.body;
    console.log("Payment Data:", paymentData);

    // Validate required fields
    if (!paymentData.order_id || !paymentData.method || !paymentData.gateway) {
      res.status(400).json({ message: "Missing required payment information" });
      return;
    }

    const result = await paymentService.initiatePayment(userId, paymentData);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Error initiating payment: ${error.message}`, { error });
    res.status(400).json({ message: error.message });
  }
};

// Handle payment gateway webhook
export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const webhookData = req.body;

    // Validate webhook data
    if (!webhookData.event || !webhookData.payment_ref) {
      res.status(400).json({ message: "Invalid webhook payload" });
      return;
    }

    const result = await paymentService.handleWebhook(webhookData);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Error processing webhook: ${error.message}`, { error });
    res.status(400).json({ message: error.message });
  }
};

// Get payment by ID
export const getPaymentById = async (
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

    // TODO: Add authorization check - user can only see their own payments unless admin

    const payment = await paymentService.getPaymentById(id);

    // Simple authorization check
    if (payment.user_id.toString() !== userId) {
      // Check if user is admin (implement based on your auth system)
      const isAdmin = false; // Replace with actual admin check

      if (!isAdmin) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
    }

    res.status(200).json(payment);
  } catch (error) {
    logger.error(`Error getting payment: ${error.message}`, { error });
    res.status(404).json({ message: error.message });
  }
};

// Get payments by order ID
export const getPaymentsByOrderId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // TODO: Add authorization check - ensure order belongs to user

    const payments = await paymentService.getPaymentsByOrderId(orderId);
    res.status(200).json(payments);
  } catch (error) {
    logger.error(`Error getting payments for order: ${error.message}`, {
      error,
    });
    res.status(404).json({ message: error.message });
  }
};

// Get payments by user ID
export const getPaymentsByUserId = async (
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

    // Authorization - users can only see their own payments unless admin
    if (userId !== currentUserId) {
      // Check if user is admin (implement based on your auth system)
      const isAdmin = false; // Replace with actual admin check

      if (!isAdmin) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
    }

    const query: PaymentQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      status: req.query.status as any,
      method: req.query.method as any,
      gateway: req.query.gateway as any,
      start_date: req.query.start_date
        ? new Date(req.query.start_date as string)
        : undefined,
      end_date: req.query.end_date
        ? new Date(req.query.end_date as string)
        : undefined,
      sort: req.query.sort as string,
    };

    const payments = await paymentService.getPaymentsByUserId(userId, query);
    res.status(200).json(payments);
  } catch (error) {
    logger.error(`Error getting payments for user: ${error.message}`, {
      error,
    });
    res.status(500).json({ message: error.message });
  }
};

// Refund payment
export const refundPayment = async (
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

    // TODO: Add authorization check - only admin or staff can refund

    const refundData: RefundPaymentDto = req.body;

    // Validate refund data
    if (!refundData.reason) {
      res.status(400).json({ message: "Refund reason is required" });
      return;
    }

    const result = await paymentService.refundPayment(id, refundData);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Error refunding payment: ${error.message}`, { error });
    res.status(400).json({ message: error.message });
  }
};

// Abort/Cancel payment
export const abortPayment = async (
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

    const result = await paymentService.abortPayment(id);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Error aborting payment: ${error.message}`, { error });
    res.status(400).json({ message: error.message });
  }
};

// Get my payments
export const getMyPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const query: PaymentQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      status: req.query.status as any,
      method: req.query.method as any,
      gateway: req.query.gateway as any,
      start_date: req.query.start_date
        ? new Date(req.query.start_date as string)
        : undefined,
      end_date: req.query.end_date
        ? new Date(req.query.end_date as string)
        : undefined,
      sort: req.query.sort as string,
    };

    const payments = await paymentService.getPaymentsByUserId(userId, query);
    res.status(200).json(payments);
  } catch (error) {
    logger.error(`Error getting user payments: ${error.message}`, { error });
    res.status(500).json({ message: error.message });
  }
};
