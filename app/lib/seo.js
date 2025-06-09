/**
 * SEO utility functions for handling meta tags, canonical URLs, and other SEO-related tasks
 */

// Default site configuration
const SITE_CONFIG = {
  siteName: 'Kaah Supermarket',
  baseUrl: 'https://kaah.co.za',
  defaultDescription: 'Shop premium quality groceries, fresh produce, and household essentials at Kaah Supermarket. Fast delivery, competitive prices, and exceptional service.',
  defaultKeywords: 'supermarket, groceries, fresh produce, household essentials, online shopping, South Africa, Kaah',
  twitterHandle: '@kaahsupermarket',
  facebookAppId: '', // Add if available
  defaultImage: '/images/kaah-og-image.jpg', // Add default OG image
};

/**
 * Generates a canonical URL for the current page, removing pagination parameters
 * to prevent duplicate content issues with paginated pages.
 *
 * @param {Object} options - Options for generating the canonical URL
 * @param {string} options.pathname - The current pathname (e.g., /collections/all)
 * @param {string} options.baseUrl - The base URL of the site (e.g., https://kaah.co.za)
 * @param {URLSearchParams} [options.searchParams] - The current search parameters
 * @param {boolean} [options.preserveParams=false] - Whether to preserve non-pagination parameters
 * @returns {string} The canonical URL
 */
export function getCanonicalUrl({
  pathname,
  baseUrl = SITE_CONFIG.baseUrl,
  searchParams,
  preserveParams = false
}) {
  // If no search params, just return the base URL + pathname
  if (!searchParams || searchParams.toString() === '') {
    return `${baseUrl}${pathname}`;
  }

  // Create a new URLSearchParams object to avoid modifying the original
  const cleanParams = new URLSearchParams();

  // If we want to preserve non-pagination parameters
  if (preserveParams) {
    // Copy all parameters except pagination-related ones
    for (const [key, value] of searchParams.entries()) {
      if (!isPaginationParam(key)) {
        cleanParams.append(key, value);
      }
    }
  }

  // If there are clean parameters to include, add them to the URL
  const queryString = cleanParams.toString();
  if (queryString) {
    return `${baseUrl}${pathname}?${queryString}`;
  }

  // Otherwise, return just the base URL + pathname
  return `${baseUrl}${pathname}`;
}

/**
 * Checks if a parameter is related to pagination
 * 
 * @param {string} paramName - The parameter name to check
 * @returns {boolean} True if the parameter is pagination-related
 */
function isPaginationParam(paramName) {
  const paginationParams = [
    'cursor',
    'direction',
    'page',
    'after',
    'before',
    'next',
    'prev'
  ];
  
  return paginationParams.includes(paramName.toLowerCase());
}

/**
 * Generates comprehensive SEO meta tags including Open Graph and Twitter Cards
 *
 * @param {Object} options - Options for generating SEO meta tags
 * @param {string} options.title - The page title
 * @param {string} [options.description] - The page description
 * @param {string} options.pathname - The current pathname
 * @param {string} [options.baseUrl] - The base URL of the site
 * @param {URLSearchParams} [options.searchParams] - The current search parameters
 * @param {boolean} [options.preserveParams=false] - Whether to preserve non-pagination parameters
 * @param {string} [options.image] - Open Graph image URL
 * @param {string} [options.imageAlt] - Alt text for the image
 * @param {string} [options.type='website'] - Open Graph type
 * @param {string[]} [options.keywords] - Additional keywords for this page
 * @param {string} [options.author] - Page author
 * @param {boolean} [options.noIndex=false] - Whether to add noindex directive
 * @param {boolean} [options.noFollow=false] - Whether to add nofollow directive
 * @returns {Array} Array of meta tag objects
 */
