import { Request, Response } from "express";
import * as authService from "./auth.service";
import { AuthRequestBody } from "./auth.types";
import * as userService from "../../modules/user/user.service";

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      login_provider,
      full_name,
      phone,
      date_of_birth,
      profile_image,
      address,
    }: AuthRequestBody = req.body;

    // Pass all fields to the createUser service
    const { user, verification_token } = await authService.createUser({
      email,
      password,
      login_provider,
      full_name,
      phone,
      date_of_birth,
      profile_image,
      address,
    });

    // In a real application, you would send a verification email here
    // For now, just return a message with the token

    res.status(201).json({
      message: "User created successfully. Please verify your email.",
      user: {
        id: user.id,
        email: user.email,
        is_verified: user.is_verified,
      },
      verification_token, // In production, do not return this in the response
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: Pick<AuthRequestBody, "email" | "password"> =
      req.body;

    // Call the login service
    const {
      token,
      refresh_token,
      user: authUser,
    } = await authService.login({
      email,
      password,
    });

    const userDetails = await userService.getUserByAuthId(authUser.id);

    res.status(200).json({
      access_token: token,
      refresh_token,
      expires_in: 3600, // 1 hour in seconds
      user: userDetails,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!req.user || !req.user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!refresh_token) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    await authService.logout(refresh_token, req.user.id);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    const tokens = await authService.refreshToken(refresh_token);

    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return; 
    }

    const profile = await authService.getProfile(req.user.id);

    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: "Verification token is required" });
      return;
    }

    const result = await authService.verifyEmail(token);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const result = await authService.sendVerificationEmail(email);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
