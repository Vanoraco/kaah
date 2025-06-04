# Structured Data (JSON-LD) Implementation Guide

This document outlines the comprehensive structured data implementation for Kaah Supermarket using JSON-LD schema markup.

## Overview

Structured data helps search engines understand your content better and can lead to rich snippets in search results. We've implemented JSON-LD (JavaScript Object Notation for Linked Data) following schema.org standards.

## Implementation Files

### Core Files
- `app/lib/structured-data.js` - Structured data utility functions
- `app/lib/seo.js` - Enhanced with structured data integration
- Route files - Updated with structured data in meta functions

## Schema Types Implemented

### 1. Organization Schema (`@type: "Organization"`)
**Location**: Home page (`app/routes/_index.jsx`)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Kaah Supermarket",
  "url": "https://kaah.co.za",
  "logo": "https://kaah.co.za/logo.svg",
  "description": "Shop premium quality groceries...",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "ZA",
    "addressRegion": "South Africa"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "English"
  }
}
```

**Benefits**:
- Establishes business identity
- Enables knowledge panel in search results
- Supports local SEO

### 2. Website Schema (`@type: "WebSite"`)
**Location**: Home page (`app/routes/_index.jsx`)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Kaah Supermarket",
  "url": "https://kaah.co.za",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://kaah.co.za/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

**Benefits**:
- Enables sitelinks search box in Google
- Improves site navigation in search results

### 3. Product Schema (`@type: "Product"`)
**Location**: Product pages (`app/routes/products.$handle.jsx`)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description",
  "url": "https://kaah.co.za/products/product-handle",
  "sku": "product-sku",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://kaah.co.za/products/product-handle",
    "priceCurrency": "ZAR",
    "price": "99.99",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Kaah Supermarket"
    }
  },
  "image": "https://example.com/product-image.jpg",
  "category": "Product Category"
}
```

**Benefits**:
- Rich snippets with price, availability, and ratings
- Enhanced product visibility in search
- Better shopping experience integration

### 4. Collection/Category Schema (`@type: "CollectionPage"`)
**Location**: Collection pages (`app/routes/collections.$handle.jsx`)

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Collection Name",
  "description": "Collection description",
  "url": "https://kaah.co.za/collections/collection-handle",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Collection Name",
    "description": "Collection description",
    "numberOfItems": 25
  }
}
```

**Benefits**:
- Better categorization in search results
- Enhanced navigation understanding

### 5. Article Schema (`@type: "Article"`)
**Location**: Blog articles (`app/routes/blogs.$blogHandle.$articleHandle.jsx`)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "description": "Article excerpt",
  "url": "https://kaah.co.za/blogs/blog/article",
  "datePublished": "2024-01-01T00:00:00Z",
  "dateModified": "2024-01-01T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Kaah Supermarket",
    "logo": {
      "@type": "ImageObject",
      "url": "https://kaah.co.za/logo.svg"
    }
  },
  "image": {
    "@type": "ImageObject",
    "url": "https://example.com/article-image.jpg"
  },
  "articleSection": "Blog Category",
  "keywords": "tag1, tag2, tag3"
}
```

**Benefits**:
- Rich snippets for articles
- Better content categorization
- Enhanced author attribution

