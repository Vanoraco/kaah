import { useState, useEffect } from 'react';

/**
 * Default background colors for promotion cards if not specified in backend data
 * @type {string[]}
 */
const DEFAULT_BG_COLORS = ["#2980b9", "#000000", "#f1c40f"];

/**
 * Default food emojis for each card type
 * @type {Object}
 */
const DEFAULT_FOOD_EMOJIS = {
  vegetables: [
    { name: "avocado", emoji: "🥑", size: "60px", top: "60%", left: "70%" },
    { name: "tomato", emoji: "🍅", size: "55px", top: "40%", left: "80%" },
    { name: "broccoli", emoji: "🥦", size: "65px", top: "70%", left: "60%" },
    { name: "cucumber", emoji: "🥒", size: "58px", top: "50%", left: "75%" },
    { name: "kiwi", emoji: "🥝", size: "50px", top: "30%", left: "85%" },
  ],
  meat: [
    { name: "meat", emoji: "🥩", size: "70px", top: "50%", left: "75%" },
    { name: "chicken", emoji: "🍗", size: "60px", top: "65%", left: "65%" },
    { name: "steak", emoji: "🥓", size: "55px", top: "40%", left: "80%" },
  ],
  fruits: [
    { name: "apple", emoji: "🍎", size: "55px", top: "40%", left: "75%" },
    { name: "banana", emoji: "🍌", size: "60px", top: "60%", left: "80%" },
    { name: "orange", emoji: "🍊", size: "50px", top: "50%", left: "70%" },
    { name: "grapes", emoji: "🍇", size: "55px", top: "45%", left: "85%" },
    { name: "strawberry", emoji: "🍓", size: "45px", top: "65%", left: "65%" },
  ]
};

/**
 * FoodEmojis Component - Renders food emoji decorations
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of food emoji items to display
 * @returns {JSX.Element} - Rendered component
 */
const FoodEmojis = ({ items }) => {
  if (!items || !items.length) return null;

  return (
    <>
      {items.map((item, index) => (
        <div
          key={index}
          className="food-emoji"
          style={{
            position: 'absolute',
            fontSize: item.size,
            top: item.top,
            left: item.left,
            transform: `rotate(${Math.random() * 20 - 10}deg)`,
            zIndex: 1,
            textShadow: '0 2px 10px rgba(0,0,0,0.15)'
          }}
        >
          {item.emoji}
        </div>
      ))}
    </>
  );
};

// PropTypes validation removed for ESM compatibility

/**
 * Countdown Component - Renders a countdown timer display
 * @param {Object} props - Component props
 * @param {Object} props.data - Countdown data
 * @returns {JSX.Element} - Rendered component
 */
const Countdown = ({ data }) => {
  if (!data) return null;

  return (
    <div className="countdown">
      <div className="countdown-item">
        <span className="countdown-value">{data.days}</span>
        <span className="countdown-label">DAYS</span>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-item">
        <span className="countdown-value">{data.hours}</span>
        <span className="countdown-label">HOURS</span>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-item">
        <span className="countdown-value">{data.mins}</span>
        <span className="countdown-label">MINS</span>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-item">
        <span className="countdown-value">{data.secs}</span>
        <span className="countdown-label">SECS</span>
      </div>
    </div>
  );
};

// PropTypes validation removed for ESM compatibility

/**
 * PromotionCard Component - Renders a single promotion card
 * @param {Object} props - Component props
 * @param {Object} props.promo - Promotion data
 * @returns {JSX.Element} - Rendered component
 */
const PromotionCard = ({ promo }) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div
      className="promo-card"
      style={{
        backgroundColor: promo.background,
        color: promo.textColor
      }}
    >
      <div className="promo-content">
        <span className="promo-subtitle">{promo.subtitle}</span>
        <h2 className="promo-title">{promo.title}</h2>

        {promo.countdown && <Countdown data={promo.countdown} />}

        {promo.price && (
          <div className="promo-price">
            <span>Starts at </span> <strong>&nbsp; {promo.price}</strong>
          </div>
        )}

        <div className="promo-discount">
          {typeof promo.discount === 'string' && promo.discount.trim() !== '' && (
            <>
              <span>Up to</span>
              <span
                className="discount-badge"
                data-discount={promo.discount}
              >
                {promo.discount}
              </span>
            </>
          )}
        </div>

        <a
          href={promo.link}
          className="shop-now-btn promo-btn"
        >
          Shop Now <i className="fas fa-arrow-right"></i>
        </a>
      </div>

      <div className="promo-image">
        {promo.image ? (
          <div className="promo-image-container">
            <div className="image-wrapper">
              <img
                src={promo.image}
                alt={promo.title}
                className="promo-actual-image"
                loading="eager"
                onLoad={(e) => {
                  e.target.classList.add('image-loaded');
                  // Trigger a reflow to ensure animations work properly
                  setTimeout(() => {
                    e.target.classList.add('image-animated');
                  }, 10);
                }}
              />
              <div className="image-overlay"></div>
            </div>
          </div>
        ) : (
          <FoodEmojis items={promo.foodItems} />
        )}
      </div>
    </div>
  );
};

