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
    const user = await authService.createUser({
      email,
      password,
      login_provider,
      full_name,
      phone,
      date_of_birth,
      profile_image,
      address,
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: Pick<AuthRequestBody, "email" | "password"> =
      req.body;

    // Call the login service
    const { token, user: authUser } = await authService.login({
      email,
      password,
      // Default value for login_provider
    });
    const userDetails = await userService.getUserByAuthId(authUser.id);

    res.status(200).json({ token, user: userDetails });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
