# Product Poster Feature Guide

This guide explains how to use the Product Poster feature to create and display promotional posters with multiple products and their prices.

## Overview

The Product Poster feature allows you to create visually appealing posters that showcase multiple products with their images and prices. These posters can be printed for in-store display or viewed digitally. This is especially useful for supermarkets that don't sell online but want to showcase their products and special offers.

## Features

- Create posters with multiple products
- Customize product positioning and sizing
- Set custom prices for poster display
- Highlight special products
- Choose between grid or freestyle layouts
- Print-ready design
- Responsive display for all device sizes

## Setup Instructions

### 1. Set Up Metaobject Definitions

Run the following script to create the necessary metaobject definitions in your Shopify store:

```bash
node scripts/create-product-poster-metaobjects.js
```

This script creates two metaobject definitions:
- `product_poster`: For storing poster data (title, background, layout, etc.)
- `poster_product_item`: For storing individual product items with custom positioning and pricing

### 2. Create a Sample Poster (Optional)

To create a sample poster with products from your store, run:

```bash
node scripts/create-sample-product-poster.js
```

This will create a sample poster with 6 products from your store.

## Creating Posters in Shopify Admin

### Step 1: Create Poster Product Items

1. Go to **Shopify Admin > Content > Metaobjects**
2. Find the "Poster Product Item" definition and click **Add entry**
3. Fill in the following fields:
   - **Product**: Select a product from your store
   - **Custom Price**: Enter a custom price for this product on the poster (optional)
   - **Position X**: X coordinate for positioning (0-100, only used in freestyle layout)
   - **Position Y**: Y coordinate for positioning (0-100, only used in freestyle layout)
   - **Size**: Size of the product image (1-100, only used in freestyle layout)
   - **Highlight**: Check this to highlight the product
   - **Custom Label**: Add a custom label like "SALE" or "NEW" (optional)
4. Click **Save**
5. Repeat for each product you want to include in your poster

### Step 2: Create the Product Poster

1. Go to **Shopify Admin > Content > Metaobjects**
2. Find the "Product Poster" definition and click **Add entry**
3. Fill in the following fields:
   - **Title**: The title of your poster (e.g., "Weekly Special Offers")
   - **Background Image**: Upload a background image for your poster (optional)
   - **Background Color**: Enter a hex color code for the poster background (e.g., "#f8f9fa")
   - **Layout Type**: Choose between "grid" or "freestyle"
   - **Products**: Select products to display on the poster (optional, you can use Poster Items instead)
   - **Poster Items**: Select the Poster Product Items you created in Step 1
   - **Effective Date**: Start date for the poster promotion (optional)
   - **Expiry Date**: End date for the poster promotion (optional)
4. Click **Save**

## Viewing and Printing Posters

### Viewing Posters

To view all available posters, navigate to:
```
https://your-store.com/posters
```

To view a specific poster, navigate to:
```
https://your-store.com/posters/[poster-handle]
```

### Printing Posters

1. Navigate to the poster you want to print
2. Click the **Print Poster** button in the top-right corner of the poster
3. A print-friendly version of the poster will open in a new tab
4. Use your browser's print function to print the poster

## Layout Types

### Grid Layout

The grid layout automatically arranges products in a grid format. This is the simplest layout and works well for most posters.

- Products are arranged in a responsive grid (1-4 columns depending on screen size)
- All products are displayed at the same size
- Positioning is automatic

### Freestyle Layout

The freestyle layout allows you to position products anywhere on the poster. This gives you more creative control but requires more setup.

- Products are positioned using X and Y coordinates (0-100)
- Products can be different sizes
- You have complete control over the layout

## Customizing Products on the Poster

Each product on the poster can be customized with:

- **Custom Price**: Override the product's regular price
- **Position**: Set the X and Y coordinates (for freestyle layout)
- **Size**: Set the size of the product image (for freestyle layout)
- **Highlight**: Add a border to make the product stand out
- **Custom Label**: Add a label like "SALE" or "NEW"

## Best Practices

1. **Use high-quality product images** with transparent backgrounds for best results
2. **Keep the number of products reasonable** (8-12 is usually a good maximum)
3. **Use highlights sparingly** to draw attention to your best offers
4. **Set effective and expiry dates** to automatically manage active posters
5. **Use a consistent color scheme** that matches your brand
6. **Test print** your posters before printing in bulk

## Troubleshooting

### Products Not Appearing on Poster

- Make sure the products are published and available in your store
- Check that you've selected the correct products in the Poster Items field
- Verify that the product images are properly uploaded

### Layout Issues

- For freestyle layout, ensure X and Y coordinates are between 0 and 100
- For grid layout, try reducing the number of products if they appear too crowded
- Check that the size values are reasonable (recommended: 80-100)

### Printing Problems

- Make sure your browser allows pop-ups from your store domain
- Try using Chrome or Firefox for best printing results
- If images are missing in the print preview, try refreshing the page before printing

## Need Help?

If you encounter any issues or have questions about the Product Poster feature, please contact our support team at support@example.com.
