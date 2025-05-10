/**
 * Utility functions for handling hamper product variants
 * This module provides functions to work with special hamper price variants
 */

/**
 * Finds the "Hamper Price" variant for a product, or uses the default variant
 * @param {Object} product - The product object
 * @returns {Object} - The variant to use for the hamper
 */
export function findHamperPriceVariant(product) {
  if (!product || !product.variants || !product.variants.nodes) {
    console.error('Invalid product object:', product);
    return null;
  }

  // Look for a variant with title containing "Hamper Price"
  const hamperVariant = product.variants.nodes.find(variant =>
    variant.title && variant.title.toLowerCase().includes('hamper price')
  );

  // If we found a hamper variant, use it
  if (hamperVariant) {
    console.log(`Found "Hamper Price" variant for product ${product.title}`);
    return hamperVariant;
  }

  // Otherwise, use the default variant
  console.log(`No "Hamper Price" variant found for product ${product.title}, using default variant`);
  return product.variants.nodes[0];
}

/**
 * Formats hamper products for cart addition using special hamper price variants
 * @param {Array} products - The products in the hamper
 * @param {Object} hamperData - The hamper data containing price information
 * @returns {Array} - The formatted cart line items
 */
export function formatHamperCartLines(products, hamperData) {
  console.log('Hamper information:', {
    hamperName: hamperData.name,
    hamperPrice: hamperData.price
  });

  // Prepare the lines array for the cart
  return products.map(product => {
    // Find the appropriate variant to use (hamper price variant or default)
    const variant = findHamperPriceVariant(product);

    if (!variant) {
      console.error(`No valid variant found for product ${product.title}`);
      return null;
    }

    // Get the variant ID and ensure it's in the correct format
    let variantId = variant.id || '';

    // If the variant ID doesn't start with the expected prefix, format it
    if (!variantId.startsWith('gid://shopify/ProductVariant/')) {
      // Extract the numeric ID if it's in another format
      const matches = variantId.match(/(\d+)$/);
      if (matches && matches[1]) {
        variantId = `gid://shopify/ProductVariant/${matches[1]}`;
      }
    }

    // Get the regular price for reference
    const regularPrice = parseFloat(product.variants.nodes[0]?.price?.amount || 0);

    // Get the hamper image URL if available
    const hamperImageUrl = hamperData.imageUrl || hamperData.image?.url || '';

    // Get the hamper price if available
    const hamperPrice = variant.price?.amount || '';

    // Return the line item with attributes
    // Use a special prefix for internal attributes to distinguish them
    return {
      merchandiseId: variantId,
      quantity: product.hamperQuantity || 1,
      attributes: [
        // Only use internal attributes - no visible attributes in checkout
        { key: '_internal_hamper_id', value: hamperData.id || '' },
        { key: '_internal_hamper_name', value: hamperData.name || 'Hamper Bundle' },
        { key: '_internal_original_price', value: regularPrice.toString() },
        { key: '_internal_hamper_price', value: hamperPrice.toString() },
        { key: '_internal_from_hamper', value: 'true' },
        { key: '_internal_product_title', value: product.title || '' },
        { key: '_internal_is_hamper_variant', value: 'true' },
        { key: '_internal_hamper_image_url', value: hamperImageUrl }
      ]
    };
  }).filter(Boolean); // Remove any null items
}
