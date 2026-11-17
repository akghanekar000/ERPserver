import mongoose from "mongoose";

const invoiceCounterSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    prefix: {
      type: String,
      default: ""
    },
    sequence: {
      type: Number,
      default: 10000,
      min: 0
    }
  },
  { timestamps: true }
);

invoiceCounterSchema.index(
  { owner: 1, prefix: 1 },
  { unique: true }
);

export default mongoose.model(
  "InvoiceCounter",
  invoiceCounterSchema
);
