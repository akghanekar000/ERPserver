import { Router } from "express";
import { listCustomers, createCustomer, updateCustomer, removeCustomer } from "../controllers/customerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, listCustomers);
router.post("/", protect, createCustomer);
router.put("/:id", protect, updateCustomer);
router.delete("/:id", protect, removeCustomer);

export default router;
