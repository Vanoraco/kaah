import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from '@remix-run/react';

// Constants
const DEFAULT_BG_COLORS = ["#1A237E", "#0a5f38", "#5d4037"];
const DEFAULT_DISCOUNTS = [
  "EXCLUSIVE OFFERS UP TO 40% OFF",
  "BUY ONE GET ONE FREE",
  "FREE SHIPPING ON ORDERS OVER ZAR 100"
];
const DEFAULT_INTERVAL = 8000; // Increased from 5000ms to 8000ms for slower transitions
const DEFAULT_FALLBACK_IMAGE = '/images/hero-bg.jpg';

/**
 * Custom hook to manage slideshow state and controls
 * @param {number} totalSlides - Total number of slides
 * @param {number} interval - Interval between slides in ms
 * @returns {Object} Slideshow state and control functions
 */
function useSlideshow(totalSlides, interval = DEFAULT_INTERVAL) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Start the slideshow with cross-fade effect
  const startSlideshow = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        // Use a smoother transition by ensuring the next slide is ready
        // before changing the current slide
        setCurrentSlide(prev => (prev + 1) % totalSlides);
      }
    }, interval);
  }, [totalSlides, interval, isPaused]);

  // Navigate to a specific slide
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    // Reset the interval when manually changing slides
    startSlideshow();
  }, [startSlideshow]);

  // Go to next slide
  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
    startSlideshow();
  }, [totalSlides, startSlideshow]);

  // Go to previous slide
  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
    startSlideshow();
  }, [totalSlides, startSlideshow]);

  // Pause the slideshow
  const pauseSlideshow = useCallback(() => {
    setIsPaused(true);
  }, []);

  // Resume the slideshow
  const resumeSlideshow = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Start the slideshow on mount and cleanup on unmount
  useEffect(() => {
    startSlideshow();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startSlideshow]);

  return {
    currentSlide,
    isPaused,
    goToSlide,
    nextSlide,
    prevSlide,
    pauseSlideshow,
    resumeSlideshow
  };
}

/**
 * Custom hook to process different data sources into a consistent slide format
 * @param {Object} props - Data sources
 * @returns {Array} Processed slides
 */
function useSlideData({ bannerMetaobjects, bannerArticles, bannerProducts, bannerCollections }) {
  return useMemo(() => {
    // Determine which data source to use and process accordingly
    if (bannerMetaobjects?.nodes?.length > 0) {
      return processMetaobjectData(bannerMetaobjects);
    } else if (bannerArticles?.blog?.articles?.nodes?.length > 0) {
      return processArticleData(bannerArticles);
    } else if (bannerProducts?.nodes?.length > 0) {
      return processProductData(bannerProducts);
    } else {
      return processCollectionData(bannerCollections);
    }
  }, [bannerMetaobjects, bannerArticles, bannerProducts, bannerCollections]);
}

/**
 * Process metaobject data into slides
 * @param {Object} metaobjects - Metaobject data
 * @returns {Array} Processed slides
 */
function processMetaobjectData(metaobjects) {
  return metaobjects.nodes.map((metaobject, index) => {
    // Create a map of field keys to values for easier access
    const fieldMap = {};
    metaobject.fields.forEach(field => {
      fieldMap[field.key] = field.value;
      if (field.key === 'image' && field.reference?.image) {
        fieldMap.imageUrl = field.reference.image.url;
      }
    });

    return {
      id: metaobject.id,
      title: fieldMap.title || 'New Arrivals',
      subtitle: fieldMap.subtitle || '',
      discount: fieldMap.discount_text || DEFAULT_DISCOUNTS[index % DEFAULT_DISCOUNTS.length],
      image: fieldMap.imageUrl || DEFAULT_FALLBACK_IMAGE,
      link: fieldMap.link || `/collections/all`,
      bgColor: fieldMap.background_color || DEFAULT_BG_COLORS[index % DEFAULT_BG_COLORS.length]
    };
  });
}

/**
 * Process blog article data into slides
 * @param {Object} articleData - Article data
 * @returns {Array} Processed slides
 */
