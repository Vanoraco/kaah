# Product Poster Quick Start Guide

This quick start guide will help you create and display your first product poster in just a few minutes.

## Prerequisites

- Shopify store with products
- Access to Shopify Admin
- Basic knowledge of Shopify

## Step 1: Set Up the Feature

Run the following script to set up the necessary metaobject definitions:

```bash
node scripts/create-product-poster-metaobjects.js
```

## Step 2: Create Your First Poster

### Create Poster Product Items

1. Go to **Shopify Admin > Content > Metaobjects**
2. Find "Poster Product Item" and click **Add entry**
3. Fill in the following:
   - **Product**: Select a product from your store
   - **Custom Price**: (Optional) Enter a special price for this product
   - **Highlight**: Check this box if you want to highlight this product
4. Click **Save**
5. Repeat for 3-6 more products

### Create the Poster

1. Go to **Shopify Admin > Content > Metaobjects**
2. Find "Product Poster" and click **Add entry**
3. Fill in the following:
   - **Title**: "Weekly Special Offers"
   - **Background Color**: "#f8f9fa" (light gray)
   - **Layout Type**: "grid"
   - **Poster Items**: Select all the poster product items you created
   - **Effective Date**: Today's date
   - **Expiry Date**: 7 days from today
4. Click **Save**

## Step 3: View Your Poster

Navigate to:
```
https://your-store.com/posters
```

You should see your poster displayed with all the products you added.

## Step 4: Print Your Poster

1. Click the **Print Poster** button in the top-right corner of the poster
2. A print-friendly version will open in a new tab
3. Use your browser's print function (Ctrl+P or Cmd+P) to print the poster

## Next Steps

- Try creating a poster with the "freestyle" layout for more control over product positioning
- Add custom labels to highlight special offers
- Create multiple posters for different departments or promotions

For more detailed information, see the [Product Poster Guide](./product-poster-guide.md).

## Quick Tips

- **Grid Layout**: Best for simple, organized displays
- **Freestyle Layout**: Best for creative, custom arrangements
- **Highlight**: Use sparingly to draw attention to the best deals
- **Custom Labels**: Add "SALE", "NEW", or "SPECIAL" to catch attention
- **Effective/Expiry Dates**: Set these to automatically manage active posters

## Example Poster Setup

Here's a quick example of a good poster setup:

### Poster Details
- **Title**: "Weekend Special Offers"
- **Background Color**: "#f5f5f5"
- **Layout**: Grid

### Products to Include
1. **Featured Product 1**
   - Highlight: Yes
   - Custom Label: "BEST DEAL"
   - Custom Price: 10% off regular price

2. **Featured Product 2**
   - Highlight: Yes
   - Custom Label: "NEW"
   - Custom Price: Regular price

3-6. **Regular Products**
   - Highlight: No
   - Custom Price: 5% off regular price

This creates a balanced poster with attention drawn to your key offers while still showcasing other products.

## Common Issues

- **Images not showing**: Make sure products have images uploaded
- **Poster not appearing**: Check that the effective date is today or earlier
- **Print quality issues**: Use high-resolution product images

For technical support, contact your development team or refer to the [Technical Documentation](./product-poster-technical.md).
