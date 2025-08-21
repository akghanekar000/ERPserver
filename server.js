import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

// Middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

// -------------------
// App Initialization
// -------------------
const app = express();

// -------------------
// Middleware
// -------------------

// ✅ CORS setup (allow frontend + production)
const allowedOrigins = [
  "http://localhost:5173",   // Vite dev server
  "http://localhost:3000",   // React dev server
  process.env.FRONTEND_URL,  // Production frontend (set in .env)
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ✅ JSON parser
app.use(express.json());

// ✅ Logger
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// -------------------
// Health Check Route
// -------------------
app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// -------------------
// API Routes
// -------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);

// -------------------
// Error Handlers
// -------------------
app.use(notFound);
app.use(errorHandler);

// -------------------
// Server + DB Connect
// -------------------
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err?.message || err);
    process.exit(1);
  });