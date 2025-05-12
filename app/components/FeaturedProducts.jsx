import {Suspense} from 'react';
import {Await, Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';

export function FeaturedProducts({products}) {
  return (
    <div className="featured-products">
      <div className="featured-header-wrapper">
        <div className="featured-header-inner">
          <div className="featured-header-content">
            <div className="featured-header-top">
              <span className="featured-label">Premium Selection</span>
            </div>
            <h2 className="featured-heading">
              Our Featured Products
            </h2>
            <div className="featured-header-bottom">
              <span className="featured-divider"></span>
            </div>
          </div>
        </div>
      </div>
      <div className="featured-products-container">
        <Suspense fallback={<FeaturedProductsSkeleton />}>
          <Await resolve={products}>
            {(data) => {
              // Handle both data structures - collection-based and direct products
              const products = data?.collection?.products?.nodes || data?.products?.nodes || [];
              const collectionTitle = data?.collection?.title;

              return (
                <>
                  {collectionTitle && (
                    <div className="collection-title-container">
                      <span className="collection-from">From Collection:</span>
                      <h3 className="collection-title">{collectionTitle}</h3>
                    </div>
                  )}
                  <div className="products-grid">
                    {products.length > 0 ? (
                      products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))
                    ) : (
                      <div className="no-featured-products">
                        <p>No featured products found. Please add products to the "featured-products" collection.</p>
                      </div>
                    )}
                  </div>

                  <div className="view-all-products-container">
                    <Link to="/products" className="view-all-products-button">
                      <span className="view-all-text">View All Products</span>
                      <span className="view-all-icon">
                        <i className="fas fa-arrow-right"></i>
                      </span>
                    </Link>
                  </div>
                </>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

function ProductCard({product}) {
  // Function to handle quick view
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Quick view logic would go here
  };

  // Function to handle wishlist
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Wishlist logic would go here
  };

  return (
    <div className="product-item-wrapper">
      <div className="product-item">
        <div className="product-image-container">
          <div className="featured-badge">Featured</div>
          <Link
            to={`/products/${product.handle}`}
            prefetch="intent"
            className="product-image-link"
          >
            {product.images.nodes[0] && (
              <Image
                alt={product.images.nodes[0].altText || product.title}
                aspectRatio="1/1"
                data={product.images.nodes[0]}
                sizes="(min-width: 45em) 400px, 100vw"
              />
            )}
          </Link>

          <div className="product-actions">
            <button
              className="product-action-btn"
              title="Quick view"
              aria-label="Quick view"
              onClick={handleQuickView}
              type="button"
            >
              <i className="fas fa-eye"></i>
            </button>
            <button
              className="product-action-btn"
              title="Add to wishlist"
              aria-label="Add to wishlist"
              onClick={handleWishlist}
              type="button"
            >
              <i className="fas fa-heart"></i>
            </button>
          </div>
        </div>

        <Link
          to={`/products/${product.handle}`}
          prefetch="intent"
          className="product-info-link"
        >
          <h4>{product.title}</h4>
          <small>
            <Money data={product.priceRange.minVariantPrice} />
          </small>
        </Link>

        <div className="product-quick-add">
          <Link
            to={`/products/${product.handle}`}
            className="quick-add-btn"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeaturedProductsSkeleton() {
  return (
    <div className="products-grid">
      {Array.from({length: 3}).map((_, index) => (
        <div key={index} className="product-item-wrapper">
          <div className="product-item skeleton">
            <div className="product-image-container skeleton-image"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-price"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
