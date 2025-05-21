import {useEffect, useState, useRef} from 'react';
import {Link} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {PosterOverlay} from '~/components/PosterOverlay';

/**
 * Promotional Poster Carousel Component
 *
 * Displays a modern email-template style carousel of promotional posters
 *
 * @param {Object} props
 * @param {Array} props.posters - Array of processed poster data
 */
export function PromotionalPosterCarousel({posters}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activePosters, setActivePosters] = useState([]);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const carouselRef = useRef(null);

  // Filter active posters and enhance data on component mount
  useEffect(() => {
    if (!posters || !posters.length) return;

    // Process posters to ensure they have the right format for the overlay
    const processedPosters = posters.map(poster => {
      // Extract discount percentage from title or description if not explicitly provided
      let discountPercentage = poster.discountPercentage;
      if (!discountPercentage) {
        const titleMatch = poster.title && poster.title.match(/(\d+)%/);
        const descMatch = poster.description && poster.description.match(/(\d+)%/);
        if (titleMatch) {
          discountPercentage = parseInt(titleMatch[1]);
        } else if (descMatch) {
          discountPercentage = parseInt(descMatch[1]);
        } else {
          discountPercentage = 10; // Default value
        }
      }

      // Create a description if not provided
      let description = poster.description;
      if (!description && discountPercentage) {
        description = `Save ${discountPercentage}% on all qualifying orders`;
      }

      // Set badge text
      const badgeText = poster.badgeText || "LIMITED TIME SPECIAL OFFER";

      // Extract promo code if available or use a default for season sales
      const promoCode = poster.promoCode ||
        (poster.title && poster.title.toUpperCase().includes("SEASON") ? "NEWSEASON10" : "");

      return {
        ...poster,
        discountPercentage,
        description,
        badgeText,
        promoCode
      };
    });

    // Always show all posters for now (we can add date filtering back later)
    setActivePosters(processedPosters);
  }, [posters]);

  // Auto-rotate carousel every 5 seconds with rotation effect
  useEffect(() => {
    if (activePosters.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [activePosters.length, currentIndex]);

  // Handle manual navigation with rotation effect
  const goToPrevious = (e) => {
    if (e) e.stopPropagation();

    // Add rotation animation class
    if (carouselRef.current) {
      carouselRef.current.classList.add('rotating-left');
      setTimeout(() => {
        carouselRef.current.classList.remove('rotating-left');
      }, 500);
    }

    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex === 0 ? activePosters.length - 1 : prevIndex - 1;
      scrollToItem(newIndex);
      return newIndex;
    });
  };

  const goToNext = (e) => {
    if (e) e.stopPropagation();

    // Add rotation animation class
    if (carouselRef.current) {
      carouselRef.current.classList.add('rotating-right');
      setTimeout(() => {
        carouselRef.current.classList.remove('rotating-right');
      }, 500);
    }

    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex === activePosters.length - 1 ? 0 : prevIndex + 1;
      scrollToItem(newIndex);
      return newIndex;
    });
  };

  // Update the active item in the circular carousel
  const scrollToItem = (index) => {
    if (!carouselRef.current) return;

    const carousel = carouselRef.current;
    const items = carousel.querySelectorAll('.promotional-poster-item');
    if (items.length <= index) return;

    // Update active class - no need to manually set transforms as CSS handles it
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // For circular carousel, we don't need to scroll horizontally
    // as items are positioned absolutely with transforms
  };

  // Handle opening the overlay
  const openPosterOverlay = (poster, e) => {
    if (e) e.stopPropagation();
    setSelectedPoster(poster);
    setIsOverlayOpen(true);
  };

  // Handle closing the overlay
  const closePosterOverlay = () => {
    setIsOverlayOpen(false);
  };

  // If no active posters, don't render anything
  if (!activePosters || activePosters.length === 0) {
    return null;
  }

  return (
    <div className="promotional-poster-container">
      <div className="promotional-poster-header">
        <h2>Special Offers</h2>

      </div>

      <div className="promotional-poster-carousel" ref={carouselRef}>
        {activePosters.map((poster, index) => (
          <div
            key={poster.id}
            className={`promotional-poster-item ${index === currentIndex ? 'active' : ''}`}
            onClick={(e) => openPosterOverlay(poster, e)}
          >
            <div className="promotional-poster-image">
              {poster.posterImage ? (
                <Image
                  src={poster.posterImage}
                  alt={poster.posterImageAlt || poster.title}
                  className="poster-img"
                  sizes="(min-width: 768px) 250px, 100vw"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className="poster-placeholder">No image</div>
              )}

              {poster.expiryDate && (
                <div className="poster-expiry-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" className="expiry-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Until {new Date(poster.expiryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <div className="promotional-poster-content">
              <div className="promotional-poster-badge">Limited Offer</div>
              <h3>{poster.title}</h3>
              {poster.description && (
                <p>{poster.description}</p>
              )}
              <button className="view-poster-btn">
                View Offer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {activePosters.length > 1 && (
        <>
          <button
            className="carousel-nav-btn carousel-prev"
            onClick={goToPrevious}
            aria-label="Previous poster"
          >
            <svg className="carousel-nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="carousel-nav-btn carousel-next"
            onClick={goToNext}
            aria-label="Next poster"
          >
            <svg className="carousel-nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}

      {/* Dots navigation */}
      {activePosters.length > 1 && (
        <div className="promotional-poster-dots">
          {activePosters.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
                scrollToItem(index);
              }}
              aria-label={`Go to poster ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Poster Overlay */}
      <PosterOverlay
        isOpen={isOverlayOpen}
        onClose={closePosterOverlay}
        poster={selectedPoster}
      />
    </div>
  );
}
