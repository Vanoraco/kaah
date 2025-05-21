/**
 * Script to create Promotional Poster metaobject definition in Shopify
 * 
 * This script creates a 'promotional_poster' metaobject definition for displaying
 * pre-designed promotional poster images.
 * 
 * Usage:
 * 1. Set your Shopify Admin API access token and store URL in environment variables
 * 2. Run this script with Node.js: node scripts/create-promotional-poster-metaobject.js
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
 * Main function to create the metaobject definition
 */
async function createPromotionalPosterDefinition() {
  try {
    console.log('Creating Promotional Poster metaobject definition...');
    
    const query = `
      mutation CreatePromotionalPosterDefinition {
        metaobjectDefinitionCreate(
          definition: {
            name: "Promotional Poster"
            apiId: "promotional_poster"
            description: "Pre-designed promotional posters for display on the website"
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
                name: "Poster Image"
                apiId: "poster_image"
                type: {
                  name: "file_reference"
                }
                required: true
                description: "The pre-designed promotional poster image"
              },
              {
                name: "Effective Date"
                apiId: "effective_date"
                type: {
                  name: "date"
                }
                description: "Start date for displaying the poster"
              },
              {
                name: "Expiry Date"
                apiId: "expiry_date"
                type: {
                  name: "date"
                }
                description: "End date for displaying the poster"
              },
              {
                name: "Description"
                apiId: "description"
                type: {
                  name: "multi_line_text_field"
                }
                description: "Optional description of the promotional poster"
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
    
    console.log('Promotional Poster metaobject definition created successfully:', data.data.metaobjectDefinitionCreate.metaobjectDefinition);
    return data.data.metaobjectDefinitionCreate.metaobjectDefinition;
  } catch (error) {
    console.error('Error creating metaobject definition:', error);
    throw error;
  }
}

// Run the script
createPromotionalPosterDefinition()
  .then(() => console.log('Script completed successfully!'))
  .catch(error => console.error('Script failed:', error));
