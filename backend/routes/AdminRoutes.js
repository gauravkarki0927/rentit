import express from "express";
import { protect } from "../middleware/auth.js";
import {
  checkAdmin,
  getAllUsers,
  getAllListings,
  deleteUserByAdmin,
  deleteListingByAdmin,
  getDashboardStats,
} from "../controller/AdminController.js";

const AdminRouter = express.Router();

// Middleware to check admin status
AdminRouter.use(protect, checkAdmin);

// Admin routes
AdminRouter.get("/stats", getDashboardStats);
AdminRouter.get("/users", getAllUsers);
AdminRouter.get("/listings", getAllListings);
AdminRouter.delete("/user/:userId", deleteUserByAdmin);
AdminRouter.delete("/listing/:listingId", deleteListingByAdmin);

export default AdminRouter;
