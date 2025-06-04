/**
 * Structured Data (JSON-LD) utility functions for SEO
 * Implements schema.org markup for better search engine understanding
 */

import { SITE_CONFIG } from './seo.js';

/**
 * Creates organization schema markup
 * @returns {Object} Organization schema
 */
export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_CONFIG.siteName,
    "url": SITE_CONFIG.baseUrl,
    "logo": `${SITE_CONFIG.baseUrl}/logo.svg`,
    "description": SITE_CONFIG.defaultDescription,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ZA",
      "addressRegion": "South Africa"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "sameAs": [
      // Add social media URLs when available
      // "https://www.facebook.com/kaahsupermarket",
      // "https://twitter.com/kaahsupermarket",
      // "https://www.instagram.com/kaahsupermarket"
    ]
  };
}

/**
 * Creates website schema markup
 * @returns {Object} Website schema
 */
export function createWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_CONFIG.siteName,
    "url": SITE_CONFIG.baseUrl,
    "description": SITE_CONFIG.defaultDescription,
    "publisher": {
      "@type": "Organization",
      "name": SITE_CONFIG.siteName
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_CONFIG.baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Creates product schema markup
 * @param {Object} product - Shopify product data
 * @param {string} [baseUrl] - Base URL for the site
 * @returns {Object} Product schema
 */
export function createProductSchema(product, baseUrl = SITE_CONFIG.baseUrl) {
  if (!product) return null;

  const variant = product.variants?.nodes?.[0] || product.selectedVariant;
  const image = product.featuredImage || product.images?.nodes?.[0];
  
  // Get price information
  const price = variant?.price?.amount || product.priceRange?.minVariantPrice?.amount;
  const compareAtPrice = variant?.compareAtPrice?.amount;
  const currency = variant?.price?.currencyCode || product.priceRange?.minVariantPrice?.currencyCode || 'ZAR';
  
  // Build offers array
  const offers = {
    "@type": "Offer",
    "url": `${baseUrl}/products/${product.handle}`,
    "priceCurrency": currency,
    "price": price,
    "availability": product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "seller": {
      "@type": "Organization",
      "name": SITE_CONFIG.siteName
    }
  };

  // Add compare at price if available
  if (compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price)) {
    offers.priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description || `${product.title} available at ${SITE_CONFIG.siteName}`,
    "url": `${baseUrl}/products/${product.handle}`,
    "sku": variant?.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": product.vendor || SITE_CONFIG.siteName
    },
    "offers": offers
  };

  // Add image if available
  if (image?.url) {
    schema.image = image.url;
  }

  // Add category if available
  if (product.productType) {
    schema.category = product.productType;
  }

  // Add aggregate rating if review data is available
  if (product.reviews && product.reviews.length > 0) {
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / product.reviews.length;

    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": averageRating.toFixed(1),
      "reviewCount": product.reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    };

    // Add individual reviews (limit to first 5 for performance)
    schema.review = product.reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Person",
        "name": review.author || "Anonymous"
      },
      "reviewBody": review.content,
      "datePublished": review.createdAt
    }));
  }

  return schema;
}

/**
 * Creates collection/category schema markup
 * @param {Object} collection - Shopify collection data
 * @param {string} [baseUrl] - Base URL for the site
 * @returns {Object} Collection schema
 */
