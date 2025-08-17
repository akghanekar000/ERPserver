import { Router } from "express";
import { listInvoices, getInvoice, createInvoice } from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, listInvoices);
router.get("/:id", protect, getInvoice);
router.post("/", protect, createInvoice);

export default router;
