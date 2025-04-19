/**
 * This script tests the promotion card metaobject implementation
 * by fetching the existing metaobjects and displaying their data.
 * 
 * Prerequisites:
 * - Node.js installed
 * - Shopify Admin API access token
 * - Metaobject definition for "promotion_card" already created
 * 
 * Usage:
 * 1. Replace the placeholders with your actual values
 * 2. Run with: node test-promotion-metaobjects.js
 */

const fetch = require('node-fetch');

// Replace these with your actual values
const SHOP_DOMAIN = 'your-store.myshopify.com';
const ACCESS_TOKEN = 'your-admin-api-access-token';

// GraphQL endpoint
const url = `https://${SHOP_DOMAIN}/admin/api/2023-07/graphql.json`;

// Headers for the API request
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': ACCESS_TOKEN
};

// Function to fetch promotion card metaobjects
async function fetchPromotionCards() {
  const query = `
    query GetPromotionCards {
      metaobjects(type: "promotion_card", first: 10) {
        edges {
          node {
            id
            handle
            fields {
              key
              value
              reference {
                ... on MediaImage {
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL Errors:', data.errors);
      return null;
    }

    return data.data.metaobjects.edges.map(edge => edge.node);
  } catch (error) {
    console.error('Error fetching metaobjects:', error);
    return null;
  }
}

// Function to format metaobject data for display
function formatMetaobjectData(metaobject) {
  const fields = {};
  
  metaobject.fields.forEach(field => {
    if (field.reference && field.reference.image) {
      fields[field.key] = field.reference.image.url;
    } else {
      fields[field.key] = field.value;
    }
  });

  return {
    id: metaobject.id,
    handle: metaobject.handle,
    fields
  };
}

// Main function to test the implementation
async function testPromotionCards() {
  console.log('Fetching promotion card metaobjects...');
  
  const metaobjects = await fetchPromotionCards();
  
  if (!metaobjects || metaobjects.length === 0) {
    console.log('No promotion card metaobjects found. Please create some entries first.');
    return;
  }
  
  console.log(`Found ${metaobjects.length} promotion card metaobjects:`);
  
  metaobjects.forEach((metaobject, index) => {
    const formattedData = formatMetaobjectData(metaobject);
    console.log(`\nPromotion Card #${index + 1}:`);
    console.log(JSON.stringify(formattedData, null, 2));
  });
  
  console.log('\nTest completed successfully!');
}

// Run the script
testPromotionCards()
  .catch(error => console.error('Error testing promotion cards:', error));
