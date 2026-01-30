import Post from "../model/PostModel.js";
import Report from "../model/ReportModel.js";
import User from "../model/UserModel.js";
import { geocodeAddress } from "../utils/geolocation.js";
import TrieSearch from "../utils/TrieSearch.js";
import RoomPaymentModel from "../model/RoomPaymentModel.js";

// Initialize Trie for location search
const locationTrie = new TrieSearch();

const createPost = async (req, res) => {
  try {
    const { name, price, description, category, location } = req.body;

    // Get userId from authenticated user
    const userId = req.user?._id;

    // Validation
    if (!name || !price || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, price, description, category",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Handle image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Store relative path for local storage
        // file.path will be something like 'uploads\listings\filename.jpg'
        // We want to store '/uploads/listings/filename.jpg'
        const relativePath = file.path.replace(/\\/g, "/");
        // Ensure it starts with / for URL construction later, but check if it's already there
        const dbPath = relativePath.startsWith("uploads")
          ? "/" + relativePath
          : relativePath;
        images.push(dbPath);
      });
    }

    // Geocode the address if location is provided
    let locationData = { ...location };
    if (location && location.street && location.city && location.state) {
      const geoResult = await geocodeAddress(
        location.street,
        location.city,
        location.state,
        location.country || "India",
      );

      if (geoResult) {
        locationData.coordinates = {
          type: "Point",
          coordinates: geoResult.coordinates,
        };
      }
    }

    const newPost = new Post({
      name,
      price: parseFloat(price),
      description,
      category,
      images: images || [],
      location: locationData || {},
      userId,
      createdAt: new Date(),
    });

    await newPost.save();

    // Populate user info before sending response
    await newPost.populate("userId", "name email");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getPost = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    let filter = { status: "available" };

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // 1️⃣ Get posts
    let allPosts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email profileImage");

    if (allPosts.length === 0) {
      return res.json({
        success: true,
        posts: [],
        totalCount: 0,
        totalPages: 0,
      });
    }

    // 2️⃣ Get paid post IDs
    const postIds = allPosts.map((p) => p._id);

    const paidPostIds = await RoomPaymentModel.find({
      postId: { $in: postIds },
      status: "success",
    }).distinct("postId");

    const paidPostIdStrings = paidPostIds.map((id) => id.toString());

    // 3️⃣ Filter
    allPosts = allPosts.filter((post) =>
      paidPostIdStrings.includes(post._id.toString()),
    );

    const totalCount = allPosts.length;

    const paginatedPosts = allPosts.slice(skip, skip + Number(limit));

    res.json({
      success: true,
      posts: paginatedPosts,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.error("Get Posts Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate(
      "userId",
      "name email profileImage",
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      post: post,
    });
  } catch (err) {
    console.error("Get Post By ID Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, images, location } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        name,
        price,
        description,
        category,
        images,
        location,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found, cannot delete",
      });
    }
    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      post: deletedPost,
    });
  } catch (err) {
    console.error("Delete Post Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const getUserListings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    let userListings = await Post.find({ userId, status: "available" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("userId", "name email profileImage");

    const userPostIds = userListings.map((p) => p._id);

    const paidPostIds = await RoomPaymentModel.find({
      postId: { $in: userPostIds },
      status: "success",
    }).distinct("postId");

    const paidPostIdStrings = paidPostIds.map((id) => id.toString());

    userListings = userListings.filter((post) =>
      paidPostIdStrings.includes(post._id.toString()),
    );

    const totalCount = userListings.length;
    const paginatedPosts = userListings.slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      count: userListings.length,
      totalCount: totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      posts: paginatedPosts,
    });
  } catch (err) {
    console.error("Get User Listings Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Geosearch - Find listings near user's location
const searchNearby = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Try to find listings with proper geolocation data first
    let listings = [];
    try {
      listings = await Post.find({
        "location.coordinates.coordinates": {
          $exists: true,
          $ne: null,
        },
        "location.coordinates": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseInt(maxDistance),
          },
        },
      })
        .populate("userId", "name email profileImage")
        .limit(20);
    } catch (geoErr) {
      console.warn(
        "Geospatial query failed, returning all listings:",
        geoErr.message,
      );
      // If geospatial query fails, return all available listings as fallback
      listings = await Post.find({})
        .populate("userId", "name email profileImage")
        .limit(20)
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: listings.length,
      listings: listings || [],
    });
  } catch (err) {
    console.error("Search Nearby Error:", err);
    // Don't return 500 for geolocation issues - return 200 with empty results as fallback
    res.status(200).json({
      success: true,
      count: 0,
      listings: [],
      message:
        "Unable to fetch nearby listings, showing all available listings instead",
    });
  }
};

