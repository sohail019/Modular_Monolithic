import { Router } from "express";
import * as paymentController from "./payment.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Public routes - only webhook doesn't require authentication
router.post("/webhook", paymentController.handleWebhook);
router.post("/seed", paymentController.seedPaymentsController);

// All other routes require authentication
router.use(authenticate);

// Payment routes
router.post("/initiate", paymentController.initiatePayment);
router.get("/order/:orderId", paymentController.getPaymentsByOrderId);
router.get("/user/:userId", paymentController.getPaymentsByUserId);
router.get("/me", paymentController.getMyPayments);
router.post("/:id/refund", paymentController.refundPayment);
router.post("/abort/:id", paymentController.abortPayment);
router.get("/:id", paymentController.getPaymentById);

export default router;
