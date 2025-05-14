import { Request, Response } from "express";
import * as cartService from "./cart.service";
import { AddToCartDto, UpdateCartItemDto } from "./cart.types";
import * as cartProductService from "../../shared/cart-product.service";

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
    console.log("Update data:", updateData);

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

export const getMyCartWithProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const cartWithProducts =
      await cartProductService.getUserCartWithProductSnapshot(userId);
    res.status(200).json(cartWithProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get a specific cart with product snapshots (for admins)
 */
export const getCartWithProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cartId } = req.params;

    // Optional: Add authorization check here to ensure admin access

    const cartWithProducts =
      await cartProductService.getCartWithProductSnapshot(cartId);
    res.status(200).json(cartWithProducts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
