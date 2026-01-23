import jwt from "jsonwebtoken";
import User from "../model/UserModel.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this id",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.userType}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// Check if user is owner
export const isOwner = (req, res, next) => {
  if (req.user.userType !== "owner") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Owner privileges required.",
    });
  }
  next();
};

// Check if user is renter
export const isRenter = (req, res, next) => {
  if (req.user.userType !== "tenant") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Renter privileges required.",
    });
  }
  next();
};