function processArticleData(articleData) {
  return articleData.blog.articles.nodes.map((article, index) => {
    // Extract subtitle from tags if available
    let subtitle = '';
    if (article.tags?.length > 0) {
      subtitle = article.tags[0];
    }

    // Use excerpt as discount text
    const discount = article.excerpt || DEFAULT_DISCOUNTS[index % DEFAULT_DISCOUNTS.length];

    // Extract background color from tags if available (format: bg:#RRGGBB)
    let bgColor = DEFAULT_BG_COLORS[index % DEFAULT_BG_COLORS.length];
    if (article.tags) {
      const bgTag = article.tags.find(tag => tag.startsWith('bg:'));
      if (bgTag) {
        bgColor = bgTag.substring(3);
      }
    }

    return {
      id: article.id,
      title: article.title,
      subtitle: subtitle,
      discount: discount,
      image: article.image?.url || DEFAULT_FALLBACK_IMAGE,
      link: `/blogs/banner-slides/${article.handle}`,
      bgColor: bgColor
    };
  });
}

/**
 * Process product data into slides
 * @param {Object} productData - Product data
 * @returns {Array} Processed slides
 */
function processProductData(productData) {
  return productData.nodes.map((product, index) => {
    // Create a map of metafield keys to values for easier access
    const metafieldMap = {};
    if (product.metafields) {
      product.metafields.forEach(field => {
        metafieldMap[field.key] = field.value;
      });
    }

    return {
      id: product.id,
      title: product.title,
      subtitle: metafieldMap.banner_subtitle || '',
      discount: metafieldMap.banner_discount || product.description || DEFAULT_DISCOUNTS[index % DEFAULT_DISCOUNTS.length],
      image: product.featuredImage?.url || DEFAULT_FALLBACK_IMAGE,
      link: `/products/${product.handle}`,
      bgColor: metafieldMap.banner_bg_color || DEFAULT_BG_COLORS[index % DEFAULT_BG_COLORS.length]
    };
  });
}

/**
 * Process collection data into slides (or use fallback data)
 * @param {Object} collections - Collection data
 * @returns {Array} Processed slides
 */
function processCollectionData(collections) {
  // If no collections data is available, use fallback data
  if (!collections?.nodes?.length) {
    return [
      {
        id: 1,
        title: "New Arrivals",
        subtitle: "Summer Collection",
        discount: DEFAULT_DISCOUNTS[0],
        image: DEFAULT_FALLBACK_IMAGE,
        link: "/collections/all",
        bgColor: DEFAULT_BG_COLORS[0]
      },
      {
        id: 2,
        title: "Special Deals",
        subtitle: "Limited Time Offer",
        discount: DEFAULT_DISCOUNTS[1],
        image: DEFAULT_FALLBACK_IMAGE,
        link: "/collections/all",
        bgColor: DEFAULT_BG_COLORS[1]
      },
      {
        id: 3,
        title: "Premium Selection",
        subtitle: "Best Sellers",
        discount: DEFAULT_DISCOUNTS[2],
        image: DEFAULT_FALLBACK_IMAGE,
        link: "/collections/all",
        bgColor: DEFAULT_BG_COLORS[2]
      }
    ];
  }

  // Map collection data to slide format
  return collections.nodes.map((collection, index) => {
    // Split the title into main title and subtitle if it contains a pipe character
    const titleParts = collection.title.split('|');
    const title = titleParts[0].trim();
    const subtitle = titleParts.length > 1 ? titleParts[1].trim() : '';

    // Use the collection description as discount text if available
    const discount = collection.description || DEFAULT_DISCOUNTS[index % DEFAULT_DISCOUNTS.length];

    return {
      id: collection.id,
      title: title,
      subtitle: subtitle,
      discount: discount,
      image: collection.image?.url || DEFAULT_FALLBACK_IMAGE,
      link: `/collections/${collection.handle}`,
      bgColor: DEFAULT_BG_COLORS[index % DEFAULT_BG_COLORS.length]
    };
  });
}

/**
 * Slide component for displaying individual slides
 * @param {Object} props - Component props
 * @param {Object} props.slide - Slide data
 * @param {boolean} props.isActive - Whether slide is active
 * @param {Function} props.onMouseEnter - Mouse enter handler
 * @param {Function} props.onMouseLeave - Mouse leave handler
 * @param {string} [props.aspectRatio='1:1'] - Aspect ratio for the image
 * @returns {JSX.Element} Slide component
 */