export function createSeoMeta({
  title,
  description = SITE_CONFIG.defaultDescription,
  pathname,
  baseUrl = SITE_CONFIG.baseUrl,
  searchParams,
  preserveParams = false,
  image,
  imageAlt,
  type = 'website',
  keywords = [],
  author,
  noIndex = false,
  noFollow = false
}) {
  const canonicalUrl = getCanonicalUrl({ pathname, baseUrl, searchParams, preserveParams });
  const fullTitle = title.includes(SITE_CONFIG.siteName) ? title : `${title} | ${SITE_CONFIG.siteName}`;
  const ogImage = image || `${baseUrl}${SITE_CONFIG.defaultImage}`;
  const allKeywords = [...new Set([...SITE_CONFIG.defaultKeywords.split(', '), ...keywords])].join(', ');

  const metaTags = [
    { title: fullTitle },
    { name: 'description', content: description },
    { name: 'keywords', content: allKeywords },

    // Canonical URL
    { tagName: 'link', rel: 'canonical', href: canonicalUrl },

    // Open Graph meta tags
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: SITE_CONFIG.siteName },
    { property: 'og:image', content: ogImage },

    // Twitter Card meta tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: ogImage },

    // Additional meta tags
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#2563eb' }, // Adjust to your brand color
  ];

  // Add image alt text if provided
  if (imageAlt) {
    metaTags.push({ property: 'og:image:alt', content: imageAlt });
    metaTags.push({ name: 'twitter:image:alt', content: imageAlt });
  }

  // Add Twitter handle if available
  if (SITE_CONFIG.twitterHandle) {
    metaTags.push({ name: 'twitter:site', content: SITE_CONFIG.twitterHandle });
    metaTags.push({ name: 'twitter:creator', content: SITE_CONFIG.twitterHandle });
  }

  // Add Facebook App ID if available
  if (SITE_CONFIG.facebookAppId) {
    metaTags.push({ property: 'fb:app_id', content: SITE_CONFIG.facebookAppId });
  }

  // Add author if provided
  if (author) {
    metaTags.push({ name: 'author', content: author });
  }

  // Add robots directive if needed
  if (noIndex || noFollow) {
    const robotsContent = [];
    if (noIndex) robotsContent.push('noindex');
    if (noFollow) robotsContent.push('nofollow');
    metaTags.push({ name: 'robots', content: robotsContent.join(', ') });
  }

  return metaTags;
}

/**
 * Creates product-specific SEO meta tags with structured data
 *
 * @param {Object} options - Product SEO options
 * @param {Object} options.product - Product data from Shopify
 * @param {string} options.pathname - Current pathname
 * @param {URLSearchParams} [options.searchParams] - Search parameters
 * @param {boolean} [options.includeStructuredData=true] - Whether to include JSON-LD
 * @returns {Array} Array of meta tag objects
 */
export function createProductSeoMeta({ product, pathname, searchParams, includeStructuredData = false }) {
  if (!product) {
    return createSeoMeta({
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
      pathname,
      searchParams,
      noIndex: true
    });
  }

  const title = product.title;
  const description = product.seo?.description ||
    product.description ||
    `Buy ${product.title} at ${SITE_CONFIG.siteName}. ${product.vendor ? `From ${product.vendor}.` : ''} High quality products with fast delivery.`;

  const image = product.featuredImage?.url || product.images?.nodes?.[0]?.url;
  const imageAlt = product.featuredImage?.altText || product.images?.nodes?.[0]?.altText || product.title;

  const keywords = [
    product.title.toLowerCase(),
    ...(product.vendor ? [product.vendor.toLowerCase()] : []),
    ...(product.productType ? [product.productType.toLowerCase()] : []),
    ...(product.tags || []).map(tag => tag.toLowerCase()),
    'buy online', 'delivery', 'quality'
  ];

  const metaTags = createSeoMeta({
    title,
    description,
    pathname,
    searchParams,
    image,
    imageAlt,
    type: 'product',
    keywords
  });

  // Add structured data if requested
  if (includeStructuredData) {
    try {
      const productSchema = createInlineProductSchema(product);

      if (productSchema) {
        const structuredDataMeta = createStructuredDataMeta(productSchema);
        if (structuredDataMeta) {
          metaTags.push(structuredDataMeta);
        }
      }
    } catch (error) {
      console.warn('Failed to create product structured data:', error);
    }
  }

  return metaTags;
}

