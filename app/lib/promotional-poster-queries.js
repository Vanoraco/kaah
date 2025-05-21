/**
 * GraphQL queries for promotional posters
 */

/**
 * Query to fetch all promotional posters
 */
export const PROMOTIONAL_POSTERS_QUERY = `#graphql
  query PromotionalPosters($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "promotional_poster", first: 20) {
      nodes {
        id
        handle
        type
        fields {
          key
          value
          reference {
            ... on MediaImage {
              id
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Query to fetch a single promotional poster by handle
 */
export const PROMOTIONAL_POSTER_BY_HANDLE_QUERY = `#graphql
  query PromotionalPosterByHandle($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobject(handle: $handle) {
      id
      handle
      type
      fields {
        key
        value
        reference {
          ... on MediaImage {
            id
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`;

/**
 * Process poster data from metaobject
 * @param {Object} posterMetaobject - The poster metaobject from Shopify
 * @returns {Object} Processed poster data
 */
export function processPromotionalPosterData(posterMetaobject) {
  if (!posterMetaobject) {
    return null;
  }

  // Create a map of field keys to values for easier access
  const fieldMap = {};
  posterMetaobject.fields.forEach(field => {
    fieldMap[field.key] = field.value;

    // Handle references like poster image
    if (field.reference) {
      fieldMap[`${field.key}_reference`] = field.reference;
    }
  });

  // Return the processed poster data
  return {
    id: posterMetaobject.id,
    handle: posterMetaobject.handle,
    title: fieldMap.title || 'Promotional Poster',
    posterImage: fieldMap.poster_image_reference?.image?.url || null,
    posterImageAlt: fieldMap.poster_image_reference?.image?.altText || fieldMap.title || 'Promotional Poster',
    posterImageWidth: fieldMap.poster_image_reference?.image?.width || 0,
    posterImageHeight: fieldMap.poster_image_reference?.image?.height || 0,
    description: fieldMap.description || '',
    effectiveDate: fieldMap.effective_date || null,
    expiryDate: fieldMap.expiry_date || null
  };
}

/**
 * Check if a poster is currently active based on its dates
 * @param {Object} poster - The processed poster data
 * @returns {boolean} Whether the poster is currently active
 */
export function isPosterActive(poster) {
  if (!poster) return false;

  const now = new Date();

  // If no dates are specified, consider it always active
  if (!poster.effectiveDate && !poster.expiryDate) return true;

  // Check effective date - convert string dates to Date objects for comparison
  if (poster.effectiveDate) {
    const effectiveDate = new Date(poster.effectiveDate);
    if (now < effectiveDate) return false;
  }

  // Check expiry date - convert string dates to Date objects for comparison
  if (poster.expiryDate) {
    const expiryDate = new Date(poster.expiryDate);
    if (now > expiryDate) return false;
  }

  return true;
}
