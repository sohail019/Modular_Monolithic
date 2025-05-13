import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Public routes (no authentication required)
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerificationEmail);

// Protected routes (require authentication)
router.use(authenticate);
router.post("/logout", authController.logout);
router.get("/profile", authController.getProfile);

export default router;
