import {Link} from '@remix-run/react';
import {useEffect, useState} from 'react';
import {Image} from '@shopify/hydrogen';

export function ShopByCategories({collections}) {
  const [categoryIcons, setCategoryIcons] = useState({});

  useEffect(() => {
    // Map collection titles to appropriate icons
    if (collections?.nodes) {
      const icons = {};
      collections.nodes.forEach(collection => {
        const title = collection.title.toLowerCase();
        let iconPath = '/images/categories/default.svg';

        if (title.includes('fruit')) iconPath = '/images/categories/fruits.svg';
        else if (title.includes('vegetable')) iconPath = '/images/categories/vegetables.svg';
        else if (title.includes('meat') || title.includes('fish')) iconPath = '/images/categories/meat.svg';
        else if (title.includes('snack')) iconPath = '/images/categories/snacks.svg';
        else if (title.includes('beverage') || title.includes('drink')) iconPath = '/images/categories/beverages.svg';
        else if (title.includes('beauty') || title.includes('health')) iconPath = '/images/categories/beauty.svg';
        else if (title.includes('bakery') || title.includes('bread')) iconPath = '/images/categories/bakery.svg';
        else if (title.includes('dairy')) iconPath = '/images/categories/dairy.svg';

        icons[collection.id] = iconPath;
      });
      setCategoryIcons(icons);
    }
  }, [collections]);

  if (!collections?.nodes?.length) {
    return (
      <div className="category-section">
        <div className="categories-header">
          <div className="categories-title-wrapper">
            <div className="categories-title-icon-container left">
              <i className="fas fa-th-large categories-title-icon"></i>
            </div>
            <h2 className="categories-title">
              <span className="categories-title-text">Shop by Top Categories</span>
            </h2>
            <div className="categories-title-icon-container right">
              <i className="fas fa-th-large categories-title-icon"></i>
            </div>
          </div>
          <div className="categories-subtitle">Explore our wide range of product categories</div>
        </div>
        <div className="categories-container">
          <div className="categories-loading">
            <div className="loading-spinner"></div>
            <p>Loading categories...</p>
          </div>

          {/* View All Collections Button (visible even during loading) */}
          <div className="view-all-collections-container">
            <Link to="/collections" className="view-all-products-button">
              <span className="view-all-text">View All Collections</span>
              <span className="view-all-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-section">
      <div className="categories-header">
        <div className="categories-title-wrapper">
          <div className="categories-title-icon-container left">
            <i className="fas fa-th-large categories-title-icon"></i>
          </div>
          <h2 className="categories-title">
            <span className="categories-title-text">Shop by Top Categories</span>
          </h2>
          <div className="categories-title-icon-container right">
            <i className="fas fa-th-large categories-title-icon"></i>
          </div>
        </div>
        <div className="categories-subtitle">Explore our wide range of product categories</div>
      </div>
      <div className="categories-container">
        <div className="category-grid">
          {collections.nodes.slice(0, 6).map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.handle}`}
              className="category-item"
              aria-label={`Browse ${collection.title}`}
            >
              <div className="category-image-container">
                {collection.image ? (
                  <Image
                    data={collection.image}
                    aspectRatio="1/1"
                    sizes="(min-width: 45em) 20vw, 50vw"
                    className="category-featured-image"
                  />
                ) : (
                  <img
                    src={categoryIcons[collection.id] || '/images/categories/default.svg'}
                    alt={collection.title}
                    className="category-icon-image"
                  />
                )}
              </div>
              <div className="category-info">
                <p>{collection.title}</p>
                {collection.products?.nodes?.length > 0 && (
                  <span className="category-product-count">
                    {collection.products.nodes.length} products
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* View All Collections Button */}
        <div className="view-all-collections-container">
          <Link to="/collections" className="view-all-products-button">
            <span className="view-all-text">View All Collections</span>
            <span className="view-all-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
