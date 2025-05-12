/**
 * Utility functions for data processing in the MegaSaver component
 */

/**
 * Default values for the MegaSaver component
 */
export const DEFAULT_VALUES = {
  BANNER_BG_COLOR: "#e50019", // Richer red color
  BANNER_TEXT_COLOR: "#ffffff",
  ACCENT_COLOR: "#ffcc00", // Yellow accent color
  SECONDARY_COLOR: "#0066cc", // Blue secondary color
  HIGHLIGHT_COLOR: "#4caf50", // Green highlight for savings
  BUTTON_COLOR: "#0066cc", // Button color
  FALLBACK_IMAGE: "https://placehold.co/200x200/png?text=No+Image"
};

/**
 * Icons for enhanced visual appeal
 */
export const ICONS = {
  SAVINGS: "💰",
  SPECIAL: "🔥",
  STAR: "⭐",
  CART: "🛒"
};

/**
 * Processes banner metaobject data from Shopify
 * @param {Object} bannerData - The banner data from Shopify
 * @returns {Object} Processed banner data with defaults applied
 */
export function processBannerData(bannerData) {
  const bannerNode = bannerData?.nodes?.[0];
  const fieldMap = {};

  if (bannerNode?.fields && Array.isArray(bannerNode.fields)) {
    bannerNode.fields.forEach(field => {
      if (field?.key) {
        fieldMap[field.key] = field.value;
      }
    });
  }

  return {
    title: fieldMap.title || "MEGA SAVER",
    subtitle: fieldMap.subtitle || "Great deals on your favorite products",
    backgroundColor: fieldMap.background_color || DEFAULT_VALUES.BANNER_BG_COLOR,
    textColor: fieldMap.text_color || DEFAULT_VALUES.BANNER_TEXT_COLOR
  };
}

/**
 * Processes item metaobject data from Shopify
 * @param {Object} itemsData - The items data from Shopify
 * @returns {Array} Array of processed item objects
 */
export function processItemsData(itemsData) {
  if (!itemsData?.nodes || !Array.isArray(itemsData.nodes)) {
    return [];
  }

  return itemsData.nodes.map((item) => {
    // Create a map of field keys to values for easier access
    const fieldMap = {};
    let imageUrl = null;

    if (item.fields && Array.isArray(item.fields)) {
      // First pass: collect all field values
      item.fields.forEach(field => {
        if (field?.key) {
          // Store all field values in the map
          fieldMap[field.key] = field.value;

          // Special handling for image reference
          if ((field.key === 'image' || field.key.includes('image_')) && field.reference?.image) {
            imageUrl = field.reference.image.url;
          }

          // Handle product reference
          if (field.key === 'product' && field.reference) {
            fieldMap['productReference'] = field.reference;

            // If we don't have an image yet, use the product's featured image
            if (!imageUrl && field.reference.featuredImage) {
              imageUrl = field.reference.featuredImage.url;
            }
          }
        }
      });
    }

    // Use product reference data if available
    const productRef = fieldMap.productReference;

    // Set link based on product reference or custom link
    const link = fieldMap.link || (productRef ? `/products/${productRef.handle}` : "/products");

    // Get product variant ID and availability information for add to cart functionality
    const variantId = productRef?.variants?.edges?.[0]?.node?.id || null;
    const variantNode = productRef?.variants?.edges?.[0]?.node;
    const availableForSale = productRef?.availableForSale ?? true;
    const quantityAvailable = variantNode?.quantityAvailable ?? null;

    // Ensure we're using the metaobject price first - with extra validation
    let price = "0.00";
    // Check for price_ first (new field name)
    if (fieldMap.price_ !== undefined && fieldMap.price_ !== null && fieldMap.price_ !== '') {
      price = fieldMap.price_;
    }
    // Fallback to old price field for backward compatibility
    else if (fieldMap.price !== undefined && fieldMap.price !== null && fieldMap.price !== '') {
      price = fieldMap.price;
    }
    // Last resort: use product price
    else if (productRef?.priceRange?.minVariantPrice?.amount) {
      price = productRef.priceRange.minVariantPrice.amount;
    }

    // Final object with all processed data
    return {
      id: item.id,
      title: fieldMap.title || (productRef ? productRef.title : `Item ${item.handle}`),
      brand: fieldMap.brand || "",
      price: price,
      originalPrice: fieldMap.original_price || "",
      specialText: fieldMap.special_text || "",
      image: imageUrl || DEFAULT_VALUES.FALLBACK_IMAGE,
      link: link,
      variantId: variantId,
      specialOffer: fieldMap.special_offer || null,
      quantity: parseInt(fieldMap.quantity || "1", 10),
      availableForSale: availableForSale,
      quantityAvailable: quantityAvailable
    };
  });
}

/**
 * Generates fallback data when no items are available
 * @returns {Array} Array of fallback item objects
 */
export function getFallbackItems() {
  return [
    {
      id: 1,
      title: "Bull Brand Corned Meat",
      brand: "Bull Brand",
      price: "49.99",
      originalPrice: "59.99",
      specialText: "BUY 2 FOR",
      image: "https://placehold.co/200x200/png?text=Bull+Brand",
      link: "/products/bull-brand-corned-meat"
    },
    {
      id: 2,
      title: "Koo Chakalaka Mild & Spicy",
      brand: "Koo",
      price: "18.99",
      originalPrice: "24.99",
      specialText: "",
      image: "https://placehold.co/200x200/png?text=Koo+Chakalaka",
      link: "/products/koo-chakalaka"
    },
    {
      id: 3,
      title: "Lucky Star Pilchards in Tomato Sauce",
      brand: "Lucky Star",
      price: "49.99",
      originalPrice: "59.99",
      specialText: "BUY 2 FOR",
      image: "https://placehold.co/200x200/png?text=Lucky+Star",
      link: "/products/lucky-star-pilchards"
    },
    {
      id: 4,
      title: "Six Gun Spice",
      brand: "Six Gun",
      price: "17.99",
      originalPrice: "22.99",
      specialText: "",
      image: "https://placehold.co/200x200/png?text=Six+Gun+Spice",
      link: "/products/six-gun-spice"
    }
  ];
}
