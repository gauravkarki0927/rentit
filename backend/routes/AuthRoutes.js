import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifysignup,
  kycUpload,
} from "../controller/AuthController.js";
import { protect } from "../middleware/auth.js";
import { uploadProfile, uploadKYC } from "../config/multer.js";

const router = express.Router();

// ... (swagger docs for register/login/me remain) ...

router.post("/register", register);
router.post("/verify-signup", verifysignup);
router.post("/login", login);
router.get("/me", protect, getProfile);
router.put("/me", protect, uploadProfile.single("profileImage"), updateProfile);
router.post("/kyc-upload", protect, uploadKYC.single("kycDocument"), kycUpload);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
