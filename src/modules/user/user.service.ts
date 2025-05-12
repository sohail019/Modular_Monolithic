import User from "./user.schema";
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateAddressDto,
  UpdateProfileImageDto,
} from "./user.types";
import mongoose from "mongoose";

// Create a new user
export const createUser = async (userData: CreateUserDto) => {
  const user = new User({
    ...userData,
    auth_id: new mongoose.Types.ObjectId(userData.auth_id),
  });

  return await user.save();
};

// Get user by ID
export const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

// Get user by Auth ID
export const getUserByAuthId = async (authId: string) => {
  const user = await User.findOne({
    auth_id: new mongoose.Types.ObjectId(authId),
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

// Update user by ID
export const updateUserById = async (id: string, updateData: UpdateUserDto) => {
  const user = await User.findByIdAndUpdate(
    id,
    { ...updateData, updated_at: new Date() },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Update user by Auth ID
export const updateUserByAuthId = async (
  authId: string,
  updateData: UpdateUserDto
) => {
  const user = await User.findOneAndUpdate(
    { auth_id: new mongoose.Types.ObjectId(authId) },
    { ...updateData, updated_at: new Date() },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Update user address
export const updateUserAddress = async (
  authId: string,
  addressData: UpdateAddressDto
) => {
  const user = await User.findOneAndUpdate(
    { auth_id: new mongoose.Types.ObjectId(authId) },
    {
      address: addressData,
      updated_at: new Date(),
    },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Update profile image
export const updateProfileImage = async (
  authId: string,
  imageData: UpdateProfileImageDto
) => {
  const user = await User.findOneAndUpdate(
    { auth_id: new mongoose.Types.ObjectId(authId) },
    {
      profile_image: imageData.profile_image,
      updated_at: new Date(),
    },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Get user orders (this would interact with an Order model)
export const getUserOrders = async (userId: string) => {
  // This would typically query the Order model to find orders
  // associated with this user
  // For now, returning a placeholder
  return { message: `Orders for user ${userId} would be returned here` };
};
