import { Router } from "express";
import * as orderController from "./order.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { seedOrders } from "./order.service";
const router = Router();

// All order routes require authentication
router.use(authenticate);

// Order routes
// Create order
router.post("/create", orderController.createOrder);

// Get all orders (admin)
router.get("/", orderController.getAllOrders);

// Get order by ID
// router.get("/:id", orderController.getOrderById);

// Get user's orders
router.get("/user/:userId", orderController.getOrdersByUserId);

// Get my orders
router.get("/getUsersOrders", orderController.getMyOrders);

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

router.get(
  "/:orderId/details",
  orderController.getOrderDetailWithItemsAndPaymentsController
);

router.get(
  "/:orderId/detailsWithShippingAddress",
  authenticate,
  orderController.getOrderDetailsWithShippingAddressController
);

router.post("/seed-orders", async (req, res) => {
  try {
    const { count } = req.body; // Number of orders to seed
    await seedOrders(count || 10);
    res.status(201).json({ message: "Orders seeded successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;
