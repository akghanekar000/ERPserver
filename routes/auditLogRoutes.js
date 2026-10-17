
import { Router } from "express";
import { createAuditLogEntry } from "../controllers/auditLogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, createAuditLogEntry);

export default router;

