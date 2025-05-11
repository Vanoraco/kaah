import {Form, useNavigate} from '@remix-run/react';
import {useEffect, useState, useRef} from 'react';
import {Slider} from '~/components/Slider';
import {CustomSelect} from '~/components/CustomSelect';

export function AllProductsFilters({filters, searchParams, allTags}) {
  const navigate = useNavigate();
  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');
  const [selectedTags, setSelectedTags] = useState(filters.selectedTags || []);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(filters.showOnlyAvailable || false);
  const [sortOption, setSortOption] = useState(filters.sortOption || 'default');
  const [priceRange, setPriceRange] = useState([filters.minPrice ? parseInt(filters.minPrice) : 0, filters.maxPrice ? parseInt(filters.maxPrice) : 1000]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const filterRef = useRef(null);

  // Handle tag checkbox change
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

    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 50);

    // Navigate to the filtered URL
    setTimeout(() => {
      navigate(`/collections/all?${params.toString()}`);
      setIsLoading(false);
      document.getElementById('all-products-filters').classList.remove('visible');
      clearInterval(interval);
    }, 500);
  };

  // Reset all filters
  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedTags([]);
    setShowOnlyAvailable(false);
    setSortOption('default');
    setPriceRange([0, 1000]);
    navigate('/collections/all');
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

  // Close filter sidebar when clicking outside on mobile
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target) && window.innerWidth <= 768) {
        document.getElementById('all-products-filters').classList.remove('visible');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      id="all-products-filters"
      ref={filterRef}
      className="product-filters"
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
            onClick={() => document.getElementById('all-products-filters').classList.remove('visible')}
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

            {/* Price Range Inputs */}
            <div className="price-range-inputs">
              <div className="price-input-group">
                <label htmlFor="min-price" className="price-label">Min</label>
                <input
                  type="number"
                  id="min-price"
                  name="minPrice"
                  value={minPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMinPrice(value);
                    setPriceRange([parseInt(value) || 0, priceRange[1]]);
                  }}
                  min={0}
                  max={priceRange[1]}
                />
              </div>
              <div className="price-input-group">
                <label htmlFor="max-price" className="price-label">Max</label>
                <input
                  type="number"
                  id="max-price"
                  name="maxPrice"
                  value={maxPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMaxPrice(value);
                    setPriceRange([priceRange[0], parseInt(value) || 1000]);
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
                <div className="button-spinner"></div>
                <span>Applying Filters... {loadingProgress}%</span>
              </>
            ) : (
              <>
                <i className="fas fa-filter"></i>
                <span>Apply Filters</span>
              </>
            )}
          </button>
        </Form>
      </div>
  );
}
