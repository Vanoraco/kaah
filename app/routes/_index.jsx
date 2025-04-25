import {Await, useLoaderData, useRouteLoaderData} from '@remix-run/react';
import {Suspense} from 'react';
import {SlideshowBanner} from '~/components/SlideshowBanner';
import {PromotionCards} from '~/components/PromotionCards';
import {ShopByCategories} from '~/components/ShopByCategories';
import {FeaturedProducts} from '~/components/FeaturedProducts';
import {
  BANNER_COLLECTIONS_QUERY,
  BANNER_METAOBJECTS_QUERY,
  BANNER_ARTICLES_QUERY,
  BANNER_PRODUCTS_QUERY,
  PROMOTION_METAOBJECTS_QUERY,
  PROMOTION_COLLECTIONS_QUERY,
  PROMOTION_PRODUCTS_QUERY
} from '~/lib/banner-queries';

export const meta = () => {
  return [{title: 'Kaah | Home'}];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}) {
  const [
    {collections},
    bannerCollectionsData,
    bannerMetaobjectsData,
    bannerArticlesData,
    bannerProductsData,
    promotionMetaobjectsData,
    promotionCollectionsData,
    promotionProductsData
  ] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    context.storefront.query(BANNER_COLLECTIONS_QUERY),
    // Try to fetch metaobjects, but don't fail if the definition doesn't exist
    context.storefront.query(BANNER_METAOBJECTS_QUERY).catch(() => ({ metaobjects: { nodes: [] } })),
    // Try to fetch articles, but don't fail if the blog doesn't exist
    context.storefront.query(BANNER_ARTICLES_QUERY).catch(() => ({ blog: null })),
    // Try to fetch products, but don't fail if there are no products with the banner tag
    context.storefront.query(BANNER_PRODUCTS_QUERY).catch(() => ({ products: { nodes: [] } })),
    // Try to fetch promotion metaobjects, but don't fail if the definition doesn't exist
    context.storefront.query(PROMOTION_METAOBJECTS_QUERY).catch(() => ({ metaobjects: { nodes: [] } })),
    // Try to fetch promotion collections, but don't fail if there are no collections with the promotion tag
    context.storefront.query(PROMOTION_COLLECTIONS_QUERY).catch(() => ({ collections: { nodes: [] } })),
    // Try to fetch promotion products, but don't fail if there are no products with the promotion tag
    context.storefront.query(PROMOTION_PRODUCTS_QUERY).catch(() => ({ products: { nodes: [] } })),
  ]);

  return {
    featuredCollection: collections.nodes[0],
    bannerCollections: bannerCollectionsData.collections,
    bannerMetaobjects: bannerMetaobjectsData.metaobjects,
    bannerArticles: bannerArticlesData,
    bannerProducts: bannerProductsData.products,
    promotionMetaobjects: promotionMetaobjectsData.metaobjects,
    promotionCollections: promotionCollectionsData.collections,
    promotionProducts: promotionProductsData.products,
  };
}

