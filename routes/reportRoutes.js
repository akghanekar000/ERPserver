import { Router } from "express";
import { salesSummary } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/sales", protect, salesSummary);

export default router;
