import express from "express";
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  forgotPassword, 
  resetPassword, 
  verifysignup
} from "../controller/AuthController.js";
import { protect } from "../middleware/auth.js";
import { uploadProfile } from "../config/multer.js";

const router = express.Router();

// ... (swagger docs for register/login/me remain) ...

router.post("/register", register);
router.post("/verify-signup", verifysignup);
router.post("/login", login);
router.get("/me", protect, getProfile);
router.put("/me", protect, uploadProfile.single('profileImage'), updateProfile);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
