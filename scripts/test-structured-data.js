/**
 * Test script for validating structured data implementation
 * Run with: node scripts/test-structured-data.js
 */

import { createProductSchema, createCollectionSchema, createArticleSchema, createOrganizationSchema, createWebsiteSchema, generateJsonLd } from '../app/lib/structured-data.js';

// Test data
const testProduct = {
  id: 'gid://shopify/Product/123',
  title: 'Premium Organic Apples',
  description: 'Fresh, crisp organic apples sourced from local farms.',
  handle: 'premium-organic-apples',
  vendor: 'Local Farms',
  productType: 'Fruits',
  availableForSale: true,
  featuredImage: {
    url: 'https://example.com/apples.jpg',
    altText: 'Premium Organic Apples'
  },
  variants: {
    nodes: [{
      id: 'gid://shopify/ProductVariant/456',
      sku: 'APPLES-ORG-1KG',
      price: {
        amount: '29.99',
        currencyCode: 'ZAR'
      },
      compareAtPrice: {
        amount: '34.99',
        currencyCode: 'ZAR'
      }
    }]
  },
  tags: ['organic', 'fresh', 'local', 'healthy']
};

const testCollection = {
  id: 'gid://shopify/Collection/789',
  title: 'Fresh Fruits',
  description: 'Our selection of fresh, seasonal fruits.',
  handle: 'fresh-fruits',
  image: {
    url: 'https://example.com/fruits-collection.jpg',
    altText: 'Fresh Fruits Collection'
  },
  products: {
    nodes: new Array(15).fill(null) // 15 products
  }
};

const testArticle = {
  id: 'gid://shopify/Article/101',
  title: 'The Benefits of Organic Produce',
  excerpt: 'Discover why choosing organic produce is better for your health and the environment.',
  handle: 'benefits-of-organic-produce',
  author: 'Kaah Nutrition Team',
  publishedAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  image: {
    url: 'https://example.com/organic-produce.jpg',
    altText: 'Organic Produce Benefits',
    width: 1200,
    height: 630
  },
  tags: ['organic', 'health', 'nutrition', 'environment']
};

const testBlog = {
  handle: 'nutrition-tips',
  title: 'Nutrition Tips'
};

function validateSchema(schema, schemaType) {
  console.log(`\n=== Testing ${schemaType} Schema ===`);
  
  if (!schema) {
    console.error(`❌ ${schemaType} schema is null or undefined`);
    return false;
  }

  // Check required properties
  const requiredProps = {
    'Product': ['@context', '@type', 'name', 'offers'],
    'Collection': ['@context', '@type', 'name', 'url'],
    'Article': ['@context', '@type', 'headline', 'author', 'publisher'],
    'Organization': ['@context', '@type', 'name', 'url'],
    'WebSite': ['@context', '@type', 'name', 'url']
  };

  const required = requiredProps[schemaType] || ['@context', '@type'];
  const missing = required.filter(prop => !schema[prop]);

  if (missing.length > 0) {
    console.error(`❌ Missing required properties: ${missing.join(', ')}`);
    return false;
  }

  // Validate JSON structure
  try {
    const jsonString = JSON.stringify(schema, null, 2);
    JSON.parse(jsonString);
    console.log(`✅ ${schemaType} schema is valid JSON`);
  } catch (error) {
    console.error(`❌ ${schemaType} schema has invalid JSON structure:`, error.message);
    return false;
  }

  // Check schema.org context
  if (schema['@context'] !== 'https://schema.org') {
    console.warn(`⚠️  ${schemaType} schema context should be 'https://schema.org'`);
  }

  // Type-specific validations
  if (schemaType === 'Product') {
    if (!schema.offers || !schema.offers.price) {
      console.error(`❌ Product schema missing price information`);
      return false;
    }
    if (!schema.offers.priceCurrency) {
      console.error(`❌ Product schema missing currency information`);
      return false;
    }
  }

  if (schemaType === 'Article') {
    if (!schema.datePublished) {
      console.warn(`⚠️  Article schema missing publication date`);
    }
    if (!schema.publisher || !schema.publisher.name) {
      console.error(`❌ Article schema missing publisher information`);
      return false;
    }
  }

  console.log(`✅ ${schemaType} schema validation passed`);
  return true;
}

function testStructuredData() {
  console.log('🧪 Testing Structured Data Implementation\n');

  let allPassed = true;

  // Test Product Schema
  try {
    const productSchema = createProductSchema(testProduct);
    if (!validateSchema(productSchema, 'Product')) {
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Error creating product schema:', error.message);
    allPassed = false;
  }

  // Test Collection Schema
  try {
    const collectionSchema = createCollectionSchema(testCollection);
    if (!validateSchema(collectionSchema, 'Collection')) {
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Error creating collection schema:', error.message);
    allPassed = false;
  }

  // Test Article Schema
  try {
    const articleSchema = createArticleSchema(testArticle, testBlog);
    if (!validateSchema(articleSchema, 'Article')) {
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Error creating article schema:', error.message);
    allPassed = false;
  }

  // Test Organization Schema
  try {
    const organizationSchema = createOrganizationSchema();
    if (!validateSchema(organizationSchema, 'Organization')) {
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Error creating organization schema:', error.message);
    allPassed = false;
  }

  // Test Website Schema
  try {
    const websiteSchema = createWebsiteSchema();
    if (!validateSchema(websiteSchema, 'WebSite')) {
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Error creating website schema:', error.message);
    allPassed = false;
  }

  // Test JSON-LD Generation
  try {
    const schemas = [
      createOrganizationSchema(),
      createWebsiteSchema(),
      createProductSchema(testProduct)
    ];
    
    const jsonLd = generateJsonLd(schemas);
    if (jsonLd) {
      JSON.parse(jsonLd); // Validate JSON
      console.log('\n✅ JSON-LD generation successful');
    } else {
      console.error('\n❌ JSON-LD generation failed');
      allPassed = false;
    }
  } catch (error) {
    console.error('\n❌ Error generating JSON-LD:', error.message);
    allPassed = false;
  }

  // Final result
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 All structured data tests passed!');
    console.log('\nNext steps:');
    console.log('1. Deploy your changes');
    console.log('2. Test with Google Rich Results Test: https://search.google.com/test/rich-results');
    console.log('3. Validate with Schema.org validator: https://validator.schema.org/');
  } else {
    console.log('❌ Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
testStructuredData();
