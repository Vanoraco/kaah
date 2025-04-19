import {Suspense} from 'react';
import {Await, Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';

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
            {(products) => (
              <div className="products-grid">
                {products?.products?.nodes?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

function ProductCard({product}) {
  return (
    <div className="product-card">
      <Link
        to={`/products/${product.handle}`}
        className="product-link"
        prefetch="intent"
      >
        <div className="product-image">
          {product.images.nodes[0] && (
            <Image
              data={product.images.nodes[0]}
              aspectRatio="1/1"
              sizes="(min-width: 45em) 20vw, 50vw"
              className="product-photo"
            />
          )}
          <button
            className="wishlist-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Add wishlist functionality here
            }}
            aria-label="Add to wishlist"
          >
            <i className="far fa-heart"></i>
          </button>
        </div>
      </Link>
      <div className="product-info">
        <Link
          to={`/products/${product.handle}`}
          prefetch="intent"
          className="product-title-link"
        >
          <h3>{product.title}</h3>
        </Link>
        <div className="product-price">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
        <button
          className="add-to-cart"
          onClick={() => {
            // Add to cart functionality here
          }}
        >
          <i className="fas fa-shopping-cart cart-icon"></i>
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}

function FeaturedProductsSkeleton() {
  return (
    <div className="products-grid">
      {Array.from({length: 5}).map((_, index) => (
        <div key={index} className="product-card skeleton">
          <div className="product-image skeleton-image"></div>
          <div className="product-info">
            <div className="skeleton-title"></div>
            <div className="skeleton-price"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
