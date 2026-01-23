/**
 * Formatter Utilities
 * Helper functions for formatting data
 */

class FormatterHelper {
  /**
   * Format currency (Nepali Rupees)
   */
  static formatCurrency(amount, currency = "NPR") {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    });
    return formatter.format(amount);
  }

  /**
   * Format date to readable format
   */
  static formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Format date and time
   */
  static formatDateTime(date) {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  static formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return this.formatDate(date);
  }

  /**
   * Format phone number
   */
  static formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `+977 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  }

  /**
   * Truncate string with ellipsis
   */
  static truncateString(str, length = 100) {
    if (!str) return "";
    return str.length > length ? str.substring(0, length) + "..." : str;
  }

  /**
   * Format file size (bytes to readable format)
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }

  /**
   * Format street address
   */
  static formatAddress(location) {
    if (!location) return "N/A";

    const parts = [
      location.street,
      location.city,
      location.state,
      location.country,
    ].filter(Boolean);

    return parts.join(", ");
  }

  /**
   * Format rating with stars
   */
  static formatRating(rating) {
    const stars = Math.round(rating);
    return "⭐".repeat(stars) + (rating % 1 !== 0 ? " ½" : "");
  }

  /**
   * Format user name (Title Case)
   */
  static formatName(name) {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  /**
   * Format query parameter to readable string
   */
  static formatQuery(query) {
    return query
      ?.split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Convert object to URL query string
   */
  static toQueryString(obj) {
    return Object.entries(obj)
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
  }

  /**
   * Parse query string to object
   */
  static parseQueryString(queryString) {
    const params = new URLSearchParams(queryString);
    const obj = {};
    params.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  /**
   * Format distance in km/meters
   */
  static formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  /**
   * Format duration (hours/days)
   */
  static formatDuration(durationString) {
    // Example: "6 months", "1 year"
    return durationString;
  }

  /**
   * Format price range
   */
  static formatPriceRange(minPrice, maxPrice) {
    return `Rs. ${this.formatCurrency(minPrice).replace("Rs.", "").trim()} - ${this.formatCurrency(maxPrice).replace("Rs.", "").trim()}`;
  }
}

export default FormatterHelper;
