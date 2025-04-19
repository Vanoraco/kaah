# How to Control the Banner from Shopify Storefront API

This guide explains how to manage your slideshow banner content directly from your Shopify admin panel.

## Overview

The slideshow banner on your homepage is now dynamically controlled through Shopify collections. This means you can update the banner content without changing any code - just by editing collections in your Shopify admin.

## How It Works

1. The banner uses the first 3 collections from your Shopify store (sorted by most recently updated)
2. For each collection, the following data is used:
   - **Title**: Used as the banner slide title (can include a subtitle by adding a pipe character)
   - **Description**: Used as the discount/promotional text
   - **Image**: Used as the banner slide image
   - **Handle**: Used to create the "Shop Now" link

## Step-by-Step Instructions

### 1. Create or Edit Collections for Banner Slides

1. Log in to your Shopify admin panel
2. Go to **Products > Collections**
3. Create a new collection or edit an existing one
4. Set the collection title in this format: `Main Title | Subtitle`
   - Example: `New Arrivals | Summer Collection`
5. Add a description that will be used as the promotional text
   - Example: `EXCLUSIVE OFFERS UP TO 40% OFF`
6. Upload a high-quality image for the collection (recommended size: 800x600px or larger)
7. Save the collection

### 2. Controlling the Order of Slides

The banner displays collections in order of most recently updated. To change the order:

1. Simply edit the collection you want to appear first
2. Make a small change (even just adding a space to the description)
3. Save the collection - it will now appear first in the banner

### 3. Customizing Background Colors

The banner automatically assigns background colors to slides in this order:
1. Navy blue (#1A237E)
2. Green (#0a5f38)
3. Brown (#5d4037)

If you want to customize these colors, you'll need to edit the `DEFAULT_BG_COLORS` array in the `app/components/SlideshowBanner.jsx` file.

## Examples

### Example 1: Summer Sale Banner

- **Title**: `Summer Sale | Limited Time`
- **Description**: `UP TO 50% OFF SELECTED ITEMS`
- **Image**: Upload an image of summer products
- **Collection Handle**: `summer-sale`

### Example 2: New Arrivals Banner

- **Title**: `New Arrivals | Fall Collection`
- **Description**: `DISCOVER THE LATEST TRENDS`
- **Image**: Upload an image of new products
- **Collection Handle**: `new-arrivals`

### Example 3: Special Offer Banner

- **Title**: `Special Offer | Members Only`
- **Description**: `FREE SHIPPING ON ALL ORDERS`
- **Image**: Upload an image highlighting the offer
- **Collection Handle**: `special-offers`

## Troubleshooting

- **Banner not updating?** Make sure you've updated and saved the collections. It may take a few minutes for changes to appear due to caching.
- **Images not displaying correctly?** Ensure your collection images are high quality and have the right dimensions (landscape orientation works best).
- **Text formatting issues?** Keep titles and subtitles concise. Long text may be cut off on mobile devices.

## Advanced: Using Metaobjects (Future Enhancement)

For even more control, we can implement a metaobject-based approach. This would allow you to:
- Set custom background colors for each slide
- Control the exact order of slides
- Add more customization options

Contact your developer if you'd like to implement this enhanced approach.