function Slide({ slide, isActive, onMouseEnter, onMouseLeave, aspectRatio = '1:1' }) {
  return (
    <div
      className={`slide ${isActive ? 'active' : ''}`}
      style={{ backgroundColor: slide.bgColor }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="group"
      aria-roledescription="slide"
      aria-label={slide.title}
    >
      {/* NOW OPEN announcement ribbon */}
      <div className="now-open-banner">
        <i className="fas fa-store"></i>
        <span>NOW OPEN</span>
      </div>

      <SlideContent slide={slide} />
      <SlideImage slide={{ ...slide, isActive }} aspectRatio={aspectRatio} />
    </div>
  );
}

/**
 * SlideContent component for displaying slide content
 */
function SlideContent({ slide }) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: isHovered ? 'white' : '#FFC107',
    color: isHovered ? '#FFC107' : '#1A237E',
    padding: '14px 28px',
    borderRadius: '16px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: isHovered
      ? '10px 10px 20px rgba(255, 193, 7, 0.3), -10px -10px 20px rgba(255, 230, 128, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.6), inset -1px -1px 2px rgba(255, 193, 7, 0.4)'
      : '8px 8px 16px rgba(255, 193, 7, 0.2), -8px -8px 16px rgba(255, 230, 128, 0.7), inset 2px 2px 4px rgba(255, 255, 255, 0.5), inset -2px -2px 4px rgba(255, 193, 7, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
    border: 'none'
  };

  const iconStyle = {
    transition: 'transform 0.3s ease',
    transform: isHovered ? 'translateX(4px)' : 'none'
  };

  return (
    <div className="slide-content">
      <h1>{slide.title}</h1>
      <h2>{slide.subtitle}</h2>

      {/* SPECIAL PROMOTIONS badge */}
      <div className="special-promotions-badge">
        <i className="fas fa-tags"></i>
        <span>SPECIAL PROMOTIONS</span>
      </div>

      <div className="discount-badge">
        <span>{slide.discount}</span>
      </div>

      <Link
        to={slide.link}
        className="slideshow-yellow-button slideshow-shop-btn"
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span style={{ whiteSpace: 'nowrap' }}>Shop now <i className="fas fa-arrow-right" style={iconStyle}></i></span>
      </Link>
    </div>
  );
}

/**
 * Helper function to optimize image URLs
 * @param {string} imageUrl - Original image URL
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @param {string} format - Image format (webp, jpg, etc.)
 * @param {number} quality - Image quality (0-100)
 * @returns {string} Optimized image URL
 */
function getOptimizedImageUrl(imageUrl, width = 800, height = 800, format = 'webp', quality = 75) {
  if (!imageUrl) return DEFAULT_FALLBACK_IMAGE;

  // Check if it's a Shopify image URL
  if (imageUrl.includes('cdn.shopify.com')) {
    // Remove any existing image transformations
    const baseUrl = imageUrl.split('?')[0];

    // Always use WebP for better performance, browsers that don't support it
    // will automatically fall back to the next best format
    const imageFormat = format;

    // Add optimized transformations with progressive loading
    return `${baseUrl}?width=${width}&height=${height}&crop=center&format=${imageFormat}&quality=${quality}&progressive=true`;
  }

  // For non-Shopify images, return the original URL
  return imageUrl;
}

/**
 * SlideImage component for displaying slide image
 * @param {Object} props - Component props
 * @param {Object} props.slide - Slide data
 * @param {string} [props.aspectRatio='1:1'] - Aspect ratio for the image (e.g., '1:1', '4:3', '16:9')
 * @returns {JSX.Element} SlideImage component
 */
