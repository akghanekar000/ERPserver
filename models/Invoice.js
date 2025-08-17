import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  items: [itemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["draft", "sent", "paid", "void"], default: "draft" }
}, { timestamps: true });

export default mongoose.model("Invoice", invoiceSchema);
