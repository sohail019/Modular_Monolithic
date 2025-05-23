import { NextFunction, Router } from "express";
import * as userController from "./user.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/getUserById/:id", userController.getUserById);
// router.post("/", userController.createUser);

// Protected routes with authentication middleware
router.get("/me", authenticate, userController.getMyProfile);
router.put("/me", authenticate, userController.updateMyProfile);
router.patch("/me/address", authenticate, userController.updateMyAddress);
router.patch("/me/image", authenticate, userController.updateMyProfileImage);
router.get("/me/orders", authenticate, userController.getUserOrders);
router.put("/updateUserById/:id", authenticate, userController.updateUserById);

router.get(
  "/userOrdersWithPayment",
  authenticate,
  userController.getUserOrdersWithPaymentController
);

router.get(
  "/profileWithAuthStatus",
  authenticate,
  userController.getProfileWithAuthStatus
);

  router.get(
  "/:orderId/statusWithUser",
  userController.getOrderStatusWithUserController
);


export default router;
