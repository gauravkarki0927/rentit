import express from "express";
import {
  createPost,
  getPost,
  getPostById,
  updatePost,
  deletePost,
  getUserListings,
  reportPost,
  searchByPrefix,
  searchByNearby,
  getRecommendations,
  getSimilarRooms,
  getTrendingRooms,
} from "../controller/PostController.js";
import { protect } from "../middleware/auth.js";
import { uploadListing } from "../config/multer.js";
const PostRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API endpoints for managing rental posts
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with filters
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully fetched all posts
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - userId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               userId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: object
 *     responses:
 *       201:
 *         description: Post created successfully
 */

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched the post
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               images:
 *                 type: array
 *               location:
 *                 type: object
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 */

PostRouter.post("/", protect, uploadListing.array("images", 10), createPost);
PostRouter.get("/my-listings", protect, getUserListings);
PostRouter.get("/search/prefix", searchByPrefix);
PostRouter.get("/search/nearby", searchByNearby);
PostRouter.get("/recommendations", protect, getRecommendations);
PostRouter.get("/trending", getTrendingRooms);
PostRouter.get("/similar/:postId", getSimilarRooms);
PostRouter.get("/", getPost);
PostRouter.get("/:id", getPostById);
PostRouter.put("/:id", protect, uploadListing.array("images", 10), updatePost);
PostRouter.delete("/:id", protect, deletePost);
PostRouter.post("/:postId/report", protect, reportPost);

export default PostRouter;
