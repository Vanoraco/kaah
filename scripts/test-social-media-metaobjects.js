/**
 * Test script for social media metaobjects
 * This script tests the transformation function and provides sample data
 */

const { transformSocialMediaData, DEFAULT_SOCIAL_MEDIA } = require('../app/lib/social-media-queries.js');

// Sample metaobject data that would come from Shopify
const sampleMetaobjectData = [
  {
    id: 'gid://shopify/Metaobject/1',
    handle: 'facebook-link',
    type: 'social_media_link',
    fields: [
      { key: 'platform', value: 'facebook' },
      { key: 'url', value: 'https://facebook.com/kaahsupermarket' },
      { key: 'aria_label', value: 'Visit our Facebook page' },
      { key: 'is_active', value: 'true' },
      { key: 'sort_order', value: '1' }
    ]
  },
  {
    id: 'gid://shopify/Metaobject/2',
    handle: 'instagram-link',
    type: 'social_media_link',
    fields: [
      { key: 'platform', value: 'instagram' },
      { key: 'url', value: 'https://instagram.com/kaahsupermarket' },
      { key: 'aria_label', value: 'Follow us on Instagram' },
      { key: 'is_active', value: 'true' },
      { key: 'sort_order', value: '2' }
    ]
  },
  {
    id: 'gid://shopify/Metaobject/3',
    handle: 'twitter-link',
    type: 'social_media_link',
    fields: [
      { key: 'platform', value: 'twitter' },
      { key: 'url', value: 'https://twitter.com/kaahsupermarket' },
      { key: 'aria_label', value: 'Follow us on Twitter' },
      { key: 'is_active', value: 'false' }, // This one is inactive
      { key: 'sort_order', value: '3' }
    ]
  },
  {
    id: 'gid://shopify/Metaobject/4',
    handle: 'youtube-link',
    type: 'social_media_link',
    fields: [
      { key: 'platform', value: 'youtube' },
      { key: 'url', value: 'https://youtube.com/@kaahsupermarket' },
      { key: 'aria_label', value: 'Subscribe to our YouTube channel' },
      { key: 'is_active', value: 'true' },
      { key: 'sort_order', value: '4' }
    ]
  }
];

console.log('🧪 Testing Social Media Metaobject Transformation\n');

// Test 1: Transform sample data
console.log('📋 Test 1: Transform sample metaobject data');
const transformedData = transformSocialMediaData(sampleMetaobjectData);
console.log('Input metaobjects:', sampleMetaobjectData.length);
console.log('Output social links:', transformedData.length);
console.log('Transformed data:', JSON.stringify(transformedData, null, 2));

// Test 2: Check that inactive links are filtered out
console.log('\n🔍 Test 2: Verify inactive links are filtered');
const activeLinks = transformedData.filter(link => link.isActive);
console.log('Active links:', activeLinks.length);
console.log('Should be 3 (Twitter is inactive)');

// Test 3: Check sorting
console.log('\n📊 Test 3: Verify sorting by sort_order');
const sortOrders = transformedData.map(link => link.sortOrder);
console.log('Sort orders:', sortOrders);
console.log('Should be in ascending order: [1, 2, 4]');

// Test 4: Test with null/undefined data
console.log('\n🚫 Test 4: Test with null/undefined data');
const nullResult = transformSocialMediaData(null);
const undefinedResult = transformSocialMediaData(undefined);
const emptyResult = transformSocialMediaData([]);
console.log('Null input result:', nullResult);
console.log('Undefined input result:', undefinedResult);
console.log('Empty array result:', emptyResult);

// Test 5: Test default fallback data
console.log('\n🔄 Test 5: Test default fallback data');
console.log('Default social media data:');
console.log(JSON.stringify(DEFAULT_SOCIAL_MEDIA, null, 2));

// Test 6: Test with malformed data
console.log('\n⚠️  Test 6: Test with malformed data');
const malformedData = [
  {
    id: 'gid://shopify/Metaobject/5',
    handle: 'malformed-link',
    type: 'social_media_link',
    fields: [
      { key: 'platform', value: 'linkedin' },
      { key: 'url', value: 'https://linkedin.com/company/kaah' },
      // Missing is_active field - should default to false and be filtered out
      { key: 'sort_order', value: '5' }
    ]
  }
];

const malformedResult = transformSocialMediaData(malformedData);
console.log('Malformed data result:', malformedResult);
console.log('Should be empty array since is_active is missing');

console.log('\n✅ All tests completed!');

// Example GraphQL query for reference
console.log('\n📝 Example GraphQL Query:');
console.log(`
query SocialMediaLinks($country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
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

// Example metaobject creation for reference
console.log('\n🏗️  Example Metaobject Creation (for Shopify Admin):');
console.log(`
1. Go to Settings > Custom data > Metaobjects
2. Create definition with type: "social_media_link"
3. Add these fields:
   - platform (single_line_text, required)
   - url (single_line_text, required)
   - aria_label (single_line_text)
   - is_active (true_or_false)
   - sort_order (number_integer)
4. Create entries for each social media platform
`);
