import User from "../model/UserModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendOTP, { sendEmailVerificationCode } from "../utils/sendEmail.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, userType, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Generate OTP
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const hashedCode = crypto
      .createHash("sha256")
      .update(verificationCode)
      .digest("hex");

    const user = await User.create({
      name,
      email,
      password,
      userType: userType || "tenant",
      address: address || {},
      isVerified: false,
      emailVerificationCode: hashedCode,
      emailVerificationExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    await sendEmailVerificationCode({
      name: user.name,
      email: user.email,
      code: verificationCode,
    });

    res.status(201).json({
      success: true,
      user,
      message: "User registered. Verification code sent to email.",
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Error during registration",
    });
  }
};

const verifysignup = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

    if (user.emailVerificationExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Verification code expired",
      });
    }

    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    if (hashedCode !== user.emailVerificationCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    user.isVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check for user
    // 1️⃣ Check if user exists by email
    const userByEmail = await User.findOne({ email }).select("+password");

    if (!userByEmail) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    // 2️⃣ Check if user is verified
    if (!userByEmail.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // ✅ Now you have a verified user
    const user = userByEmail;

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Remove password from response
    user.password = undefined;

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, bio, address, profileImage } = req.body;
    let profileImagePath = profileImage;
    if (req.file) {
      const relativePath = req.file.path.replace(/\\/g, "/");
      profileImagePath = relativePath.startsWith("uploads")
        ? "/" + relativePath
        : relativePath;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        phoneNumber,
        bio,
        address,
        profileImage: profileImagePath,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate reset token (6 digit OTP)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    try {
      await sendOTP({
        email: user.email,
        subject: "Password Reset",
        message: `Your password reset code is ${resetToken}`,
      });
      res.status(200).json({
        success: true,
        message: "Password reset code sent to email",
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Error during password reset request",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    user.password = password; // Will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

const kycUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload a document" });
    }

    const relativePath = req.file.path.replace(/\\/g, "/");
    const kycPath = relativePath.startsWith("uploads")
      ? "/" + relativePath
      : relativePath;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        kycDocument: kycPath,
        kycStatus: "pending",
        kycSubmittedAt: new Date(),
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "KYC document submitted successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  register,
  verifysignup,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  kycUpload,
};
