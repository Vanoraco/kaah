/**
 * Query to fetch banner slides from Shopify metaobjects
 * This assumes you have created a metaobject definition called 'banner_slide'
 * with fields: title, subtitle, discount_text, link, background_color, and image
 */
export const BANNER_METAOBJECTS_QUERY = `#graphql
  query BannerSlides($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "banner_slide", first: 5) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Alternative approach using collections for banner slides
 * This uses existing collections and their images for banner slides
 */
export const BANNER_COLLECTIONS_QUERY = `#graphql
  query FeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 3, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        description
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

/**
 * Alternative approach using blog articles for banner slides
 * This uses blog articles and their featured images for banner slides
 */
export const BANNER_ARTICLES_QUERY = `#graphql
  query FeaturedArticles($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    blog(handle: "banner-slides") {
      articles(first: 3, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          id
          title
          handle
          excerpt
          content
          image {
            url
            altText
            width
            height
          }
          tags
        }
      }
    }
  }
`;

/**
 * Alternative approach using product metafields for banner slides
 * This uses specific products tagged with "banner" and their metafields
 */
export const BANNER_PRODUCTS_QUERY = `#graphql
  query BannerProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 3, query: "tag:banner", sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        description
        featuredImage {
          url
          altText
          width
          height
        }
        metafields(identifiers: [
          {namespace: "custom", key: "banner_subtitle"},
          {namespace: "custom", key: "banner_discount"},
          {namespace: "custom", key: "banner_bg_color"}
        ]) {
          key
          value
        }
      }
    }
  }
`;

/**
 * Query to fetch promotion cards from Shopify metaobjects
 * This assumes you have created a metaobject definition called 'promotion_card'
 * with fields: title, subtitle, background_color, text_color, link, price, discount, countdown_days, countdown_hours, countdown_mins, countdown_secs, image
 *
 * Note: The image field key will be 'promotion_card.image_' in the response
 */
export const PROMOTION_METAOBJECTS_QUERY = `#graphql
  query PromotionCards($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "promotion_card", first: 3) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Alternative approach using collections for promotion cards
 * This uses collections with a specific tag for promotion cards
 */
export const PROMOTION_COLLECTIONS_QUERY = `#graphql
  query PromotionCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 3, query: "tag:promotion", sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        description
        image {
          url
          altText
          width
          height
        }
        metafields(identifiers: [
          {namespace: "custom", key: "promo_subtitle"},
          {namespace: "custom", key: "promo_background"},
          {namespace: "custom", key: "promo_text_color"},
          {namespace: "custom", key: "promo_price"},
          {namespace: "custom", key: "promo_discount"},
          {namespace: "custom", key: "promo_countdown"}
        ]) {
          key
          value
        }
      }
    }
  }
`;

/**
 * Alternative approach using products for promotion cards
 * This uses products tagged with "promotion" and their metafields
 */
export const PROMOTION_PRODUCTS_QUERY = `#graphql
  query PromotionProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 3, query: "tag:promotion", sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        description
        featuredImage {
          url
          altText
          width
          height
        }
        metafields(identifiers: [
          {namespace: "custom", key: "promo_subtitle"},
          {namespace: "custom", key: "promo_background"},
          {namespace: "custom", key: "promo_text_color"},
          {namespace: "custom", key: "promo_price"},
          {namespace: "custom", key: "promo_discount"},
          {namespace: "custom", key: "promo_countdown_days"},
          {namespace: "custom", key: "promo_countdown_hours"},
          {namespace: "custom", key: "promo_countdown_mins"},
          {namespace: "custom", key: "promo_countdown_secs"}
        ]) {
          key
          value
        }
      }
    }
  }
`;

/**
 * Query to fetch mega saver items from Shopify metaobjects
 * This assumes you have created a metaobject definition called 'mega_saver_item'
 * with fields: title, brand, price, original_price, special_text, image, link, special_offer, quantity
 *
 * Note: The image field can be either 'image' or 'mega_saver_item.image_' in the response
 */
export const MEGA_SAVER_METAOBJECTS_QUERY = `#graphql
  query MegaSaverItems($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "mega_saver_item", first: 12) {
      nodes {
        id
        handle
        type
        fields {
          key
          value
          type
          reference {
            ... on MediaImage {
              id
              image {
                url
                altText
                width
                height
              }
            }
            ... on Product {
              id
              title
              handle
              availableForSale
              featuredImage {
                url
                altText
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    availableForSale
                    quantityAvailable
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Query to fetch mega saver header/banner from Shopify metaobjects
 * This assumes you have created a metaobject definition called 'mega_saver_banner'
 * with fields: title, subtitle, background_color, text_color
 */
export const MEGA_SAVER_BANNER_QUERY = `#graphql
  query MegaSaverBanner($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "mega_saver_banner", first: 1) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
  }
`;
