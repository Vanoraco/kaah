import { Link } from '@remix-run/react';
import { useEffect, useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { hexToRgb } from './utils/colorUtils';
import { 
  processBannerData, 
  processItemsData, 
  getFallbackItems, 
  DEFAULT_VALUES 
} from './utils/dataUtils';
import MegaSaverBanner from './MegaSaverBanner';
import MegaSaverItem from './MegaSaverItem';

/**
 * MegaSaver Component
 * Displays a grid of special offer products with a banner
 * 
 * @param {Object} props - Component props
 * @param {Object} props.megaSaverItems - Metaobjects data for mega saver items
 * @param {Object} props.megaSaverBanner - Metaobjects data for mega saver banner
 * @param {boolean} [props.showViewMoreButton=true] - Whether to show the "View More" button
 * @returns {JSX.Element} The rendered component
 */
export function MegaSaver({ megaSaverItems, megaSaverBanner, showViewMoreButton = true }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Process the banner data from backend or use fallback data
  const banner = useMemo(() => {
    const defaultBanner = {
      title: "MEGA SAVER",
      subtitle: "Great deals on your favorite products",
      backgroundColor: DEFAULT_VALUES.BANNER_BG_COLOR,
      textColor: DEFAULT_VALUES.BANNER_TEXT_COLOR
    };

    // If we have banner data from the backend, use it
    if (megaSaverBanner?.nodes?.length > 0) {
      return processBannerData(megaSaverBanner);
    }

    return defaultBanner;
  }, [megaSaverBanner]);

  // Process the items data from backend or use fallback data
  const items = useMemo(() => {
    if (megaSaverItems?.nodes?.length > 0) {
      // Use metaobjects if available
      return processItemsData(megaSaverItems);
    }
    
    // Use fallback data if no backend data is available
    return getFallbackItems();
  }, [megaSaverItems]);

  // Add animation effect when component mounts and on scroll
  useEffect(() => {
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
        background: `rgba(${hexToRgb(DEFAULT_VALUES.BANNER_BG_COLOR)}, 0.1)`,
        borderRadius: '50%',
        zIndex: 0
      }}></div>

      <div className="mega-saver-decoration" style={{
        position: 'absolute',
        bottom: '25px',
        right: '25px',
        width: '120px',
        height: '120px',
        background: `rgba(${hexToRgb(DEFAULT_VALUES.BANNER_BG_COLOR)}, 0.05)`,
        borderRadius: '50%',
        zIndex: 0
      }}></div>

      {/* Mega Saver Banner */}
      <MegaSaverBanner banner={banner} />

      {/* Mega Saver Items Grid */}
      <div className="mega-saver-grid">
        {items.map((item) => (
          <MegaSaverItem 
            key={item.id} 
            item={item} 
            isVisible={isVisible} 
          />
        ))}
      </div>

      {/* View More Button */}
      {showViewMoreButton && (
        <div className="mega-saver-view-more-container">
          <Link to="/mega-saver" className="mega-saver-view-more-button">
            <span>View More Mega Savers</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

MegaSaver.propTypes = {
  megaSaverItems: PropTypes.object,
  megaSaverBanner: PropTypes.object,
  showViewMoreButton: PropTypes.bool
};

export default MegaSaver;