function loadDeferredData({context}) {
  // Fetch products from the "featured-products" collection
  // If the collection doesn't exist, fall back to recommended products
  const featuredProducts = context.storefront
    .query(FEATURED_PRODUCTS_QUERY, {
      variables: {
        collectionHandle: 'featured-products', // This should match your collection handle in Shopify
      },
    })
    .catch((error) => {
      console.error('Error fetching featured products collection:', error);
      // Fall back to recommended products if the featured collection doesn't exist
      return context.storefront.query(RECOMMENDED_PRODUCTS_QUERY);
    });

  return {
    featuredProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData();
  const rootData = useRouteLoaderData('root');
  const collections = rootData?.collections;

  return (
    <div className="home">
      {/* Slideshow Banner */}
      <SlideshowBanner
        bannerCollections={data.bannerCollections}
        bannerMetaobjects={data.bannerMetaobjects}
        bannerArticles={data.bannerArticles}
        bannerProducts={data.bannerProducts}
      />

      {/* Promotion Cards */}
      <PromotionCards
        promotionMetaobjects={data.promotionMetaobjects}
        promotionCollections={data.promotionCollections}
        promotionProducts={data.promotionProducts}
      />

      {/* Info Badges */}
      <div className="info-badges">
        <div className="info-badge">
          <div className="info-badge-icon">🚚</div>
          <div>
            <h4>Free Shipping</h4>
            <p>From all orders over ZAR 100</p>
          </div>
        </div>
        <div className="info-badge">
          <div className="info-badge-icon">🎧</div>
          <div>
            <h4>24/7 Support</h4>
            <p>Shop with an expert</p>
          </div>
        </div>
        <div className="info-badge">
          <div className="info-badge-icon">💳</div>
          <div>
            <h4>Secure Payments</h4>
            <p>100% protected payments</p>
          </div>
        </div>
        <div className="info-badge">
          <div className="info-badge-icon">↩️</div>
          <div>
            <h4>Money-Back Guarantee</h4>
            <p>30 days money back</p>
          </div>
        </div>
      </div>



      {/* Shop by Categories */}
      <ShopByCategories collections={collections} />

      {/* Featured Products */}
      <FeaturedProducts products={data.featuredProducts} />

      {/* Professional Members */}
      {/* <div className="members-section">
        <h2 className="section-title">Our Professional Members</h2>
        <div className="members-grid">
          <div className="member-card">
            <img src="/images/members/member1.jpg" alt="Jerry Wilson" />
            <h3>Jerry Wilson</h3>
            <p>Store Manager</p>
          </div>
          <div className="member-card">
            <img src="/images/members/member2.jpg" alt="Jane Cooper" />
            <h3>Jane Cooper</h3>
            <p>Staff</p>
          </div>
          <div className="member-card">
            <img src="/images/members/member3.jpg" alt="Cody Fisher" />
            <h3>Cody Fisher</h3>
            <p>Worker</p>
          </div>
          <div className="member-card">
            <img src="/images/members/member4.jpg" alt="Robert Fox" />
            <h3>Robert Fox</h3>
            <p>Farmer</p>
          </div>
        </div>
      </div> */}

      {/* Testimonials */}
      <div className="testimonials">
        <h2 className="section-title">What our Client Says</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p>"Great quality products and fast delivery. I'm very satisfied with their service."</p>
            <div className="testimonial-author">
              <img src="https://ecofishresearch.com/wp-content/uploads/2022/03/690-6904538_men-profile-icon-png-image-free-download-searchpng.png" alt="Robert Fox" />
              <div>
                <h4>Robert Fox</h4>
                <p>Customer</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p>"The freshness of their organic products is unmatched. Highly recommended!"</p>
            <div className="testimonial-author">
              <img src="https://ecofishresearch.com/wp-content/uploads/2022/03/690-6904538_men-profile-icon-png-image-free-download-searchpng.png" alt="Leslie Alexander" />
              <div>
                <h4>Leslie Alexander</h4>
                <p>Customer</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p>"Best organic food store in the area. Love their variety and quality."</p>
            <div className="testimonial-author">
              <img src="https://ecofishresearch.com/wp-content/uploads/2022/03/690-6904538_men-profile-icon-png-image-free-download-searchpng.png" alt="Dianne Russell" />
              <div>
                <h4>Dianne Russell</h4>
                <p>Customer</p>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const FEATURED_PRODUCTS_QUERY = `#graphql
  fragment FeaturedProductDetails on Product {
    id
    title
    handle
    vendor
    description
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    tags
    availableForSale
  }
  query FeaturedProducts($country: CountryCode, $language: LanguageCode, $collectionHandle: String!)
    @inContext(country: $country, language: $language) {
    collection(handle: $collectionHandle) {
      id
      title
      handle
      products(first: 10) {
        nodes {
          ...FeaturedProductDetails
        }
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    vendor
    description
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    tags
    availableForSale
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 10, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;
