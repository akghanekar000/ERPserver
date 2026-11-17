import { Router } from "express";

import {
  listInvoices,
  getInvoice,
  createInvoice,
  deleteInvoice,
  updatePaymentStatus
} from "../controllers/invoiceController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, listInvoices);

router.post("/", protect, createInvoice);

router.patch(
  "/:id/payment-status",
  protect,
  updatePaymentStatus
);

router.delete(
  "/:id",
  protect,
  deleteInvoice
);

router.get("/:id", protect, getInvoice);

export default router;
