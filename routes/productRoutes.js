import { Router } from "express";
import { listProducts, getProduct, createProduct, updateProduct, removeProduct } from "../controllers/productController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, listProducts);
router.get("/:id", protect, getProduct);
router.post("/", protect, requireRole("admin"), createProduct);
router.put("/:id", protect, requireRole("admin"), updateProduct);
router.delete("/:id", protect, requireRole("admin"), removeProduct);

export default router;
