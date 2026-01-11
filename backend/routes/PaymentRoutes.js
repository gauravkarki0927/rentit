import express from "express";
import { 
  createPayment, 
  getMyPayments, 
  initiateKhaltiPayment, 
  verifyKhaltiPayment 
} from "../controller/PaymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Regular payment routes
router.post("/", protect, createPayment);
router.get("/my", protect, getMyPayments);

// Khalti payment routes
router.post("/khalti/initiate", protect, initiateKhaltiPayment);
router.post("/khalti/verify", protect, verifyKhaltiPayment);

export default router;
