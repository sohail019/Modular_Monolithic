import mongoose from "mongoose";
import * as userService from "../modules/user/user.service";
import * as authService from "../modules/auth/auth.service";

/**
 * Get user profile with authentication status details
 * This combines data from both Auth and User collections
 *
 * @param userId The user ID from the User collection
 * @returns Combined user profile with auth status
 */
export const getUserProfileWithAuthStatus = async (userId: string) => {
  try {
    // Fetch user details
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get auth details using auth_id from user
    const authId = user.auth_id?.toString();
    if (!authId) {
      throw new Error("User has no associated auth record");
    }

    // Fetch auth details
    const auth = await authService.getAuthById(authId);
    if (!auth) {
      throw new Error("Auth record not found");
    }

    // Combine the data into a single response
    return {
      user: {
        id: user._id,
        full_name: user.full_name,
        phone: user.phone,
        profile_image: user.profile_image,
        date_of_birth: user.date_of_birth,
        address: user.address,
        is_completed: user.is_completed,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      auth: {
        id: auth._id,
        email: auth.email,
        role: auth.role,
        permissions: auth.permissions,
        is_verified: auth.is_verified,
        is_active: auth.is_active,
        login_provider: auth.login_provider,
        last_login_at: auth.last_login_at,
        created_at: auth.created_at,
      },
    };
  } catch (error) {
    throw new Error(
      `Error fetching user profile with auth status: ${error.message}`
    );
  }
};

/**
 * Get user profile by auth ID with authentication status details
 * Useful when you have the auth ID from JWT but need the complete user profile
 *
 * @param authId The auth ID from Auth collection
 * @returns Combined user profile with auth status
 */
export const getUserProfileByAuthId = async (authId: string) => {
  try {
    // Find user by auth_id
    const user = await userService.getUserByAuthId(authId);
    if (!user) {
      throw new Error("User not found for this auth ID");
    }

    // Get auth details
    const auth = await authService.getAuthById(authId);
    if (!auth) {
      throw new Error("Auth record not found");
    }

    // Return combined profile
    return {
      user: {
        id: user._id,
        full_name: user.full_name,
        phone: user.phone,
        profile_image: user.profile_image,
        date_of_birth: user.date_of_birth,
        address: user.address,
        is_completed: user.is_completed,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      auth: {
        id: auth._id,
        email: auth.email,
        role: auth.role,
        permissions: auth.permissions,
        is_verified: auth.is_verified,
        is_active: auth.is_active,
        login_provider: auth.login_provider,
        last_login_at: auth.last_login_at,
        created_at: auth.created_at,
      },
    };
  } catch (error) {
    throw new Error(`Error fetching user profile by auth ID: ${error.message}`);
  }
};
