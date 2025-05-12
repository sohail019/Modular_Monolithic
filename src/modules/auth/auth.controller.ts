import { Request, Response } from "express";
import * as authService from "./auth.service";
import { AuthRequestBody } from "./auth.types";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, login_provider }: AuthRequestBody = req.body;
    const user = await authService.createUser({
      email,
      password,
      login_provider,
    });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: AuthRequestBody = req.body;
    const { token, user } = await authService.login({
      email,
      password,
      login_provider: "",
    });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
