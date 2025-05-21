import {useEffect, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';

/**
 * Poster Overlay Component
 *
 * Displays a promotional poster in a full-screen overlay when clicked
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the overlay is open
 * @param {Function} props.onClose - Function to close the overlay
 * @param {Object} props.poster - The poster data to display
 * @returns {JSX.Element} The poster overlay component
 */
export function PosterOverlay({isOpen, onClose, poster}) {
  const overlayRef = useRef(null);
  const imageContainerRef = useRef(null);
  const imageRef = useRef(null);
  const zoomContainerRef = useRef(null);
  const zoomImageRef = useRef(null);
  const [isZooming, setIsZooming] = useState(false);

  // Prevent scrolling when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Handle zoom functionality
  const handleMouseMove = (e) => {
    if (!imageRef.current || !zoomContainerRef.current || !zoomImageRef.current || !imageContainerRef.current) return;

    const container = imageContainerRef.current;
    const zoomContainer = zoomContainerRef.current;
    const zoomImage = zoomImageRef.current;
    const image = imageRef.current;

    // Get container and image dimensions
    const containerRect = container.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    // Calculate mouse position relative to container
    const x = e.clientX - imageRect.left;
    const y = e.clientY - imageRect.top;

    // Calculate position as percentage
    const xPercent = (x / imageRect.width);
    const yPercent = (y / imageRect.height);

    // Calculate zoom level
    const zoomLevel = 3;

    // Set the background position for the zoomed image
    zoomImage.style.backgroundImage = `url(${poster.posterImage})`;
    zoomImage.style.backgroundSize = `${imageRect.width * zoomLevel}px ${imageRect.height * zoomLevel}px`;

    // Calculate the position to show the correct part of the image in the zoom container
    const zoomX = xPercent * (imageRect.width * zoomLevel - zoomContainer.offsetWidth);
    const zoomY = yPercent * (imageRect.height * zoomLevel - zoomContainer.offsetHeight);
    zoomImage.style.backgroundPosition = `-${zoomX}px -${zoomY}px`;

    // Show the zoom container
    zoomContainer.classList.add('visible');
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    if (zoomContainerRef.current) {
      zoomContainerRef.current.classList.remove('visible');
    }
    setIsZooming(false);
  };

  // Add event listener for ESC key to close the overlay
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!poster) return null;

  // Get text content from the metaobject
  const badgeText = poster.badgeText || "LIMITED TIME SPECIAL OFFER";
  const title = poster.title || "NEW SEASON SALE!";
  const description = poster.description || "Save 10% on all qualifying orders";
  const promoCode = poster.promoCode || "";

  return (
    <div
      className={`poster-overlay ${isOpen ? 'active' : ''}`}
      aria-modal={isOpen}
      role="dialog"
      aria-label={`${poster.title} Promotional Poster`}
    >
      <div
        className="poster-overlay-content"
        onClick={(e) => e.stopPropagation()}
        ref={overlayRef}
      >
        <button
          className="poster-overlay-close"
          onClick={onClose}
          aria-label="Close poster"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="poster-overlay-split">
          <div
            className="poster-overlay-image-container"
            ref={imageContainerRef}
          >
            {poster.posterImage ? (
              <div
                className="poster-overlay-image-wrapper"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <Image
                  src={poster.posterImage}
                  alt={poster.posterImageAlt || poster.title}
                  className="poster-overlay-image"
                  sizes="50vw"
                  loading="eager"
                  ref={imageRef}
                />
                <div className="zoom-container" ref={zoomContainerRef}>
                  <div className="zoom-image" ref={zoomImageRef}></div>
                </div>
              </div>
            ) : (
              <div className="poster-overlay-placeholder">
                <span>No image available</span>
              </div>
            )}
          </div>

          <div className="poster-overlay-details">
            <div className="poster-overlay-badge">{badgeText}</div>

            <h2 className="poster-overlay-title">
              {title.includes(" ") && title.split(" ").length > 2 ? (
                <>
                  {title.split(" ").slice(0, 2).join(" ")}<br />
                  {title.split(" ").slice(2).join(" ")}
                </>
              ) : title.includes(" ") ? (
                <>
                  {title.split(" ")[0]}<br />
                  {title.split(" ").slice(1).join(" ")}
                </>
              ) : (
                title
              )}
            </h2>

            <p className="poster-overlay-description">
              {description}
            </p>

            {promoCode && (
              <div className="poster-overlay-promo-code">
                {promoCode}
              </div>
            )}

            <div className="poster-overlay-social">
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.6,5.82C15.76,5.04 15.21,3.78 15.21,2.5H12.53V16.07C12.53,17.17 11.7,18 10.6,18C9.5,18 8.67,17.17 8.67,16.07C8.67,14.97 9.5,14.14 10.6,14.14C10.89,14.14 11.17,14.22 11.42,14.37V11.51C11.15,11.45 10.86,11.42 10.6,11.42C8,11.42 5.89,13.53 5.89,16.14C5.89,18.75 8,20.86 10.6,20.86C13.2,20.86 15.3,18.75 15.3,16.14V9.14C16.41,9.96 17.84,10.42 19.21,10.42V7.71C19.21,7.71 17.72,7.76 16.6,5.82M22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12Z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Twitter/X">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Threads">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
