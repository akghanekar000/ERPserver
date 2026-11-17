import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    gstin: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
      maxlength: 15
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true
    },
    phone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    pinCode: {
      type: String,
      default: "",
      trim: true,
      maxlength: 10
    },

    // Company bank details
    bankName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150
    },
    accountHolder: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150
    },
    accountNumber: {
      type: String,
      default: "",
      trim: true,
      maxlength: 34
    },
    ifscCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
      maxlength: 11
    },
    branch: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150
    },

    // Invoice numbering preferences.
    invoiceNumbering: {
      usePrefix: {
        type: Boolean,
        default: false
      },
      savedPrefix: {
        type: String,
        default: "",
        trim: true,
        maxlength: 15
      },
      savePrefixForFuture: {
        type: Boolean,
        default: false
      },
      automaticNumbering: {
        type: Boolean,
        default: true
      },
      nextNumber: {
        type: Number,
        default: 10001,
        min: 1
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
