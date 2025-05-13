import { Router } from "express";
import * as cartController from "./cart.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// Cart routes
router.get("/", cartController.getUserCart);
router.post("/items", cartController.addToCart);
router.put("/items/updateCartItem/:id", cartController.updateCartItem);
router.delete("/items/removeFromCart/:id", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

// Saved for later functionality
router.post("/items/:id/save-for-later", cartController.saveForLater);
router.post("/items/:id/move-to-cart", cartController.moveToCart);

export default router;
