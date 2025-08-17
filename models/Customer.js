import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String }
}, { timestamps: true });

export default mongoose.model("Customer", customerSchema);
