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
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(compression());

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

// Try to connect DB, but start server regardless so nodemon won't exit
(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connection failed (continuing without DB):", err?.message || err);
  } finally {
    app.listen(PORT, () => console.log(`✅ Server listening on :${PORT}`));
  }
})();