// PropTypes validation removed for ESM compatibility

/**
 * Main PromotionCards component
 * @param {Object} props - Component props
 * @param {Object} props.promotionMetaobjects - Metaobjects data from Shopify
 * @param {Object} props.promotionCollections - Collections data from Shopify
 * @param {Object} props.promotionProducts - Products data from Shopify
 * @returns {JSX.Element} - Rendered component
 */
export function PromotionCards({ promotionMetaobjects, promotionCollections, promotionProducts }) {

  /**
   * Get the appropriate food emoji set based on title or handle
   * @param {string} title - The title to check
   * @param {string} handle - The handle to check
   * @returns {string} - The food type key
   */
  const getFoodType = (title = '', handle = '') => {
    const titleLower = title.toLowerCase();
    const handleLower = handle.toLowerCase();

    if (titleLower.includes('meat') || handleLower.includes('meat')) {
      return 'meat';
    } else if (titleLower.includes('fruit') || handleLower.includes('fruit')) {
      return 'fruits';
    }
    return 'vegetables';
  };

  /**
   * Create a standardized promotion object from various data sources
   * @param {Object} data - The source data
   * @param {number} index - The index for fallback colors
   * @returns {Object} - Standardized promotion object
   */
  const createPromotionObject = (data, index) => {
    const {
      id,
      title,
      subtitle = '',
      background = DEFAULT_BG_COLORS[index % DEFAULT_BG_COLORS.length],
      textColor = 'white',
      link = '/collections/all',
      price = null,
      discount = null,
      countdown = null,
      image = null,
      foodType = 'vegetables',
      handle = ''
    } = data;

    return {
      id,
      title,
      subtitle,
      background,
      textColor,
      link: link || (handle ? `/collections/${handle}` : '/collections/all'),
      price,
      discount,
      countdown,
      image,
      foodItems: image ? null : DEFAULT_FOOD_EMOJIS[foodType]
    };
  };

  // Process the data from backend or use fallback data
  let promotions;

  if (promotionMetaobjects?.nodes?.length > 0) {
    // Use metaobjects if available (highest priority)
    promotions = processMetaobjectData(promotionMetaobjects);
  } else if (promotionCollections?.nodes?.length > 0) {
    // Use collections if available (second priority)
    promotions = processCollectionData(promotionCollections);
  } else if (promotionProducts?.nodes?.length > 0) {
    // Use products if available (third priority)
    promotions = processProductData(promotionProducts);
  } else {
    // Use fallback data if no backend data is available
    promotions = [
      {
        id: 1,
        title: "Sale of the Month",
        subtitle: "BEST DEALS",
        background: "#2980b9",
        textColor: "white",
        link: "/collections/monthly-deals",
        countdown: {
          days: "00",
          hours: "02",
          mins: "18",
          secs: "46"
        },
        foodType: 'vegetables'
      },
      {
        id: 2,
        title: "Low-Fat Meat",
        subtitle: "85% FAT FREE",
        background: "#000000",
        textColor: "white",
        link: "/collections/meat",
        price: "$79.99",
        foodType: 'meat'
      },
      {
        id: 3,
        title: "100% Fresh Fruit",
        subtitle: "SUMMER SALE",
        background: "#f1c40f",
        textColor: "black",
        link: "/collections/fruits",
        discount: "64% OFF",
        foodType: 'fruits'
      }
    ].map((item, index) => createPromotionObject(item, index));
  }

  /**
   * Process metaobject data into promotion cards format
   * @param {Object} metaobjectData - Metaobject data from Shopify
   * @returns {Array} - Array of processed promotion objects
   */
  function processMetaobjectData(metaobjectData) {
    try {
      return metaobjectData.nodes.map((metaobject, index) => {
        // Create a map of field keys to values for easier access
        const fieldMap = {};

        if (metaobject.fields && Array.isArray(metaobject.fields)) {
          metaobject.fields.forEach(field => {
            if (field && field.key) {
              // Handle image field with special key format
              if (field.key.includes('image_') && field.reference?.image) {
                fieldMap['image'] = field.reference.image.url;
              }
              // Handle discount field
              else if (field.key === 'discount' || field.key.includes('discount')) {
                fieldMap['discount'] = field.value;
              }
              // Handle other reference fields
              else if (field.reference?.image) {
                fieldMap[field.key] = field.reference.image.url;
              }
              // Handle regular fields
              else {
                fieldMap[field.key] = field.value;
              }
            }
          });
        }

        // Parse countdown if it exists
        let countdown = null;
        if (fieldMap.countdown_days || fieldMap.countdown_hours ||
            fieldMap.countdown_minutes || fieldMap.countdown_seconds ||
            fieldMap.countdown_mins || fieldMap.countdown_secs) {
          countdown = {
            days: fieldMap.countdown_days || "00",
            hours: fieldMap.countdown_hours || "00",
            mins: fieldMap.countdown_minutes || fieldMap.countdown_mins || "00",
            secs: fieldMap.countdown_seconds || fieldMap.countdown_secs || "00"
          };
        }

        return createPromotionObject({
          id: metaobject.id,
          title: fieldMap.title || `Promotion ${index + 1}`,
          subtitle: fieldMap.subtitle || '',
          background: fieldMap.background_color,
          textColor: fieldMap.text_color,
          link: fieldMap.link,
          price: fieldMap.price,
          discount: fieldMap.discount,
          countdown,
          image: fieldMap.image,
          foodType: getFoodType(fieldMap.title || '', metaobject.handle || '')
        }, index);
      });
    } catch (error) {
      console.error('Error processing metaobject data:', error);
      return [];
    }
  }

  /**
   * Process collection data into promotion cards format
   * @param {Object} collectionData - Collection data from Shopify
   * @returns {Array} - Array of processed promotion objects
   */
  function processCollectionData(collectionData) {
    try {
      return collectionData.nodes.map((collection, index) => {
        // Create a map of metafield keys to values for easier access
        const metafieldMap = {};
        if (collection.metafields && Array.isArray(collection.metafields)) {
          collection.metafields.forEach(field => {
            if (field && field.key) {
              metafieldMap[field.key] = field.value;
            }
          });
        }

        // Parse countdown if it exists
        let countdown = null;
        if (metafieldMap.promo_countdown) {
          try {
            const countdownValues = JSON.parse(metafieldMap.promo_countdown);
            countdown = {
              days: countdownValues.days || "00",
              hours: countdownValues.hours || "00",
              mins: countdownValues.mins || "00",
              secs: countdownValues.secs || "00"
            };
          } catch (e) {
            console.error('Error parsing countdown JSON:', e);
          }
        }

        return createPromotionObject({
          id: collection.id,
          title: collection.title,
          subtitle: metafieldMap.promo_subtitle,
          background: metafieldMap.promo_background,
          textColor: metafieldMap.promo_text_color,
          link: `/collections/${collection.handle}`,
          price: metafieldMap.promo_price,
          discount: metafieldMap.promo_discount,
          countdown,
          image: collection.image?.url,
          handle: collection.handle,
          foodType: getFoodType(collection.title, collection.handle)
        }, index);
      });
    } catch (error) {
      console.error('Error processing collection data:', error);
      return [];
    }
  }

  /**
   * Process product data into promotion cards format
   * @param {Object} productData - Product data from Shopify
   * @returns {Array} - Array of processed promotion objects
   */
  function processProductData(productData) {
    try {
      return productData.nodes.map((product, index) => {
        // Create a map of metafield keys to values for easier access
        const metafieldMap = {};
        if (product.metafields && Array.isArray(product.metafields)) {
          product.metafields.forEach(field => {
            if (field && field.key) {
              metafieldMap[field.key] = field.value;
            }
          });
        }

        // Parse countdown if it exists
        let countdown = null;
        if (metafieldMap.promo_countdown_days || metafieldMap.promo_countdown_hours ||
            metafieldMap.promo_countdown_mins || metafieldMap.promo_countdown_secs) {
          countdown = {
            days: metafieldMap.promo_countdown_days || "00",
            hours: metafieldMap.promo_countdown_hours || "00",
            mins: metafieldMap.promo_countdown_mins || "00",
            secs: metafieldMap.promo_countdown_secs || "00"
          };
        }

        return createPromotionObject({
          id: product.id,
          title: product.title,
          subtitle: metafieldMap.promo_subtitle,
          background: metafieldMap.promo_background,
          textColor: metafieldMap.promo_text_color,
          link: `/products/${product.handle}`,
          price: metafieldMap.promo_price,
          discount: metafieldMap.promo_discount,
          countdown,
          image: product.featuredImage?.url,
          handle: product.handle,
          foodType: getFoodType(product.title, product.handle)
        }, index);
      });
    } catch (error) {
      console.error('Error processing product data:', error);
      return [];
    }
  }

  return (
    <div className="promotion-cards">
      {promotions.map((promo) => (
        <PromotionCard key={promo.id} promo={promo} />
      ))}
    </div>
  );
}

// PropTypes validation removed for ESM compatibility
