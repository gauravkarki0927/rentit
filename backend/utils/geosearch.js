/**
 * Geo-Search Algorithm
 * Identifies rental rooms within a specific radius from the user's location
 * using geographic coordinates (Haversine formula)
 */

class GeoSearch {
  /**
   * Calculate distance between two geographic coordinates using Haversine formula
   * @param {number} lat1 - Latitude of first location
   * @param {number} lon1 - Longitude of first location
   * @param {number} lat2 - Latitude of second location
   * @param {number} lon2 - Longitude of second location
   * @returns {number} - Distance in kilometers
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this._toRad(lat2 - lat1);
    const dLon = this._toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._toRad(lat1)) *
        Math.cos(this._toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  /**
   * Convert degrees to radians
   * @private
   * @param {number} deg - Degrees
   * @returns {number} - Radians
   */
  static _toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  /**
   * Find all rooms within a specified radius from user's location
   * @param {Object} userLocation - User's location with lat and lon
   * @param {Array} rooms - Array of room objects with location data
   * @param {number} maxDistance - Maximum distance in kilometers
   * @returns {Array} - Array of nearby rooms sorted by distance
   */
  static findNearbyRooms(userLocation, rooms, maxDistance = 5) {
    if (
      !userLocation ||
      !userLocation.coordinates ||
      userLocation.coordinates.length < 2
    ) {
      return [];
    }

    if (!Array.isArray(rooms) || rooms.length === 0) {
      return [];
    }

    const [userLon, userLat] = userLocation.coordinates;
    const nearbyRooms = [];

    for (const room of rooms) {
      // Check if room has valid location data
      if (
        !room.location ||
        !room.location.coordinates ||
        room.location.coordinates.length < 2
      ) {
        continue;
      }

      const [roomLon, roomLat] = room.location.coordinates;
      const distance = this.calculateDistance(
        userLat,
        userLon,
        roomLat,
        roomLon,
      );

      // Only include rooms within maximum distance
      if (distance <= maxDistance) {
        nearbyRooms.push({
          ...room,
          distanceFromUser: Math.round(distance * 100) / 100, // Round to 2 decimal places
        });
      }
    }

    // Sort by distance (closest first)
    nearbyRooms.sort((a, b) => a.distanceFromUser - b.distanceFromUser);

    return nearbyRooms;
  }

  /**
   * Get nearby rooms with limit
   * @param {Object} userLocation - User's location
   * @param {Array} rooms - Array of room objects
   * @param {number} maxDistance - Maximum distance in km
   * @param {number} limit - Maximum number of results (default: 10)
   * @returns {Array} - Limited array of nearby rooms
   */
  static getNearbyRoomsWithLimit(
    userLocation,
    rooms,
    maxDistance = 5,
    limit = 10,
  ) {
    const nearbyRooms = this.findNearbyRooms(userLocation, rooms, maxDistance);
    return nearbyRooms.slice(0, limit);
  }

  /**
   * Get statistics about nearby rooms
   * @param {Object} userLocation - User's location
   * @param {Array} rooms - Array of room objects
   * @param {number} maxDistance - Maximum distance in km
   * @returns {Object} - Statistics object with count, avgDistance, minPrice, maxPrice
   */
  static getNearbyRoomsStats(userLocation, rooms, maxDistance = 5) {
    const nearbyRooms = this.findNearbyRooms(userLocation, rooms, maxDistance);

    if (nearbyRooms.length === 0) {
      return {
        count: 0,
        averageDistance: 0,
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
      };
    }

    const totalDistance = nearbyRooms.reduce(
      (sum, room) => sum + room.distanceFromUser,
      0,
    );
    const prices = nearbyRooms.map((room) => room.price).filter((p) => p);
    const totalPrice = prices.reduce((sum, price) => sum + price, 0);

    return {
      count: nearbyRooms.length,
      averageDistance: Math.round((totalDistance / nearbyRooms.length) * 100) / 100,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      avgPrice: prices.length > 0 ? Math.round(totalPrice / prices.length) : 0,
    };
  }

  /**
   * Filter rooms by distance and price range
   * @param {Object} userLocation - User's location
   * @param {Array} rooms - Array of room objects
   * @param {number} maxDistance - Maximum distance in km
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @returns {Array} - Filtered rooms
   */
  static filterRoomsByDistanceAndPrice(
    userLocation,
    rooms,
    maxDistance = 5,
    minPrice = 0,
    maxPrice = 999999,
  ) {
    const nearbyRooms = this.findNearbyRooms(userLocation, rooms, maxDistance);
    return nearbyRooms.filter(
      (room) => room.price >= minPrice && room.price <= maxPrice,
    );
  }
}

export default GeoSearch;
