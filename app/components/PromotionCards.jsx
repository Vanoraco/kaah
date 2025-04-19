import { Link } from '@remix-run/react';
import { useEffect } from 'react';

// Default background colors for promotion cards if not specified in backend data
const DEFAULT_BG_COLORS = ["#2980b9", "#000000", "#f1c40f"];

// Default food emojis for each card type
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

export function PromotionCards({ promotionMetaobjects, promotionCollections, promotionProducts }) {
  // Use effect to ensure discount badges are visible after component mounts
  useEffect(() => {
    // Force update of discount badges after component mounts
    setTimeout(() => {
      const discountBadges = document.querySelectorAll('.discount-badge');
      console.log('Found discount badges:', discountBadges.length);

      discountBadges.forEach(badge => {
        // Force the badge to be visible
        badge.style.display = 'inline-block';
        badge.style.visibility = 'visible';
        badge.style.opacity = '1';
        console.log('Forced visibility on badge:', badge.id, badge.textContent);
      });
    }, 100); // Small delay to ensure DOM is ready
  }, []);

  // Process the data from backend or use fallback data
  let promotions;

  if (promotionMetaobjects && promotionMetaobjects.nodes && promotionMetaobjects.nodes.length > 0) {
    // Use metaobjects if available (highest priority)
    promotions = processMetaobjectData(promotionMetaobjects);
  } else if (promotionCollections && promotionCollections.nodes && promotionCollections.nodes.length > 0) {
    // Use collections if available (second priority)
    promotions = processCollectionData(promotionCollections);
  } else if (promotionProducts && promotionProducts.nodes && promotionProducts.nodes.length > 0) {
    // Use products if available (third priority)
    promotions = processProductData(promotionProducts);
  } else {
    // Use fallback data if no backend data is available
    promotions = [
    {
      id: 1,
      title: "Sale of the Month",
      subtitle: "BEST DEALS",
      background: "#2980b9", // Blue background
      textColor: "white",
      link: "/collections/monthly-deals",
      countdown: {
        days: "00",
        hours: "02",
        mins: "18",
        secs: "46"
      },
      // Food items for the first card
      foodItems: [
        { name: "avocado", emoji: "🥑", size: "60px", top: "60%", left: "70%" },
        { name: "tomato", emoji: "🍅", size: "55px", top: "40%", left: "80%" },
        { name: "broccoli", emoji: "🥦", size: "65px", top: "70%", left: "60%" },
        { name: "cucumber", emoji: "🥒", size: "58px", top: "50%", left: "75%" },
        { name: "kiwi", emoji: "🥝", size: "50px", top: "30%", left: "85%" },
      ]
    },
    {
      id: 2,
      title: "Low-Fat Meat",
      subtitle: "85% FAT FREE",
      background: "#000000", // Black background
      textColor: "white",
      link: "/collections/meat",
      price: "$79.99",
      // Food items for the second card
      foodItems: [
        { name: "meat", emoji: "🥩", size: "70px", top: "50%", left: "75%" },
        { name: "chicken", emoji: "🍗", size: "60px", top: "65%", left: "65%" },
        { name: "steak", emoji: "🥓", size: "55px", top: "40%", left: "80%" },
      ]
    },
    {
      id: 3,
      title: "100% Fresh Fruit",
      subtitle: "SUMMER SALE",
      background: "#f1c40f", // Yellow background
      textColor: "black",
      link: "/collections/fruits",
      discount: "64% OFF",
      // Food items for the third card
      foodItems: [
        { name: "apple", emoji: "🍎", size: "55px", top: "40%", left: "75%" },
        { name: "banana", emoji: "🍌", size: "60px", top: "60%", left: "80%" },
        { name: "orange", emoji: "🍊", size: "50px", top: "50%", left: "70%" },
        { name: "grapes", emoji: "🍇", size: "55px", top: "45%", left: "85%" },
        { name: "strawberry", emoji: "🍓", size: "45px", top: "65%", left: "65%" },
      ]
    }
  ];
  }

  // Process metaobject data into promotion cards format
  function processMetaobjectData(metaobjectData) {
    console.log('Processing metaobject data:', metaobjectData);
    return metaobjectData.nodes.map((metaobject, index) => {
      // Create a map of field keys to values for easier access
      const fieldMap = {};

      // Debug: Log all fields to see what's coming from the API
      console.log('Metaobject fields:', metaobject.fields);

      if (metaobject.fields && Array.isArray(metaobject.fields)) {
        metaobject.fields.forEach(field => {
          if (field && field.key) {
            console.log('Processing field:', field.key, field);

            // Handle image field with special key format 'promotion_card.image_'
            if (field.key.includes('image_') && field.reference && field.reference.image) {
              console.log('Found image field:', field.key, field.reference.image.url);
              fieldMap['image'] = field.reference.image.url;
            }
            // Handle discount field with special key format 'promotion_card.discount'
            else if (field.key === 'discount' || field.key.includes('discount')) {
              console.log('Found discount field:', field.key, field.value);
              fieldMap['discount'] = field.value;
            }
            // Handle other reference fields
            else if (field.reference && field.reference.image) {
              console.log('Found other image reference:', field.key, field.reference.image.url);
              fieldMap[field.key] = field.reference.image.url;
            }
            // Handle regular fields
            else {
              fieldMap[field.key] = field.value;
            }
          }
        });
      }

      // Debug: Log the final fieldMap
      console.log('Final fieldMap:', fieldMap);

      // Determine which food emoji set to use based on the metaobject handle or title
      let foodType = 'vegetables';
      const handle = metaobject.handle ? metaobject.handle.toLowerCase() : '';
      if (handle.includes('meat') || fieldMap.title?.toLowerCase().includes('meat')) {
        foodType = 'meat';
      } else if (handle.includes('fruit') || fieldMap.title?.toLowerCase().includes('fruit')) {
        foodType = 'fruits';
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

      // Debug the discount field specifically
      if (fieldMap.discount) {
        console.log('Found discount in fieldMap:', fieldMap.discount);
      }

      const promoData = {
        id: metaobject.id,
        title: fieldMap.title || `Promotion ${index + 1}`,
        subtitle: fieldMap.subtitle || '',
        background: fieldMap.background_color || DEFAULT_BG_COLORS[index % DEFAULT_BG_COLORS.length],
        textColor: fieldMap.text_color || 'white',
        link: fieldMap.link || `/collections/all`,
        price: fieldMap.price || null,
        discount: fieldMap.discount || null,
        countdown: countdown,
        image: fieldMap.image || null,
        foodItems: fieldMap.image ? null : DEFAULT_FOOD_EMOJIS[foodType] // Use food emojis only if no image is provided
      };

      // Debug the final promo object
      console.log('Final promo object discount:', promoData.discount);

      return promoData;
    });
  }

  // Process collection data into promotion cards format
  function processCollectionData(collectionData) {
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

      // Determine which food emoji set to use based on the collection title or handle
      let foodType = 'vegetables';
      const title = collection.title.toLowerCase();
      const handle = collection.handle.toLowerCase();
      if (title.includes('meat') || handle.includes('meat')) {
        foodType = 'meat';
      } else if (title.includes('fruit') || handle.includes('fruit')) {
        foodType = 'fruits';
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

      // Use collection image if available
      const image = collection.image ? collection.image.url : null;

      return {
        id: collection.id,
        title: collection.title,
        subtitle: metafieldMap.promo_subtitle || '',
        background: metafieldMap.promo_background || DEFAULT_BG_COLORS[index % DEFAULT_BG_COLORS.length],
        textColor: metafieldMap.promo_text_color || 'white',
        link: `/collections/${collection.handle}`,
        price: metafieldMap.promo_price || null,
        discount: metafieldMap.promo_discount || null,
        countdown: countdown,
        image: image,
        foodItems: image ? null : DEFAULT_FOOD_EMOJIS[foodType] // Use food emojis only if no image is provided
      };
    });
  }

  // Process product data into promotion cards format
  function processProductData(productData) {
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

      // Determine which food emoji set to use based on the product title or handle
      let foodType = 'vegetables';
      const title = product.title.toLowerCase();
      const handle = product.handle.toLowerCase();
      if (title.includes('meat') || handle.includes('meat')) {
        foodType = 'meat';
      } else if (title.includes('fruit') || handle.includes('fruit')) {
        foodType = 'fruits';
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

      // Use product featured image if available
      const image = product.featuredImage ? product.featuredImage.url : null;

      return {
        id: product.id,
        title: product.title,
        subtitle: metafieldMap.promo_subtitle || '',
        background: metafieldMap.promo_background || DEFAULT_BG_COLORS[index % DEFAULT_BG_COLORS.length],
        textColor: metafieldMap.promo_text_color || 'white',
        link: `/products/${product.handle}`,
        price: metafieldMap.promo_price || null,
        discount: metafieldMap.promo_discount || null,
        countdown: countdown,
        image: image,
        foodItems: image ? null : DEFAULT_FOOD_EMOJIS[foodType] // Use food emojis only if no image is provided
      };
    });
  }

  return (
    <div className="promotion-cards">
      {promotions.map((promo) => (
        <div
          key={promo.id}
          className="promo-card"
          style={{
            backgroundColor: promo.background,
            color: promo.textColor
          }}
        >
          <div className="promo-content">
            <span className="promo-subtitle">{promo.subtitle}</span>
            <h2 className="promo-title">{promo.title}</h2>

            {promo.countdown && (
              <div className="countdown">
                <div className="countdown-item">
                  <span className="countdown-value">{promo.countdown.days}</span>
                  <span className="countdown-label">DAYS</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{promo.countdown.hours}</span>
                  <span className="countdown-label">HOURS</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{promo.countdown.mins}</span>
                  <span className="countdown-label">MINS</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{promo.countdown.secs}</span>
                  <span className="countdown-label">SECS</span>
                </div>
              </div>
            )}

            {promo.price && (
              <div className="promo-price">
                <span>Started at</span> <strong>{promo.price}</strong>
              </div>
            )}

            {/* Render discount section */}
            <div className="promo-discount">
              {typeof promo.discount === 'string' && promo.discount.trim() !== '' && (
                <>
                  <span>Up to</span>
                  <span
                    className="discount-badge"
                    id={`discount-${promo.id}`}
                    data-discount={promo.discount}
                    style={{
                      display: 'inline-block',
                      visibility: 'visible',
                      opacity: 1,
                      position: 'relative',
                      zIndex: 10
                    }}
                  >
                    {promo.discount}
                  </span>
                  {/* Add a debug message to check if discount is being rendered */}
                  {console.log('Rendering discount with ID:', `discount-${promo.id}`, promo.discount)}
                </>
              )}
            </div>

            {/* Shop Now Button - Ultra simplified to prevent flickering */}
            <a
              href={promo.link}
              className="shop-now-btn promo-btn"
              style={{
                display: 'inline-block',
                visibility: 'visible',
                opacity: 1,
                position: 'relative',
                zIndex: 20,
                transition: 'none',
                animation: 'none',
                transform: 'none',
                backgroundColor: 'white',
                color: '#333',
                textDecoration: 'none',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50px',
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '25px',
                alignSelf: 'flex-start'
              }}
            >
              Shop Now <i className="fas fa-arrow-right" style={{marginLeft: '8px'}}></i>
            </a>
          </div>

          <div className="promo-image">
            {promo.image ? (
              <div className="promo-image-container">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="promo-actual-image"
                  loading="eager"
                  onLoad={(e) => {
                    // Add a class when the image is loaded to trigger animations
                    e.target.classList.add('image-loaded');
                  }}
                />
              </div>
            ) : (
              promo.foodItems && promo.foodItems.map((item, index) => (
                <div
                  key={index}
                  className="food-emoji"
                  style={{
                    position: 'absolute',
                    fontSize: item.size,
                    top: item.top,
                    left: item.left,
                    transform: 'rotate(' + (Math.random() * 20 - 10) + 'deg)',
                    zIndex: 1,
                    textShadow: '0 2px 10px rgba(0,0,0,0.15)'
                  }}
                >
                  {item.emoji}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
