import express from "express";
import {
  createApplication,
  getOwnerApplications,
  getMyApplications,
  updateApplicationStatus,
  deleteApplication,
  getAllApplications,
  getApplicationByID,
  updateApplication,
} from "../controller/ApplicationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createApplication);
router.get("/owner", protect, getOwnerApplications);
router.get("/", protect, getAllApplications); 
router.get("/my-applications", protect, getMyApplications); // Alias for user dashboard
router.get("/:id", protect, getApplicationByID);
router.put("/:id/status", protect, updateApplicationStatus);
router.put("/:id", protect, updateApplication);
router.delete("/:id", protect, deleteApplication);

export default router;
