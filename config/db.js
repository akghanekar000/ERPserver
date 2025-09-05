// config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI not set in environment");
  }
  try {
    const conn = await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || "erpdb",
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // throw error so caller can decide what to do
    throw error;
  }
};
