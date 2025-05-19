/**
 * SEO utility functions for handling canonical URLs and other SEO-related tasks
 */

/**
 * Generates a canonical URL for the current page, removing pagination parameters
 * to prevent duplicate content issues with paginated pages.
 * 
 * @param {Object} options - Options for generating the canonical URL
 * @param {string} options.pathname - The current pathname (e.g., /collections/all)
 * @param {string} options.baseUrl - The base URL of the site (e.g., https://kaah.co.za)
 * @param {URLSearchParams} [options.searchParams] - The current search parameters
 * @param {boolean} [options.preserveParams=false] - Whether to preserve non-pagination parameters
 * @returns {string} The canonical URL
 */
export function getCanonicalUrl({
  pathname,
  baseUrl = 'https://kaah.co.za',
  searchParams,
  preserveParams = false
}) {
  // If no search params, just return the base URL + pathname
  if (!searchParams || searchParams.toString() === '') {
    return `${baseUrl}${pathname}`;
  }

  // Create a new URLSearchParams object to avoid modifying the original
  const cleanParams = new URLSearchParams();
  
  // If we want to preserve non-pagination parameters
  if (preserveParams) {
    // Copy all parameters except pagination-related ones
    for (const [key, value] of searchParams.entries()) {
      if (!isPaginationParam(key)) {
        cleanParams.append(key, value);
      }
    }
  }

  // If there are clean parameters to include, add them to the URL
  const queryString = cleanParams.toString();
  if (queryString) {
    return `${baseUrl}${pathname}?${queryString}`;
  }
  
  // Otherwise, return just the base URL + pathname
  return `${baseUrl}${pathname}`;
}

/**
 * Checks if a parameter is related to pagination
 * 
 * @param {string} paramName - The parameter name to check
 * @returns {boolean} True if the parameter is pagination-related
 */
function isPaginationParam(paramName) {
  const paginationParams = [
    'cursor',
    'direction',
    'page',
    'after',
    'before',
    'next',
    'prev'
  ];
  
  return paginationParams.includes(paramName.toLowerCase());
}

/**
 * Creates SEO meta tags including canonical URLs for paginated pages
 * 
 * @param {Object} options - Options for generating SEO meta tags
 * @param {string} options.title - The page title
 * @param {string} [options.description] - The page description
 * @param {string} options.pathname - The current pathname
 * @param {string} [options.baseUrl] - The base URL of the site
 * @param {URLSearchParams} [options.searchParams] - The current search parameters
 * @param {boolean} [options.preserveParams=false] - Whether to preserve non-pagination parameters
 * @returns {Array} Array of meta tag objects
 */
export function createSeoMeta({
  title,
  description,
  pathname,
  baseUrl = 'https://kaah.co.za',
  searchParams,
  preserveParams = false
}) {
  const metaTags = [
    { title },
  ];
  
  if (description) {
    metaTags.push({ description });
  }
  
  // Add canonical URL
  metaTags.push({
    rel: 'canonical',
    href: getCanonicalUrl({ pathname, baseUrl, searchParams, preserveParams }),
  });
  
  return metaTags;
}
