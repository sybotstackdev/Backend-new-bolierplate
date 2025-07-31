/**
 * Utility helper functions for the application
 */

/**
 * Formats a date to a readable string
 * @param {Date} date - The date to format
 * @param {string} format - The format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return null;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Generates a random string of specified length
 * @param {number} length - Length of the string to generate
 * @param {string} charset - Characters to use (default: alphanumeric)
 * @returns {string} Random string
 */
function generateRandomString(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Capitalizes the first letter of each word in a string
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Removes duplicate items from an array
 * @param {Array} array - The array to deduplicate
 * @returns {Array} Array with duplicates removed
 */
function removeDuplicates(array) {
  if (!Array.isArray(array)) return [];
  return [...new Set(array)];
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - The value to check
 * @returns {boolean} True if empty, false otherwise
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Safely parses JSON string
 * @param {string} jsonString - The JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed JSON or default value
 */
function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Converts bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Human readable size
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Debounces a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validates an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email format, false otherwise
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncates a string to specified length and adds ellipsis
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length
 * @param {string} ending - String to append if truncated
 * @returns {string} Truncated string
 */
function truncateString(str, length = 50, ending = '...') {
  if (!str || str.length <= length) return str;
  return str.substring(0, length - ending.length) + ending;
}

/**
 * Generates a URL-friendly slug from a string
 * @param {string} str - The string to convert to slug
 * @param {string} separator - Character to use as separator (default: '-')
 * @returns {string} URL-friendly slug
 */
function generateSlug(str, separator = '-') {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, separator) // Replace spaces and underscores with separator
    .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), ''); // Remove leading/trailing separators
}

/**
 * Generates a UUID v4 string
 * @returns {string} UUID v4 string
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Deep clones an object or array
 * @param {*} obj - The object to clone
 * @returns {*} Deep cloned object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * Throttles a function call
 * @param {Function} func - The function to throttle
 * @param {number} limit - The number of milliseconds to throttle
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Formats a number with commas as thousands separators
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
function formatNumber(num, decimals = 0) {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Calculates the difference between two dates in various units
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @param {string} unit - Unit of measurement ('days', 'hours', 'minutes', 'seconds')
 * @returns {number} Difference in specified unit
 */
function dateDifference(date1, date2, unit = 'days') {
  const diff = Math.abs(new Date(date1) - new Date(date2));
  const units = {
    days: 1000 * 60 * 60 * 24,
    hours: 1000 * 60 * 60,
    minutes: 1000 * 60,
    seconds: 1000
  };
  return Math.floor(diff / units[unit]);
}

/**
 * Validates a phone number format
 * @param {string} phone - The phone number to validate
 * @param {string} country - Country code (default: 'US')
 * @returns {boolean} True if valid phone format, false otherwise
 */
function isValidPhone(phone, country = 'US') {
  if (!phone || typeof phone !== 'string') return false;
  
  const phoneRegex = {
    US: /^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
    IN: /^\+?91?\s*([0-9]{5})[-.\s]?([0-9]{5})$/,
    UK: /^\+?44?\s*([0-9]{4})[-.\s]?([0-9]{3})[-.\s]?([0-9]{3})$/
  };
  
  const regex = phoneRegex[country] || phoneRegex.US;
  return regex.test(phone.replace(/\s+/g, ''));
}

/**
 * Generates a hash from a string using simple algorithm
 * @param {string} str - The string to hash
 * @returns {string} Hash string
 */
function simpleHash(str) {
  if (!str || typeof str !== 'string') return '';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Checks if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid URL, false otherwise
 */
function isValidURL(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Converts a string to title case
 * @param {string} str - The string to convert
 * @returns {string} Title case string
 */
function toTitleCase(str) {
  if (!str || typeof str !== 'string') return '';
  
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

module.exports = {
  formatDate,
  generateRandomString,
  capitalizeWords,
  removeDuplicates,
  isEmpty,
  safeJsonParse,
  formatBytes,
  debounce,
  isValidEmail,
  truncateString,
  generateSlug,
  generateUUID,
  deepClone,
  throttle,
  formatNumber,
  dateDifference,
  isValidPhone,
  simpleHash,
  isValidURL,
  toTitleCase
}; 