/**
 * Creates collection-specific SEO meta tags with structured data
 *
 * @param {Object} options - Collection SEO options
 * @param {Object} options.collection - Collection data from Shopify
 * @param {string} options.pathname - Current pathname
 * @param {URLSearchParams} [options.searchParams] - Search parameters
 * @param {boolean} [options.includeStructuredData=true] - Whether to include JSON-LD
 * @returns {Array} Array of meta tag objects
 */
export function createCollectionSeoMeta({ collection, pathname, searchParams, includeStructuredData = false }) {
  if (!collection) {
    return createSeoMeta({
      title: 'Collection Not Found',
      description: 'The requested collection could not be found.',
      pathname,
      searchParams,
      noIndex: true
    });
  }

  const title = `${collection.title} Collection`;
  const description = collection.seo?.description ||
    collection.description ||
    `Shop our ${collection.title.toLowerCase()} collection at ${SITE_CONFIG.siteName}. Discover quality products with competitive prices and fast delivery.`;

  const image = collection.image?.url;
  const imageAlt = collection.image?.altText || `${collection.title} collection`;

  const keywords = [
    collection.title.toLowerCase(),
    'collection',
    'shop',
    'buy online',
    ...(collection.handle ? [collection.handle.replace(/-/g, ' ')] : [])
  ];

  const metaTags = createSeoMeta({
    title,
    description,
    pathname,
    searchParams,
    preserveParams: true, // Preserve filter parameters for collections
    image,
    imageAlt,
    keywords
  });

  // Add structured data if requested
  if (includeStructuredData) {
    try {
      const schemas = [];

      // Add collection schema
      const collectionSchema = createInlineCollectionSchema(collection);
      if (collectionSchema) {
        schemas.push(collectionSchema);
      }

      // Add breadcrumb schema
      const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Collections', url: '/collections' },
        { name: collection.title, url: `/collections/${collection.handle}` }
      ];
      const breadcrumbSchema = createInlineBreadcrumbSchema(breadcrumbs);
      if (breadcrumbSchema) {
        schemas.push(breadcrumbSchema);
      }

      if (schemas.length > 0) {
        const structuredDataMeta = createStructuredDataMeta(schemas);
        if (structuredDataMeta) {
          metaTags.push(structuredDataMeta);
        }
      }
    } catch (error) {
      console.warn('Failed to create collection structured data:', error);
    }
  }

  return metaTags;
}

/**
 * Creates blog/article-specific SEO meta tags with structured data
 *
 * @param {Object} options - Article SEO options
 * @param {Object} options.article - Article data from Shopify
 * @param {Object} [options.blog] - Blog data from Shopify
 * @param {string} options.pathname - Current pathname
 * @param {URLSearchParams} [options.searchParams] - Search parameters
 * @param {boolean} [options.includeStructuredData=true] - Whether to include JSON-LD
 * @returns {Array} Array of meta tag objects
 */
export function createArticleSeoMeta({ article, blog, pathname, searchParams, includeStructuredData = false }) {
  if (!article) {
    return createSeoMeta({
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
      pathname,
      searchParams,
      noIndex: true
    });
  }

  const title = article.title;
  const description = article.seo?.description ||
    article.excerpt ||
    `Read ${article.title} on the ${blog?.title || SITE_CONFIG.siteName} blog.`;

  const image = article.image?.url;
  const imageAlt = article.image?.altText || article.title;

  const keywords = [
    ...(article.tags || []).map(tag => tag.toLowerCase()),
    'blog',
    'article',
    ...(blog?.title ? [blog.title.toLowerCase()] : [])
  ];

  const metaTags = createSeoMeta({
    title,
    description,
    pathname,
    searchParams,
    image,
    imageAlt,
    type: 'article',
    keywords,
    author: article.author || SITE_CONFIG.siteName
  });

  // Add structured data if requested
  if (includeStructuredData) {
    try {
      const schemas = [];

      // Add article schema
      const articleSchema = createInlineArticleSchema(article, blog);
      if (articleSchema) {
        schemas.push(articleSchema);
      }

      // Add breadcrumb schema
      const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Blog', url: `/blogs/${blog?.handle || 'blog'}` },
        { name: article.title, url: `/blogs/${blog?.handle || 'blog'}/${article.handle}` }
      ];
      const breadcrumbSchema = createInlineBreadcrumbSchema(breadcrumbs);
      if (breadcrumbSchema) {
        schemas.push(breadcrumbSchema);
      }

      if (schemas.length > 0) {
        const structuredDataMeta = createStructuredDataMeta(schemas);
        if (structuredDataMeta) {
          metaTags.push(structuredDataMeta);
        }
      }
    } catch (error) {
      console.warn('Failed to create article structured data:', error);
    }
  }

  return metaTags;
}

