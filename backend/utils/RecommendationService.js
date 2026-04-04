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

  /**
   * Advanced Room Recommendation Algorithm
   * Combines multiple factors for personalized recommendations
   * @param {Array} rooms - Available rooms
   * @param {Object} userPreferences - User preferences
   * @returns {Array} - Ranked rooms with detailed scoring
   */
  static getAdvancedRecommendations(rooms, userPreferences, limit = 5) {
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return [];
    }

    const scoredRooms = rooms.map((room) => {
      let locationScore = 0;
      let priceScore = 0;
      let amenitiesScore = 0;

      // Location scoring (35% weight)
      if (userPreferences.preferredCity && room.location?.city) {
        const cityMatch = room.location.city.toLowerCase() === 
                         userPreferences.preferredCity.toLowerCase();
        locationScore = cityMatch ? 35 : 10;
      }

      // Price scoring (30% weight)
      if (userPreferences.minPrice && userPreferences.maxPrice) {
        if (room.price >= userPreferences.minPrice && 
            room.price <= userPreferences.maxPrice) {
          priceScore = 30;
        } else {
          // Partial score based on proximity to range
          const centerPrice = (userPreferences.minPrice + userPreferences.maxPrice) / 2;
          const priceGap = Math.abs(room.price - centerPrice);
          const priceRange = userPreferences.maxPrice - userPreferences.minPrice;
          priceScore = Math.max(0, 30 - (priceGap / priceRange) * 30);
        }
      }

      // Amenities scoring (25% weight)
      if (userPreferences.desiredAmenities && Array.isArray(userPreferences.desiredAmenities)) {
        const roomAmenities = (room.amenities || []).map((a) => 
          typeof a === 'string' ? a.toLowerCase() : a.name?.toLowerCase()
        );
        const desiredCount = userPreferences.desiredAmenities.length;
        const matchedCount = userPreferences.desiredAmenities.filter((desired) =>
          roomAmenities.some(room => room.includes(desired.toLowerCase()))
        ).length;

        amenitiesScore = desiredCount > 0 ? (matchedCount / desiredCount) * 25 : 0;
      }

      // Add rating bonus (10% weight)
      const ratingBonus = (room.rating || 0) * 2;

      const totalScore = Math.min(100, locationScore + priceScore + amenitiesScore + ratingBonus);

      return {
        ...room,
        recommendationScore: Math.round(totalScore),
        scoreBreakdown: {
          locationScore: Math.round(locationScore),
          priceScore: Math.round(priceScore),
          amenitiesScore: Math.round(amenitiesScore),
          ratingBonus: Math.round(ratingBonus),
        },
      };
    })
      .filter((room) => room.recommendationScore >= 40)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);

    return scoredRooms;
  }

  /**
   * Hybrid Recommendation - combines collaborative and content-based filtering
   * @param {Array} rooms - All available rooms
   * @param {Object} userPreferences - User preferences
   * @param {Array} similarUsers - Data from similar users (optional)
   * @param {number} limit - Number of recommendations
   * @returns {Array} - Hybrid recommended rooms
   */
  static getHybridRecommendations(rooms, userPreferences, similarUsers = [], limit = 5) {
    // Get content-based recommendations
    const contentBased = this.getAdvancedRecommendations(rooms, userPreferences, rooms.length);

    // If no similar users data, return content-based
    if (!Array.isArray(similarUsers) || similarUsers.length === 0) {
      return contentBased.slice(0, limit);
    }

    // Boost scores based on similar users' preferences
    const boostedRooms = contentBased.map((room) => {
      let similarUsersBoost = 0;

      // Count how many similar users have viewed/applied to this room
      const userInteractions = similarUsers.filter((user) =>
        (user.viewedRooms || []).some((r) => r._id?.toString() === room._id?.toString()) ||
        (user.appliedRooms || []).some((r) => r._id?.toString() === room._id?.toString())
      ).length;

      // Boost by 5 points per similar user interaction (max 20 points)
      similarUsersBoost = Math.min(20, userInteractions * 5);

      return {
        ...room,
        recommendationScore: Math.min(100, room.recommendationScore + similarUsersBoost),
      };
    });

    return boostedRooms.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, limit);
  }

  /**
   * Get contextual recommendations based on room characteristics
   * @param {Object} referenceRoom - Reference room to base recommendations on
   * @param {Array} allRooms - All available rooms
   * @param {number} limit - Number of recommendations
   * @returns {Array} - Contextually similar rooms
   */
  static getContextualRecommendations(referenceRoom, allRooms, limit = 5) {
    if (!referenceRoom || !Array.isArray(allRooms)) {
      return [];
    }

    const preferences = {
      preferredCity: referenceRoom.location?.city,
      minPrice: referenceRoom.price * 0.7,
      maxPrice: referenceRoom.price * 1.3,
      desiredAmenities: referenceRoom.amenities || [],
    };

    const otherRooms = allRooms.filter(
      (room) => room._id?.toString() !== referenceRoom._id?.toString()
    );

    return this.getAdvancedRecommendations(otherRooms, preferences, limit);
  }

  /**
   * Calculate diversity score to avoid recommending too similar rooms
   * @param {Array} recommendedRooms - Array of recommended rooms
   * @returns {Array} - Diverse recommendations
   */
  static diversifyRecommendations(recommendedRooms) {
    if (!Array.isArray(recommendedRooms) || recommendedRooms.length <= 1) {
      return recommendedRooms;
    }

    const diverse = [recommendedRooms[0]];
    const selected = new Set([recommendedRooms[0]._id?.toString()]);

    for (let i = 1; i < recommendedRooms.length; i++) {
      const room = recommendedRooms[i];
      const isDiverse = diverse.every((selected) => {
        // Consider rooms diverse if they are in different locations or price ranges
        const cityDifferent = room.location?.city !== selected.location?.city;
        const priceDifferent = Math.abs(room.price - selected.price) > 5000;

        return cityDifferent || priceDifferent;
      });

      if (isDiverse && diverse.length < recommendedRooms.length) {
        diverse.push(room);
        selected.add(room._id?.toString());
      }
    }

    return diverse;
  }
}

export default RecommendationService;
