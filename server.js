import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Connect Database
connectDB();

// Simple route
app.get("/", (req, res) => {
  res.send("API is running and connected to MongoDB");
});

// Import routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));