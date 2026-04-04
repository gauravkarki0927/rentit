import express from "express";
import { createReview, getReviews } from "../controller/ReviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/post/:targetId", getReviews);

export default router;
