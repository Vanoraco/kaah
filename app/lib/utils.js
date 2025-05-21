/**
 * Utility functions for the application
 */

/**
 * Format a price with the appropriate currency symbol
 * @param {string|number} amount - The price amount
 * @param {string} [currencyCode='ZAR'] - The currency code
 * @returns {string} Formatted price
 */
export function formatPrice(amount, currencyCode = 'ZAR') {
  if (!amount) return '';
  
  // Convert to number if it's a string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format based on currency code
  switch (currencyCode) {
    case 'ZAR':
      return `R ${numericAmount.toFixed(2)}`;
    case 'USD':
      return `$${numericAmount.toFixed(2)}`;
    case 'EUR':
      return `€${numericAmount.toFixed(2)}`;
    case 'GBP':
      return `£${numericAmount.toFixed(2)}`;
    default:
      return `${numericAmount.toFixed(2)} ${currencyCode}`;
  }
}

/**
 * Generate a random ID
 * @param {number} [length=8] - Length of the ID
 * @returns {string} Random ID
 */
export function generateRandomId(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Truncate text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} [maxLength=50] - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

/**
 * Check if a date is in the future
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} Whether the date is in the future
 */
export function isDateInFuture(dateString) {
  if (!dateString) return false;
  
  const inputDate = new Date(dateString);
  const today = new Date();
  
  // Reset time part for accurate date comparison
  today.setHours(0, 0, 0, 0);
  
  return inputDate > today;
}

/**
 * Format a date string
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {string} [format='long'] - Format type: 'long', 'short', or 'relative'
 * @returns {string} Formatted date
 */
export function formatDate(dateString, format = 'long') {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  switch (format) {
    case 'long':
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'short':
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    case 'relative':
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return date > now ? 'Tomorrow' : 'Yesterday';
      if (diffDays < 7) return date > now ? `In ${diffDays} days` : `${diffDays} days ago`;
      
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    default:
      return dateString;
  }
}
