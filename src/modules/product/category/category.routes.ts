import { Router } from "express";
import * as categoryController from "./category.controller";
import { authenticate } from "../../../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/getCategory/:id", categoryController.getCategoryById);
router.get("/slug/:slug", categoryController.getCategoryBySlug);

// Protected routes (require authentication)
router.post("/createCategory", authenticate, categoryController.createCategory);
router.patch(
  "/updateCategory/:id",
  authenticate,
  categoryController.updateCategoryById
);
router.delete(
  "/deleteCategory/:id",
  authenticate,
  categoryController.deleteCategoryById
);

export default router;
