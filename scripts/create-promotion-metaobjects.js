/**
 * This script demonstrates how to create promotion card metaobject entries
 * using the Shopify Admin API.
 * 
 * Prerequisites:
 * - Node.js installed
 * - Shopify Admin API access token
 * - Metaobject definition for "promotion_card" already created
 * 
 * Usage:
 * 1. Replace the placeholders with your actual values
 * 2. Run with: node create-promotion-metaobjects.js
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

// Function to create a metaobject entry
async function createMetaobject(fields) {
  const query = `
    mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
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

  const variables = {
    metaobject: {
      type: "promotion_card",
      fields: fields.map(field => ({
        key: field.key,
        value: field.value
      }))
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables })
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL Errors:', data.errors);
      return null;
    }

    if (data.data.metaobjectCreate.userErrors.length > 0) {
      console.error('User Errors:', data.data.metaobjectCreate.userErrors);
      return null;
    }

    return data.data.metaobjectCreate.metaobject;
  } catch (error) {
    console.error('Error creating metaobject:', error);
    return null;
  }
}

// Create the three promotion cards
async function createPromotionCards() {
  // First promotion card: Sale of the Month
  const saleCard = await createMetaobject([
    { key: "title", value: "Sale of the Month" },
    { key: "subtitle", value: "BEST DEALS" },
    { key: "background_color", value: "#2980b9" },
    { key: "text_color", value: "white" },
    { key: "link", value: "/collections/monthly-deals" },
    { key: "countdown_days", value: "00" },
    { key: "countdown_hours", value: "02" },
    { key: "countdown_mins", value: "18" },
    { key: "countdown_secs", value: "46" }
  ]);
  
  console.log('Created Sale of the Month card:', saleCard);

  // Second promotion card: Low-Fat Meat
  const meatCard = await createMetaobject([
    { key: "title", value: "Low-Fat Meat" },
    { key: "subtitle", value: "85% FAT FREE" },
    { key: "background_color", value: "#000000" },
    { key: "text_color", value: "white" },
    { key: "link", value: "/collections/meat" },
    { key: "price", value: "$79.99" }
  ]);
  
  console.log('Created Low-Fat Meat card:', meatCard);

  // Third promotion card: Fresh Fruit
  const fruitCard = await createMetaobject([
    { key: "title", value: "100% Fresh Fruit" },
    { key: "subtitle", value: "SUMMER SALE" },
    { key: "background_color", value: "#f1c40f" },
    { key: "text_color", value: "black" },
    { key: "link", value: "/collections/fruits" },
    { key: "discount", value: "64% OFF" }
  ]);
  
  console.log('Created Fresh Fruit card:', fruitCard);
}

// Run the script
createPromotionCards()
  .then(() => console.log('All promotion cards created successfully!'))
  .catch(error => console.error('Error creating promotion cards:', error));
