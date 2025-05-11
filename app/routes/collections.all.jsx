import {useLoaderData, Link, useSearchParams} from '@remix-run/react';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {AllProductsFilters} from '~/components/AllProductsFilters';
import {CustomSelect} from '~/components/CustomSelect';
import '~/styles/all-products.css';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = () => {
  return [
    {title: `All Products | Kaah`},
    {description: 'Discover our complete range of products at Kaah. Browse through our collection of high-quality items.'}
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
async function loadCriticalData({context, request}) {
  const {storefront} = context;
  const url = new URL(request.url);

  // Get filter parameters from URL
  const minPrice = url.searchParams.get('minPrice') || '';
  const maxPrice = url.searchParams.get('maxPrice') || '';
  const selectedTags = url.searchParams.getAll('tag') || [];
  const showOnlyAvailable = url.searchParams.get('available') === 'true';
  const sortOption = url.searchParams.get('sort') || 'default';

  // Determine sort key and direction based on sort option
  let sortKey = 'RELEVANCE';
  let reverse = false;

  switch (sortOption) {
    case 'price-asc':
      sortKey = 'PRICE';
      reverse = false;
      break;
    case 'price-desc':
      sortKey = 'PRICE';
      reverse = true;
      break;
    case 'title-asc':
      sortKey = 'TITLE';
      reverse = false;
      break;
    case 'title-desc':
      sortKey = 'TITLE';
      reverse = true;
      break;
    case 'created-desc':
      sortKey = 'CREATED';
      reverse = true;
      break;
    default:
      sortKey = 'RELEVANCE';
      reverse = false;
  }

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {
        ...paginationVariables,
        sortKey,
        reverse,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  // Extract all unique tags from products for the tag filter
  const allTags = [...new Set(
    products.nodes
      .flatMap(product => product.tags || [])
      .filter(tag => tag) // Remove empty tags
  )].sort();

  // Client-side filtering of products
  let filteredProducts = {...products};

  // If we have any filters applied, filter the products on the client side
  if (minPrice || maxPrice || selectedTags.length > 0 || showOnlyAvailable) {
    const filteredNodes = products.nodes.filter(product => {
      // Price filter
      const productPrice = parseFloat(product.priceRange.minVariantPrice.amount);

      if (minPrice && productPrice < parseFloat(minPrice)) {
        return false;
      }

      if (maxPrice && productPrice > parseFloat(maxPrice)) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const productTags = product.tags || [];
        const hasMatchingTag = selectedTags.some(tag =>
          productTags.includes(tag)
        );

        if (!hasMatchingTag) {
          return false;
        }
      }

      // Availability filter
      if (showOnlyAvailable && !product.availableForSale) {
        return false;
      }

      return true;
    });

    filteredProducts = {
      ...products,
      nodes: filteredNodes,
    };
  }

  return {
    products: filteredProducts,
    allTags,
    filters: {
      minPrice,
      maxPrice,
      selectedTags,
      showOnlyAvailable,
      sortOption,
    },
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {products, allTags, filters} = useLoaderData();
  const [searchParams] = useSearchParams();

  return (
    <div className="all-products-page">
      <div className="all-products-header">
        <div className="header-background">
          <div className="header-shape shape-1"></div>
          <div className="header-shape shape-2"></div>
          <div className="header-shape shape-3"></div>
        </div>
        <h1 className="title-text">All Products</h1>
        <div className="all-products-subtitle">
          <span className="subtitle-text">Discover our complete range of products</span>
        </div>
      </div>

      {/* Mobile filter toggle - only shown on mobile */}
      <div className="mobile-filter-toggle">
        <button
          type="button"
          className="filter-toggle-button"
          onClick={() => document.getElementById('all-products-filters').classList.add('visible')}
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
            value={filters.sortOption}
            onChange={(value) => {
              const params = new URLSearchParams(searchParams);
              params.delete('sort');
              if (value !== 'default') {
                params.append('sort', value);
              }
              window.location.href = `/collections/all?${params.toString()}`;
            }}
            placeholder="Sort by"
          />
        </div>
      </div>

      <div className="all-products-container">
        <div className="all-products-sidebar">
          <AllProductsFilters
            filters={filters}
            searchParams={searchParams}
            allTags={allTags}
          />
        </div>

        <div className="all-products-content">
          <PaginatedResourceSection
            connection={products}
            resourcesClassName="products-grid"
          >
            {({node: product, index}) => (
              <div className="product-item-wrapper">
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 8 ? 'eager' : undefined}
                />
              </div>
            )}
          </PaginatedResourceSection>
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);

  // Find the Original Price variant if it exists
  const findOriginalPriceVariant = (product) => {
    if (product.variants?.nodes) {
      // Look for a variant with title "Original Price"
      const originalPriceVariant = product.variants.nodes.find(
        variant => variant.title === "Original Price"
      );

      if (originalPriceVariant) {
        return originalPriceVariant;
      }
    }
    return null;
  };

  // Get the original price variant or use the default price
  const originalPriceVariant = findOriginalPriceVariant(product);
  const priceToShow = originalPriceVariant?.price || product.priceRange.minVariantPrice;

  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="product-image-container">
        {product.featuredImage ? (
          <Image
            alt={product.featuredImage.altText || product.title}
            aspectRatio="1/1"
            data={product.featuredImage}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        ) : (
          <div className="product-image-placeholder">
            <i className="fas fa-image product-image-placeholder-icon"></i>
          </div>
        )}
        <div className="product-overlay">
          <div className="product-view-button">View Details</div>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <div className="product-price">
          <Money data={priceToShow} />
        </div>
      </div>
      <div className="product-quick-add">
        <span>Quick View</span>
      </div>
    </Link>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 10) {
      nodes {
        id
        title
        price {
          ...MoneyProductItem
        }
        compareAtPrice {
          ...MoneyProductItem
        }
        selectedOptions {
          name
          value
        }
      }
    }
    availableForSale
    vendor
    tags
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/2024-01/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      nodes {
        ...ProductItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_ITEM_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/**
 * @typedef {Object} Filters
 * @property {string} minPrice
 * @property {string} maxPrice
 * @property {string[]} selectedTags
 * @property {boolean} showOnlyAvailable
 * @property {string} sortOption
 */
