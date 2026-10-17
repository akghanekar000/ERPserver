
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";

export async function createAuditLogEntry(req, res, next) {
  try {
    const action =
      typeof req.body?.action === "string"
        ? req.body.action.trim()
        : "";

    const details =
      typeof req.body?.details === "string"
        ? req.body.details.trim()
        : "";

    if (!action || action.length > 100) {
      return res.status(400).json({
        message: "A valid action is required"
      });
    }

    if (details.length > 2000) {
      return res.status(400).json({
        message: "Details are too long"
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const user = await User.findById(req.user.id).select("name");

    if (!user) {
      return res.status(401).json({
        message: "Authenticated user was not found"
      });
    }

    const entry = await AuditLog.create({
      userId: user._id,
      userName: user.name,
      action,
      details
    });

    return res.status(201).json({
      message: "Audit log saved",
      auditLog: {
        id: entry._id,
        userName: entry.userName,
        action: entry.action,
        details: entry.details,
        createdAt: entry.createdAt
      }
    });
  } catch (error) {
    return next(error);
  }
}

