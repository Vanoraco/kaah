import {Form, useNavigate} from '@remix-run/react';
import {useEffect, useState, useRef} from 'react';
import {Slider} from '~/components/Slider';
import {CustomSelect} from '~/components/CustomSelect';

export function CollectionFilters({filters, searchParams, allTags, collectionHandle}) {
  const navigate = useNavigate();
  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');
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
    params.delete('tag');
    params.delete('available');
    params.delete('sort');

    // Add new filter params
    if (priceRange[0] > 0) params.append('minPrice', priceRange[0].toString());
    if (priceRange[1] < 1000) params.append('maxPrice', priceRange[1].toString());

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

    navigate(`/collections/${collectionHandle}?${params.toString()}`);

    // Simulate loading state (will be replaced by actual loading state in a real app)
    setTimeout(() => {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }, 1200);
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
    setSelectedTags([]);
    setShowOnlyAvailable(false);
    setSortOption('default');
    setPriceRange([0, 1000]);
    navigate(`/collections/${collectionHandle}`);
  };

  // Reset individual filter sections
  const resetPriceFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setPriceRange([0, 1000]);
  };

  const resetTagFilter = () => {
    setSelectedTags([]);
  };

  const resetAvailabilityFilter = () => {
    setShowOnlyAvailable(false);
  };

  return (
    <>
      <div className="mobile-filter-toggle">
        <button
          type="button"
          className="filter-toggle-button"
          onClick={() => setIsFilterVisible(true)}
        >
          <i className="fas fa-filter"></i> Filter Products
        </button>
        <div className="mobile-sort-dropdown">
          <CustomSelect
            options={[
              { value: 'default', label: 'Sort by: Featured' },
              { value: 'price-asc', label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
              { value: 'title-asc', label: 'Name: A-Z' },
              { value: 'title-desc', label: 'Name: Z-A' },
              { value: 'created-desc', label: 'Newest' }
            ]}
            value={sortOption}
            onChange={(value) => {
              setSortOption(value);
              const params = new URLSearchParams(searchParams);
              params.delete('sort');
              if (value !== 'default') {
                params.append('sort', value);
              }
              navigate(`/collections/${collectionHandle}?${params.toString()}`);
            }}
            placeholder="Sort by"
          />
        </div>
      </div>

      <div
        id="collection-filters"
        ref={filterRef}
        className={`collection-filters ${isFilterVisible ? 'visible' : ''}`}
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
          {/* Sort Options */}
          <div className="filter-section desktop-only">
            <div className="filter-section-header">
              <h3 className="filter-title">
                <i className="fas fa-sort filter-icon"></i>
                Sort By
              </h3>
            </div>
            <div className="sort-options">
              <CustomSelect
                options={[
                  { value: 'default', label: 'Featured' },
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                  { value: 'title-asc', label: 'Name: A-Z' },
                  { value: 'title-desc', label: 'Name: Z-A' },
                  { value: 'created-desc', label: 'Newest' }
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

            {/* Price Inputs */}
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
                    aria-label="Clear tag filter"
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
                <span className="button-text">Applying Filters...</span>
              </>
            ) : (
              <span className="button-text">Apply Filters</span>
            )}
          </button>
        </Form>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="filter-loading-overlay">
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <p>Filtering Products</p>
            <div className="loading-status">Finding the perfect products for you...</div>
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
    </>
  );
}
