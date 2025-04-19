# Promotion Cards Implementation with Shopify Metaobjects

This directory contains documentation and scripts for implementing promotion cards using Shopify Metaobjects.

## Documentation

- [Metaobject Implementation Guide](./metaobject-implementation-guide.md) - Step-by-step instructions for setting up metaobjects
- [Metaobject Visual Guide](./metaobject-visual-guide.md) - Visual walkthrough with screenshots
- [Shopify Metaobject API Reference](./shopify-metaobject-api-reference.md) - API reference for advanced users

## Scripts

The `scripts` directory contains helper scripts for managing promotion card metaobjects:

- `create-promotion-metaobjects.js` - Creates sample promotion card metaobjects
- `test-promotion-metaobjects.js` - Tests the metaobject implementation by fetching existing entries

### Using the Scripts

1. Navigate to the `scripts` directory
2. Install dependencies: `npm install`
3. Edit the scripts to add your Shopify store domain and access token
4. Run the scripts:
   - Create metaobjects: `npm run create`
   - Test implementation: `npm run test`

## Implementation Overview

The promotion cards feature uses Shopify Metaobjects to allow store owners to control the content of promotional cards displayed on the homepage. Each card can have:

- Title and subtitle
- Custom background and text colors
- Link to a collection or product
- Price or discount information
- Countdown timer

The system automatically selects appropriate food emojis based on the card's title or content.

## Troubleshooting

If you encounter issues with the implementation:

1. Verify that the metaobject definition and fields match exactly what's described in the guides
2. Check that all required fields are filled in
3. Clear your browser cache and reload the page
4. Check the browser console for JavaScript errors
5. Try using the test script to verify that your metaobjects are correctly configured

## Support

For additional help, refer to:

- [Shopify Metaobjects Documentation](https://shopify.dev/api/admin-graphql/current/objects/Metaobject)
- [Shopify Admin API Reference](https://shopify.dev/api/admin-graphql)
