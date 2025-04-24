import {useState, useEffect, useRef} from 'react';
import {Form} from '@remix-run/react';

export function SearchOverlay({isOpen, onClose}) {
  const inputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset search term when overlay is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure animation completes before focusing
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }

    // Add event listener for ESC key to close the overlay
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    // Prevent scrolling when overlay is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e) => {
    if (!searchTerm.trim()) {
      e.preventDefault();
    }
  };

  // Sample recent searches for visual appeal
  const recentSearches = [
    "Summer dresses",
    "Kitchen appliances",
    "Home decor",
    "Bedding",
    "Outdoor furniture"
  ];

  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`search-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="search-overlay-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="search-overlay-close"
          onClick={onClose}
          aria-label="Close search"
        >
          <i className="fas fa-times"></i>
        </button>

        <Form
          method="get"
          action="/search"
          className="search-overlay-form"
          onSubmit={handleSubmit}
        >
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="What are you looking for today?"
            className="search-overlay-input"
          />
          <button type="submit" className="search-overlay-button">
            <i className="fas fa-search"></i> Search
          </button>
        </Form>

        {/* Recent Searches Section */}
        <div className="recent-searches">
          <h3><i className="fas fa-history"></i> Recent Searches</h3>
          <div className="recent-search-items">
            {recentSearches.map((term, index) => (
              <div
                key={index}
                className="recent-search-item"
                onClick={() => handleRecentSearchClick(term)}
              >
                <i className="fas fa-search"></i> {term}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
