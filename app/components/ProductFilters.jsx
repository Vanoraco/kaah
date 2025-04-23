import {Form, useNavigate} from '@remix-run/react';
import {useEffect, useState, useRef} from 'react';
import {Slider} from '~/components/Slider';
import {CustomSelect} from '~/components/CustomSelect';

export function ProductFilters({collections, filters, searchParams, allTags}) {
  const navigate = useNavigate();
  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');
  const [selectedCategories, setSelectedCategories] = useState(filters.selectedCategories || []);
  const [selectedTags, setSelectedTags] = useState(filters.selectedTags || []);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(filters.showOnlyAvailable || false);
  const [sortOption, setSortOption] = useState(filters.sortOption || 'default');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [priceRange, setPriceRange] = useState([filters.minPrice ? parseInt(filters.minPrice) : 0, filters.maxPrice ? parseInt(filters.maxPrice) : 1000]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const filterRef = useRef(null);

  // Handle outside click to close mobile filters
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target) && window.innerWidth <= 768) {
        setIsFilterVisible(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Apply filters when form is submitted
  const applyFilters = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setLoadingProgress(0);

    const params = new URLSearchParams(searchParams);

    // Clear existing filter params
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('category');
    params.delete('tag');
    params.delete('available');
    params.delete('sort');

    // Add new filter params
    if (priceRange[0] > 0) params.append('minPrice', priceRange[0].toString());
    if (priceRange[1] < 1000) params.append('maxPrice', priceRange[1].toString());

    selectedCategories.forEach(category => {
      params.append('category', category);
    });

    selectedTags.forEach(tag => {
      params.append('tag', tag);
    });

    if (showOnlyAvailable) {
      params.append('available', 'true');
    }

    if (sortOption !== 'default') {
      params.append('sort', sortOption);
    }

    // Close mobile filters after applying
    if (window.innerWidth <= 768) {
      setIsFilterVisible(false);
    }

    // Simulate loading progress (would be replaced by actual loading progress in a real app)
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 200);

    navigate(`/products?${params.toString()}`);

    // Simulate loading state (will be replaced by actual loading state in a real app)
    setTimeout(() => {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }, 1200);
  };

  // Handle category checkbox changes
  const handleCategoryChange = (handle, checked) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, handle]);
    } else {
      setSelectedCategories(selectedCategories.filter(cat => cat !== handle));
    }
  };

  // Handle tag checkbox changes
  const handleTagChange = (tag, checked) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    }
  };

  // Handle price range slider change
  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
    setMinPrice(newRange[0].toString());
    setMaxPrice(newRange[1].toString());
  };

  // Reset all filters
  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategories([]);
    setSelectedTags([]);
    setShowOnlyAvailable(false);
    setSortOption('default');
    setPriceRange([0, 1000]);
    navigate('/products');
  };

  // Reset individual filter sections
  const resetPriceFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setPriceRange([0, 1000]);
  };

  const resetCategoryFilter = () => {
    setSelectedCategories([]);
  };

  const resetTagFilter = () => {
    setSelectedTags([]);
  };

  const resetAvailabilityFilter = () => {
    setShowOnlyAvailable(false);
  };

  const resetSortOption = () => {
    setSortOption('default');
  };

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className="mobile-filter-toggle">
        <button
          type="button"
          className="filter-toggle-button"
          onClick={() => setIsFilterVisible(!isFilterVisible)}
          aria-expanded={isFilterVisible}
          aria-controls="product-filters"
        >
          <i className="fas fa-filter"></i> {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Sort Dropdown for Mobile */}
        <div className="mobile-sort-dropdown">
          <CustomSelect
            options={[
              { value: 'default', label: 'Sort by' },
              { value: 'price-asc', label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
              { value: 'newest', label: 'Newest' },
              { value: 'title-asc', label: 'Name: A-Z' },
              { value: 'title-desc', label: 'Name: Z-A' }
            ]}
            value={sortOption}
            onChange={setSortOption}
            placeholder="Sort by"
          />
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="filter-loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-message">
            <p>Applying filters...</p>
            <div className="loading-status">
              Finding the perfect products for you
            </div>
            <div className="loading-progress-container">
              <div
                className="loading-progress-bar"
                style={{ width: `${loadingProgress}%` }}
              ></div>
              <div className="loading-progress-text">{Math.round(loadingProgress)}%</div>
            </div>
          </div>
        </div>
      )}

      <div
        id="product-filters"
        ref={filterRef}
        className={`product-filters ${isFilterVisible ? 'visible' : ''}`}
      >
        <div className="filter-header">
          <h2>Filters</h2>
          <button
            type="button"
            className="reset-filters-button"
            onClick={resetFilters}
          >
            Reset All
          </button>
          <button
            type="button"
            className="close-filters-button mobile-only"
            onClick={() => setIsFilterVisible(false)}
            aria-label="Close filters"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <Form onSubmit={applyFilters}>
          {/* Sort Options (Desktop) */}
          <div className="filter-section desktop-only">
            <div className="filter-section-header">
              <h3 className="filter-title">
                <i className="fas fa-sort filter-icon"></i>
                Sort By
              </h3>
              {sortOption !== 'default' && (
                <button
                  type="button"
                  className="clear-section-button"
                  onClick={resetSortOption}
                  aria-label="Clear sort options"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <div className="sort-options">
              <CustomSelect
                options={[
                  { value: 'default', label: 'Default' },
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                  { value: 'newest', label: 'Newest' },
                  { value: 'title-asc', label: 'Name: A-Z' },
                  { value: 'title-desc', label: 'Name: Z-A' }
                ]}
                value={sortOption}
                onChange={setSortOption}
                placeholder="Select sorting"
              />
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <div className="filter-section-header">
              <h3 className="filter-title">
                <i className="fas fa-dollar-sign filter-icon"></i>
                Price Range
              </h3>
              {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                <button
                  type="button"
                  className="clear-section-button"
                  onClick={resetPriceFilter}
                  aria-label="Clear price filter"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {/* Price Range Slider */}
            <div className="price-range-slider">
              <Slider
                min={0}
                max={1000}
                step={10}
                value={priceRange}
                onChange={handlePriceRangeChange}
              />
            </div>

            {/* Legacy Price Inputs (as fallback) */}
            <div className="price-range-inputs">
              <div className="price-input-group">
                <label htmlFor="minPrice" className="price-label">Min Price:</label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    if (e.target.value) {
                      setPriceRange([parseInt(e.target.value), priceRange[1]]);
                    }
                  }}
                  min="0"
                  max={priceRange[1]}
                />
              </div>
              <div className="price-input-group">
                <label htmlFor="maxPrice" className="price-label">Max Price:</label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    if (e.target.value) {
                      setPriceRange([priceRange[0], parseInt(e.target.value)]);
                    }
                  }}
                  min={priceRange[0]}
                />
              </div>
            </div>
          </div>

          {/* Availability Filter */}
          <div className="filter-section">
            <div className="filter-section-header">
              <h3 className="filter-title">
                <i className="fas fa-check-circle filter-icon"></i>
                Availability
              </h3>
              {showOnlyAvailable && (
                <button
                  type="button"
                  className="clear-section-button"
                  onClick={resetAvailabilityFilter}
                  aria-label="Clear availability filter"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <div className="availability-option">
              <input
                type="checkbox"
                id="availability"
                name="availability"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              />
              <label htmlFor="availability">In stock only</label>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="filter-section">
            <div className="filter-section-header">
              <h3 className="filter-title">
                <i className="fas fa-th-large filter-icon"></i>
                Categories
              </h3>
              {selectedCategories.length > 0 && (
                <button
                  type="button"
                  className="clear-section-button"
                  onClick={resetCategoryFilter}
                  aria-label="Clear category filters"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <div className="categories-list">
              {collections.nodes.map((collection) => (
                <div className="category-checkbox" key={collection.id}>
                  <input
                    type="checkbox"
                    id={`category-${collection.handle}`}
                    name="category"
                    value={collection.handle}
                    checked={selectedCategories.includes(collection.handle)}
                    onChange={(e) => handleCategoryChange(collection.handle, e.target.checked)}
                  />
                  <label htmlFor={`category-${collection.handle}`}>
                    {collection.title}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {allTags && allTags.length > 0 && (
            <div className="filter-section">
              <div className="filter-section-header">
                <h3 className="filter-title">
                  <i className="fas fa-tags filter-icon"></i>
                  Product Tags
                </h3>
                {selectedTags.length > 0 && (
                  <button
                    type="button"
                    className="clear-section-button"
                    onClick={resetTagFilter}
                    aria-label="Clear tag filters"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <div className="tags-list">
                {allTags.map((tag) => (
                  <div className="tag-checkbox" key={tag}>
                    <input
                      type="checkbox"
                      id={`tag-${tag}`}
                      name="tag"
                      value={tag}
                      checked={selectedTags.includes(tag)}
                      onChange={(e) => handleTagChange(tag, e.target.checked)}
                    />
                    <label htmlFor={`tag-${tag}`}>
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply Filters Button */}
          <button
            type="submit"
            className={`apply-filters-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="button-spinner"></span>
                <span className="button-text">Processing...</span>
              </>
            ) : (
              <span className="button-text">Apply Filters</span>
            )}
          </button>
        </Form>
      </div>
    </>
  );
}
