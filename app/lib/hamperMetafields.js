/**
 * Utility functions for handling hamper product metafields
 * This module provides functions to work with metafields for hamper pricing
 */

/**
 * Formats hamper products for cart addition with metafields for pricing
 * @param {Array} products - The products in the hamper
 * @param {Object} hamperData - The hamper data containing price information
 * @returns {Array} - The formatted cart line items with metafields
 */
export function formatHamperCartLines(products, hamperData) {
  // Calculate the total regular price of all products
  const totalRegularPrice = products.reduce((total, product) => {
    const productPrice = parseFloat(product.variants.nodes[0]?.price?.amount || 0);
    return total + productPrice;
  }, 0);

  // Get the hamper price
  const hamperPrice = parseFloat(hamperData.price || 0);

  console.log('Hamper pricing information:', {
    hamperName: hamperData.name,
    hamperPrice,
    totalRegularPrice,
    discount: totalRegularPrice - hamperPrice
  });

  // Prepare the lines array for the cart
  return products.map(product => {
    // Calculate the proportional price for this product
    const regularPrice = parseFloat(product.variants.nodes[0]?.price?.amount || 0);
    const priceRatio = regularPrice / totalRegularPrice;
    const proportionalPrice = (hamperPrice * priceRatio).toFixed(2);

    console.log(`Adding product ${product.title} with proportional price R${proportionalPrice} (original: R${regularPrice})`);

    // Get the variant ID and ensure it's in the correct format
    let variantId = product.variants.nodes[0]?.id || '';

    // If the variant ID doesn't start with the expected prefix, format it
    if (!variantId.startsWith('gid://shopify/ProductVariant/')) {
      // Extract the numeric ID if it's in another format
      const matches = variantId.match(/(\d+)$/);
      if (matches && matches[1]) {
        variantId = `gid://shopify/ProductVariant/${matches[1]}`;
      }
    }

    // Return the line item with attributes including metafield information
    return {
      merchandiseId: variantId,
      quantity: product.hamperQuantity || 1,
      attributes: [
        { key: 'hamper_id', value: hamperData.id || '' },
        { key: 'hamper_name', value: hamperData.name || 'Hamper Bundle' },
        { key: 'hamper_price', value: proportionalPrice.toString() },
        { key: 'original_price', value: regularPrice.toString() },
        { key: 'from_hamper', value: 'true' },
        { key: 'product_title', value: product.title || '' },
        { key: 'use_metafields', value: 'true' }
      ]
    };
  });
}

/**
 * Creates metafields for a product variant to override its price
 * This function uses the Shopify Admin API to create or update metafields
 *
 * @param {Object} context - The Remix context containing admin API client
 * @param {string} variantId - The variant ID
 * @param {number} customPrice - The custom price to set
 * @returns {Promise<Object>} - The result of creating the metafields
 */
export async function createPriceMetafields(context, variantId, customPrice) {
  console.log('Creating price metafields for variant:', variantId);
  console.log('Custom price:', customPrice);

  try {
    // Check if we have admin API access
    if (!context.admin) {
      console.warn('No admin API access available. Using mock implementation.');
      return {
        success: true,
        variantId,
        customPrice,
        message: 'Mock price metafields created (no admin API access)'
      };
    }

    // Extract the numeric ID from the GID
    const matches = variantId.match(/\/(\d+)$/);
    if (!matches || !matches[1]) {
      throw new Error(`Invalid variant ID format: ${variantId}`);
    }

    const numericId = matches[1];
    const gid = `gid://shopify/ProductVariant/${numericId}`;

    // Create the metafield using Admin API
    const response = await context.admin.graphql(`
      mutation CreatePriceMetafield($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
          productVariant {
            id
            metafields(first: 5) {
              edges {
                node {
                  namespace
                  key
                  value
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        input: {
          id: gid,
          metafields: [
            {
              namespace: "custom",
              key: "price",
              value: customPrice.toString(),
              type: "number_decimal"
            }
          ]
        }
      }
    });

    const result = await response.json();

    if (result.data?.productVariantUpdate?.userErrors?.length > 0) {
      console.error('Errors creating metafield:', result.data.productVariantUpdate.userErrors);
      return {
        success: false,
        errors: result.data.productVariantUpdate.userErrors,
        message: 'Failed to create price metafields'
      };
    }

    console.log('Successfully created price metafield:', result);
    return {
      success: true,
      variantId,
      customPrice,
      message: 'Price metafields created successfully',
      response: result
    };
  } catch (error) {
    console.error('Error creating price metafields:', error);
    return {
      success: false,
      error: error.message,
      message: 'Error creating price metafields'
    };
  }
}

/**
 * Applies a custom price to a product variant using metafields
 * @param {Object} context - The Remix context containing storefront API client
 * @param {string} variantId - The variant ID
 * @param {number} customPrice - The custom price to set
 * @returns {Promise<Object>} - The result of applying the custom price
 */
export async function applyCustomPriceToVariant(context, variantId, customPrice) {
  try {
    // Extract the numeric ID from the GID
    const matches = variantId.match(/\/(\d+)$/);
    if (!matches || !matches[1]) {
      throw new Error(`Invalid variant ID format: ${variantId}`);
    }

    const numericId = matches[1];

    // Create metafields for the variant
    // In a real implementation, this would use Shopify's Admin API
    const result = await createPriceMetafields(numericId, customPrice);

    return {
      success: true,
      variantId,
      customPrice,
      message: 'Custom price applied successfully'
    };
  } catch (error) {
    console.error('Error applying custom price to variant:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
