import { useState, useEffect, useRef } from 'react';
import { Image } from '@shopify/hydrogen';

/**
 * CompactPosterDisplay Component
 *
 * A modern promotional poster display with overlay functionality
 * similar to email marketing templates
 *
 * @param {Object} props
 * @param {Array} props.posters - Array of poster data objects
 */
export function CompactPosterDisplay({ posters }) {
  const [activePosters, setActivePosters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const carouselRef = useRef(null);

  // Filter active posters on component mount
  useEffect(() => {
    if (!posters || !posters.length) return;
    setActivePosters(posters);
  }, [posters]);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (activePosters.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [activePosters.length, currentIndex]);

  // Handle opening the overlay
  const openPosterOverlay = (poster, e) => {
    if (e) e.stopPropagation();
    setSelectedPoster(poster);
    setIsOverlayOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Handle closing the overlay
  const closePosterOverlay = () => {
    setIsOverlayOpen(false);
    document.body.style.overflow = '';
  };

  // Navigation functions
  const goToPrevious = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex === 0 ? activePosters.length - 1 : prevIndex - 1;
      scrollToItem(newIndex);
      return newIndex;
    });
  };

  const goToNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex === activePosters.length - 1 ? 0 : prevIndex + 1;
      scrollToItem(newIndex);
      return newIndex;
    });
  };

  // Scroll to the active item
  const scrollToItem = (index) => {
    if (!carouselRef.current) return;

    const carousel = carouselRef.current;
    const items = carousel.querySelectorAll('.compact-poster-item');
    if (items.length <= index) return;

    const item = items[index];
    const carouselRect = carousel.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    const scrollLeft = carousel.scrollLeft + (itemRect.left - carouselRect.left) -
                      (carouselRect.width / 2) + (itemRect.width / 2);

    carousel.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  };

  // If no active posters, don't render anything
  if (!activePosters || activePosters.length === 0) {
    return null;
  }

  return (
    <div className="compact-poster-container">
      <div className="compact-poster-header">
        <h3>Special Offers</h3>
      </div>

      <div className="compact-poster-carousel" ref={carouselRef}>
        {activePosters.map((poster, index) => (
          <div
            key={poster.id}
            className={`compact-poster-item ${index === currentIndex ? 'active' : ''}`}
            onClick={(e) => openPosterOverlay(poster, e)}
          >
            <div className="compact-poster-image">
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
            </div>
            <div className="compact-poster-content">
              <h4>{poster.title}</h4>
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="carousel-nav-btn carousel-next"
            onClick={goToNext}
            aria-label="Next poster"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}

      {/* Dots navigation */}
      {activePosters.length > 1 && (
        <div className="compact-poster-dots">
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
      {isOverlayOpen && selectedPoster && (
        <div className="poster-overlay" onClick={closePosterOverlay}>
          <div className="poster-overlay-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-overlay-btn" onClick={closePosterOverlay} aria-label="Close poster">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="poster-overlay-image">
              {selectedPoster.posterImage ? (
                <Image
                  src={selectedPoster.posterImage}
                  alt={selectedPoster.posterImageAlt || selectedPoster.title}
                  className="overlay-img"
                  sizes="90vw"
                />
              ) : (
                <div className="overlay-placeholder">No image available</div>
              )}
            </div>
            <div className="poster-overlay-details">
              <h3>{selectedPoster.title}</h3>
              {selectedPoster.description && (
                <p>{selectedPoster.description}</p>
              )}
              {selectedPoster.expiryDate && (
                <div className="poster-validity">
                  <span>Valid until: {new Date(selectedPoster.expiryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
