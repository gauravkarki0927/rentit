/**
 * Recommendation Algorithm Service
 * Provides personalized recommendations based on user preferences and property features
 */

class RecommendationService {
  /**
   * Calculate similarity score between user preferences and room features
   * @param {Object} room - Room/Post object
   * @param {Object} userPreferences - User preferences
   * @returns {number} - Similarity score (0-100)
   */
  static calculateSimilarityScore(room, userPreferences) {
    let score = 0;
    let maxScore = 0;

    // 1. Location matching (Weight: 30%)
    maxScore += 30;
    if (userPreferences.preferredCity && room.location?.city) {
      if (
        room.location.city.toLowerCase() ===
        userPreferences.preferredCity.toLowerCase()
      ) {
        score += 30;
      } else {
        score += 10; // Partial credit for same region/state
      }
    }

    // 2. Price matching (Weight: 25%)
    maxScore += 25;
    if (userPreferences.minPrice && userPreferences.maxPrice) {
      if (
        room.price >= userPreferences.minPrice &&
        room.price <= userPreferences.maxPrice
      ) {
        score += 25;
      } else if (Math.abs(room.price - userPreferences.minPrice) < 2000) {
        score += 12; // Partial credit if close to range
      }
    }

    // 3. Amenities matching (Weight: 25%)
    maxScore += 25;
    if (
      userPreferences.desiredAmenities &&
      Array.isArray(userPreferences.desiredAmenities)
    ) {
      const roomAmenities = (room.amenities || []).map((a) => a.toLowerCase());
      const desiredAmenities = userPreferences.desiredAmenities.map((a) =>
        a.toLowerCase()
      );
      const matchedAmenities = desiredAmenities.filter((a) =>
        roomAmenities.includes(a)
      ).length;

      const amenitiesScore =
        (matchedAmenities / desiredAmenities.length) * 25;
      score += amenitiesScore;
    }

    // 4. Rating/Reviews (Weight: 20%)
    maxScore += 20;
    if (room.rating) {
      // Convert rating (1-5) to percentage
      const ratingPercentage = (room.rating / 5) * 20;
      score += ratingPercentage;
    }

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Get recommended rooms for a user based on their preferences
   * @param {Array} rooms - Array of available rooms
   * @param {Object} userPreferences - User preferences
   * @param {number} limit - Maximum number of recommendations (default: 5)
   * @returns {Array} - Recommended rooms sorted by score
   */
  static getRecommendations(rooms, userPreferences, limit = 5) {
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return [];
    }

    // Calculate scores for all rooms
    const scoredRooms = rooms
      .map((room) => ({
        ...room,
        recommendationScore: this.calculateSimilarityScore(
          room,
          userPreferences
        ),
      }))
      .filter((room) => room.recommendationScore >= 40) // Filter out low-scoring recommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);

    return scoredRooms;
  }

  /**
   * Get rooms similar to a given room
   * @param {Object} targetRoom - The room to find similar rooms for
   * @param {Array} allRooms - All available rooms
   * @param {number} limit - Maximum number of similar rooms (default: 5)
   * @returns {Array} - Similar rooms
   */
  static getSimilarRooms(targetRoom, allRooms, limit = 5) {
    if (!Array.isArray(allRooms) || allRooms.length === 0) {
      return [];
    }

    const preferences = {
      preferredCity: targetRoom.location?.city,
      minPrice: targetRoom.price * 0.8, // ±20% price range
      maxPrice: targetRoom.price * 1.2,
      desiredAmenities: targetRoom.amenities || [],
    };

    // Exclude the target room itself
    const otherRooms = allRooms.filter(
      (room) => room._id?.toString() !== targetRoom._id?.toString()
    );

    return this.getRecommendations(otherRooms, preferences, limit);
  }

  /**
   * Get trending rooms based on views, ratings, and applications
   * @param {Array} rooms - Array of rooms with metrics
   * @param {number} limit - Maximum number of trending rooms
   * @returns {Array} - Top trending rooms
   */
  static getTrendingRooms(rooms, limit = 5) {
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return [];
    }

