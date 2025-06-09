/**
 * Script to create the online sales control metaobject definition in Shopify
 * 
 * This script creates a metaobject definition called 'online_sales_control'
 * with a boolean field 'enabled' to control whether online sales are available.
 * 
 * Usage:
 * 1. Set your Shopify store URL and Admin API access token in the environment variables
 * 2. Run: node scripts/create-online-sales-control-metaobject.js
 */

import fetch from 'node-fetch';

// Configuration - replace with your actual values
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL || 'your-store.myshopify.com';
const ADMIN_API_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || 'your-admin-api-token';

// GraphQL endpoint
const GRAPHQL_ENDPOINT = `https://${SHOPIFY_STORE_URL}/admin/api/2023-07/graphql.json`;

// Function to create a metaobject definition
async function createMetaobjectDefinition() {
  const query = `
    mutation CreateOnlineSalesControlDefinition {
      metaobjectDefinitionCreate(
        definition: {
          name: "Online Sales Control"
          apiId: "online_sales_control"
          description: "Controls whether online sales are enabled or disabled"
          fieldDefinitions: [
            {
              name: "Enabled"
              apiId: "enabled"
              type: {
                name: "boolean"
              }
              required: true
              description: "Whether online sales are currently enabled"
            }
          ]
        }
      ) {
        metaobjectDefinition {
          id
          name
          apiId
          fieldDefinitions {
            name
            apiId
            type {
              name
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_API_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return null;
    }

    if (result.data.metaobjectDefinitionCreate.userErrors.length > 0) {
      console.error('User errors:', result.data.metaobjectDefinitionCreate.userErrors);
      return null;
    }

    return result.data.metaobjectDefinitionCreate.metaobjectDefinition;
  } catch (error) {
    console.error('Error creating metaobject definition:', error);
    return null;
  }
}

// Function to create the initial metaobject instance
async function createInitialMetaobject() {
  const query = `
    mutation CreateOnlineSalesControlMetaobject {
      metaobjectCreate(
        metaobject: {
          type: "online_sales_control"
          handle: "main-control"
          fields: [
            {
              key: "enabled"
              value: "true"
            }
          ]
        }
      ) {
        metaobject {
          id
          handle
          type
          fields {
            key
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_API_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return null;
    }

    if (result.data.metaobjectCreate.userErrors.length > 0) {
      console.error('User errors:', result.data.metaobjectCreate.userErrors);
      return null;
    }

    return result.data.metaobjectCreate.metaobject;
  } catch (error) {
    console.error('Error creating metaobject:', error);
    return null;
  }
}

// Main function
async function main() {
  console.log('Creating online sales control metaobject definition...');

  // Check if environment variables are set
  if (SHOPIFY_STORE_URL === 'your-store.myshopify.com' || ADMIN_API_ACCESS_TOKEN === 'your-admin-api-token') {
    console.error('Please set SHOPIFY_STORE_URL and SHOPIFY_ADMIN_API_TOKEN environment variables');
    process.exit(1);
  }

  // Create the metaobject definition
  const definition = await createMetaobjectDefinition();
  if (!definition) {
    console.error('Failed to create metaobject definition');
    process.exit(1);
  }

  console.log('✅ Metaobject definition created successfully:');
  console.log(`   Name: ${definition.name}`);
  console.log(`   API ID: ${definition.apiId}`);
  console.log(`   ID: ${definition.id}`);

  // Create the initial metaobject instance
  console.log('\nCreating initial metaobject instance...');
  const metaobject = await createInitialMetaobject();
  if (!metaobject) {
    console.error('Failed to create initial metaobject instance');
    process.exit(1);
  }

  console.log('✅ Initial metaobject instance created successfully:');
  console.log(`   Handle: ${metaobject.handle}`);
  console.log(`   Type: ${metaobject.type}`);
  console.log(`   ID: ${metaobject.id}`);
  console.log(`   Enabled: ${metaobject.fields.find(f => f.key === 'enabled')?.value}`);

  console.log('\n🎉 Setup complete! You can now:');
  console.log('1. Go to your Shopify Admin > Settings > Custom data > Metaobjects');
  console.log('2. Find "Online Sales Control" and edit the "main-control" entry');
  console.log('3. Toggle the "Enabled" field to control online sales');
  console.log('\nThe website will automatically reflect the changes!');
}

// Run the script
main().catch(console.error);
