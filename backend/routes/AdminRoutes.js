import express from "express";
import { protect, isAdmin } from "../middleware/auth.js";
import {
  checkAdmin,
  getAllUsers,
  getAllListings,
  deleteUserByAdmin,
  deleteListingByAdmin,
  getDashboardStats,
  updateUserStatus,
  updateUserRole,
  updateListingStatus,
  getAllPayments,
  getAllApplications,
} from "../controller/AdminController.js";

const AdminRouter = express.Router();

// Middleware to check admin status - Apply to all admin routes
AdminRouter.use(protect, isAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved
 */
AdminRouter.get("/stats", getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination and search
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
AdminRouter.get("/users", getAllUsers);

/**
 * @swagger
 * /api/admin/listings:
 *   get:
 *     summary: Get all listings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of listings
 */
AdminRouter.get("/listings", getAllListings);

/**
 * @swagger
 * /api/admin/user/{userId}:
 *   delete:
 *     summary: Delete a user by admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
AdminRouter.delete("/user/:userId", deleteUserByAdmin);

/**
 * @swagger
 * /api/admin/listing/{listingId}:
 *   delete:
 *     summary: Delete a listing by admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing deleted successfully
 */
AdminRouter.delete("/listing/:listingId", deleteListingByAdmin);

/**
 * @swagger
 * /api/admin/user/{userId}/status:
 *   patch:
 *     summary: Update user status
 *     tags: [Admin]
 */
AdminRouter.patch("/user/:userId/status", updateUserStatus);

/**
 * @swagger
 * /api/admin/user/{userId}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 */
AdminRouter.patch("/user/:userId/role", updateUserRole);

/**
 * @swagger
 * /api/admin/listing/{listingId}/status:
 *   patch:
 *     summary: Update listing status
 *     tags: [Admin]
 */
AdminRouter.patch("/listing/:listingId/status", updateListingStatus);

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Admin]
 */
AdminRouter.get("/payments", getAllPayments);

/**
 * @swagger
 * /api/admin/applications:
 *   get:
 *     summary: Get all applications
 *     tags: [Admin]
 */
AdminRouter.get("/applications", getAllApplications);

export default AdminRouter;
