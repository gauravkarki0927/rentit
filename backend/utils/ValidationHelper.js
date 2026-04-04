/**
 * Validation Utilities
 * Helper functions for data validation
 */

class ValidationHelper {
  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Nepal format)
   */
  static isValidPhoneNumber(phone) {
    // Nepal phone: +977 followed by 10 digits
    const phoneRegex = /^(\+977)?[-.\s]?9[814]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password) {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validate password (basic)
   */
  static isValidPassword(password) {
    return password && password.length >= 6;
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate string length
   */
  static validateLength(str, min, max) {
    if (typeof str !== "string") return false;
    const length = str.trim().length;
    return length >= min && length <= max;
  }

  /**
   * Validate price format
   */
  static isValidPrice(price) {
    const num = parseFloat(price);
    return !isNaN(num) && num >= 0;
  }

  /**
   * Validate coordinates (latitude, longitude)
   */
  static isValidCoordinates(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * Validate MongoDB ObjectId
   */
  static isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Sanitize input string (prevent XSS)
   */
  static sanitizeInput(input) {
    if (typeof input !== "string") return input;
    return input
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .trim();
  }

  /**
   * Validate category
   */
  static isValidCategory(category) {
    const validCategories = [
      "Room",
      "Flat",
      "Apartment",
      "Attached Kitchen",
      "Attached Bathroom",
    ];
    return validCategories.includes(category);
  }

  /**
   * Validate user type
   */
  static isValidUserType(userType) {
    const validTypes = ["owner", "renter", "both"];
    return validTypes.includes(userType);
  }

  /**
   * Validate payment status
   */
  static isValidPaymentStatus(status) {
    const validStatuses = ["pending", "completed", "failed", "refunded"];
    return validStatuses.includes(status);
  }

  /**
   * Validate application status
   */
  static isValidApplicationStatus(status) {
    const validStatuses = ["pending", "accepted", "rejected", "withdrawn"];
    return validStatuses.includes(status);
  }

  /**
   * Validate rating
   */
  static isValidRating(rating) {
    const num = parseFloat(rating);
    return !isNaN(num) && num >= 1 && num <= 5;
  }

  /**
   * Validate required fields
   */
  static validateRequiredFields(data, requiredFields) {
    const missing = [];
    requiredFields.forEach((field) => {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        missing.push(field);
      }
    });
    return missing;
  }

  /**
   * Validate image file
   */
  static isValidImageFile(file) {
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file) return false;
    if (!validMimes.includes(file.mimetype)) return false;
    if (file.size > maxSize) return false;

    return true;
  }

  /**
   * Validate array of strings
   */
  static isValidStringArray(arr) {
    if (!Array.isArray(arr)) return false;
    return arr.every((item) => typeof item === "string" && item.trim().length > 0);
  }
}

export default ValidationHelper;
