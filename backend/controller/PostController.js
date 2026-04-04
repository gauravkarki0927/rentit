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

// Trie-based prefix search for locations and room names
export const searchByPrefix = async (req, res) => {
  try {
    const { q } = req.query; // q = query

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Query must be at least 2 characters",
      });
    }

    // Get all active posts
    const posts = await Post.find({ status: "available" })
      .populate("userId", "name email")
      .limit(50)
      .lean();

    // Build Trie from current posts
    const { RoomListingSearcher } = await import("../utils/TrieSearch.js");
    const searcher = new RoomListingSearcher();
    searcher.indexRooms(posts);

    // Search using Trie
    const results = searcher.search(q);
    const suggestions = searcher.getAutocompleteSuggestions(q, 10);

    res.status(200).json({
      success: true,
      query: q,
      suggestions,
      results: results.slice(0, 20),
      totalResults: results.length,
    });
  } catch (err) {
    console.error("Prefix Search Error:", err);
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: err.message,
    });
  }
};

// Geo-search: Find rooms within user's radius
export const searchByNearby = async (req, res) => {
  try {
    const { lat, lon, radius = 5 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const userLocation = {
      coordinates: [parseFloat(lon), parseFloat(lat)],
    };

    const maxDistance = parseFloat(radius);

    // Get all active posts with location data - use lean() to get plain objects
    const posts = await Post.find({ 
      status: "available",
      "location.coordinates": { $exists: true }
    })
      .populate("userId", "name email")
      .select("-description")
      .lean(); // Convert to plain JavaScript objects

    // Use GeoSearch
    const GeoSearch = (await import("../utils/geosearch.js")).default;
    const nearbyRooms = GeoSearch.getNearbyRoomsWithLimit(
      userLocation,
      posts,
      maxDistance,
      50
    );

    const stats = GeoSearch.getNearbyRoomsStats(
      userLocation,
      posts,
      maxDistance
    );

    res.status(200).json({
      success: true,
      userLocation: { lat, lon },
      radiusKm: maxDistance,
      stats,
      rooms: nearbyRooms,
      totalFound: nearbyRooms.length,
    });
  } catch (err) {
    console.error("Nearby Search Error:", err);
    res.status(500).json({
      success: false,
      message: "Geosearch failed",
      error: err.message,
    });
  }
};

// Get personalized recommendations for the user
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { limit = 5 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get user preferences if they exist
    const user = await User.findById(userId);
    
    const userPreferences = {
      preferredCity: user?.preferredCity || "Kathmandu",
      minPrice: user?.minPrice || 5000,
      maxPrice: user?.maxPrice || 50000,
      desiredAmenities: user?.desiredAmenities || [],
    };

    // Get all available posts
    const allPosts = await Post.find({ status: "available" })
      .populate("userId", "name email rating")
      .sort({ createdAt: -1 })
      .lean();

    // Get recommendations using advanced algorithm
    const RecommendationService = (await import("../utils/RecommendationService.js")).default;
    const recommendations = RecommendationService.getAdvancedRecommendations(
      allPosts,
      userPreferences,
      parseInt(limit)
    );

    // Optionally diversify recommendations
    const diversified = RecommendationService.diversifyRecommendations(recommendations);

    res.status(200).json({
      success: true,
      recommendations: diversified,
      count: diversified.length,
    });
  } catch (err) {
    console.error("Recommendations Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
      error: err.message,
    });
  }
};

// Get recommendations similar to a specific room
export const getSimilarRooms = async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 5 } = req.query;

    const targetRoom = await Post.findById(postId);

    if (!targetRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Get all other available rooms
    const allRooms = await Post.find({
      status: "available",
      _id: { $ne: postId },
    })
      .populate("userId", "name email rating")
      .limit(200)
      .lean();

    // Get similar rooms
    const RecommendationService = (await import("../utils/RecommendationService.js")).default;
    const similarRooms = RecommendationService.getContextualRecommendations(
      targetRoom,
      allRooms,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      originalRoom: targetRoom.name,
      similarRooms,
      count: similarRooms.length,
    });
  } catch (err) {
    console.error("Similar Rooms Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch similar rooms",
      error: err.message,
    });
  }
};

// Get trending rooms
export const getTrendingRooms = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // Get all available rooms
    const rooms = await Post.find({ status: "available" })
      .populate("userId", "name email rating")
      .select("+views +applicationCount") // Include fields if they're selected in schema
      .sort({ views: -1, rating: -1 })
      .limit(parseInt(limit) * 2) // Get more to score
      .lean();

    // Use trending algorithm
    const RecommendationService = (await import("../utils/RecommendationService.js")).default;
    const trending = RecommendationService.getTrendingRooms(
      rooms,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      trending,
      count: trending.length,
    });
  } catch (err) {
    console.error("Trending Rooms Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trending rooms",
      error: err.message,
    });
  }
};
