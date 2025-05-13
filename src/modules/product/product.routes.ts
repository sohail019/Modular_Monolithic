import { Router } from "express";
import * as productController from "./product.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/:id", productController.getProductById);
router.get("/:id/availability", productController.checkProductAvailability);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/brand/:brand", productController.getProductsByBrand);
// router.post("/seeding", productController.seedProducts);
// Protected routes (require authentication)
router.post("/", authenticate, productController.createProduct);
router.patch("/:id", authenticate, productController.updateProductById);
router.delete("/:id", authenticate, productController.deleteProductById);

export default router;
