# Implementing Mega Saver with Shopify Metaobjects

This guide provides step-by-step instructions for implementing the Mega Saver feature using Shopify Metaobjects.

## Overview

The Mega Saver feature displays a grid of promotional products with special pricing, similar to a weekly specials flyer. It consists of:

1. A banner/header with a title and subtitle
2. A grid of product items with pricing information

## Prerequisites

- Access to your Shopify Admin dashboard
- Admin permissions to create metaobject definitions

## Step 1: Create the Metaobject Definitions

### Mega Saver Banner Definition

1. Log in to your Shopify Admin dashboard
2. Navigate to **Settings > Custom data > Metaobjects**
3. Click **Add definition**
4. Fill in the following details:
   - **Name**: Mega Saver Banner
   - **API ID**: `mega_saver_banner` (this must match exactly)
   - **Description**: Banner for the Mega Saver section

5. Click **Add field** and add the following fields:

| Field Name | API ID | Type | Required |
|------------|--------|------|----------|
| Title | title | Single line text | Yes |
| Subtitle | subtitle | Single line text | No |
| Background Color | background_color | Single line text | No |
| Text Color | text_color | Single line text | No |

6. Click **Save**

### Mega Saver Item Definition

1. Click **Add definition** again
2. Fill in the following details:
   - **Name**: Mega Saver Item
   - **API ID**: `mega_saver_item` (this must match exactly)
   - **Description**: Individual product items for the Mega Saver section

3. Click **Add field** and add the following fields:

| Field Name | API ID | Type | Required |
|------------|--------|------|----------|
| Title | title | Single line text | Yes |
| Brand | brand | Single line text | No |
| Price | price_ | Single line text | Yes |
| Original Price | original_price | Single line text | No |
| Special Text | special_text | Single line text | No |
| Special Offer | special_offer | Single line text | No |
| Quantity | quantity | Integer | No |
| Image | image | File reference | No |
| Product | product | Product reference | No |
| Link | link | Single line text | No |

4. Click **Save**

## Step 2: Create Metaobject Entries

### Create a Mega Saver Banner

1. Navigate to **Content > Metaobjects**
2. Click **Add metaobject**
3. Select **Mega Saver Banner**
4. Fill in the fields:
   - **Title**: MEGA SAVER
   - **Subtitle**: Great deals on your favorite products
   - **Background Color**: #ff0000 (or your preferred color)
   - **Text Color**: #ffffff (or your preferred color)
5. Click **Save**

### Create Mega Saver Items

1. Navigate to **Content > Metaobjects**
2. Click **Add metaobject**
3. Select **Mega Saver Item**
4. Fill in the fields for each product:
   - **Title**: Product name (e.g., "Bull Brand Corned Meat")
   - **Brand**: Brand name (e.g., "Bull Brand")
   - **Price**: Price in Rand (e.g., "49.99")
   - **Original Price**: Original price if on sale (e.g., "59.99")
   - **Special Text**: Any special offer text (e.g., "BUY 2 FOR")
   - **Image**: Upload a product image or leave blank to use the linked product's image
   - **Product**: Link to a Shopify product (optional)
   - **Link**: Custom link URL (optional, defaults to product URL if a product is selected)
5. Click **Save**
6. Repeat for each product you want to display in the Mega Saver section

## Step 3: Automated Setup (Optional)

You can use the provided script to automatically create the metaobject definitions and sample entries:

1. Set your Shopify Admin API access token:
   ```
   export SHOPIFY_ADMIN_API_TOKEN=your_admin_api_token
   export SHOPIFY_STORE_URL=your-store.myshopify.com
   ```

2. Run the script:
   ```
   node scripts/create-mega-saver-metaobjects.js
   ```

## Customization Options

### Banner Styling

You can customize the appearance of the Mega Saver banner by modifying the following fields:

- **Background Color**: Use any valid CSS color (e.g., #ff0000, red, rgba(255,0,0,0.8))
- **Text Color**: Use any valid CSS color (e.g., #ffffff, white)

### Item Display

For each Mega Saver item, you can:

- Link directly to a product by selecting a product in the **Product** field
- Use a custom image by uploading to the **Image** field
- Display special offer text (like "BUY 2 FOR") using the **Special Text** field
- Show original and sale prices using the **Price** and **Original Price** fields

## Troubleshooting

### Items Not Appearing

If your Mega Saver items are not appearing on the website:

1. Check that you've created entries for both the banner and at least one item
2. Verify that the API IDs match exactly: `mega_saver_banner` and `mega_saver_item`
3. Make sure required fields are filled in (Title and Price)

### Image Issues

If product images are not displaying correctly:

1. Try uploading an image directly to the **Image** field
2. If using a product reference, make sure the product has a featured image
3. Check that the image dimensions are appropriate (recommended: square images around 500x500px)

## API Reference

For developers, here are the GraphQL queries used to fetch Mega Saver data:

```graphql
# Fetch Mega Saver Items
query MegaSaverItems {
  metaobjects(type: "mega_saver_item", first: 12) {
    nodes {
      id
      handle
      fields {
        key
        value
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
          ... on Product {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}

# Fetch Mega Saver Banner
query MegaSaverBanner {
  metaobjects(type: "mega_saver_banner", first: 1) {
    nodes {
      id
      handle
      fields {
        key
        value
      }
    }
  }
}
```
