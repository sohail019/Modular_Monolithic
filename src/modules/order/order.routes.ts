import { Router } from "express";
import * as orderController from "./order.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// All order routes require authentication
router.use(authenticate);

// Order routes
// Create order
router.post("/create", orderController.createOrder);

// Get all orders (admin)
router.get("/", orderController.getAllOrders);

// Get order by ID
router.get("/:id", orderController.getOrderById);

// Get user's orders
router.get("/user/:userId", orderController.getOrdersByUserId);

// Get my orders
router.get("/me/orders", orderController.getMyOrders);

// Update order status
router.patch("/:id/status", orderController.updateOrderStatus);

// Cancel order
router.patch("/:id/cancel", orderController.cancelOrder);

// Cancel order item
router.patch("/:id/items/:itemId/cancel", orderController.cancelOrderItem);

// Get order status log
router.get("/:id/status-log", orderController.getOrderStatusLog);

// Apply discount
router.post("/:id/discount", orderController.applyOrderDiscount);

// Get order items
router.get("/:id/items", orderController.getOrderItems);

// Order item routes
router.patch("/:orderId/items/:itemId", orderController.updateOrderItem);
router.delete("/:orderId/items/:itemId", orderController.deleteOrderItem);

export default router;
