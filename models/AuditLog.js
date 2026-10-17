
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    details: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000
    }
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);

