
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    // GST percentage for this specific product.
    // Set the correct rate for each product in your product records.
    gstRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    description: String
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
