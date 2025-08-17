import { Router } from "express";
import { register, login, me } from "../controllers/authController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// For first-time setup, you may comment out protect/requireRole to create the first admin.
router.post("/register", protect, requireRole("admin"), register);
router.post("/login", login);
router.get("/me", protect, me);

export default router;