// Get recommended listings based on user's location and search history
const getRecommendations = async (req, res) => {
  try {
    const { latitude, longitude, category, limit = 10 } = req.query;
    const userId = req.user?._id;

    let query = { status: "available" };
    let recommendations = [];

    // If coordinates are provided, prioritize listings near user
    if (latitude && longitude) {
      try {
        // Find nearby listings using geospatial query
        const nearbyListings = await Post.find({
          "location.coordinates": {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
              },
              $maxDistance: 50000, // 50km radius
            },
          },
          status: "available",
        })
          .populate("userId", "name email profileImage")
          .limit(Math.floor(limit / 2));

        recommendations.push(...nearbyListings);
      } catch (geoError) {
        console.warn(
          "Geospatial query failed, falling back to category search",
        );
      }
    }

    // Add category preferences if available
    let categoryListings = [];
    if (category) {
      query.category = category;
      categoryListings = await Post.find(query)
        .populate("userId", "name email profileImage")
        .limit(Math.floor(limit / 2));
    } else {
      // Get random recommendations if no category specified
      categoryListings = await Post.find(query)
        .populate("userId", "name email profileImage")
        .limit(Math.floor(limit / 2));
    }

    recommendations.push(...categoryListings);

    // Remove duplicates
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map((item) => [item._id, item])).values(),
    );

    res.status(200).json({
      success: true,
      count: uniqueRecommendations.slice(0, limit).length,
      recommendations: uniqueRecommendations.slice(0, limit),
    });
  } catch (err) {
    console.error("Get Recommendations Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Prefix search for locations using Trie algorithm
const searchPrefix = async (req, res) => {
  try {
    const { query, type = "location", limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Query must be at least 2 characters long",
      });
    }

    // Populate Trie if empty
    if (locationTrie.getAllWords().length === 0) {
      await populateTrieIndex();
    }

    let results = [];

    if (type === "location") {
      // Search by location city
      results = locationTrie.getSuggestions(query, parseInt(limit));

      if (results.length === 0) {
        // Fallback to database search
        const locationResults = await Post.find({
          "location.city": { $regex: query, $options: "i" },
        })
          .select("location.city")
          .distinct("location.city")
          .limit(parseInt(limit));
        results = locationResults;
      }
    } else if (type === "keyword") {
      // Search by property name/description
      const keywordResults = await Post.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
        ],
      })
        .select("name category")
        .limit(parseInt(limit));

      results = keywordResults.map((post) => ({
        name: post.name,
        category: post.category,
        type: "property",
      }));
    }

    res.status(200).json({
      success: true,
      count: results.length,
      results: results,
      query: query,
      type: type,
    });
  } catch (error) {
    console.error("Search Prefix Error:", error);
    res.status(500).json({
      success: false,
      message: "Error during search",
      error: error.message,
    });
  }
};

// Populate Trie with all unique cities from database
const populateTrieIndex = async () => {
  try {
    const uniqueCities = await Post.find({})
      .select("location.city")
      .distinct("location.city");

    uniqueCities.forEach((city) => {
      if (city) {
        locationTrie.insert(city);
      }
    });

    console.log(`✓ Trie index populated with ${uniqueCities.length} cities`);
  } catch (error) {
    console.error("Error populating Trie index:", error);
  }
};

export {
  createPost,
  getPost,
  getPostById,
  updatePost,
  deletePost,
  getUserListings,
  searchNearby,
  getRecommendations,
  searchPrefix,
  populateTrieIndex,
};
// Report a post
export const reportPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason, description } = req.body;

    const report = await Report.create({
      reporterId: req.user._id,
      postId,
      reason,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Listing reported successfully. Admin will review it.",
      report,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
