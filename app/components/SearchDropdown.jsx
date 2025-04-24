import {useState, useEffect, useRef} from 'react';
import {Form} from '@remix-run/react';

export function SearchDropdown({isOpen, onClose}) {
  const inputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }

    // Add event listener for ESC key to close the dropdown
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    // Add event listener for clicks outside to close the dropdown
    const handleClickOutside = (event) => {
      // Check if the click is on the search icon button or its children
      const searchButton = document.querySelector('.search-icon-button');
      const searchIcon = document.querySelector('.search-icon-button i');

      // Don't close if clicking the search button or its icon - the toggle function will handle this
      if (searchButton && (
          searchButton === event.target ||
          searchButton.contains(event.target) ||
          searchIcon === event.target
      )) {
        return;
      }

      // Otherwise close if clicking outside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e) => {
    if (!searchTerm.trim()) {
      e.preventDefault();
    } else {
      onClose();
    }
  };

  return (
    <div className="search-dropdown-container" ref={dropdownRef}>
      <div className={`search-dropdown ${isOpen ? 'active' : ''}`}>
        <h4 className="search-dropdown-title">Find Your Perfect Product</h4>
        <Form
          method="get"
          action="/search"
          className="search-dropdown-form"
          onSubmit={handleSubmit}
        >
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="What are you looking for today?"
            className="search-dropdown-input"
          />
          <button type="submit" className="search-dropdown-button">
            <i className="fas fa-search"></i>
          </button>
        </Form>
        <div className="search-dropdown-hint">
          <i className="fas fa-info-circle"></i>
          <span>Press Enter to search or ESC to close</span>
        </div>
      </div>
    </div>
  );
}
