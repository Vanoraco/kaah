/**
 * This script demonstrates how to create hamper metaobject entries
 * using the Shopify Admin API.
 * 
 * Prerequisites:
 * - Node.js installed
 * - Shopify Admin API access token
 * - Metaobject definition for "hamper" already created
 * 
 * Usage:
 * 1. Replace the placeholders with your actual values
 * 2. Run with: node create-hamper-metaobjects.js
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

// Function to create a metaobject definition
async function createMetaobjectDefinition() {
  const query = `
    mutation CreateMetaobjectDefinition {
      metaobjectDefinitionCreate(
        definition: {
          name: "Hamper"
          apiId: "hamper"
          description: "Hampers with various products"
          fieldDefinitions: [
            {
              name: "Name"
              apiId: "name"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Products"
              apiId: "products"
              type: {
                name: "list.product_reference"
              }
              required: true
            },
            {
              name: "Price"
              apiId: "price"
              type: {
                name: "number_decimal"
              }
              required: true
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
    console.error('Error creating metaobject definition:', error);
    return null;
  }
}

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
      type: "hamper",
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

// Create hamper metaobject entries
async function createHamperMetaobjects() {
  // Create metaobject definition for hamper if it doesn't exist
  const hamperDefinition = await createMetaobjectDefinition();
  console.log('Created Hamper metaobject definition:', hamperDefinition);

  // Create hamper entries
  const hamper1 = await createMetaobject([
    { key: "name", value: "Hamper 1" },
    { key: "products", value: JSON.stringify(["D’lite Cooking Oil 10lt", "Snowflake Cake Flour 10kg", "Selati Brown Sugar 10kg"]) },
    { key: "price", value: "449.99" }
  ]);
  console.log('Created Hamper 1:', hamper1);

  const hamper2 = await createMetaobject([
    { key: "name", value: "Hamper 2" },
    { key: "products", value: JSON.stringify(["D’lite Cooking Oil 10lt", "Tastic Rice 10kg", "Selati Brown Sugar 10kg"]) },
    { key: "price", value: "479.99" }
  ]);
  console.log('Created Hamper 2:', hamper2);

  const hamper3 = await createMetaobject([
    { key: "name", value: "Hamper 3" },
    { key: "products", value: JSON.stringify(["Surf/Maq Washing Powder 2kg", "Sunlight Dishwashing Liquid 750ml", "Maq Fabric Softener Refill 500ml"]) },
    { key: "price", value: "109.99" }
  ]);
  console.log('Created Hamper 3:', hamper3);

  const hamper4 = await createMetaobject([
    { key: "name", value: "Hamper 4" },
    { key: "products", value: JSON.stringify(["Thokoman Peanut Butter 1kg", "Ellis Brown Coffee Creamer 750g"]) },
    { key: "price", value: "126.99" }
  ]);
  console.log('Created Hamper 4:', hamper4);
}

// Run the script
createHamperMetaobjects()
  .then(() => console.log('All hamper metaobjects created successfully!'))
  .catch(error => console.error('Error creating hamper metaobjects:', error));