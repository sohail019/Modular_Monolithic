import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Public routes (no authentication required)
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refreshToken", authController.refreshToken);
router.post("/verifyEmail", authController.verifyEmail);
router.post("/resendVerification", authController.resendVerificationEmail);

// Protected routes (require authentication)
router.use(authenticate);
router.post("/logout", authController.logout);
router.get("/profile", authController.getProfile);

router.get("/myFullProfile", authenticate, authController.getMyFullProfile);

export default router;
