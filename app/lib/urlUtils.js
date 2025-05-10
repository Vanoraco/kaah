/**
 * Utility functions for URL manipulation
 */

/**
 * Cleans up URL parameters, removing unwanted ones and preserving specified ones
 * @param {Array<string>} [preserveParams=['nocache', 'refresh']] - Parameters to preserve
 * @returns {boolean} - True if the URL was changed
 */
export function cleanupUrlParameters(preserveParams = ['nocache', 'refresh']) {
  try {
    // Get the current URL
    const currentUrl = new URL(window.location.href);
    let hasParams = false;
    
    // Parameters to remove
    const removeParams = ['Price'];
    
    // Remove unwanted parameters
    removeParams.forEach(param => {
      if (currentUrl.searchParams.has(param)) {
        currentUrl.searchParams.delete(param);
        hasParams = true;
      }
    });
    
    // Create a clean URL with only the path
    const cleanUrl = new URL(window.location.origin + window.location.pathname);
    
    // Add back only the parameters we want to preserve
    preserveParams.forEach(param => {
      if (currentUrl.searchParams.has(param)) {
        cleanUrl.searchParams.set(param, currentUrl.searchParams.get(param));
        hasParams = true;
      }
    });
    
    // Update the URL if we removed any parameters
    if (hasParams && window.location.href !== cleanUrl.href) {
      window.history.replaceState({}, '', cleanUrl.href);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error cleaning up URL parameters:', error);
    return false;
  }
}
