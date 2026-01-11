import express from "express";
import {
  createApplication,
  getOwnerApplications,
  getMyApplications,
  updateApplicationStatus,
} from "../controller/ApplicationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createApplication);
router.get("/owner", protect, getOwnerApplications);
router.get("/my", protect, getMyApplications);
router.put("/:id/status", protect, updateApplicationStatus);

export default router;