    return rooms
      .map((room) => {
        let trendScore = 0;

        // Weight views (50%)
        trendScore += (room.views || 0) * 0.5;

        // Weight rating (30%)
        trendScore += (room.rating || 0) * 6; // max rating * weight = 5*6 = 30

        // Weight applications (20%)
        trendScore += (room.applicationCount || 0) * 4; // Assuming high app count ~5 = 20

        return {
          ...room,
          trendScore,
        };
      })
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, limit)
      .map(({ trendScore, ...room }) => room); // Remove score from response
  }

  /**
   * Personalized recommendation based on user's viewing and search history
   * @param {Array} userHistory - User's recent searches and views
   * @param {Array} allRooms - All available rooms
   * @param {number} limit - Maximum recommendations
   * @returns {Array} - Personalized recommendations
   */
  static getPersonalizedRecommendations(
    userHistory,
    allRooms,
    limit = 5
  ) {
    if (
      !Array.isArray(userHistory) ||
      userHistory.length === 0 ||
      !Array.isArray(allRooms)
    ) {
      return [];
    }

    // Extract common preferences from history
    const extractedPreferences = this._extractUserPreferences(userHistory);

    return this.getRecommendations(allRooms, extractedPreferences, limit);
  }

  /**
   * Extract preferences from user history
   * @private
   */
  static _extractUserPreferences(userHistory) {
    const preferences = {
      preferredCity: null,
      minPrice: null,
      maxPrice: null,
      desiredAmenities: [],
    };

    if (userHistory.length === 0) return preferences;

    // Find most common city
    const cities = userHistory
      .map((h) => h.city)
      .filter(Boolean);
    if (cities.length > 0) {
      preferences.preferredCity = cities.sort(
        (a, b) =>
          cities.filter((v) => v === a).length -
          cities.filter((v) => v === b).length
      )[0];
    }

    // Calculate average price from history
    const prices = userHistory
      .map((h) => h.price)
      .filter((p) => typeof p === "number");
    if (prices.length > 0) {
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      preferences.minPrice = Math.round(avgPrice * 0.8);
      preferences.maxPrice = Math.round(avgPrice * 1.2);
    }

    // Get most frequent amenities
    const allAmenities = [];
    userHistory.forEach((h) => {
      if (Array.isArray(h.amenities)) {
        allAmenities.push(...h.amenities);
      }
    });

    // Get top 3 most frequent amenities
    preferences.desiredAmenities = [
      ...new Set(
        allAmenities
          .sort(
            (a, b) =>
              allAmenities.filter((v) => v === b).length -
              allAmenities.filter((v) => v === a).length
          )
          .slice(0, 3)
      ),
    ];

    return preferences;
  }

  /**
   * Calculate content-based filtering score
   * @param {Object} room - Room object
   * @param {Object} userProfile - User profile with preferences
   * @param {number} threshold - Minimum similarity threshold (0-1)
   * @returns {number} - Similarity score
   */
  static calculateContentBasedScore(room, userProfile, threshold = 0.6) {
    let matches = 0;
    let totalFeatures = 0;

    // Features to compare
    const features = [
      { user: userProfile.minPrice, room: room.price, type: "range-min" },
      { user: userProfile.maxPrice, room: room.price, type: "range-max" },
      { user: userProfile.preferredCity, room: room.location?.city, type: "exact" },
      {
        user: userProfile.desiredType,
        room: room.category,
        type: "exact",
      },
    ];

    features.forEach((feature) => {
      if (feature.user === undefined || feature.user === null) return;

      totalFeatures++;

      if (feature.type === "exact") {
        if (
          feature.user?.toLowerCase() === feature.room?.toLowerCase()
        ) {
          matches++;
        }
      } else if (feature.type === "range-min") {
        if (feature.room >= feature.user) {
          matches++;
        }
      } else if (feature.type === "range-max") {
        if (feature.room <= feature.user) {
          matches++;
        }
      }
    });

    return totalFeatures > 0 ? matches / totalFeatures : 0;
  }
}

export default RecommendationService;
