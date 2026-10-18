
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    // Optional for customers who do not have a GSTIN.
    gstin: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
      maxlength: 15
    },
    // Needed to help determine the applicable GST treatment.
    state: {
      type: String,
      default: "",
      trim: true
    },
    stateCode: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2
    }
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
