import { Request, Response } from "express";
import * as userService from "./user.service";
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateAddressDto,
  UpdateProfileImageDto,
} from "./user.types";
import * as orderPaymentService from "../../shared/order-payment.service";
import * as userAuthService from "../../shared/user-auth.service";

// Get current user profile
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    // Assuming auth middleware adds userId to req object
    const authId = req.user?.id;
    if (!authId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await userService.getUserById(authId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Create new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const userData: CreateUserDto = req.body;
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update current user profile
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const authId = req.user?.id;
    if (!authId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const updateData: UpdateUserDto = req.body;
    const updatedUser = await userService.updateUserById(authId, updateData);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user by ID
export const updateUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateUserDto = req.body;
    const updatedUser = await userService.updateUserById(id, updateData);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update current user address
export const updateMyAddress = async (req: Request, res: Response) => {
  try {
    const authId = req.user?.id;
    if (!authId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const addressData: UpdateAddressDto = req.body;
    const updatedUser = await userService.updateUserAddress(
      authId,
      addressData
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update current user profile image
export const updateMyProfileImage = async (req: Request, res: Response) => {
  try {
    const authId = req.user?.id;
    if (!authId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const imageData: UpdateProfileImageDto = req.body;
    const updatedUser = await userService.updateProfileImage(authId, imageData);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const authId = req.user?.id;
    if (!authId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const orders = await userService.getUserOrders(authId);
    res.status(200).json(orders);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserOrdersWithPaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await orderPaymentService.getUserDetailsAndOrdersWithPayment(
      userId
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add this to your user controller
export const getProfileWithAuthStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.auth_id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const profile = await userAuthService.getUserProfileByAuthId(userId);
    res.status(200).json(profile);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getOrderStatusWithUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const result = await orderPaymentService.getOrderStatusWithUser(orderId);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
