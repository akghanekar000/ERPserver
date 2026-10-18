
import { Router } from "express";
import {
  getCompany,
  saveCompany
} from "../controllers/companyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getCompany);
router.put("/", protect, saveCompany);

export default router;

