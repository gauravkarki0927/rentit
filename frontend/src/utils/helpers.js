/**
 * Utility functions for RentIt application
 * Includes validation, formatting, and common utilities
 */

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requires minimum 8 characters with at least one uppercase, lowercase, and number
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validates phone number (basic international format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone number
 */
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s]?[0-9]{3}[-\s]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validates a complete form object
 * @param {object} formData - Form data to validate
 * @param {object} rules - Validation rules { fieldName: { required, minLength, pattern } }
 * @returns {object} - { isValid: boolean, errors: { fieldName: errorMessage } }
 */
export const validateForm = (formData, rules) => {
  const errors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];

    // Check required fields
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      continue;
    }

    // Check minimum length
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
    }

    // Check pattern (regex)
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.patternMessage || `${field} format is invalid`;
    }

    // Check minimum value (for numbers)
    if (rule.min !== undefined && value && Number(value) < rule.min) {
      errors[field] = `${field} must be at least ${rule.min}`;
    }

    // Check maximum value (for numbers)
    if (rule.max !== undefined && value && Number(value) > rule.max) {
      errors[field] = `${field} must be no more than ${rule.max}`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================
// FORMATTING FUNCTIONS
// ============================================

/**
 * Formats currency values
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} - Formatted date string (e.g., "Dec 16, 2025")
 */
export const formatDate = (date, locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Formats date with time
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date, locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Truncates text to specified length and adds ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text with ellipsis
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Capitalizes first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Converts string to title case
 * @param {string} str - String to convert
 * @returns {string} - Title cased string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Formats a slug to readable text
 * @param {string} slug - Slug to format (e.g., "electronics-devices")
 * @returns {string} - Readable text (e.g., "Electronics Devices")
 */
export const slugToText = (slug) => {
  if (!slug) return '';
  return toTitleCase(slug.replace(/-/g, ' '));
};

// ============================================
// PERFORMANCE FUNCTIONS
// ============================================

/**
 * Debounce function - delays execution until after delay milliseconds have elapsed
 * @param {function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {function} - Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function - limits execution to once per delay milliseconds
 * @param {function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {function} - Throttled function
 */
export const throttle = (func, delay = 300) => {
  let isThrottled = false;
  return (...args) => {
    if (isThrottled) return;
    func(...args);
    isThrottled = true;
    setTimeout(() => (isThrottled = false), delay);
  };
};

// ============================================
// ERROR HANDLING FUNCTIONS
// ============================================

/**
 * Handles API errors and returns formatted error message
 * @param {Error|AxiosError} error - Error object
 * @returns {string} - Formatted error message
 */
export const handleApiError = (error) => {
  if (!error) return 'An unknown error occurred';

  // Axios error
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data?.message || 'Invalid request';
      case 401:
        return 'Unauthorized - please log in again';
      case 403:
        return 'Forbidden - you do not have access';
      case 404:
        return 'Resource not found';
      case 409:
        return data?.message || 'Conflict - resource already exists';
      case 500:
        return 'Server error - please try again later';
      default:
        return data?.message || `Error: ${status}`;
    }
  }

  // Network error
  if (error.message === 'Network Error') {
    return 'Network error - please check your connection';
  }

  // Generic error
  return error.message || 'An unexpected error occurred';
};

// ============================================
// OBJECT/ARRAY FUNCTIONS
// ============================================

/**
 * Deep clones an object or array
 * @param {object|array} obj - Object or array to clone
 * @returns {object|array} - Cloned object or array
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
};

/**
 * Merges multiple objects
 * @param {...object} objects - Objects to merge
 * @returns {object} - Merged object
 */
export const mergeObjects = (...objects) => {
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
};

/**
 * Filters out falsy values from an object
 * @param {object} obj - Object to filter
 * @returns {object} - Filtered object
 */
export const filterFalsy = (obj) => {
  return Object.entries(obj)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

// ============================================
// STRING FUNCTIONS
// ============================================

/**
 * Generates a random string of specified length
 * @param {number} length - Length of random string (default: 10)
 * @returns {string} - Random string
 */
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Converts string to slug format
 * @param {string} str - String to convert
 * @returns {string} - Slug format
 */
export const textToSlug = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================

/**
 * Gets item from localStorage, returns default if not found
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} - Stored value or default
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
};

/**
 * Sets item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
};

/**
 * Removes item from localStorage
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Waits for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after delay
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Checks if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} - True if object is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Gets query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} - Parameter value or null
 */
export const getQueryParam = (param) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
};

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - True if successful
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export default {
  // Validation
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateForm,
  
  // Formatting
  formatCurrency,
  formatDate,
  formatDateTime,
  truncateText,
  capitalize,
  toTitleCase,
  slugToText,
  
  // Performance
  debounce,
  throttle,
  
  // Error Handling
  handleApiError,
  
  // Object/Array
  deepClone,
  mergeObjects,
  filterFalsy,
  
  // String
  generateRandomString,
  textToSlug,
  
  // Storage
  getFromStorage,
  setToStorage,
  removeFromStorage,
  
  // Utility
  sleep,
  isEmpty,
  getQueryParam,
  copyToClipboard,
};