function SlideImage({ slide, aspectRatio = '1:1' }) {
  // Handle image loading error
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Calculate padding-bottom based on aspect ratio
  const getPaddingBottom = () => {
    if (aspectRatio === '1:1') return '100%';
    if (aspectRatio === '4:3') return '75%';
    if (aspectRatio === '16:9') return '56.25%';
    if (aspectRatio === '3:4') return '133.33%';
    return '100%'; // Default to 1:1
  };

  // Calculate dimensions based on aspect ratio
  const getDimensions = () => {
    if (aspectRatio === '1:1') return { width: 800, height: 800 };
    if (aspectRatio === '4:3') return { width: 800, height: 600 };
    if (aspectRatio === '16:9') return { width: 800, height: 450 };
    if (aspectRatio === '3:4') return { width: 600, height: 800 };
    return { width: 800, height: 800 }; // Default to 1:1
  };

  const dimensions = getDimensions();

  // Generate responsive image URLs
  const generateSrcSet = () => {
    if (!slide.image || imageError) return '';
    if (!slide.image.includes('cdn.shopify.com')) return slide.image;

    try {
      const baseUrl = slide.image.split('?')[0];
      // Limit the number of sizes to reduce processing
      const sizes = [
        { width: Math.round(dimensions.width / 2), height: Math.round(dimensions.height / 2) },
        { width: dimensions.width, height: dimensions.height },
        { width: Math.round(dimensions.width * 1.5), height: Math.round(dimensions.height * 1.5) }
      ];

      return sizes.map(size => {
        const url = getOptimizedImageUrl(baseUrl, size.width, size.height);
        return `${url} ${size.width}w`;
      }).join(', ');
    } catch (error) {
      // Fallback to single image URL if there's an error
      console.error('Error generating srcset:', error);
      return '';
    }
  };

  // Get optimized image URL for src attribute (fallback)
  const imageUrl = imageError
    ? DEFAULT_FALLBACK_IMAGE
    : getOptimizedImageUrl(slide.image, dimensions.width, dimensions.height);

  // Use a simpler approach for image loading that works with SSR
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || !imageRef.current) return;

    // Set a flag to track if the component is mounted
    let isMounted = true;

    // Simple approach: if the slide is active, ensure the image is loaded
    if (slide.isActive && !imageLoaded && imageRef.current) {
      // Force image loading for active slides
      const img = imageRef.current;
      if (img.complete) {
        // Image is already loaded
        if (isMounted) setImageLoaded(true);
      } else {
        // Image is still loading
        img.onload = () => {
          if (isMounted) setImageLoaded(true);
        };
      }
    }

    return () => {
      // Clean up
      isMounted = false;
    };
  }, [imageLoaded, slide.isActive]);

  return (
    <div className="slide-image">
      <div className="slide-image-container">
        <div
          className="slide-image-wrapper"
          style={{ paddingBottom: getPaddingBottom() }}
        >
          {!imageLoaded && (
            <div className="slide-image-placeholder">
              <div className="loading-spinner"></div>
            </div>
          )}
          <img
            ref={imageRef}
            src={imageUrl}
            srcSet={generateSrcSet()}
            sizes={`(max-width: 576px) 220px, (max-width: 992px) 300px, 400px`}
            width={dimensions.width}
            height={dimensions.height}
            alt={`${slide.title} ${slide.subtitle}`}
            loading="eager"
            fetchpriority="high"
            decoding="async"
            onError={handleImageError}
            onLoad={handleImageLoad}
            className={`slide-image-element ${imageLoaded ? 'loaded' : ''}`}
            style={{
              // Add inline style for better initial loading
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              objectFit: 'cover',
              transition: 'opacity 0.3s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * SlideControls component for navigation dots and arrows
 */
function SlideControls({
  slides,
  currentSlide,
  goToSlide,
  nextSlide,
  prevSlide,
  isPaused = false,
  onTogglePause
}) {
  return (
    <>
      <div className="slideshow-dots" role="tablist">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={index === currentSlide}
            role="tab"
          />
        ))}
      </div>

      <button
        className="slideshow-arrow slideshow-arrow-prev"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Previous slide"
      >
        <i className="fas fa-chevron-left"></i>
      </button>

      <button
        className="slideshow-arrow slideshow-arrow-next"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        aria-label="Next slide"
      >
        <i className="fas fa-chevron-right"></i>
      </button>

      <button
        className="slideshow-autoplay-control"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePause();
        }}
        aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
      >
        <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
      </button>
    </>
  );
}