### 6. Breadcrumb Schema (`@type: "BreadcrumbList"`)
**Location**: Collection and article pages

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://kaah.co.za"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Collections",
      "item": "https://kaah.co.za/collections"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Category Name",
      "item": "https://kaah.co.za/collections/category"
    }
  ]
}
```

**Benefits**:
- Breadcrumb navigation in search results
- Better site structure understanding

## Technical Implementation

### SEO Function Integration

Each specialized SEO function now includes structured data:

```javascript
// Product pages
export function createProductSeoMeta({ 
  product, 
  pathname, 
  searchParams, 
  includeStructuredData = true 
}) {
  // ... meta tags creation
  
  if (includeStructuredData) {
    // Create product schema inline
    const productSchema = { /* schema object */ };
    const structuredDataMeta = createStructuredDataMeta(productSchema);
    metaTags.push(structuredDataMeta);
  }
  
  return metaTags;
}
```

### Structured Data Meta Creation

```javascript
export function createStructuredDataMeta(schema) {
  if (!schema) return null;
  
  const schemaArray = Array.isArray(schema) ? schema : [schema];
  const validSchemas = schemaArray.filter(s => s !== null && s !== undefined);
  
  if (validSchemas.length === 0) return null;
  
  const jsonLd = JSON.stringify(
    validSchemas.length === 1 ? validSchemas[0] : validSchemas, 
    null, 
    0
  );
  
  return {
    tagName: 'script',
    type: 'application/ld+json',
    children: jsonLd
  };
}
```

## Testing Structured Data

### Google Tools
1. **Rich Results Test**: https://search.google.com/test/rich-results
2. **Structured Data Testing Tool**: https://validator.schema.org/

### Testing Process
1. Deploy your changes
2. Test individual pages with Google's Rich Results Test
3. Check for errors and warnings
4. Validate schema markup with schema.org validator

### Common Issues to Check
- Valid JSON syntax
- Required properties for each schema type
- Correct data types (strings, numbers, dates)
- Valid URLs and image paths
- Proper nesting of objects

## SEO Benefits

### Search Engine Understanding
- Better content categorization
- Enhanced relevance signals
- Improved crawling efficiency

### Rich Snippets Potential
- Product prices and availability
- Star ratings and reviews
- Breadcrumb navigation
- Article publication dates
- Organization information

### User Experience
- More informative search results
- Better click-through rates
- Enhanced trust signals

## Monitoring and Maintenance

### Google Search Console
- Monitor rich results performance
- Check for structured data errors
- Track impressions and clicks

### Regular Audits
- Validate schema markup quarterly
- Update schemas when content changes
- Monitor for new schema.org updates

## Future Enhancements

### Additional Schema Types
- **Review/Rating Schema**: For product reviews
- **FAQ Schema**: For frequently asked questions
- **LocalBusiness Schema**: For physical store locations
- **Event Schema**: For promotions and sales events

### Advanced Features
- **AggregateRating**: Product review aggregation
- **Offers**: Multiple pricing options
- **VideoObject**: Product demonstration videos
- **Recipe**: For food-related content

## Quick Testing Guide

### 1. Local Testing
Run the test script to validate schemas:
```bash
node scripts/test-structured-data.js
```

### 2. Live Testing
After deployment, test your pages:

**Home Page**: https://kaah.co.za
- Should include Organization and Website schemas

**Product Page**: https://kaah.co.za/products/[product-handle]
- Should include Product schema with pricing and availability

**Collection Page**: https://kaah.co.za/collections/[collection-handle]
- Should include CollectionPage and BreadcrumbList schemas

**Blog Article**: https://kaah.co.za/blogs/[blog]/[article]
- Should include Article and BreadcrumbList schemas

### 3. Google Rich Results Test
1. Go to: https://search.google.com/test/rich-results
2. Enter your page URL
3. Check for valid structured data
4. Look for any errors or warnings

### 4. Schema.org Validator
1. Go to: https://validator.schema.org/
2. Enter your page URL or paste the JSON-LD
3. Validate against schema.org standards

## Implementation Checklist

- ✅ Organization schema on home page
- ✅ Website schema with search action
- ✅ Product schema with offers and pricing
- ✅ Collection schema with item lists
- ✅ Article schema with author and publisher
- ✅ Breadcrumb schema for navigation
- ✅ Review/rating schema (ready for future use)
- ✅ FAQ schema (ready for future use)
- ✅ Event schema (ready for promotions)

## Performance Notes

- Structured data is generated server-side during meta function execution
- JSON-LD is minified (no pretty printing) for optimal performance
- Schemas are only included when relevant data is available
- Error handling prevents broken pages if schema generation fails

---

This structured data implementation provides a solid foundation for enhanced search engine visibility and rich snippet opportunities for Kaah Supermarket.
