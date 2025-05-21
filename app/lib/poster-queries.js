/**
 * GraphQL queries for product posters
 */

/**
 * Query to fetch all product posters
 */
export const PRODUCT_POSTERS_QUERY = `#graphql
  query ProductPosters($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "product_poster", first: 10) {
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
 * Query to fetch a single product poster by handle
 */
export const PRODUCT_POSTER_BY_HANDLE_QUERY = `#graphql
  query ProductPosterByHandle($handle: String!, $country: CountryCode, $language: LanguageCode)
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
        references(first: 50) {
          nodes {
            ... on Metaobject {
              id
              type
              fields {
                key
                value
                reference {
                  ... on Product {
                    id
                    title
                    handle
                    featuredImage {
                      url
                      altText
                      width
                      height
                    }
                    priceRange {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Query to fetch poster product items
 */
export const POSTER_PRODUCT_ITEMS_QUERY = `#graphql
  query PosterProductItems($ids: [ID!]!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Metaobject {
        id
        type
        fields {
          key
          value
          reference {
            ... on Product {
              id
              title
              handle
              featuredImage {
                url
                altText
                width
                height
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
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
export function processPosterData(posterMetaobject) {
  if (!posterMetaobject) {
    return null;
  }

  // Create a map of field keys to values for easier access
  const fieldMap = {};
  posterMetaobject.fields.forEach(field => {
    fieldMap[field.key] = field.value;
    
    // Handle references like background image
    if (field.reference) {
      fieldMap[`${field.key}_reference`] = field.reference;
    }
    
    // Handle list references like poster items
    if (field.references && field.references.nodes) {
      fieldMap[`${field.key}_references`] = field.references.nodes;
    }
  });

  // Process poster items if available
  const posterItems = [];
  if (fieldMap.poster_items_references) {
    fieldMap.poster_items_references.forEach(item => {
      if (item.type === 'poster_product_item') {
        const itemFieldMap = {};
        item.fields.forEach(field => {
          itemFieldMap[field.key] = field.value;
          
          // Handle product reference
          if (field.key === 'product' && field.reference) {
            itemFieldMap.product_data = field.reference;
          }
        });
        
        // Create a processed poster item
        posterItems.push({
          id: item.id,
          product: itemFieldMap.product_data,
          customPrice: itemFieldMap.custom_price,
          positionX: parseInt(itemFieldMap.position_x || '0', 10),
          positionY: parseInt(itemFieldMap.position_y || '0', 10),
          size: parseInt(itemFieldMap.size || '100', 10),
          highlight: itemFieldMap.highlight === 'true',
          customLabel: itemFieldMap.custom_label || ''
        });
      }
    });
  }

  // Return the processed poster data
  return {
    id: posterMetaobject.id,
    handle: posterMetaobject.handle,
    title: fieldMap.title || 'Product Poster',
    backgroundImage: fieldMap.background_image_reference?.image?.url || null,
    backgroundColor: fieldMap.background_color || '#ffffff',
    layoutType: fieldMap.layout_type || 'grid',
    effectiveDate: fieldMap.effective_date || null,
    expiryDate: fieldMap.expiry_date || null,
    posterItems: posterItems
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
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // If no dates are specified, consider it always active
  if (!poster.effectiveDate && !poster.expiryDate) return true;
  
  // Check effective date
  if (poster.effectiveDate && today < poster.effectiveDate) return false;
  
  // Check expiry date
  if (poster.expiryDate && today > poster.expiryDate) return false;
  
  return true;
}