/**
 * Creates search results SEO meta tags
 *
 * @param {Object} options - Search SEO options
 * @param {string} [options.searchTerm] - The search query
 * @param {number} [options.resultCount] - Number of search results
 * @param {string} options.pathname - Current pathname
 * @param {URLSearchParams} [options.searchParams] - Search parameters
 * @returns {Array} Array of meta tag objects
 */
export function createSearchSeoMeta({ searchTerm, resultCount, pathname, searchParams }) {
  const title = searchTerm
    ? `Search results for "${searchTerm}"`
    : 'Search Products';

  const description = searchTerm
    ? `Found ${resultCount || 0} results for "${searchTerm}" at ${SITE_CONFIG.siteName}. Shop quality products with fast delivery.`
    : `Search for products, collections, and more at ${SITE_CONFIG.siteName}. Find exactly what you're looking for.`;

  const keywords = [
    'search',
    'find products',
    ...(searchTerm ? [searchTerm.toLowerCase()] : [])
  ];

  return createSeoMeta({
    title,
    description,
    pathname,
    searchParams,
    keywords,
    noIndex: true // Search results should not be indexed
  });
}

/**
 * Truncates text to a specified length while preserving word boundaries
 *
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 160) {
  if (!text || text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Creates a product schema object inline
 * @param {Object} product - Product data from Shopify
 * @returns {Object|null} Product schema object
 */
export function createInlineProductSchema(product) {
  if (!product) return null;

  const variant = product.variants?.nodes?.[0] || product.selectedVariant;
  const productImage = product.featuredImage || product.images?.nodes?.[0];
  const price = variant?.price?.amount || product.priceRange?.minVariantPrice?.amount;
  const compareAtPrice = variant?.compareAtPrice?.amount;
  const currency = variant?.price?.currencyCode || product.priceRange?.minVariantPrice?.currencyCode || 'ZAR';

  // Skip schema creation if no price available
  if (!price) {
    console.warn(`Product ${product.handle} missing price information for schema`);
    return null;
  }

  // Build offers with proper price validation
  const offers = {
    "@type": "Offer",
    "url": `${SITE_CONFIG.baseUrl}/products/${product.handle}`,
    "priceCurrency": currency,
    "price": parseFloat(price).toFixed(2),
    "availability": product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "seller": {
      "@type": "Organization",
      "name": SITE_CONFIG.siteName
    }
  };

  // Add compare at price logic with proper validation
  if (compareAtPrice) {
    const currentPrice = parseFloat(price);
    const originalPrice = parseFloat(compareAtPrice);

    if (!isNaN(originalPrice) && !isNaN(currentPrice) && originalPrice > currentPrice) {
      const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      offers.priceValidUntil = validUntil.toISOString().split('T')[0];
      offers.highPrice = originalPrice.toFixed(2);
      offers.lowPrice = currentPrice.toFixed(2);
    }
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description || `${product.title} available at ${SITE_CONFIG.siteName}`,
    "url": `${SITE_CONFIG.baseUrl}/products/${product.handle}`,
    "sku": variant?.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": product.vendor || SITE_CONFIG.siteName
    },
    "offers": offers
  };

  if (productImage?.url) {
    productSchema.image = productImage.url;
  }

  if (product.productType) {
    productSchema.category = product.productType;
  }

  return productSchema;
}

