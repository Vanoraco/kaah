import {Await, useLoaderData, Link, useRouteLoaderData} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {SlideshowBanner} from '~/components/SlideshowBanner';
import {PromotionCards} from '~/components/PromotionCards';
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
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
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
            <p>From all orders over $100</p>
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



      {/* Categories */}
      <div className="category-section">
        <h2 className="section-title">Shop by Top Categories</h2>
        <div className="category-grid">
          {collections && collections.nodes ? (
            collections.nodes.slice(0, 6).map((collection) => {
              // Determine which image to use based on collection title
              let imagePath = '/images/categories/default.png';
              const title = collection.title.toLowerCase();

              if (title.includes('fruit')) imagePath = '/images/categories/fruits.png';
              else if (title.includes('vegetable')) imagePath = '/images/categories/vegetables.png';
              else if (title.includes('meat') || title.includes('fish')) imagePath = '/images/categories/meat.png';
              else if (title.includes('snack')) imagePath = '/images/categories/snacks.png';
              else if (title.includes('beverage') || title.includes('drink')) imagePath = '/images/categories/beverages.png';
              else if (title.includes('beauty') || title.includes('health')) imagePath = '/images/categories/beauty.png';

              return (
                <Link key={collection.id} to={`/collections/${collection.handle}`} className="category-item">
                  <img src={imagePath} alt={collection.title} />
                  <p>{collection.title}</p>
                </Link>
              );
            })
          ) : (
            <div className="loading-categories">Loading categories...</div>
          )}
        </div>
      </div>

      {/* Featured Products */}
      <div className="featured-products">
        <h2 className="section-title">Our Featured Products</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={data.recommendedProducts}>
            {(products) => (
              <div className="products-grid">
                {products?.products?.nodes?.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <Image
                        data={product.images.nodes[0]}
                        aspectRatio="1/1"
                        sizes="(min-width: 45em) 20vw, 50vw"
                      />
                      <button className="wishlist-button">❤️</button>
                    </div>
                    <div className="product-info">
                      <h3>{product.title}</h3>
                      <div className="product-price">
                        <Money data={product.priceRange.minVariantPrice} />
                      </div>
                      <button className="add-to-cart">Add to Cart</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Await>
        </Suspense>
      </div>

      {/* Professional Members */}
      <div className="members-section">
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
      </div>

      {/* Testimonials */}
      <div className="testimonials">
        <h2 className="section-title">What our Client Says</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p>"Great quality products and fast delivery. I'm very satisfied with their service."</p>
            <div className="testimonial-author">
              <img src="/images/testimonials/user1.jpg" alt="Robert Fox" />
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
              <img src="/images/testimonials/user2.jpg" alt="Leslie Alexander" />
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
              <img src="/images/testimonials/user3.jpg" alt="Dianne Russell" />
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

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
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
