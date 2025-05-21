/**
 * Script to create Product Poster metaobject definitions in Shopify
 * 
 * This script creates:
 * 1. A 'product_poster' metaobject definition for the poster itself
 * 2. A 'poster_product_item' metaobject definition for individual product items on the poster
 * 
 * Usage:
 * 1. Set your Shopify Admin API access token and store URL in environment variables
 * 2. Run this script with Node.js: node scripts/create-product-poster-metaobjects.js
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
 * Main function to create all metaobject definitions
 */
async function createMetaobjectDefinitions() {
  try {
    console.log('Creating Product Poster metaobject definitions...');
    
    // Create the product_poster metaobject definition
    const posterDefinition = await createProductPosterDefinition();
    console.log('Product Poster definition created:', posterDefinition);
    
    // Create the poster_product_item metaobject definition
    const productItemDefinition = await createPosterProductItemDefinition();
    console.log('Poster Product Item definition created:', productItemDefinition);
    
    console.log('All metaobject definitions created successfully!');
  } catch (error) {
    console.error('Error creating metaobject definitions:', error);
  }
}

/**
 * Function to create the product_poster metaobject definition
 */
async function createProductPosterDefinition() {
  const query = `
    mutation CreateProductPosterDefinition {
      metaobjectDefinitionCreate(
        definition: {
          name: "Product Poster"
          apiId: "product_poster"
          description: "Poster for displaying multiple products with prices"
          fieldDefinitions: [
            {
              name: "Title"
              apiId: "title"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Background Image"
              apiId: "background_image"
              type: {
                name: "file_reference"
              }
            },
            {
              name: "Background Color"
              apiId: "background_color"
              type: {
                name: "single_line_text_field"
              }
              description: "Hex color code (e.g., #FFFFFF)"
            },
            {
              name: "Layout Type"
              apiId: "layout_type"
              type: {
                name: "single_line_text_field"
              }
              description: "Layout template to use (e.g., grid, freestyle)"
              validations: {
                options: ["grid", "freestyle"]
              }
            },
            {
              name: "Products"
              apiId: "products"
              type: {
                name: "list.product_reference"
              }
              description: "Products to display on the poster"
            },
            {
              name: "Poster Items"
              apiId: "poster_items"
              type: {
                name: "list.metaobject_reference"
                metaobjectDefinition: {
                  type: "poster_product_item"
                }
              }
              description: "Custom product items with positioning for the poster"
            },
            {
              name: "Effective Date"
              apiId: "effective_date"
              type: {
                name: "date"
              }
              description: "Start date for the poster promotion"
            },
            {
              name: "Expiry Date"
              apiId: "expiry_date"
              type: {
                name: "date"
              }
              description: "End date for the poster promotion"
            }
          ]
        }
      ) {
        metaobjectDefinition {
          id
          name
          apiId
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
  
  if (data.data.metaobjectDefinitionCreate.userErrors.length > 0) {
    throw new Error(JSON.stringify(data.data.metaobjectDefinitionCreate.userErrors, null, 2));
  }
  
  return data.data.metaobjectDefinitionCreate.metaobjectDefinition;
}

/**
 * Function to create the poster_product_item metaobject definition
 */
async function createPosterProductItemDefinition() {
  const query = `
    mutation CreatePosterProductItemDefinition {
      metaobjectDefinitionCreate(
        definition: {
          name: "Poster Product Item"
          apiId: "poster_product_item"
          description: "Individual product items for the product poster"
          fieldDefinitions: [
            {
              name: "Product"
              apiId: "product"
              type: {
                name: "product_reference"
              }
              required: true
            },
            {
              name: "Custom Price"
              apiId: "custom_price"
              type: {
                name: "number_decimal"
              }
              description: "Custom price for this product on the poster"
            },
            {
              name: "Position X"
              apiId: "position_x"
              type: {
                name: "number_integer"
              }
              description: "X coordinate for positioning (0-100)"
            },
            {
              name: "Position Y"
              apiId: "position_y"
              type: {
                name: "number_integer"
              }
              description: "Y coordinate for positioning (0-100)"
            },
            {
              name: "Size"
              apiId: "size"
              type: {
                name: "number_integer"
              }
              description: "Size of the product image (1-100)"
            },
            {
              name: "Highlight"
              apiId: "highlight"
              type: {
                name: "boolean"
              }
              description: "Whether to highlight this product"
            },
            {
              name: "Custom Label"
              apiId: "custom_label"
              type: {
                name: "single_line_text_field"
              }
              description: "Custom label for the product (e.g., 'SALE', 'NEW')"
            }
          ]
        }
      ) {
        metaobjectDefinition {
          id
          name
          apiId
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
  
  if (data.data.metaobjectDefinitionCreate.userErrors.length > 0) {
    throw new Error(JSON.stringify(data.data.metaobjectDefinitionCreate.userErrors, null, 2));
  }
  
  return data.data.metaobjectDefinitionCreate.metaobjectDefinition;
}

// Run the script
createMetaobjectDefinitions();
