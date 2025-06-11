/**
 * Debug script to test social media metaobject fetching
 */

const { SOCIAL_MEDIA_QUERY } = require('../app/lib/social-media-queries.js');

// Test the GraphQL query directly
console.log('🔍 Social Media GraphQL Query:');
console.log(SOCIAL_MEDIA_QUERY);

console.log('\n📋 Expected metaobject structure:');
console.log(`
{
  "metaobjects": {
    "nodes": [
      {
        "id": "gid://shopify/Metaobject/123",
        "handle": "instagram-link",
        "type": "social_media_link",
        "fields": [
          { "key": "platform", "value": "instagram" },
          { "key": "url", "value": "https://instagram.com/kaahsa_supermarket" },
          { "key": "aria_label", "value": "Follow us on Instagram" },
          { "key": "is_active", "value": "true" },
          { "key": "sort_order", "value": "3" }
        ]
      }
    ]
  }
}
`);

console.log('\n🔧 Troubleshooting steps:');
console.log('1. Check if metaobject type is exactly "social_media_link"');
console.log('2. Verify field keys match exactly: platform, url, aria_label, is_active, sort_order');
console.log('3. Make sure is_active is set to "true" (string, not boolean)');
console.log('4. Check that the Instagram entry has sort_order = "3"');
console.log('5. Test the GraphQL query in GraphiQL browser at http://localhost:3001/graphiql');

console.log('\n🧪 Test query for GraphiQL:');
console.log(`
query SocialMediaLinks {
  metaobjects(type: "social_media_link", first: 10) {
    nodes {
      id
      handle
      type
      fields {
        key
        value
      }
    }
  }
}
`);

console.log('\n✅ If the query returns data, the issue might be in the transformation or rendering logic.');
console.log('❌ If the query returns empty, check the metaobject setup in Shopify admin.');
