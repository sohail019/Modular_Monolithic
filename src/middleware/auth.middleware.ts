import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token:", token); // Log the token for debugging
    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return; // Return after sending response, don't call next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    console.log(decoded);
    req.user = decoded;
    next(); // Call next() to continue to the route handler
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    // Don't call next() on error, just end the request
  }
};
