# Structured Data Implementation Fixes

This document outlines the critical fixes applied to the structured data implementation to resolve price comparison logic and undefined value issues.

## Issues Fixed

### 1. Product Schema Price Comparison Logic Fix

**Problem**: The original price comparison logic had several issues:
- No validation of price data types
- Missing null checks for price values
- Incorrect comparison logic for compareAtPrice
- No proper formatting of price values

**Solution**: Enhanced price validation and comparison logic

#### Before:
```javascript
const price = variant?.price?.amount || product.priceRange?.minVariantPrice?.amount;
const compareAtPrice = variant?.compareAtPrice?.amount;

// Add compare at price if available
if (compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price)) {
  offers.priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}
```

#### After:
```javascript
const price = variant?.price?.amount || product.priceRange?.minVariantPrice?.amount;
const compareAtPrice = variant?.compareAtPrice?.amount;

// Validate price data
if (!price) {
  console.warn(`Product ${product.handle} missing price information`);
  return null;
}

// Build offers with proper price validation
const offers = {
  "@type": "Offer",
  "price": parseFloat(price).toFixed(2),
  "priceCurrency": currency,
  // ... other properties
};

// Add compare at price logic with proper validation
if (compareAtPrice) {
  const currentPrice = parseFloat(price);
  const originalPrice = parseFloat(compareAtPrice);
  
  // Only add compare at price if it's actually higher than current price
  if (!isNaN(originalPrice) && !isNaN(currentPrice) && originalPrice > currentPrice) {
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    offers.priceValidUntil = validUntil.toISOString().split('T')[0];
    offers.highPrice = originalPrice.toFixed(2);
    offers.lowPrice = currentPrice.toFixed(2);
  }
}
```

**Improvements**:
- ✅ Validates price data exists before creating schema
- ✅ Proper number parsing with NaN checks
- ✅ Only adds price comparison when compareAtPrice is actually higher
- ✅ Formats prices to 2 decimal places
- ✅ Adds highPrice/lowPrice properties for better schema compliance
- ✅ Returns null for products without valid pricing

### 2. Event Schema Undefined Value Issue Fix

**Problem**: The original event schema had potential undefined value issues:
- Could include undefined properties in the schema
- No validation of required fields
- Offers object could be undefined but still included

**Solution**: Comprehensive validation and conditional property inclusion

#### Before:
```javascript
export function createEventSchema(event) {
  if (!event) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": event.description,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "offers": event.offers ? {
      "@type": "Offer",
      "description": event.offers.description,
      "price": event.offers.price || "0",
      "priceCurrency": event.offers.currency || "ZAR",
      "availability": "https://schema.org/InStock"
    } : undefined  // ❌ This could add undefined to schema
  };
}
```

#### After:
```javascript
export function createEventSchema(event) {
  if (!event || !event.name || !event.startDate) {
    console.warn('Event schema requires at least name and startDate');
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "startDate": event.startDate,
    "location": {
      "@type": "VirtualLocation",
      "url": event.url || SITE_CONFIG.baseUrl
    },
    "organizer": {
      "@type": "Organization",
      "name": SITE_CONFIG.siteName,
      "url": SITE_CONFIG.baseUrl
    }
  };

  // Add optional properties only if they exist
  if (event.description) {
    schema.description = event.description;
  }

  if (event.endDate) {
    schema.endDate = event.endDate;
  }

  // Add offers only if properly structured
  if (event.offers && typeof event.offers === 'object') {
    const offers = {
      "@type": "Offer",
      "availability": "https://schema.org/InStock"
    };

    if (event.offers.description) {
      offers.description = event.offers.description;
    }

    if (event.offers.price !== undefined) {
      offers.price = String(event.offers.price);
      offers.priceCurrency = event.offers.currency || "ZAR";
    } else {
      offers.price = "0";
      offers.priceCurrency = "ZAR";
    }

    schema.offers = offers;
  }

  return schema;
}
```

**Improvements**:
- ✅ Validates required fields (name, startDate) before creating schema
- ✅ Only adds properties that actually exist (no undefined values)
- ✅ Proper type checking for offers object
- ✅ Safe string conversion for price values
- ✅ Returns null for invalid events
- ✅ Comprehensive error handling with warnings

## Enhanced Testing

### Updated Test Script (`scripts/test-structured-data.js`)

Added comprehensive test cases for edge cases:

1. **Product Schema Tests**:
   - ✅ Valid product with price comparison
   - ✅ Product without price data (should return null)
   - ✅ Product with invalid compareAtPrice (lower than current price)
   - ✅ Price format validation
   - ✅ Currency validation

2. **Event Schema Tests**:
   - ✅ Valid event with all properties
   - ✅ Event with missing required fields (should return null)
   - ✅ Event with undefined offers (should not include offers)
   - ✅ Date format validation
   - ✅ Offers price validation

3. **Enhanced Validation**:
   - ✅ Price comparison logic validation
   - ✅ Undefined value detection
   - ✅ Required property checking
   - ✅ Data type validation

### Test Commands

Run the enhanced test suite:
```bash
node scripts/test-structured-data.js
```

Expected output includes validation of:
- Price comparison logic: `✅ Price comparison logic validated: 29.99 < 34.99`
- Missing price handling: `✅ Product schema correctly handles missing price`
- Invalid compare price: `✅ Product schema correctly handles invalid compare at price`
- Event validation: `✅ Event schema correctly handles missing required fields`
- Undefined offers: `✅ Event schema correctly handles undefined offers`

## SEO Library Integration

Both fixes are also applied to the inline schema generation in `app/lib/seo.js`:

- ✅ Product SEO function includes enhanced price validation
- ✅ Proper error handling prevents broken schemas
- ✅ Graceful fallbacks when data is missing
- ✅ Consistent validation across all schema generation

## Benefits of Fixes

### 1. Reliability
- Prevents invalid schemas from being generated
- Handles edge cases gracefully
- Provides meaningful error messages

### 2. SEO Compliance
- Ensures schema.org compliance
- Prevents Google Rich Results errors
- Improves structured data validation scores

### 3. Performance
- Avoids unnecessary schema generation for invalid data
- Reduces JSON-LD payload size
- Prevents client-side errors

### 4. Maintainability
- Clear validation logic
- Comprehensive error handling
- Extensive test coverage

## Validation Checklist

Before deployment, ensure:

- [ ] Run test script: `node scripts/test-structured-data.js`
- [ ] All tests pass without errors
- [ ] Price comparison logic works correctly
- [ ] Event schema handles undefined values properly
- [ ] Google Rich Results Test validates schemas
- [ ] Schema.org validator shows no errors

## Monitoring

After deployment, monitor:

1. **Google Search Console**: Check for structured data errors
2. **Rich Results Test**: Validate live pages
3. **Server Logs**: Watch for schema generation warnings
4. **Performance**: Ensure no impact on page load times

These fixes ensure robust, reliable structured data generation that handles real-world edge cases and maintains SEO compliance.