export function createCollectionSchema(collection, baseUrl = SITE_CONFIG.baseUrl) {
  if (!collection) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": collection.title,
    "description": collection.description || `Shop ${collection.title} at ${SITE_CONFIG.siteName}`,
    "url": `${baseUrl}/collections/${collection.handle}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": collection.title,
      "description": collection.description,
      "numberOfItems": collection.products?.nodes?.length || 0
    }
  };

  // Add image if available
  if (collection.image?.url) {
    schema.image = collection.image.url;
  }

  // Add breadcrumb
  schema.breadcrumb = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Collections",
        "item": `${baseUrl}/collections`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": collection.title,
        "item": `${baseUrl}/collections/${collection.handle}`
      }
    ]
  };

  return schema;
}

/**
 * Creates article schema markup
 * @param {Object} article - Shopify article data
 * @param {Object} [blog] - Shopify blog data
 * @param {string} [baseUrl] - Base URL for the site
 * @returns {Object} Article schema
 */
export function createArticleSchema(article, blog, baseUrl = SITE_CONFIG.baseUrl) {
  if (!article) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt || article.summary,
    "url": `${baseUrl}/blogs/${blog?.handle || 'blog'}/${article.handle}`,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.author || SITE_CONFIG.siteName
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_CONFIG.siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.svg`
      }
    }
  };

  // Add image if available
  if (article.image?.url) {
    schema.image = {
      "@type": "ImageObject",
      "url": article.image.url,
      "width": article.image.width,
      "height": article.image.height
    };
  }

  // Add article section/category
  if (blog?.title) {
    schema.articleSection = blog.title;
  }

  // Add tags as keywords
  if (article.tags && article.tags.length > 0) {
    schema.keywords = article.tags.join(', ');
  }

  return schema;
}

/**
 * Creates breadcrumb schema markup
 * @param {Array} breadcrumbs - Array of breadcrumb items
 * @param {string} [baseUrl] - Base URL for the site
 * @returns {Object} BreadcrumbList schema
 */
export function createBreadcrumbSchema(breadcrumbs, baseUrl = SITE_CONFIG.baseUrl) {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`
    }))
  };
}

/**
 * Creates local business schema markup (for physical stores)
 * @param {Object} storeInfo - Store information
 * @returns {Object} LocalBusiness schema
 */
export function createLocalBusinessSchema(storeInfo = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Supermarket",
    "name": SITE_CONFIG.siteName,
    "url": SITE_CONFIG.baseUrl,
    "description": SITE_CONFIG.defaultDescription,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": storeInfo.streetAddress || "",
      "addressLocality": storeInfo.city || "",
      "addressRegion": storeInfo.region || "",
      "postalCode": storeInfo.postalCode || "",
      "addressCountry": "ZA"
    },
    "telephone": storeInfo.phone || "",
    "email": storeInfo.email || "",
    "openingHours": storeInfo.openingHours || [
      "Mo-Fr 08:00-20:00",
      "Sa 08:00-18:00",
      "Su 09:00-17:00"
    ],
    "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
    "currenciesAccepted": "ZAR"
  };
}

/**
 * Creates FAQ schema markup
 * @param {Array} faqs - Array of FAQ objects with question and answer
 * @returns {Object} FAQ schema
 */
export function createFAQSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Creates event schema markup (for promotions/sales)
 * @param {Object} event - Event information
 * @returns {Object} Event schema
 */
export function createEventSchema(event) {
  if (!event) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": event.description,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "location": {
      "@type": "VirtualLocation",
      "url": event.url || SITE_CONFIG.baseUrl
    },
    "organizer": {
      "@type": "Organization",
      "name": SITE_CONFIG.siteName,
      "url": SITE_CONFIG.baseUrl
    },
    "offers": event.offers ? {
      "@type": "Offer",
      "description": event.offers.description,
      "price": event.offers.price || "0",
      "priceCurrency": event.offers.currency || "ZAR",
      "availability": "https://schema.org/InStock"
    } : undefined
  };
}

/**
 * Generates JSON-LD script tag content
 * @param {Object|Array} schema - Schema object or array of schema objects
 * @returns {string} JSON-LD script content
 */
export function generateJsonLd(schema) {
  if (!schema) return '';

  const schemaArray = Array.isArray(schema) ? schema : [schema];
  const validSchemas = schemaArray.filter(s => s !== null && s !== undefined);

  if (validSchemas.length === 0) return '';

  return JSON.stringify(validSchemas.length === 1 ? validSchemas[0] : validSchemas, null, 0);
}