/**
 * Creates a collection schema object inline
 * @param {Object} collection - Collection data from Shopify
 * @returns {Object|null} Collection schema object
 */
export function createInlineCollectionSchema(collection) {
  if (!collection) return null;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": collection.title,
    "description": collection.description || `Shop ${collection.title} at ${SITE_CONFIG.siteName}`,
    "url": `${SITE_CONFIG.baseUrl}/collections/${collection.handle}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": collection.title,
      "description": collection.description,
      "numberOfItems": collection.products?.nodes?.length || 0
    }
  };

  if (collection.image?.url) {
    collectionSchema.image = collection.image.url;
  }

  return collectionSchema;
}

/**
 * Creates a breadcrumb schema object inline
 * @param {Array} breadcrumbs - Array of breadcrumb items {name, url}
 * @returns {Object|null} Breadcrumb schema object
 */
export function createInlineBreadcrumbSchema(breadcrumbs) {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url.startsWith('http') ? crumb.url : `${SITE_CONFIG.baseUrl}${crumb.url}`
    }))
  };
}

/**
 * Creates an article schema object inline
 * @param {Object} article - Article data from Shopify
 * @param {Object} blog - Blog data from Shopify
 * @returns {Object|null} Article schema object
 */
export function createInlineArticleSchema(article, blog) {
  if (!article) return null;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt || article.summary,
    "url": `${SITE_CONFIG.baseUrl}/blogs/${blog?.handle || 'blog'}/${article.handle}`,
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
        "url": `${SITE_CONFIG.baseUrl}/logo.svg`
      }
    }
  };

  if (article.image?.url) {
    articleSchema.image = {
      "@type": "ImageObject",
      "url": article.image.url,
      "width": article.image.width,
      "height": article.image.height
    };
  }

  if (blog?.title) {
    articleSchema.articleSection = blog.title;
  }

  if (article.tags && article.tags.length > 0) {
    articleSchema.keywords = article.tags.join(', ');
  }

  return articleSchema;
}

/**
 * Generates JSON-LD string for structured data
 * @param {Object|Array} schema - Schema object or array of schemas
 * @returns {string|null} JSON-LD string
 */
export function generateJsonLdString(schema) {
  if (!schema) return null;

  const schemaArray = Array.isArray(schema) ? schema : [schema];
  const validSchemas = schemaArray.filter(s => s !== null && s !== undefined);

  if (validSchemas.length === 0) return null;

  return JSON.stringify(validSchemas.length === 1 ? validSchemas[0] : validSchemas, null, 0);
}

/**
 * Creates structured data script tag for JSON-LD (for use in components)
 * @param {Object|Array} schema - Schema object or array of schemas
 * @returns {Object|null} Script tag object for Remix meta
 */
export function createStructuredDataMeta(schema) {
  const jsonLd = generateJsonLdString(schema);
  if (!jsonLd) return null;

  // Return as a special meta tag that we can handle in the root layout
  return {
    name: 'structured-data',
    content: jsonLd
  };
}

/**
 * Creates organization schema for the site
 * @returns {Object} Organization schema object
 */
export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_CONFIG.siteName,
    "url": SITE_CONFIG.baseUrl,
    "logo": `${SITE_CONFIG.baseUrl}/logo.svg`,
    "description": SITE_CONFIG.defaultDescription,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+27-11-123-4567", // Update with actual phone number
      "contactType": "customer service",
      "availableLanguage": ["English", "Afrikaans"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main Street", // Update with actual address
      "addressLocality": "Johannesburg",
      "addressRegion": "Gauteng",
      "postalCode": "2000",
      "addressCountry": "ZA"
    },
    "sameAs": [
      "https://www.facebook.com/kaahsupermarket", // Update with actual social media URLs
      "https://www.instagram.com/kaahsupermarket",
      "https://twitter.com/kaahsupermarket"
    ]
  };
}

/**
 * Creates website schema for the site
 * @returns {Object} Website schema object
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

// Export site configuration for use in other files
export { SITE_CONFIG };
