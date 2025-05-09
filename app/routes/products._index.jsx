import {useLoaderData, useSearchParams, Link, useNavigation} from '@remix-run/react';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductFilters} from '~/components/ProductFilters';
import {SimpleAddToCartButton} from '~/components/SimpleAddToCartButton';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = () => {
  return [{title: `Kaah | All Products`}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const {request, context} = args;
  const {storefront} = context;
  const url = new URL(request.url);

  // Get filter parameters from URL
  const minPrice = url.searchParams.get('minPrice') || '';
  const maxPrice = url.searchParams.get('maxPrice') || '';
  const selectedCategories = url.searchParams.getAll('category') || [];
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
    case 'newest':
      sortKey = 'CREATED_AT';
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
    default:
      // Default sorting (relevance)
      sortKey = 'RELEVANCE';
      reverse = false;
  }

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  // Fetch all products, collections, and products by collection if needed
  let collectionProducts = {};

  // First, fetch basic data
  const [{products}, {collections}] = await Promise.all([
    storefront.query(ALL_PRODUCTS_QUERY, {
      variables: {
        ...paginationVariables,
        sortKey,
        reverse,
      },
    }),
    storefront.query(COLLECTIONS_QUERY, {
      variables: {first: 20},
    }),
  ]);

  // If category filters are applied, fetch products for each selected collection
  if (selectedCategories.length > 0) {
    const collectionQueries = selectedCategories.map(handle =>
      storefront.query(COLLECTION_PRODUCTS_QUERY, {
        variables: {
          handle,
          ...paginationVariables,
          sortKey,
          reverse,
        },
      })
    );

    const results = await Promise.all(collectionQueries);

    // Create a map of product IDs by collection handle
    selectedCategories.forEach((handle, index) => {
      const result = results[index];
      if (result.collection) {
        collectionProducts[handle] = result.collection.products.nodes.map(product => product.id);
      } else {
        collectionProducts[handle] = [];
      }
    });
  }

  // Extract all unique tags from products for the tag filter
  const allTags = [...new Set(
    products.nodes
      .flatMap(product => product.tags || [])
      .filter(tag => tag) // Remove empty tags
  )].sort();

  // Client-side filtering of products
  let filteredProducts = {...products};

  // If we have any filters applied, filter the products on the client side
  if (minPrice || maxPrice || selectedCategories.length > 0 || selectedTags.length > 0 || showOnlyAvailable) {
    const filteredNodes = products.nodes.filter(product => {
      // Price filter
      const productPrice = parseFloat(product.priceRange.minVariantPrice.amount);

      if (minPrice && productPrice < parseFloat(minPrice)) {
        return false;
      }

      if (maxPrice && productPrice > parseFloat(maxPrice)) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        // Check if the product belongs to any of the selected collections
        // using the product IDs we fetched for each collection
        const productInSelectedCollection = selectedCategories.some(handle => {
          const collectionProductIds = collectionProducts[handle] || [];
          return collectionProductIds.includes(product.id);
        });

        if (!productInSelectedCollection) {
          return false;
        }
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
    collections,
    allTags,
    filters: {
      minPrice,
      maxPrice,
      selectedCategories,
      selectedTags,
      showOnlyAvailable,
      sortOption,
    },
  };
}

export default function AllProducts() {
  const {products, collections, filters, allTags} = useLoaderData();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div className="all-products-page">
      <div className="all-products-header">
        <div className="header-background">
          <div className="header-shape shape-1"></div>
          <div className="header-shape shape-2"></div>
        </div>
        <div className="header-content">
          <h1 className="all-products-title">
            <span className="title-text">All Products</span>
          </h1>
          <div className="all-products-subtitle">
            <span className="subtitle-text">Browse our complete catalog</span>
          </div>
        </div>
      </div>

      <div className="all-products-container">
        <div className="all-products-sidebar">
          <ProductFilters
            collections={collections}
            filters={filters}
            searchParams={searchParams}
            allTags={allTags}
          />
        </div>

        <div className="all-products-content">
          {isLoading ? (
            <div className="products-loading">
              <div className="products-loading-container">
                <div className="loading-spinner-container">
                  <div className="loading-spinner"></div>
                  <div className="loading-spinner-inner"></div>
                  <div className="loading-spinner-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <p className="loading-text">Loading products<span className="loading-dots"><span>.</span><span>.</span><span>.</span></span></p>
              </div>
            </div>
          ) : (
            products.nodes.length > 0 ? (
              <PaginatedResourceSection
                connection={products}
                resourcesClassName="products-grid"
              >
                {({node: product, index}) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    loading={index < 8 ? 'eager' : undefined}
                  />
                )}
              </PaginatedResourceSection>
            ) : (
              <div className="no-products-found">
                <div className="no-products-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h2>No Products Found</h2>
                <p>We couldn't find any products matching your current filters.</p>
                <button
                  onClick={() => window.location.href = '/products'}
                  className="reset-search-button"
                >
                  Clear All Filters
                </button>
              </div>
            )
          )}
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

  return (
    <div className="product-item-wrapper">
      <Link
        className="product-item"
        key={product.id}
        prefetch="intent"
        to={variantUrl}
      >
        <div className="product-image-container">
          {product.featuredImage && (
            <Image
              alt={product.featuredImage.altText || product.title}
              aspectRatio="1/1"
              data={product.featuredImage}
              loading={loading}
              sizes="(min-width: 45em) 400px, 100vw"
            />
          )}

          <div className="product-actions">
            <button
              className="product-action-btn"
              title="Quick view"
              aria-label="Quick view"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Quick view logic would go here
                console.log('Quick view:', product.title);
              }}
            >
              <i className="fas fa-eye"></i>
            </button>
            <button
              className="product-action-btn"
              title="Add to wishlist"
              aria-label="Add to wishlist"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Wishlist logic would go here
                console.log('Add to wishlist:', product.title);
              }}
            >
              <i className="fas fa-heart"></i>
            </button>
          </div>
        </div>

        <h4>{product.title}</h4>
        <small>
          <Money data={product.priceRange.minVariantPrice} />
        </small>

        <div className="product-quick-add">
          {product.variants?.nodes?.[0] && product.variants.nodes[0].availableForSale && (
            <SimpleAddToCartButton
              merchandiseId={product.variants.nodes[0].id}
              quantity={1}
            />
          )}
          {(!product.variants?.nodes?.[0] || !product.variants.nodes[0].availableForSale) && (
            <button
              className="add-to-cart-button"
              disabled={true}
            >
              <span className="add-to-cart-text">Sold out</span>
              <i className="fas fa-shopping-cart"></i>
            </button>
          )}
        </div>
      </Link>
    </div>
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
    variants(first: 1) {
      nodes {
        id
        availableForSale
        compareAtPrice {
          ...MoneyProductItem
        }
        price {
          ...MoneyProductItem
        }
      }
    }
    vendor
    tags
    productType
    availableForSale
    createdAt
    updatedAt
  }
`;

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, sortKey: $sortKey, reverse: $reverse) {
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

const COLLECTIONS_QUERY = `#graphql
  query ProductsPageCollections(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
  ) @inContext(country: $country, language: $language) {
    collections(first: $first) {
      nodes {
        id
        title
        handle
        description
      }
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `#graphql
  query CollectionProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      products(first: $first, last: $last, before: $startCursor, after: $endCursor, sortKey: $sortKey, reverse: $reverse) {
        nodes {
          id
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
