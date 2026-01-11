import Review from "../model/ReviewModel.js";
import Post from "../model/PostModel.js";
import User from "../model/UserModel.js";

export const createReview = async (req, res) => {
  try {
    const { targetId, targetModel, rating, comment } = req.body;
    const reviewerId = req.user._id;

    // Simple check to prevent multiple reviews from same user on same target (optional)
    const existingReview = await Review.findOne({ reviewerId, targetId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this.",
      });
    }

    const review = await Review.create({
      reviewerId,
      targetId,
      targetModel, // 'User' or 'Post'
      rating,
      comment,
    });

    // Update average rating for Post or User
    if (targetModel === "Post") {
        const stats = await Review.aggregate([
            { $match: { targetId: review.targetId } },
            { $group: { _id: "$targetId", avgRating: { $avg: "$rating" } } }
        ]);
        await Post.findByIdAndUpdate(targetId, { rating: stats[0].avgRating });
    } else if (targetModel === "User") {
        // Assuming User model has ratings field with average and count
         const stats = await Review.aggregate([
            { $match: { targetId: review.targetId } },
            { $group: { _id: "$targetId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);
        await User.findByIdAndUpdate(targetId, { 
            "ratings.average": stats[0].avgRating,
            "ratings.count": stats[0].count
        });
    }

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Create Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting review",
      error: error.message,
    });
  }
};

export const getReviews = async (req, res) => {
    try {
        const { targetId } = req.params;
        const reviews = await Review.find({ targetId })
            .populate("reviewerId", "name profileImage")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
         console.error("Get Reviews Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching reviews",
            error: error.message,
        });
    }
}
