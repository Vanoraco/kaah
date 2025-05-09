/**
 * Script to create Mega Saver metaobject definitions and entries in Shopify
 * 
 * This script creates:
 * 1. A 'mega_saver_banner' metaobject definition for the banner/header
 * 2. A 'mega_saver_item' metaobject definition for individual product items
 * 3. Sample entries for both types
 * 
 * Usage:
 * 1. Set your Shopify Admin API access token and store URL in environment variables
 * 2. Run this script with Node.js
 */

// Replace these with your actual Shopify credentials
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

// Function to create the mega_saver_banner metaobject definition
async function createMegaSaverBannerDefinition() {
  const query = `
    mutation CreateMegaSaverBannerDefinition {
      metaobjectDefinitionCreate(
        definition: {
          name: "Mega Saver Banner"
          apiId: "mega_saver_banner"
          description: "Banner for the Mega Saver section"
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
              name: "Subtitle"
              apiId: "subtitle"
              type: {
                name: "single_line_text_field"
              }
            },
            {
              name: "Background Color"
              apiId: "background_color"
              type: {
                name: "single_line_text_field"
              }
            },
            {
              name: "Text Color"
              apiId: "text_color"
              type: {
                name: "single_line_text_field"
              }
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

    if (data.data.metaobjectDefinitionCreate.userErrors.length > 0) {
      console.error('User Errors:', data.data.metaobjectDefinitionCreate.userErrors);
      return null;
    }

    return data.data.metaobjectDefinitionCreate.metaobjectDefinition;
  } catch (error) {
    console.error('Error creating mega_saver_banner definition:', error);
    return null;
  }
}

// Function to create the mega_saver_item metaobject definition
async function createMegaSaverItemDefinition() {
  const query = `
    mutation CreateMegaSaverItemDefinition {
      metaobjectDefinitionCreate(
        definition: {
          name: "Mega Saver Item"
          apiId: "mega_saver_item"
          description: "Individual product items for the Mega Saver section"
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
              name: "Brand"
              apiId: "brand"
              type: {
                name: "single_line_text_field"
              }
            },
            {
              name: "Price"
              apiId: "price"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Original Price"
              apiId: "original_price"
              type: {
                name: "single_line_text_field"
              }
            },
            {
              name: "Special Text"
              apiId: "special_text"
              type: {
                name: "single_line_text_field"
              }
            },
            {
              name: "Image"
              apiId: "image"
              type: {
                name: "file_reference"
              }
            },
            {
              name: "Product"
              apiId: "product"
              type: {
                name: "product_reference"
              }
            },
            {
              name: "Link"
              apiId: "link"
              type: {
                name: "single_line_text_field"
              }
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

    if (data.data.metaobjectDefinitionCreate.userErrors.length > 0) {
      console.error('User Errors:', data.data.metaobjectDefinitionCreate.userErrors);
      return null;
    }

    return data.data.metaobjectDefinitionCreate.metaobjectDefinition;
  } catch (error) {
    console.error('Error creating mega_saver_item definition:', error);
    return null;
  }
}

// Function to create a metaobject entry
async function createMetaobject(type, fields) {
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
      type: type,
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

// Main function to create all metaobject definitions and entries
async function createMegaSaverMetaobjects() {
  console.log('Creating Mega Saver metaobject definitions...');
  
  // Create metaobject definitions
  const bannerDefinition = await createMegaSaverBannerDefinition();
  console.log('Created Mega Saver Banner definition:', bannerDefinition);
  
  const itemDefinition = await createMegaSaverItemDefinition();
  console.log('Created Mega Saver Item definition:', itemDefinition);

  if (!bannerDefinition || !itemDefinition) {
    console.error('Failed to create one or more metaobject definitions. Exiting.');
    return;
  }

  // Create a banner entry
  const banner = await createMetaobject('mega_saver_banner', [
    { key: "title", value: "MEGA SAVER" },
    { key: "subtitle", value: "Great deals on your favorite products" },
    { key: "background_color", value: "#ff0000" },
    { key: "text_color", value: "#ffffff" }
  ]);
  console.log('Created Mega Saver Banner:', banner);

  // Create sample item entries
  const items = [
    {
      title: "Bull Brand Corned Meat",
      brand: "Bull Brand",
      price: "49.99",
      original_price: "59.99",
      special_text: "BUY 2 FOR"
    },
    {
      title: "Koo Chakalaka Mild & Spicy",
      brand: "Koo",
      price: "18.99",
      original_price: "24.99"
    },
    {
      title: "Lucky Star Pilchards in Tomato Sauce",
      brand: "Lucky Star",
      price: "49.99",
      original_price: "59.99",
      special_text: "BUY 2 FOR"
    },
    {
      title: "Six Gun Spice",
      brand: "Six Gun",
      price: "17.99",
      original_price: "22.99"
    }
  ];

  for (const item of items) {
    const fields = Object.entries(item).map(([key, value]) => ({ key, value }));
    const createdItem = await createMetaobject('mega_saver_item', fields);
    console.log(`Created Mega Saver Item: ${item.title}`, createdItem);
  }

  console.log('Mega Saver metaobjects creation completed!');
}

// Run the script if executed directly
if (require.main === module) {
  if (!accessToken) {
    console.error('Error: SHOPIFY_ADMIN_API_TOKEN environment variable is required');
    process.exit(1);
  }

  createMegaSaverMetaobjects().catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  createMegaSaverBannerDefinition,
  createMegaSaverItemDefinition,
  createMetaobject,
  createMegaSaverMetaobjects
};
