# Setting Up Promotion Cards in Shopify Admin

This guide explains how to control the promotion cards on your homepage through the Shopify admin interface.

## Overview

The promotion cards can be controlled through three different methods:

1. **Metaobjects** (Recommended) - Create custom metaobjects for each promotion card
2. **Collections** - Use existing collections with metafields for promotion cards
3. **Products** - Use products tagged with "promotion" for promotion cards

## Method 1: Using Metaobjects (Recommended)

### Step 1: Create a Metaobject Definition

1. Go to **Settings > Custom data > Metaobjects**
2. Click **Add definition**
3. Name it "Promotion Card"
4. Set the API ID to "promotion_card"
5. Add the following fields:

| Field Name | Field Type | API ID |
|------------|------------|--------|
| Title | Single line text | title |
| Subtitle | Single line text | subtitle |
| Background Color | Single line text | background_color |
| Text Color | Single line text | text_color |
| Link | Single line text | link |
| Price | Single line text | price |
| Discount | Single line text | discount |
| Countdown Days | Single line text | countdown_days |
| Countdown Hours | Single line text | countdown_hours |
| Countdown Minutes | Single line text | countdown_mins |
| Countdown Seconds | Single line text | countdown_secs |

6. Click **Save**

### Step 2: Create Promotion Card Entries

1. Go to **Content > Metaobjects**
2. Click **Add entry** under "Promotion Card"
3. Fill in the fields:
   - **Title**: "Sale of the Month" (or your preferred title)
   - **Subtitle**: "BEST DEALS" (or your preferred subtitle)
   - **Background Color**: "#2980b9" (or any hex color code)
   - **Text Color**: "white" (or "black" depending on background)
   - **Link**: "/collections/monthly-deals" (or any collection URL)
   - **Price**: Leave empty for a countdown card
   - **Discount**: Leave empty for a countdown card
   - **Countdown Days**: "00" (or your preferred value)
   - **Countdown Hours**: "02" (or your preferred value)
   - **Countdown Minutes**: "18" (or your preferred value)
   - **Countdown Seconds**: "46" (or your preferred value)
4. Click **Save**
5. Repeat to create additional promotion cards (up to 3)

## Method 2: Using Collections

### Step 1: Set Up Metafields for Collections

1. Go to **Settings > Custom data > Metafields**
2. Click **Add definition**
3. Select **Collection** as the resource
4. Add the following metafields:

| Field Name | Field Type | Namespace | Key |
|------------|------------|-----------|-----|
| Promotion Subtitle | Single line text | custom | promo_subtitle |
| Promotion Background | Single line text | custom | promo_background |
| Promotion Text Color | Single line text | custom | promo_text_color |
| Promotion Price | Single line text | custom | promo_price |
| Promotion Discount | Single line text | custom | promo_discount |
| Promotion Countdown | JSON string | custom | promo_countdown |

5. Click **Save**

### Step 2: Tag Collections for Promotions

1. Go to **Products > Collections**
2. Edit a collection you want to use for a promotion card
3. Add the tag "promotion" to the collection
4. Fill in the metafields you created:
   - **Promotion Subtitle**: "BEST DEALS"
   - **Promotion Background**: "#2980b9"
   - **Promotion Text Color**: "white"
   - **Promotion Price**: "$79.99" (if applicable)
   - **Promotion Discount**: "64% OFF" (if applicable)
   - **Promotion Countdown**: `{"days":"00","hours":"02","mins":"18","secs":"46"}` (if applicable)
5. Save the collection
6. Repeat for up to 3 collections

## Method 3: Using Products

### Step 1: Set Up Metafields for Products

1. Go to **Settings > Custom data > Metafields**
2. Click **Add definition**
3. Select **Product** as the resource
4. Add the following metafields:

| Field Name | Field Type | Namespace | Key |
|------------|------------|-----------|-----|
| Promotion Subtitle | Single line text | custom | promo_subtitle |
| Promotion Background | Single line text | custom | promo_background |
| Promotion Text Color | Single line text | custom | promo_text_color |
| Promotion Price | Single line text | custom | promo_price |
| Promotion Discount | Single line text | custom | promo_discount |
| Promotion Countdown Days | Single line text | custom | promo_countdown_days |
| Promotion Countdown Hours | Single line text | custom | promo_countdown_hours |
| Promotion Countdown Minutes | Single line text | custom | promo_countdown_mins |
| Promotion Countdown Seconds | Single line text | custom | promo_countdown_secs |

5. Click **Save**

### Step 2: Tag Products for Promotions

1. Go to **Products**
2. Edit a product you want to use for a promotion card
3. Add the tag "promotion" to the product
4. Fill in the metafields you created
5. Save the product
6. Repeat for up to 3 products

## Food Emoji Selection

The system automatically selects food emojis based on the title or handle of your promotion:

- If the title or handle contains "meat", meat-related emojis will be displayed
- If the title or handle contains "fruit", fruit-related emojis will be displayed
- Otherwise, vegetable-related emojis will be displayed

## Styling Guide

- **Background Color**: Use hex color codes (e.g., "#2980b9" for blue, "#000000" for black, "#f1c40f" for yellow)
- **Text Color**: Use "white" or "black" depending on your background color
- **Countdown**: Only fill in countdown fields if you want to display a countdown timer
- **Price**: Only fill in price field if you want to display a price
- **Discount**: Only fill in discount field if you want to display a discount badge

## Troubleshooting

If your promotion cards are not appearing:
1. Make sure you've correctly set up one of the methods above
2. Check that your metafields are correctly defined
3. Verify that collections or products have the "promotion" tag
4. Refresh your store's cache

For further assistance, contact your developer.
