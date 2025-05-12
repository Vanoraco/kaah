import React, {useState, useEffect} from 'react';
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
    {title: `Kaah | ${data?.product.title ?? ''}`},
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

  // Find the "Original Price" variant if it exists
  const findOriginalPriceVariant = (product) => {
    // Check if the product has variants
    if (product.options && product.options.some(option => option.name === 'Price')) {
      // Find the Price option
      const priceOption = product.options.find(option => option.name === 'Price');

      // Find the Original Price option value
      const originalPriceOptionValue = priceOption?.optionValues?.find(
        value => value.name === 'Original Price'
      );

      // If we found an Original Price option value, use its variant
      if (originalPriceOptionValue?.firstSelectableVariant) {
        console.log('Found Original Price variant, using it as default');
        return originalPriceOptionValue.firstSelectableVariant;
      }
    }

    // If no Original Price variant found, return null to use the default selection
    return null;
  };

  // Get the Original Price variant if it exists
  const originalPriceVariant = findOriginalPriceVariant(product);

  // Optimistically selects a variant with given available variant information
  // Use the Original Price variant if found, otherwise use the default selection
  const selectedVariant = useOptimisticVariant(
    originalPriceVariant || product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );



  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // If we have an Original Price variant and it's not already selected, update the URL
  useEffect(() => {
    if (originalPriceVariant && selectedVariant.id !== originalPriceVariant.id) {
      // Check if the selected variant is a Hamper Price variant
      const isHamperPrice = selectedVariant.selectedOptions?.some(
        option => option.name === 'Price' && option.value === 'Hamper Price'
      );

      // If it's a Hamper Price variant, update the URL to use the Original Price variant
      if (isHamperPrice && originalPriceVariant.selectedOptions) {
        console.log('Redirecting from Hamper Price to Original Price variant');

        // Create the URL search params
        const searchParams = new URLSearchParams();
        originalPriceVariant.selectedOptions.forEach(option => {
          searchParams.set(option.name, option.value);
        });

        // Update the URL without reloading the page
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}`
        );
      }
    }
  }, [selectedVariant, originalPriceVariant]);

  // Clean up URL parameters when component mounts
  useEffect(() => {
    // Import the URL utilities and clean up URL parameters
    import('~/lib/urlUtils').then(({ cleanupUrlParameters }) => {
      // Clean up URL parameters (remove Price=Original+Price)
      cleanupUrlParameters([]);
    }).catch(error => {
      console.error('Error importing URL utilities:', error);
    });
  }, []);

  // Get the product options array and filter out Hamper Price variants
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  }).map(option => {
    // If this is the Price option, filter out Hamper Price variants
    if (option.name === 'Price') {
      return {
        ...option,
        optionValues: option.optionValues.filter(value =>
          value.name !== 'Hamper Price'
        )
      };
    }
    return option;
  });

  const {title, descriptionHtml, vendor, tags} = product;
  const [currentImage, setCurrentImage] = useState(selectedVariant?.image || null);

  // Update current image when variant changes
  useEffect(() => {
    if (selectedVariant?.image) {
      setCurrentImage(selectedVariant.image);
    }
  }, [selectedVariant]);

  // Function to handle thumbnail click
  const handleThumbnailClick = (image) => {
    setCurrentImage(image);
  };

  // Function to handle keyboard navigation for accessibility
  const handleThumbnailKeyDown = (e, image) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setCurrentImage(image);
    }
  };

  // Log variant information for debugging
  console.log('Selected variant:', {
    id: selectedVariant?.id,
    title: selectedVariant?.title,
    price: selectedVariant?.price,
    availableForSale: selectedVariant?.availableForSale,
    selectedOptions: selectedVariant?.selectedOptions
  });

  // Log Original Price variant if found
  if (originalPriceVariant) {
    console.log('Original Price variant found:', {
      id: originalPriceVariant?.id,
      title: originalPriceVariant?.title,
      price: originalPriceVariant?.price,
      availableForSale: originalPriceVariant?.availableForSale,
      selectedOptions: originalPriceVariant?.selectedOptions
    });
  } else {
    console.log('No Original Price variant found for this product');
  }

  // Log product options after filtering
  console.log('Product options after filtering:', productOptions);

  return (
    <div className="product-detail-container">
      <div className="product-detail">
        {/* Product Images Gallery Section */}
        <div className="product-gallery">
          <div className="product-gallery-main">
            {currentImage && (
              <div className="gallery-main-image-container">
                <div className="product-image-badge">Featured</div>
                <div className="gallery-main-image">
                  <img
                    src={currentImage.url}
                    alt={currentImage.altText || title}
                    className="product-detail-image"
                    loading="eager"
                    id="main-product-image"
                  />

                </div>
              </div>
            )}
          </div>

          <div className="product-thumbnails-container">

            <div className="product-thumbnails">
              {product.images?.nodes?.map((image, index) => (
                <div
                  key={image.id}
                  className={`product-thumbnail ${currentImage?.id === image.id ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(image)}
                  onKeyDown={(e) => handleThumbnailKeyDown(e, image)}
                  role="button"
                  tabIndex="0"
                  aria-label={`View ${title} - Image ${index + 1}`}
                >
                  <img
                    src={image.url}
                    alt={`${title} - Image ${index + 1}`}
                    loading="lazy"
                  />
                  {currentImage?.id === image.id && <div className="thumbnail-active-indicator"></div>}
                </div>
              ))}
            </div>
            <div className="product-disclaimer">
              <i className="fas fa-info-circle"></i>
              <span>Pictures used for illustrative purpose only & may differ from actual product</span>
            </div>
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



          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            analytics={{
              products: [
                {
                  name: product.title,
                  productGid: product.id,
                  variantGid: selectedVariant?.id,
                  price: selectedVariant?.price?.amount,
                  quantity: 1,
                },
              ],
              cartId: null,
            }}
          />

          <div className="product-guarantees">
            <div className="guarantee-item">
              <div className="guarantee-icon">
                <i className="fas fa-truck"></i>
              </div>
              <div className="guarantee-title">Free Shipping</div>
              <div className="guarantee-text">Free shipping on orders over ZAR 100</div>
            </div>
            <div className="guarantee-item">
              <div className="guarantee-icon">
                <i className="fas fa-undo"></i>
              </div>
              <div className="guarantee-title">Money Back</div>
              <div className="guarantee-text">30-day money-back guarantee</div>
            </div>
            <div className="guarantee-item">
              <div className="guarantee-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="guarantee-title">Secure Payment</div>
              <div className="guarantee-text">Your data is always protected</div>
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
