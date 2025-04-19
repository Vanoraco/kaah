# Controlling the Banner with Metaobjects

This guide explains how to manage your slideshow banner content using Shopify metaobjects, which provides the most flexible control over your banner slides.

## What are Metaobjects?

Metaobjects are a Shopify feature that allows you to create custom content types. Think of them as custom database entries that you can define and manage through the Shopify admin. For our banner slides, we've created a custom "Banner Slide" metaobject type with specific fields for each aspect of a slide.

## Step 1: Access Metaobjects in Shopify Admin

1. Log in to your Shopify admin
2. Go to **Settings > Custom data > Metaobjects**
3. You should see a "Banner Slide" definition in the list

## Step 2: Create a New Banner Slide

1. Click on the "Banner Slide" definition
2. Click **Add Banner Slide**
3. Fill in the following fields:

   - **Title**: The main heading for your slide (e.g., "New Arrivals")
   - **Subtitle**: The secondary heading (e.g., "Summer Collection")
   - **Discount Text**: The promotional text that appears in the badge (e.g., "UP TO 40% OFF")
   - **Link**: Where the "Shop Now" button should lead (e.g., "/collections/new-arrivals")
   - **Background Color**: The hex color code for the slide background (e.g., "#1A237E" for navy blue)
   - **Image**: Upload a high-quality image for the slide

4. Click **Save**

## Step 3: Managing Existing Slides

### Editing a Slide
1. Go to **Settings > Custom data > Metaobjects**
2. Click on the "Banner Slide" definition
3. Find the slide you want to edit in the list
4. Click on it to open the editing screen
5. Make your changes
6. Click **Save**

### Changing the Order of Slides
The slides will appear in the order they were last updated. To change the order:
1. Edit the slide you want to appear first
2. Make a small change (or no change at all)
3. Click **Save**
4. Repeat for other slides in the desired order

### Deleting a Slide
1. Go to **Settings > Custom data > Metaobjects**
2. Click on the "Banner Slide" definition
3. Find the slide you want to delete
4. Click the three dots (⋮) next to it
5. Select **Delete**
6. Confirm the deletion

## Tips for Creating Effective Banner Slides

### Images
- Use high-quality images with dimensions around 800x600px or larger
- Images with transparent backgrounds work best to blend with the slide background color
- Make sure the image contrasts well with the text for readability

### Background Colors
- Use colors that match your brand
- Ensure good contrast with the text and image
- Some suggested hex colors:
  - Navy Blue: #1A237E
  - Green: #0a5f38
  - Brown: #5d4037
  - Red: #b71c1c
  - Purple: #4a148c

### Links
- You can link to collections: `/collections/collection-handle`
- You can link to products: `/products/product-handle`
- You can link to pages: `/pages/page-handle`
- You can even link to external websites with a full URL: `https://example.com`

### Text Content
- Keep titles short and impactful (1-3 words)
- Use subtitles to provide additional context
- Make discount text stand out with specific offers or percentages

## Example Slides

### Example 1: New Arrivals
- **Title**: New Arrivals
- **Subtitle**: Summer Collection
- **Discount Text**: EXCLUSIVE OFFERS UP TO 40% OFF
- **Link**: /collections/new-arrivals
- **Background Color**: #1A237E
- **Image**: [Upload an image of new summer products]

### Example 2: Special Sale
- **Title**: Flash Sale
- **Subtitle**: This Weekend Only
- **Discount Text**: BUY ONE GET ONE FREE
- **Link**: /collections/sale
- **Background Color**: #b71c1c
- **Image**: [Upload an image highlighting the sale]

### Example 3: Featured Category
- **Title**: Premium Selection
- **Subtitle**: Handpicked Products
- **Discount Text**: FREE SHIPPING ON ORDERS OVER $50
- **Link**: /collections/featured
- **Background Color**: #0a5f38
- **Image**: [Upload an image of featured products]

## Troubleshooting

### Slide Not Appearing
- Make sure you've filled in all required fields
- Check that the image was properly uploaded
- Verify that the link is correctly formatted

### Image Display Issues
- Try using a different image format (JPG or PNG)
- Make sure the image dimensions are appropriate
- Check that the image has good contrast with the background color

### Text Readability Problems
- Adjust the background color for better contrast
- Use an image that doesn't interfere with text visibility
- Keep text content concise

If you encounter any other issues, contact your developer for assistance.