/**
 * Custom hook for handling touch swipe gestures
 * @param {Function} onSwipeLeft - Callback for left swipe
 * @param {Function} onSwipeRight - Callback for right swipe
 * @returns {Object} Touch event handlers
 */
function useSwipeGestures(onSwipeLeft, onSwipeRight) {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50; // Minimum distance to consider as swipe

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onSwipeLeft();
    } else if (isRightSwipe) {
      onSwipeRight();
    }

    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  }, [onSwipeLeft, onSwipeRight]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}

/**
 * Custom hook to preload images for the slideshow
 * @param {Array} slides - Array of slide data
 * @param {number} currentSlide - Index of the current slide
 * @returns {void}
 */
function useImagePreloader(slides, currentSlide) {
  // Use a ref to track if we're in the browser environment
  const isBrowser = typeof window !== 'undefined';

  useEffect(() => {
    // Skip on server-side rendering
    if (!isBrowser) return;

    if (!slides || slides.length === 0) return;

    // Only preload the next image to reduce bandwidth usage
    const nextSlideIndex = (currentSlide + 1) % slides.length;
    const nextSlide = slides[nextSlideIndex];

    if (nextSlide && nextSlide.image) {
      // Create an image object for immediate caching
      const img = new Image();
      img.src = getOptimizedImageUrl(nextSlide.image, 800, 800);

      // Simple preloading without DOM manipulation
      // This avoids hydration mismatches while still preloading the next image
      const preloadNextImage = () => {
        const nextNextSlideIndex = (nextSlideIndex + 1) % slides.length;
        if (slides[nextNextSlideIndex] && slides[nextNextSlideIndex].image) {
          setTimeout(() => {
            const nextImg = new Image();
            nextImg.src = getOptimizedImageUrl(slides[nextNextSlideIndex].image, 800, 800);
          }, 1000); // Delay loading of the next-next image
        }
      };

      preloadNextImage();
    }

    // No cleanup needed since we're not manipulating the DOM
  }, [slides, currentSlide, isBrowser]);
}

/**
 * Main SlideshowBanner component
 * @param {Object} props - Component props
 * @param {Object} props.bannerCollections - Collections data
 * @param {Object} props.bannerMetaobjects - Metaobjects data
 * @param {Object} props.bannerArticles - Articles data
 * @param {Object} props.bannerProducts - Products data
 * @param {number} [props.interval=5000] - Interval between slides in ms
 * @param {string} [props.aspectRatio='1:1'] - Aspect ratio for slide images
 * @returns {JSX.Element|null} SlideshowBanner component
 */
export function SlideshowBanner({
  bannerCollections,
  bannerMetaobjects,
  bannerArticles,
  bannerProducts,
  interval = DEFAULT_INTERVAL,
  aspectRatio = '1:1'
}) {
  // Process data into slides
  const slides = useSlideData({
    bannerCollections,
    bannerMetaobjects,
    bannerArticles,
    bannerProducts
  });

  // Initialize slideshow controls
  const {
    currentSlide,
    isPaused,
    goToSlide,
    nextSlide,
    prevSlide,
    pauseSlideshow,
    resumeSlideshow
  } = useSlideshow(slides.length, interval);

  // Preload images for the next and previous slides
  useImagePreloader(slides, currentSlide);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  }, [prevSlide, nextSlide]);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Initialize swipe gesture handlers
  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useSwipeGestures(nextSlide, prevSlide);

  // If no slides are available, return null
  if (!slides.length) {
    return null;
  }

  return (
    <div
      className="slideshow-banner"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <Slide
            key={slide.id}
            slide={slide}
            isActive={index === currentSlide}
            onMouseEnter={pauseSlideshow}
            onMouseLeave={resumeSlideshow}
            aspectRatio={aspectRatio} // Use the aspectRatio prop passed to the component
          />
        ))}
      </div>

      <SlideControls
        slides={slides}
        currentSlide={currentSlide}
        goToSlide={goToSlide}
        nextSlide={nextSlide}
        prevSlide={prevSlide}
        isPaused={isPaused}
        onTogglePause={() => isPaused ? resumeSlideshow() : pauseSlideshow()}
      />
    </div>
  );
}
