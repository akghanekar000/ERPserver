
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    qty: { type: Number, required: true, min: 0.001 },
    
    description: { type: String, default: "" },
    hsnSac: { type: String, default: "", trim: true },
    unit: { type: String, default: "Nos", trim: true },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    discountAmount: { type: Number, default: 0, min: 0 },
    
    // Unit price entered or selected for the product.
    price: { type: Number, required: true, min: 0 },
    priceMode: {
      type: String,
      enum: ["inclusive", "exclusive"],
      default: "exclusive"
    },
    gstRate: { type: Number, default: 0, min: 0, max: 100 },
    taxableAmount: { type: Number, default: 0, min: 0 },
    cgst: { type: Number, default: 0, min: 0 },
    sgst: { type: Number, default: 0, min: 0 },
    igst: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    lineTotal: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    invoiceDate: {
      type: Date,
      default: Date.now
    },
    roundOff: {
      type: Number,
      default: 0
    },
    buyerOrderNumber: { 
      type: String, 
      default: "" 
    },
    buyerOrderDate: { 
      type: Date, 
      default: null 
    },
    vehicleNumber: { 
      type: String, 
      default: "" 
    },
    deliveryDate: { 
      type: Date, 
      default: null 
    },
    transportDetails: { 
      type: String, 
      default: "" 
    },
    deliveryAddress: { 
      type: String, 
      default: "" 
    },
    placeOfSupply: { 
      type: String, 
      default: "" 
    },
    reverseCharge: { 
      type: Boolean, 
      default: false 
    },
    freightCharges: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    packingCharges: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    items: {
      type: [itemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "An invoice must contain at least one item."
      }
    },
    sellerSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
    customerSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
    supplyType: {
      type: String,
      enum: ["intra-state", "inter-state"],
      default: "intra-state"
    },
    subtotal: { type: Number, required: true, min: 0 },
    taxableAmount: { type: Number, default: 0, min: 0 },
    cgst: { type: Number, default: 0, min: 0 },
    sgst: { type: Number, default: 0, min: 0 },
    igst: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "void"],
      default: "draft"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
