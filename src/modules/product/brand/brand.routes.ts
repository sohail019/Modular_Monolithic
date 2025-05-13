import { Router } from "express";
import * as brandController from "./brand.controller";
import { authenticate } from "../../../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", brandController.getAllBrands);
router.get("/:id", brandController.getBrandById);
router.get("/:id/products", brandController.getProductsByBrandId);

// Protected routes (require authentication)
router.post("/", authenticate, brandController.createBrand);
router.patch("/:id", authenticate, brandController.updateBrandById);
router.delete("/:id", authenticate, brandController.deleteBrandById);

export default router;
