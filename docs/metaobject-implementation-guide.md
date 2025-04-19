# Implementing Promotion Cards with Shopify Metaobjects

This guide provides step-by-step instructions for implementing promotion cards using Shopify Metaobjects.

## Prerequisites

- Access to your Shopify Admin dashboard
- Admin permissions to create metaobject definitions

## Step 1: Create the Metaobject Definition

1. Log in to your Shopify Admin dashboard
2. Navigate to **Settings > Custom data > Metaobjects**
3. Click **Add definition**
4. Fill in the following details:
   - **Name**: Promotion Card
   - **API ID**: `promotion_card` (this must match exactly)
   - **Description**: Cards for promotional content on the homepage

5. Click **Add field** and add the following fields:

| Display Name | Field Type | API ID | Description | Validation |
|--------------|------------|--------|-------------|------------|
| Title | Single line text | `title` | Main title of the promotion | Required |
| Subtitle | Single line text | `subtitle` | Smaller text above the title | Optional |
| Background Color | Single line text | `background_color` | Hex color code (e.g., #2980b9) | Optional |
| Text Color | Single line text | `text_color` | Text color (white or black) | Optional |
| Link | Single line text | `link` | URL path for the "Shop Now" button | Required |
| Price | Single line text | `price` | Price to display (e.g., $79.99) | Optional |
| Discount | Single line text | `discount` | Discount text (e.g., 64% OFF) | Optional |
| Countdown Days | Single line text | `countdown_days` | Days for countdown timer | Optional |
| Countdown Hours | Single line text | `countdown_hours` | Hours for countdown timer | Optional |
| Countdown Minutes | Single line text | `countdown_mins` | Minutes for countdown timer | Optional |
| Countdown Seconds | Single line text | `countdown_secs` | Seconds for countdown timer | Optional |
| Image | Media (image) | `image` | Promotional image (will replace food emojis) | Optional |

6. Click **Save** to create the metaobject definition

## Step 2: Create Promotion Card Entries

### First Promotion Card (Sale of the Month)

1. Navigate to **Content > Metaobjects**
2. Find the "Promotion Card" definition and click **Add entry**
3. Fill in the following details:
   - **Title**: Sale of the Month
   - **Subtitle**: BEST DEALS
   - **Background Color**: #2980b9
   - **Text Color**: white
   - **Link**: /collections/monthly-deals
   - **Countdown Days**: 00
   - **Countdown Hours**: 02
   - **Countdown Minutes**: 18
   - **Countdown Seconds**: 46
4. Click **Save**

### Second Promotion Card (Low-Fat Meat)

1. Click **Add entry** again
2. Fill in the following details:
   - **Title**: Low-Fat Meat
   - **Subtitle**: 85% FAT FREE
   - **Background Color**: #000000
   - **Text Color**: white
   - **Link**: /collections/meat
   - **Price**: $79.99
3. Click **Save**

### Third Promotion Card (Fresh Fruit)

1. Click **Add entry** again
2. Fill in the following details:
   - **Title**: 100% Fresh Fruit
   - **Subtitle**: SUMMER SALE
   - **Background Color**: #f1c40f
   - **Text Color**: black
   - **Link**: /collections/fruits
   - **Discount**: 64% OFF
3. Click **Save**

## Step 3: Verify the Implementation

1. Visit your store's homepage
2. Verify that the promotion cards are displaying correctly
3. Check that:
   - The countdown timer is working on the first card
   - The price is displayed on the second card
   - The discount badge is displayed on the third card
   - The "Shop Now" buttons link to the correct collections

## Troubleshooting

If the promotion cards are not displaying correctly:

1. **Check API IDs**: Ensure all field API IDs match exactly what's in the code
2. **Verify Required Fields**: Make sure all required fields are filled in
3. **Clear Cache**: Try clearing your browser cache or using incognito mode
4. **Check Console Errors**: Use browser developer tools to check for JavaScript errors
5. **Restart Development Server**: If you're in development mode, try restarting your server

## Customization Tips

- **Background Colors**: You can use any valid hex color code
- **Food Emojis**: The system automatically selects food emojis based on the title:
  - If the title contains "meat", meat-related emojis will be displayed
  - If the title contains "fruit", fruit-related emojis will be displayed
  - Otherwise, vegetable-related emojis will be displayed
- **Countdown Timer**: Only fill in countdown fields if you want to display a countdown timer
- **Price vs. Discount**: You can display either a price or a discount, but not both on the same card

## Advanced: Importing via API

If you prefer to set up the metaobject definition programmatically, you can use the Shopify Admin API. Here's a sample GraphQL mutation:

```graphql
mutation CreateMetaobjectDefinition {
  metaobjectDefinitionCreate(
    definition: {
      name: "Promotion Card"
      apiId: "promotion_card"
      description: "Cards for promotional content on the homepage"
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
        },
        {
          name: "Link"
          apiId: "link"
          type: {
            name: "single_line_text_field"
          }
          required: true
        },
        {
          name: "Price"
          apiId: "price"
          type: {
            name: "single_line_text_field"
          }
        },
        {
          name: "Discount"
          apiId: "discount"
          type: {
            name: "single_line_text_field"
          }
        },
        {
          name: "Countdown Days"
          apiId: "countdown_days"
          type: {
            name: "single_line_text_field"
          }
        },
        {
          name: "Countdown Hours"
          apiId: "countdown_hours"
          type: {
            name: "single_line_text_field"
          }
        },
        {
          name: "Countdown Minutes"
          apiId: "countdown_mins"
          type: {
            name: "single_line_text_field"
          }
        },
        {
          name: "Countdown Seconds"
          apiId: "countdown_secs"
          type: {
            name: "single_line_text_field"
          }
        },
        {
          name: "Image"
          apiId: "image"
          type: {
            name: "media"
            mediaType: "image"
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
```
