import { Request, Response } from "express";
import * as cartService from "./cart.service";
import { AddToCartDto, UpdateCartItemDto } from "./cart.types";

// Get user cart
export const getUserCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const cart = await cartService.getUserCart(userId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const itemData: AddToCartDto = req.body;

    // Validate required fields
    if (!itemData.product_id || !itemData.quantity || itemData.quantity < 1) {
      res.status(400).json({
        message:
          "Product ID and quantity are required. Quantity must be greater than 0.",
      });
      return;
    }

    const updatedCart = await cartService.addToCart(userId, itemData);
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update cart item
export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const updateData: UpdateCartItemDto = req.body;

    // Validate update data
    if (updateData.quantity !== undefined && updateData.quantity < 1) {
      res.status(400).json({ message: "Quantity must be greater than 0" });
      return;
    }

    const updatedCart = await cartService.updateCartItem(
      userId,
      id,
      updateData
    );
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const updatedCart = await cartService.removeFromCart(userId, id);
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await cartService.clearCart(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Save item for later
export const saveForLater = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const updatedCart = await cartService.updateCartItem(userId, id, {
      status: "saved_for_later",
    });
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Move to cart (from saved for later)
export const moveToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const updatedCart = await cartService.updateCartItem(userId, id, {
      status: "active",
    });
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
