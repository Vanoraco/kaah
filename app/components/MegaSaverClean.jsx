import { Link, useFetcher } from '@remix-run/react';
import { useEffect, useState, useRef } from 'react';

// Enhanced color scheme for the mega saver component
const DEFAULT_BANNER_BG_COLOR = "#e50019"; // Richer red color
const DEFAULT_BANNER_TEXT_COLOR = "#ffffff";
const DEFAULT_ACCENT_COLOR = "#ffcc00"; // Yellow accent color
const DEFAULT_SECONDARY_COLOR = "#0066cc"; // Blue secondary color
const DEFAULT_HIGHLIGHT_COLOR = "#4caf50"; // Green highlight for savings
const DEFAULT_BUTTON_COLOR = "#1a237e"; // Button color

// Icons for enhanced visual appeal
const SAVINGS_ICON = "💰";
const SPECIAL_ICON = "🔥";
const STAR_ICON = "⭐";
const CART_ICON = "🛒";

// Add to Cart Button Component
function AddToCartButton({ item, quantity = 1 }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const fetcher = useFetcher();

  // Handle special offers (e.g., "BUY 2 FOR")
  const specialQuantity = item.quantity || quantity;

  // Check if item is in stock
  const isInStock = item.availableForSale !== false;
  const stockLevel = item.quantityAvailable;
  const hasLimitedStock = stockLevel !== null && stockLevel <= 10 && stockLevel > 0;

  // Reset the "Added" state after a delay
  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => {
        setIsAdded(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAdded]);

  // Track the fetcher state
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setIsAdding(true);
    } else if (fetcher.state === 'idle' && isAdding) {
      setIsAdding(false);
      setIsAdded(true);
      setAddedCount(prev => prev + specialQuantity);
    }
  }, [fetcher.state, isAdding, specialQuantity]);

  // Handle the add to cart action
  const handleAddToCart = () => {
    if (!item.variantId || isAdding || !isInStock) return;



    fetcher.submit(
      {
        action: 'add-to-cart',
        merchandiseId: item.variantId,
        quantity: specialQuantity,
        price: item.price || '0.00', // This will be used as mega_saver_price in cart.jsx
        originalPrice: item.originalPrice || '0.00',
        productTitle: item.title || '',
        specialQuantity: item.quantity || 1,
        from_mega_saver: 'true' // Explicitly mark as from mega saver
      },
      { method: 'post', action: '/cart' }
    );
  };

  return (
    <div className="mega-saver-add-to-cart-container">
      {/* Stock indicator */}
      {hasLimitedStock && (
        <div className="mega-saver-stock-indicator">
          Only {stockLevel} left
        </div>
      )}

      {/* Quantity indicator for special offers */}
      {specialQuantity > 1 && (
        <div className="mega-saver-quantity-badge">
          {specialQuantity}x
        </div>
      )}

      <button
        className={`mega-saver-add-to-cart ${isInStock ? '' : 'out-of-stock'}`}
        onClick={handleAddToCart}
        disabled={isAdding || !item.variantId || !isInStock}
        style={{
          backgroundColor: isAdded ? DEFAULT_HIGHLIGHT_COLOR :
                          !isInStock ? '#999999' : DEFAULT_BUTTON_COLOR,
          opacity: !item.variantId || !isInStock ? 0.7 : 1
        }}
      >
        {isAdding ? (
          <div className="mega-saver-button-content">
            <div className="mega-saver-loading-spinner"></div>
            <span>Adding...</span>
          </div>
        ) : isAdded ? (
          <div className="mega-saver-button-content">
            <span>{CART_ICON} Added to Cart!</span>
            {addedCount > 0 && (
              <span className="mega-saver-added-count">{addedCount} in cart</span>
            )}
          </div>
        ) : !isInStock ? (
          <span>Out of Stock</span>
        ) : (
          <div className="mega-saver-button-content">
            {item.specialText ? (
              <>
                <div className="mega-saver-special-offer-label">
                  <span className="mega-saver-offer-icon">{SPECIAL_ICON}</span>
                  <span>Special Offer</span>
                </div>
                <span className="mega-saver-add-text">Add to Cart</span>
              </>
            ) : (
              <span>{CART_ICON} Add to Cart</span>
            )}
            {specialQuantity > 1 && (
              <span className="mega-saver-quantity-text">Qty: {specialQuantity}</span>
            )}
          </div>
        )}
      </button>
    </div>
  );
}

