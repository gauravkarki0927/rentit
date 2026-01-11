import User from "../model/UserModel.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';

// Mock email sender
const sendEmail = async (options) => {
  console.log(`[EMAIL SEND MOCK] To: ${options.email}, Subject: ${options.subject}, Message: ${options.message}`);
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, userType, address } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      userType: userType || "both",
      address: address || {},
      isVerified: true
    });

    // Remove password from response
    user.password = undefined;

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Error during registration",
      error: error.message,
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
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

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
      const relativePath = req.file.path.replace(/\\/g, '/');
      profileImagePath = relativePath.startsWith('uploads') ? '/' + relativePath : relativePath;
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
      { new: true, runValidators: true }
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

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset',
        message: `Your password reset code is ${resetToken}`
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

    const resetPasswordToken = crypto.createHash('sha256').update(code).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
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


export { register, login, getProfile, updateProfile, forgotPassword, resetPassword };
