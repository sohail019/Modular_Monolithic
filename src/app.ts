import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db"; // Importing database connection
import authRoutes from "./modules/auth/auth.routes"; // Importing auth routes
import userRoutes from "./modules/user/user.routes";
import productRoutes from "./modules/product/product.routes";
import categoryRoutes from "./modules/product/category/category.routes";
import brandRoutes from "./modules/product/brand/brand.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/order/order.routes";
import paymentRoutes from "./modules/payment/payment.routes";
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
app.use("/api/products", productRoutes); // product routes
app.use("/api/categories", categoryRoutes); // category routes
app.use("/api/brands", brandRoutes);
// Add more routes as needed
app.use("/api/cart", cartRoutes); // cart routes
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
// Root endpoint
app.get("/", (req, res) => {
  res.send("Modular Monolithic Auth Server Running!");
});

export default app;
