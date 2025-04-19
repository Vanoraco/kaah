# Banner Control Options for Shopify Storefront API

This guide explains all the different ways you can control your slideshow banner content through the Shopify Storefront API.

## Option 1: Using Metaobjects (Most Flexible)

Metaobjects are custom content types in Shopify that give you the most control over your banner content.

### Setup Instructions:

1. In your Shopify admin, go to **Settings > Custom data > Metaobjects**
2. Click **Add definition**
3. Name it "Banner Slide" with handle `banner_slide`
4. Add the following fields:
   - `title` (Single line text) - The main title of the slide
   - `subtitle` (Single line text) - The subtitle of the slide
   - `discount_text` (Single line text) - The promotional text
   - `link` (Single line text) - The URL for the "Shop Now" button
   - `background_color` (Single line text) - The background color (hex code)
   - `image` (Media) - The banner image

### Creating Banner Slides:

1. Go to **Settings > Custom data > Metaobjects**
2. Click on the "Banner Slide" definition
3. Click **Add Banner Slide**
4. Fill in all the fields
5. Save the metaobject

### Advantages:
- Complete control over all aspects of the banner
- Can specify exact background colors
- Can link to any URL (not just collections)
- Can control the exact order of slides

### Disadvantages:
- Requires setting up metaobject definitions
- More complex to set up initially

## Option 2: Using Blog Articles

You can use a dedicated blog to control your banner slides.

### Setup Instructions:

1. In your Shopify admin, go to **Online Store > Blog posts**
2. Create a new blog called "Banner Slides" with handle `banner-slides`
3. Add articles for each banner slide with:
   - **Title**: The main title of the slide
   - **Featured image**: The banner image
   - **Excerpt**: The promotional/discount text
   - **Tags**: Use tags for additional data:
     - First tag: Used as subtitle
     - Tags starting with `bg:`: Used as background color (e.g., `bg:#1A237E`)

### Advantages:
- Easy to use through the familiar blog interface
- Can preview content in the editor
- Can schedule slides by scheduling posts

### Disadvantages:
- Less control over specific fields
- Requires using tags for some data

## Option 3: Using Collections (Simplest)

This is the simplest approach, using your existing collections.

### Setup Instructions:

1. In your Shopify admin, go to **Products > Collections**
2. Create or edit collections with:
   - **Title**: Format as `Main Title | Subtitle`
   - **Description**: The promotional/discount text
   - **Collection image**: The banner image

### Advantages:
- Simplest to set up
- Uses existing collections you may already have
- No additional configuration needed

### Disadvantages:
- Limited control over background colors
- Can only link to collections
- Order is determined by update time

## Option 4: Using Products with Metafields

You can use specific products tagged with "banner" and their metafields.

### Setup Instructions:

1. In your Shopify admin, go to **Products**
2. Create or edit products and add the tag `banner`
3. Add metafields to these products:
   - `custom.banner_subtitle`: The subtitle text
   - `custom.banner_discount`: The promotional text
   - `custom.banner_bg_color`: The background color (hex code)
4. Use the product's featured image as the banner image

### Advantages:
- Can use existing products
- Good control over all aspects
- Can link directly to products

### Disadvantages:
- Requires setting up metafields
- May mix with your actual product catalog

## Priority Order

The system checks for banner data in this order:

1. Metaobjects (highest priority)
2. Blog articles
3. Products with "banner" tag
4. Collections (fallback)
5. Default hardcoded slides (if nothing else is available)

## Customizing Default Values

If you want to change the default background colors or promotional texts, you can edit the `DEFAULT_BG_COLORS` and `DEFAULT_DISCOUNTS` arrays in the `app/components/SlideshowBanner.jsx` file.
