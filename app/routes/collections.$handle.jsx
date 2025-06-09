import {redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Link, useSearchParams} from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {createCollectionSeoMeta, createInlineCollectionSchema, createInlineBreadcrumbSchema} from '~/lib/seo';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {CollectionFilters} from '~/components/CollectionFilters';
import {SimpleAddToCartButton} from '~/components/SimpleAddToCartButton';
import {StructuredData} from '~/components/StructuredData';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data, request}) => {
  if (!request) {
    return [
      {title: `Kaah | ${data?.collection?.title ?? 'Collection'}`},
      {name: 'description', content: 'Shop our curated collections at Kaah Supermarket with quality products and fast delivery.'}
    ];
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  return createCollectionSeoMeta({
    collection: data?.collection,
    pathname,
    searchParams: url.searchParams
  });
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

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        ...paginationVariables,
        sortKey,
        reverse,
      },
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // Extract all unique tags from products for the tag filter
  const allTags = [...new Set(
    collection.products.nodes
      .flatMap(product => product.tags || [])
      .filter(tag => tag) // Remove empty tags
  )].sort();

  // Client-side filtering of products
  let filteredProducts = {...collection.products};

  // If we have any filters applied, filter the products on the client side
  if (minPrice || maxPrice || selectedTags.length > 0 || showOnlyAvailable) {
    const filteredNodes = collection.products.nodes.filter(product => {
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
      ...collection.products,
      nodes: filteredNodes,
    };
  }

  // Replace the original products with the filtered ones
  collection.products = filteredProducts;

  return {
    collection,
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
  const {collection, allTags, filters} = useLoaderData();
  const [searchParams] = useSearchParams();
  const productCount = collection.products.nodes.length;

  // Create structured data for the collection
  const collectionSchema = createInlineCollectionSchema(collection);
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: collection.title, url: `/collections/${collection.handle}` }
  ];
  const breadcrumbSchema = createInlineBreadcrumbSchema(breadcrumbs);

  return (
    <div className="collection">
      {/* Structured Data */}
      {collectionSchema && <StructuredData schema={collectionSchema} />}
      {breadcrumbSchema && <StructuredData schema={breadcrumbSchema} />}
      <div className="collection-header">
        {collection.image && (
          <div className="collection-header-bg">
            <img
              src={collection.image.url}
              alt={collection.image.altText || collection.title}
              className="collection-header-image"
            />
          </div>
        )}
        <div className="collection-header-content">
          <div className="collection-breadcrumbs">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <Link to="/collections">Collections</Link>
            <span className="separator">/</span>
            <span>{collection.title}</span>
          </div>
          <h1>{collection.title}</h1>
          {collection.description && (
            <p className="collection-description">{collection.description}</p>
          )}
          <div className="collection-stats">
            {productCount} {productCount === 1 ? 'Product' : 'Products'} Available
          </div>
        </div>
      </div>

      <div className="collection-container">
        <div className="collection-sidebar">
          <CollectionFilters
            filters={filters}
            searchParams={searchParams}
            allTags={allTags}
            collectionHandle={collection.handle}
          />
        </div>

        <div className="collection-content">
          <PaginatedResourceSection
            connection={collection.products}
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
        </div>
      </div>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
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
  // Find the Original Price variant if it exists
  const findOriginalPriceVariant = (product) => {
    if (product.variants?.nodes) {
      // Look for a variant with title "Original Price"
      const originalPriceVariant = product.variants.nodes.find(
        variant => variant.title === "Original Price"
      );

      if (originalPriceVariant) {
        console.log(`Found Original Price variant for ${product.title}`);
        return originalPriceVariant;
      }
    }
    return null;
  };

  // Get the Original Price variant if it exists
  const originalPriceVariant = findOriginalPriceVariant(product);

  // Use the updated useVariantUrl function with the product object
  const variantUrl = useVariantUrl(product.handle, originalPriceVariant?.selectedOptions, product);

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
          {/* Use the Original Price variant price if available, otherwise use the default price */}
          {originalPriceVariant ? (
            <Money data={originalPriceVariant.price} />
          ) : (
            <Money data={product.priceRange.minVariantPrice} />
          )}
        </small>

        <div className="product-quick-add">
          {(() => {
            // Use the Original Price variant if available, otherwise use the first variant
            const variantToUse = originalPriceVariant || product.variants?.nodes?.[0];

            if (variantToUse && variantToUse.availableForSale) {
              return (
                <SimpleAddToCartButton
                  merchandiseId={variantToUse.id}
                  quantity={1}
                />
              );
            } else {
              return (
                <button
                  className="add-to-cart-button"
                  disabled={true}
                >
                  <span className="add-to-cart-text">Sold out</span>
                  <i className="fas fa-shopping-cart"></i>
                </button>
              );
            }
          })()}
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
    variants(first: 10) {
      nodes {
        id
        availableForSale
        compareAtPrice {
          ...MoneyProductItem
        }
        price {
          ...MoneyProductItem
        }
        selectedOptions {
          name
          value
        }
        title
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          id
          availableForSale
          price {
            ...MoneyProductItem
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
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
      description
      image {
        id
        url
        altText
        width
        height
      }
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
          availableForSale
          tags
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
