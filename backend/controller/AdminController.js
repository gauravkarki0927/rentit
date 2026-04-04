import User from "../model/UserModel.js";
import Post from "../model/PostModel.js";
import Payment from "../model/PaymentModel.js";
import Application from "../model/ApplicationModel.js";
import RoomPayment from "../model/RoomPaymentModel.js";
import Report from "../model/ReportModel.js";
import SystemSettings from "../model/SystemSettingsModel.js";

// Check if user is admin
export const checkAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalCount = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      users,
    });
  } catch (err) {
    console.error("Get All Users Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Get all listings
export const getAllListings = async (req, res) => {
  try {
    const { page = 1, limit = 50, status = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    if (status) {
      query.status = status;
    }

    const listings = await Post.find(query)
      .populate("userId", "name email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalCount = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: listings.length,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      listings,
    });
  } catch (err) {
    console.error("Get All Listings Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Delete user (by admin)
export const deleteUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Also delete user's listings
    await Post.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: "User and their listings deleted successfully",
      user,
    });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Delete listing (by admin)
export const deleteListingByAdmin = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await Post.findByIdAndDelete(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
      listing,
    });
  } catch (err) {
    console.error("Delete Listing Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Update user status (isActive)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Update listing status
export const updateListingStatus = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { status, isFeatured } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;

    const listing = await Post.findByIdAndUpdate(listingId, updateData, {
      new: true,
    }).populate("userId", "name email");

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      listing,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// --- KYC Management ---

// Get pending KYC requests
export const getPendingKYC = async (req, res) => {
  try {
    const users = await User.find({ kycStatus: "pending" }).select("-password");
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve/Reject KYC
export const handleKYC = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // approved, rejected

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        kycStatus: status,
        isVerified: status === "approved",
      },
      { new: true },
    ).select("-password");

    res.status(200).json({
      success: true,
      message: `KYC ${status} successfully`,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Report Management ---

// Get all reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporterId", "name email")
      .populate("postId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update report status
export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNote } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status, adminNote },
      { new: true },
    );

    res.status(200).json({ success: true, message: "Report updated", report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- System Settings Management ---

// Get settings
export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({
        postingFee: 50,
        featuredFee: 500,
      });
    }
    res.status(200).json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    const { postingFee, featuredFee, maintenanceMode } = req.body;
    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = new SystemSettings();
    }

    if (postingFee !== undefined) settings.postingFee = postingFee;
    if (featuredFee !== undefined) settings.featuredFee = featuredFee;
    if (maintenanceMode !== undefined)
      settings.maintenanceMode = maintenanceMode;
    settings.updatedBy = req.user._id;

    await settings.save();
    res
      .status(200)
      .json({ success: true, message: "Settings updated", settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all payments (Tenant to Owner)
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find()
      .populate("userId", "name email")
      .populate("ownerId", "name email")
      .populate("roomId", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalCount = await Payment.countDocuments();

    res.status(200).json({
      success: true,
      count: payments.length,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      payments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Get all room posting payments (Owner to Platform)
export const getAllRoomPayments = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const payments = await RoomPayment.find()
      .populate("userId", "name email")
      .populate("postId", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalCount = await RoomPayment.countDocuments();

    res.status(200).json({
      success: true,
      count: payments.length,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      payments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const applications = await Application.find()
      .populate("tenantId", "name email")
      .populate("ownerId", "name email")
      .populate("roomId", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalCount = await Application.countDocuments();

    res.status(200).json({
      success: true,
      count: applications.length,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      applications,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Post.countDocuments();
    const activeListings = await Post.countDocuments({ status: "available" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const pendingKYC = await User.countDocuments({ kycStatus: "pending" });
    const pendingReports = await Report.countDocuments({ status: "pending" });

    // Calculate total platform revenue from room postings
    const platformRevData = await RoomPayment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const platformRevenue =
      platformRevData.length > 0 ? platformRevData[0].total : 0;

    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentListings = await Post.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        activeListings,
        totalAdmins,
        pendingKYC,
        pendingReports,
        platformRevenue,
        recentUsers,
        recentListings,
      },
    });
  } catch (err) {
    console.error("Get Stats Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
