import User from "../modules/user/user.schema";
import { CreateUserDto } from "../modules/user/user.types";
import mongoose from "mongoose";

import * as userService from "../modules/user/user.service";
import * as orderService from "../modules/order/order.service";

/**
 * Add a new user to the database.
 * This service can be reused across modules.
 * @param userData - Data for creating a new user
 */
export const addUser = async (userData: CreateUserDto) => {
  const user = new User({
    ...userData,
    auth_id: new mongoose.Types.ObjectId(userData.auth_id),
    created_at: new Date(),
    updated_at: new Date(),
  });

  return await user.save();
};

export const getUserDetailsAndOrders = async (userId: string) => {
  try {
    console.log(userId);
    // Fetch user details from the user module
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Fetch orders of the user from the order module
    // const orders = await orderService.getOrdersByUserId(userId, {
    //   page: 1,
    //   limit: 10, // Default pagination
    //   sort: "-created_at", // Sort by most recent orders
    // });

    return {
      user,
      // orders,
    };
  } catch (error) {
    throw new Error(`Error fetching user details and orders: ${error.message}`);
  }
};
