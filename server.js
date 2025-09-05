// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());      // parse JSON bodies
app.use(morgan("dev"));      // request logging
app.use(helmet());           // security headers
app.use(cors());             // enable CORS
app.use(compression());      // gzip responses

// Simple root route
app.get("/", (req, res) => res.send("API running"));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);

// Error middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect DB then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connect error:", err?.message || err);
    process.exit(1);
  });
