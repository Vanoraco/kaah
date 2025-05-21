/**
 * Script to create a sample Product Poster metaobject in Shopify
 * 
 * This script creates:
 * 1. Several 'poster_product_item' metaobjects for individual products
 * 2. A 'product_poster' metaobject that references these items
 * 
 * Usage:
 * 1. Set your Shopify Admin API access token and store URL in environment variables
 * 2. Run this script with Node.js: node scripts/create-sample-product-poster.js
 */

require('dotenv').config();
const fetch = require('node-fetch');

// Replace these with your actual Shopify credentials or use environment variables
const accessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
const shopDomain = process.env.SHOPIFY_STORE_URL || 'your-store.myshopify.com';
const apiVersion = '2023-07'; // Update to the latest API version as needed

// API endpoint
const url = `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`;

// Headers for API requests
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': accessToken
};

/**
 * Main function to create a sample product poster
 */
async function createSampleProductPoster() {
  try {
    console.log('Creating sample product poster...');
    
    // First, fetch some products to use in our poster
    const products = await fetchProducts(6); // Get 6 products
    
    if (!products || products.length === 0) {
      throw new Error('No products found in the store');
    }
    
    console.log(`Found ${products.length} products to use in the poster`);
    
    // Create poster product items for each product
    const posterItemIds = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Create different positions and sizes for variety
      const posX = 10 + (i % 3) * 30; // 3 columns: 10, 40, 70
      const posY = 20 + Math.floor(i / 3) * 40; // 2 rows: 20, 60
      const size = 80 + (i % 3) * 5; // Sizes: 80, 85, 90
      const highlight = i === 0 || i === 3; // Highlight first product in each row
      
      // Create a custom price (10% off the original price)
      const originalPrice = parseFloat(product.variants.edges[0].node.price);
      const customPrice = (originalPrice * 0.9).toFixed(2);
      
      const posterItem = await createPosterProductItem({
        product: product.id,
        customPrice: customPrice,
        positionX: posX,
        positionY: posY,
        size: size,
        highlight: highlight,
        customLabel: highlight ? 'SPECIAL' : ''
      });
      
      posterItemIds.push(posterItem.id);
      console.log(`Created poster item for product: ${product.title}`);
    }
    
    // Create the product poster that references these items
    const poster = await createProductPoster({
      title: "Weekly Special Offers",
      backgroundColor: "#f8f9fa",
      layoutType: "grid",
      posterItems: posterItemIds,
      effectiveDate: new Date().toISOString().split('T')[0], // Today
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    });
    
    console.log('Sample product poster created successfully:', poster);
  } catch (error) {
    console.error('Error creating sample product poster:', error);
  }
}

/**
 * Function to fetch products from the store
 */
async function fetchProducts(limit = 5) {
  const query = `
    query GetProducts {
      products(first: ${limit}) {
        edges {
          node {
            id
            title
            handle
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(JSON.stringify(data.errors, null, 2));
  }
  
  return data.data.products.edges.map(edge => edge.node);
}

/**
 * Function to create a poster product item metaobject
 */
async function createPosterProductItem({ product, customPrice, positionX, positionY, size, highlight, customLabel }) {
  const query = `
    mutation CreatePosterProductItem {
      metaobjectCreate(
        metaobject: {
          type: "poster_product_item",
          fields: [
            {
              key: "product",
              value: "${product}"
            },
            {
              key: "custom_price",
              value: "${customPrice}"
            },
            {
              key: "position_x",
              value: "${positionX}"
            },
            {
              key: "position_y",
              value: "${positionY}"
            },
            {
              key: "size",
              value: "${size}"
            },
            {
              key: "highlight",
              value: "${highlight}"
            },
            {
              key: "custom_label",
              value: "${customLabel}"
            }
          ]
        }
      ) {
        metaobject {
          id
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(JSON.stringify(data.errors, null, 2));
  }
  
  if (data.data.metaobjectCreate.userErrors.length > 0) {
    throw new Error(JSON.stringify(data.data.metaobjectCreate.userErrors, null, 2));
  }
  
  return data.data.metaobjectCreate.metaobject;
}

/**
 * Function to create a product poster metaobject
 */
async function createProductPoster({ title, backgroundColor, layoutType, posterItems, effectiveDate, expiryDate }) {
  // Convert poster item IDs to a JSON array string
  const posterItemsValue = JSON.stringify(posterItems);
  
  const query = `
    mutation CreateProductPoster {
      metaobjectCreate(
        metaobject: {
          type: "product_poster",
          fields: [
            {
              key: "title",
              value: "${title}"
            },
            {
              key: "background_color",
              value: "${backgroundColor}"
            },
            {
              key: "layout_type",
              value: "${layoutType}"
            },
            {
              key: "poster_items",
              value: ${posterItemsValue}
            },
            {
              key: "effective_date",
              value: "${effectiveDate}"
            },
            {
              key: "expiry_date",
              value: "${expiryDate}"
            }
          ]
        }
      ) {
        metaobject {
          id
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(JSON.stringify(data.errors, null, 2));
  }
  
  if (data.data.metaobjectCreate.userErrors.length > 0) {
    throw new Error(JSON.stringify(data.data.metaobjectCreate.userErrors, null, 2));
  }
  
  return data.data.metaobjectCreate.metaobject;
}

// Run the script
createSampleProductPoster();
