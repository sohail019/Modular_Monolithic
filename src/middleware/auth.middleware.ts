import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as authService from "../modules/auth/auth.service";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Check if token is revoked
    const isRevoked = await authService.isTokenRevoked(token);
    if (isRevoked) {
      res.status(401).json({ message: "Token has been revoked" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    // Ensure it's an access token, not a refresh token
    if ((decoded as any).type !== "access") {
      res.status(401).json({ message: "Invalid token type" });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
