import {useLoaderData} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {AddToCartButton} from '~/components/AddToCartButton';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params}) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, vendor, tags} = product;

  return (
    <div className="product-detail-container">
      <div className="product-detail">
        {/* Product Images Section */}
        <div className="product-image-container">
          <div className="product-image">
            {selectedVariant?.image && (
              <>
                <div className="product-image-badge">Featured</div>
                <img
                  src={selectedVariant.image.url}
                  alt={selectedVariant.image.altText || title}
                />
              </>
            )}
          </div>

          <div className="product-thumbnails">
            {product.images?.nodes?.map((image, index) => (
              <div
                key={image.id}
                className={`product-thumbnail ${selectedVariant?.image?.id === image.id ? 'active' : ''}`}
              >
                <img src={image.url} alt={`${title} - Image ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="product-info-container">
          <div className="product-breadcrumbs">
            <a href="/">Home</a>
            <span className="separator">/</span>
            <a href="/collections/all">Products</a>
            <span className="separator">/</span>
            <span>{title}</span>
          </div>

          <h1 className="product-title">{title}</h1>

          {vendor && <div className="product-vendor">{vendor}</div>}

          <div className="product-rating">
            <div className="product-stars">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
            
          </div>

          <div className="product-price-container">
            <div className="product-price">
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
            </div>
            {selectedVariant?.compareAtPrice && (
              <div className="product-discount-badge">
                Save {Math.round((1 - parseFloat(selectedVariant.price.amount) / parseFloat(selectedVariant.compareAtPrice.amount)) * 100)}%
              </div>
            )}
          </div>

          <div className={`product-availability ${selectedVariant?.availableForSale ? 'in-stock' : 'out-of-stock'}`}>
            <i className={`fas ${selectedVariant?.availableForSale ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            {selectedVariant?.availableForSale ? 'In Stock' : 'Out of Stock'}
          </div>

          <div className="product-description" dangerouslySetInnerHTML={{__html: descriptionHtml}} />

          <div className="product-form">
            <div className="product-options">
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
              />
            </div>

            <div className="add-to-cart-container">
              <div className="quantity-selector">
                <button className="quantity-btn" aria-label="Decrease quantity">-</button>
                <input type="number" className="quantity-input" value="1" min="1" readOnly />
                <button className="quantity-btn" aria-label="Increase quantity">+</button>
              </div>

              

             
            </div>

            
          </div>

          <div className="product-guarantees">
            <div className="guarantee-item">
              <div className="guarantee-icon">
                <i className="fas fa-truck"></i>
              </div>
              <div className="guarantee-text">Free shipping on orders over $50</div>
            </div>
            <div className="guarantee-item">
              <div className="guarantee-icon">
                <i className="fas fa-undo"></i>
              </div>
              <div className="guarantee-text">30-day money-back guarantee</div>
            </div>
            <div className="guarantee-item">
              <div className="guarantee-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="guarantee-text">Secure payment</div>
            </div>
          </div>

          <div className="product-meta">
            <div className="product-meta-item">
              <div className="product-meta-label">SKU</div>
              <div className="product-meta-value">{selectedVariant?.sku || 'N/A'}</div>
            </div>
            {tags && tags.length > 0 && (
              <div className="product-meta-item">
                <div className="product-meta-label">Tags</div>
                <div className="product-meta-value">
                  <div className="product-tags">
                    {tags.map((tag, index) => (
                      <span key={index} className="product-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="product-tabs">
        <div className="tabs-header">
          <button className="tab-button active">
            <i className="fas fa-info-circle"></i> Description
          </button>
          <button className="tab-button">
            <i className="fas fa-list"></i> Specifications
          </button>
          <button className="tab-button">
            <i className="fas fa-star"></i> Reviews
          </button>
        </div>
        <div className="tab-content active">
          <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
        </div>
      </div>

      {/* Related Products */}
      <div className="related-products">
        <h3 className="related-products-title">You May Also Like</h3>
        <div className="related-products-grid">
          {/* Related products would go here */}
        </div>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
