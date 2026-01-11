import User from "../model/UserModel.js";
import Post from "../model/PostModel.js";

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

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Post.countDocuments();
    const activeListings = await Post.countDocuments({ status: "available" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

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
      },
      recentUsers,
      recentListings,
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
