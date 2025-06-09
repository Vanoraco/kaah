import { useState, useEffect } from 'react';
import { useRouteLoaderData } from '@remix-run/react';
import { useOnlineSalesStatus } from '~/lib/onlineSalesControl';

/**
 * Site-wide notification banner that displays when online sales are disabled
 * Shows at the top of all pages with critical information about in-store availability
 */
export function OnlineSalesNotificationBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Get root data for online sales status
  const rootData = useRouteLoaderData('root');
  const isOnlineSalesEnabled = useOnlineSalesStatus(rootData);
  
  // Check if banner should be shown
  const shouldShowBanner = !isOnlineSalesEnabled && !isDismissed;

  // Handle session storage for dismissal (optional - can be removed for non-dismissible banner)
  useEffect(() => {
    // Check if user has dismissed the banner in this session
    const dismissed = sessionStorage.getItem('online-sales-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Show/hide banner with animation
  useEffect(() => {
    if (shouldShowBanner) {
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [shouldShowBanner]);

  // Handle banner dismissal (optional)
  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to complete before setting dismissed state
    setTimeout(() => {
      setIsDismissed(true);
      sessionStorage.setItem('online-sales-banner-dismissed', 'true');
    }, 300);
  };

  // Don't render if online sales are enabled or banner is dismissed
  if (isOnlineSalesEnabled || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Banner */}
      <div 
        className={`online-sales-notification-banner ${isVisible ? 'visible' : ''}`}
        role="alert"
        aria-live="polite"
      >
        <div className="banner-content">
          <div className="banner-icon">
            <i className="fas fa-store" aria-hidden="true"></i>
          </div>
          
          <div className="banner-message">
            <span className="banner-title">Online Sales Temporarily Unavailable</span>
            <span className="banner-subtitle">Visit us in-store for immediate purchase</span>
          </div>
          
          <div className="banner-actions">
            <a href="/locations" className="banner-link">
              <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
              Find Store
            </a>
          </div>

          {/* Optional dismiss button - remove if banner should be non-dismissible */}
          <button 
            className="banner-dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            title="Dismiss this notification"
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="banner-decoration banner-decoration-1"></div>
        <div className="banner-decoration banner-decoration-2"></div>
      </div>

      {/* Small spacer to give content a little breathing room */}
      <div
        className={`banner-spacer ${isVisible ? 'active' : ''}`}
        aria-hidden="true"
      ></div>


    </>
  );
}


