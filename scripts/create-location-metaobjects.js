/**
 * Script to create location metaobjects in Shopify
 * 
 * This script creates a metaobject definition for store locations
 * and then creates metaobject entries for each location.
 * 
 * Usage:
 * 1. Set up your Shopify Admin API credentials in a .env file
 * 2. Run this script with Node.js
 * 
 * Example:
 * node scripts/create-location-metaobjects.js
 */

require('dotenv').config();
const fetch = require('node-fetch');

// Shopify Admin API credentials
const SHOP = process.env.SHOPIFY_SHOP;
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = '2023-07'; // Update to the latest version as needed

// GraphQL endpoint
const GRAPHQL_URL = `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`;

// Function to make GraphQL requests
async function graphqlRequest(query, variables = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ACCESS_TOKEN
    },
    body: JSON.stringify({ query, variables })
  });

  const result = await response.json();
  
  if (result.errors) {
    console.error('GraphQL Error:', result.errors);
    throw new Error('GraphQL request failed');
  }
  
  return result.data;
}

// Function to create a metaobject definition
async function createLocationDefinition() {
  const query = `
    mutation CreateLocationDefinition {
      metaobjectDefinitionCreate(
        definition: {
          name: "Store Location"
          apiId: "location"
          description: "Store locations with address, contact info, and hours"
          fieldDefinitions: [
            {
              name: "Branch Name"
              apiId: "branch_name"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Street Address"
              apiId: "street_address"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "City"
              apiId: "city"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Province"
              apiId: "province"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Postal Code"
              apiId: "postal_code"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Country"
              apiId: "country"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Phone Numbers"
              apiId: "phone_numbers"
              type: {
                name: "list.single_line_text_field"
              }
              required: true
            },
            {
              name: "Email"
              apiId: "email"
              type: {
                name: "email"
              }
              required: true
            },
            {
              name: "Monday Hours"
              apiId: "monday_hours"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Tuesday Hours"
              apiId: "tuesday_hours"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Wednesday Hours"
              apiId: "wednesday_hours"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Thursday Hours"
              apiId: "thursday_hours"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Friday Hours"
              apiId: "friday_hours"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Saturday Hours"
              apiId: "saturday_hours"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Sunday Hours"
              apiId: "sunday_hours"
              type: {
                name: "single_line_text_field"
              }
              required: true
            },
            {
              name: "Location Image"
              apiId: "location_image"
              type: {
                name: "file_reference"
              }
              required: false
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
    const result = await graphqlRequest(query);
    console.log('Location metaobject definition created:', result.metaobjectDefinitionCreate.metaobjectDefinition);
    return result.metaobjectDefinitionCreate.metaobjectDefinition;
  } catch (error) {
    console.error('Error creating location metaobject definition:', error);
    throw error;
  }
}

// Function to create a location metaobject
async function createLocationMetaobject(location) {
  const query = `
    mutation CreateLocationMetaobject {
      metaobjectCreate(
        metaobject: {
          type: "location"
          fields: [
            {
              key: "branch_name"
              value: "${location.branch_name}"
            },
            {
              key: "street_address"
              value: "${location.address.street}"
            },
            {
              key: "city"
              value: "${location.address.city}"
            },
            {
              key: "province"
              value: "${location.address.province}"
            },
            {
              key: "postal_code"
              value: "${location.address.postal_code}"
            },
            {
              key: "country"
              value: "${location.address.country}"
            },
            {
              key: "phone_numbers"
              value: ${JSON.stringify(JSON.stringify(location.contact.phone))}
            },
            {
              key: "email"
              value: "${location.contact.email}"
            },
            {
              key: "monday_hours"
              value: "${location.hours.monday}"
            },
            {
              key: "tuesday_hours"
              value: "${location.hours.tuesday}"
            },
            {
              key: "wednesday_hours"
              value: "${location.hours.wednesday}"
            },
            {
              key: "thursday_hours"
              value: "${location.hours.thursday}"
            },
            {
              key: "friday_hours"
              value: "${location.hours.friday}"
            },
            {
              key: "saturday_hours"
              value: "${location.hours.saturday}"
            },
            {
              key: "sunday_hours"
              value: "${location.hours.sunday}"
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

  try {
    const result = await graphqlRequest(query);
    console.log(`Location metaobject created for ${location.branch_name}:`, result.metaobjectCreate.metaobject);
    return result.metaobjectCreate.metaobject;
  } catch (error) {
    console.error(`Error creating location metaobject for ${location.branch_name}:`, error);
    throw error;
  }
}

// Sample location data
const locations = [
  {
    branch_name: "KAAH Secunda",
    address: {
      street: "Horwood Street",
      city: "Secunda",
      province: "Mpumalanga",
      postal_code: "2302",
      country: "South Africa"
    },
    contact: {
      phone: [
        "017 880 0399",
        "076 969 6416"
      ],
      email: "uzile@kaah.co.za"
    },
    hours: {
      monday: "7:00 AM - 7:00 PM",
      tuesday: "7:00 AM - 7:00 PM",
      wednesday: "7:00 AM - 7:00 PM",
      thursday: "7:00 AM - 7:00 PM",
      friday: "7:00 AM - 7:00 PM",
      saturday: "7:00 AM - 7:00 PM",
      sunday: "7:00 AM - 7:00 PM"
    }
  },
  {
    branch_name: "KAAH Bronkhorstspruit",
    address: {
      street: "18 Lanham Street",
      city: "Bronkhorstspruit",
      province: "Gauteng",
      postal_code: "1020",
      country: "South Africa"
    },
    contact: {
      phone: [
        "013 880 1534",
        "076 969 6416"
      ],
      email: "bronkhorstspruit@kaah.co.za"
    },
    hours: {
      monday: "7:00 AM - 7:00 PM",
      tuesday: "7:00 AM - 7:00 PM",
      wednesday: "7:00 AM - 7:00 PM",
      thursday: "7:00 AM - 7:00 PM",
      friday: "7:00 AM - 7:00 PM",
      saturday: "7:00 AM - 7:00 PM",
      sunday: "7:00 AM - 7:00 PM"
    }
  },
  {
    branch_name: "KAAH Rustenburg",
    address: {
      street: "16914 Tlou Street",
      city: "Rustenburg",
      province: "North West",
      postal_code: "0309",
      country: "South Africa"
    },
    contact: {
      phone: [
        "013 880 1534",
        "076 969 6416"
      ],
      email: "boitekong@kaah.co.za"
    },
    hours: {
      monday: "7:00 AM - 7:00 PM",
      tuesday: "7:00 AM - 7:00 PM",
      wednesday: "7:00 AM - 7:00 PM",
      thursday: "7:00 AM - 7:00 PM",
      friday: "7:00 AM - 7:00 PM",
      saturday: "7:00 AM - 7:00 PM",
      sunday: "7:00 AM - 7:00 PM"
    }
  },
  {
    branch_name: "KAAH Potchefstroom",
    address: {
      street: "70 Rivier Street",
      city: "Potchefstroom",
      province: "North West",
      postal_code: "2531",
      country: "South Africa"
    },
    contact: {
      phone: [
        "013 880 1534",
        "076 969 6416"
      ],
      email: "potchefstroom@kaah.co.za"
    },
    hours: {
      monday: "7:00 AM - 7:00 PM",
      tuesday: "7:00 AM - 7:00 PM",
      wednesday: "7:00 AM - 7:00 PM",
      thursday: "7:00 AM - 7:00 PM",
      friday: "7:00 AM - 7:00 PM",
      saturday: "7:00 AM - 7:00 PM",
      sunday: "7:00 AM - 7:00 PM"
    }
  }
];

// Main function to run the script
async function main() {
  try {
    // Create the location metaobject definition
    await createLocationDefinition();
    
    // Create location metaobjects
    for (const location of locations) {
      await createLocationMetaobject(location);
    }
    
    console.log('All location metaobjects created successfully!');
  } catch (error) {
    console.error('Error running script:', error);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createLocationDefinition,
  createLocationMetaobject
};
