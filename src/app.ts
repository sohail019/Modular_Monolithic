import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db"; // Importing database connection
import authRoutes from "./modules/auth/auth.routes"; // Importing auth routes
import userRoutes from "./modules/user/user.routes";

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to the database
connectDB();

// Use Routes
app.use("/api/auth", authRoutes); // auth routes
app.use("/api/users", userRoutes); // user routes

// Root endpoint
app.get("/", (req, res) => {
  res.send("Modular Monolithic Auth Server Running!");
});

export default app;
