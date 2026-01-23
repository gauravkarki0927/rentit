import express from "express";
import {
  initializeRoomPayment,
  verifyRoomPayment,
  getPaymentHistory,
  getPaymentDetails,
  refundPayment,
} from "../controller/RoomPaymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Initialize payment for room upload
router.post("/initialize", initializeRoomPayment);

// Verify payment (after Khalti callback)
router.post("/verify", verifyRoomPayment);

// Get payment history
router.get("/history", getPaymentHistory);

// Get payment details
router.get("/:paymentId", getPaymentDetails);

// Refund payment
router.post("/:paymentId/refund", refundPayment);

export default router;