export function MegaSaverClean({ megaSaverItems, megaSaverBanner, showViewMoreButton = true }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);



  // Add animation effect when component mounts and on scroll
  useEffect(() => {
    // Set visible immediately to avoid animation issues with clickable elements
    setIsVisible(true);

    // Add scroll animation
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Process the banner data from backend or use fallback data
  let banner = {
    title: "MEGA SAVER",
    subtitle: "Great deals on your favorite products",
    backgroundColor: DEFAULT_BANNER_BG_COLOR,
    textColor: DEFAULT_BANNER_TEXT_COLOR
  };

  // If we have banner data from the backend, use it
  if (megaSaverBanner && megaSaverBanner.nodes && megaSaverBanner.nodes.length > 0) {
    const bannerData = processBannerData(megaSaverBanner);
    banner = bannerData;
  }

  // Process the items data from backend or use fallback data
  let items = [];

  if (megaSaverItems && megaSaverItems.nodes && megaSaverItems.nodes.length > 0) {
    // Use metaobjects if available
    items = processItemsData(megaSaverItems);
  } else {
    // Use fallback data if no backend data is available
    items = [
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

  // Process banner metaobject data
  function processBannerData(bannerData) {
    const bannerNode = bannerData.nodes[0];
    const fieldMap = {};

    if (bannerNode && bannerNode.fields && Array.isArray(bannerNode.fields)) {
      bannerNode.fields.forEach(field => {
        if (field && field.key) {
          fieldMap[field.key] = field.value;
        }
      });
    }

    return {
      title: fieldMap.title || "MEGA SAVER",
      subtitle: fieldMap.subtitle || "Great deals on your favorite products",
      backgroundColor: fieldMap.background_color || DEFAULT_BANNER_BG_COLOR,
      textColor: fieldMap.text_color || DEFAULT_BANNER_TEXT_COLOR
    };
  }

  // Process item metaobject data
  function processItemsData(itemsData) {
    return itemsData.nodes.map((item) => {
      // Create a map of field keys to values for easier access
      const fieldMap = {};
      let imageUrl = null;

      if (item.fields && Array.isArray(item.fields)) {
        // First pass: collect all field values
        item.fields.forEach(field => {
          if (field && field.key) {
            // Store all field values in the map
            fieldMap[field.key] = field.value;

            // Special handling for image reference
            if ((field.key === 'image' || field.key.includes('image_')) && field.reference && field.reference.image) {
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
        image: imageUrl || "https://placehold.co/200x200/png?text=No+Image",
        link: link,
        variantId: variantId,
        specialOffer: fieldMap.special_offer || null,
        quantity: parseInt(fieldMap.quantity || "1", 10),
        availableForSale: availableForSale,
        quantityAvailable: quantityAvailable
      };
    });
  }

  // Calculate savings percentage for each item
  const calculateSavings = (price, originalPrice) => {
    if (!originalPrice || !price) return null;
    const priceNum = parseFloat(price);
    const originalPriceNum = parseFloat(originalPrice);
    if (isNaN(priceNum) || isNaN(originalPriceNum) || originalPriceNum <= priceNum) return null;
    return Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
  };

  return (
    <div
      ref={sectionRef}
      className={`mega-saver-section ${isVisible ? 'visible' : ''}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease'
      }}
    >
      {/* Decorative elements */}
      <div className="mega-saver-decoration" style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        width: '80px',
        height: '80px',
        background: `rgba(${hexToRgb(DEFAULT_BANNER_BG_COLOR)}, 0.1)`,
        borderRadius: '50%',
        zIndex: 0
      }}></div>

      <div className="mega-saver-decoration" style={{
        position: 'absolute',
        bottom: '25px',
        right: '25px',
        width: '120px',
        height: '120px',
        background: `rgba(${hexToRgb(DEFAULT_BANNER_BG_COLOR)}, 0.05)`,
        borderRadius: '50%',
        zIndex: 0
      }}></div>

      {/* Mega Saver Banner */}
      <div
        className="mega-saver-banner"
        style={{
          background: `linear-gradient(135deg, ${banner.backgroundColor} 0%, ${adjustColor(banner.backgroundColor, -30)} 100%)`,
          color: banner.textColor
        }}
      >
        <div className="mega-saver-banner-content">
          <h2 className="mega-saver-title">{banner.title}</h2>
          <p className="mega-saver-subtitle">{banner.subtitle}</p>
        </div>

        {/* Decorative elements for banner */}
        <div style={{
          position: 'absolute',
          top: '-15px',
          left: '-15px',
          width: '30px',
          height: '30px',
          background: adjustColor(banner.backgroundColor, -40),
          borderRadius: '50%',
          zIndex: 0
        }}></div>

        <div style={{
          position: 'absolute',
          bottom: '-10px',
          right: '-10px',
          width: '20px',
          height: '20px',
          background: adjustColor(banner.backgroundColor, -40),
          borderRadius: '50%',
          zIndex: 0
        }}></div>
      </div>

      {/* Mega Saver Items Grid */}
      <div className="mega-saver-grid">
        {items.map((item, index) => {
          const savingsPercent = calculateSavings(item.price, item.originalPrice);

          return (
            <div
              key={item.id}
              className="mega-saver-item"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: isVisible ? 'fadeInUpBounce 0.6s ease forwards' : 'none'
              }}
            >
              <div className="mega-saver-item-inner">
                {item.specialText && (
                  <div className="mega-saver-special-text">
                    <span className="mega-saver-offer-icon">{SPECIAL_ICON}</span>
                    <span>{item.specialText}</span>
                    <div className="shine-effect"></div>
                  </div>
                )}

                {savingsPercent && !item.specialText && (
                  <div className="mega-saver-special-text" style={{
                    background: `linear-gradient(135deg, ${DEFAULT_HIGHLIGHT_COLOR} 0%, ${adjustColor(DEFAULT_HIGHLIGHT_COLOR, -30)} 100%)`
                  }}>
                    <span className="mega-saver-offer-icon">{SAVINGS_ICON}</span>
                    <span>SAVE {savingsPercent}%</span>
                    <div className="shine-effect"></div>
                  </div>
                )}

                <Link to={item.link} className="mega-saver-item-link">
                  <div className="mega-saver-image-container">
                    <div className="mega-saver-image-wrapper">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="mega-saver-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/200x200/png?text=No+Image";
                        }}
                      />
                    </div>
                  </div>
                  <div className="mega-saver-content">
                    <div className="mega-saver-brand">{item.brand}</div>
                    <h3 className="mega-saver-item-title">{item.title}</h3>
                    <div className="mega-saver-price-container">
                      {savingsPercent && (
                        <div className="mega-saver-save-badge">Save {savingsPercent}%</div>
                      )}
                      <div className="mega-saver-price-row">
                        <span className="mega-saver-price">{item.price}</span>
                        {item.originalPrice && (
                          <span className="mega-saver-original-price">{item.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Add to Cart Button */}
                <div className="mega-saver-actions">
                  <AddToCartButton
                    item={item}
                    quantity={item.specialText && item.specialText.includes("BUY 2") ? 2 :
                             item.specialText && item.specialText.includes("BUY 3") ? 3 : 1}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View More Button - only show on homepage */}
      {showViewMoreButton && (
        <div className="mega-saver-view-more-container" style={{ position: 'relative', zIndex: 100 }}>
          {/* Pure HTML anchor tag with no JavaScript */}
          <a
            href="/mega_saver"
            className="mega-saver-view-more-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #1a237e 45%, #ffc107 100%)',
              color: 'white',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 200,
              pointerEvents: 'auto'
            }}
          >
            <span>View More Mega Savers</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}


// Helper function to adjust color brightness
function adjustColor(color, amount) {
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

// Helper function to convert hex color to RGB format
function hexToRgb(hex) {
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
