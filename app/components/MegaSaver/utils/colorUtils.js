/**
 * Utility functions for color manipulation in the MegaSaver component
 */

/**
 * Adjusts a color's brightness by the specified amount
 * @param {string} color - The color to adjust (hex or rgb format)
 * @param {number} amount - The amount to adjust (-255 to 255)
 * @returns {string} The adjusted color in hex format
 */
export function adjustColor(color, amount) {
  // If color is in hex format, convert to RGB
  let r, g, b;

  if (color.startsWith('#')) {
    // Remove # if present
    color = color.slice(1);

    // Convert 3-digit hex to 6-digit
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }

    // Parse hex values
    r = parseInt(color.substring(0, 2), 16);
    g = parseInt(color.substring(2, 4), 16);
    b = parseInt(color.substring(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    // Extract RGB values from rgb/rgba string
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) {
      r = parseInt(rgbMatch[1], 10);
      g = parseInt(rgbMatch[2], 10);
      b = parseInt(rgbMatch[3], 10);
    } else {
      // Default to red if parsing fails
      return amount < 0 ? '#cc0000' : '#ff3333';
    }
  } else {
    // Default to red if color format is unknown
    return amount < 0 ? '#cc0000' : '#ff3333';
  }

  // Adjust color
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));

  // Convert back to hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Converts a hex color to RGB format
 * @param {string} hex - The hex color to convert
 * @returns {string} The color in "r, g, b" format (without rgb() wrapper)
 */
export function hexToRgb(hex) {
  // Remove # if present
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }

  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Return RGB format
  return `${r}, ${g}, ${b}`;
}

/**
 * Calculates savings percentage between original and current price
 * @param {string|number} price - Current price
 * @param {string|number} originalPrice - Original price
 * @returns {number|null} Percentage saved or null if invalid
 */
export function calculateSavings(price, originalPrice) {
  if (!originalPrice || !price) return null;
  const priceNum = parseFloat(price);
  const originalPriceNum = parseFloat(originalPrice);
  if (isNaN(priceNum) || isNaN(originalPriceNum) || originalPriceNum <= priceNum) return null;
  return Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
}
