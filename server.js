import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// DB Connection
console.log("Connecting to DB...");
await connectDB();

// Simple route to test
app.get("/", (req, res) => {
  res.send("🚀 Server and DB are running successfully!");
});

// Keep server alive
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});