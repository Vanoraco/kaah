# Visual Guide: Setting Up Promotion Cards with Metaobjects

This visual guide walks you through the process of setting up promotion cards using Shopify Metaobjects.

## 1. Creating the Metaobject Definition

### Navigate to Metaobjects

1. Go to your Shopify Admin dashboard
2. Click on **Settings** in the left sidebar
3. Select **Custom data**
4. Click on **Metaobjects**

![Navigate to Metaobjects](https://shopify.dev/assets/custom-data/metaobjects/metaobjects-admin-nav.png)

### Add a New Definition

1. Click the **Add definition** button
2. Enter the following details:
   - **Name**: Promotion Card
   - **API ID**: promotion_card
   - **Description**: Cards for promotional content on the homepage

![Add Definition](https://shopify.dev/assets/custom-data/metaobjects/metaobject-definition-create.png)

### Add Fields to the Definition

Click **Add field** and add each of these fields:

#### Title Field
- **Display name**: Title
- **API ID**: title
- **Field type**: Single line text
- Check **Required field**

#### Subtitle Field
- **Display name**: Subtitle
- **API ID**: subtitle
- **Field type**: Single line text

#### Background Color Field
- **Display name**: Background Color
- **API ID**: background_color
- **Field type**: Single line text
- **Help text**: Enter a hex color code (e.g., #2980b9)

#### Text Color Field
- **Display name**: Text Color
- **API ID**: text_color
- **Field type**: Single line text
- **Help text**: Enter 'white' or 'black'

#### Link Field
- **Display name**: Link
- **API ID**: link
- **Field type**: Single line text
- **Help text**: URL path for the "Shop Now" button (e.g., /collections/sale)
- Check **Required field**

#### Price Field
- **Display name**: Price
- **API ID**: price
- **Field type**: Single line text
- **Help text**: Price to display (e.g., $79.99)

#### Discount Field
- **Display name**: Discount
- **API ID**: discount
- **Field type**: Single line text
- **Help text**: Discount text (e.g., 64% OFF)

#### Countdown Fields
- Create four separate fields for the countdown:
  - **Display name**: Countdown Days
    - **API ID**: countdown_days
    - **Field type**: Single line text
  - **Display name**: Countdown Hours
    - **API ID**: countdown_hours
    - **Field type**: Single line text
  - **Display name**: Countdown Minutes
    - **API ID**: countdown_mins
    - **Field type**: Single line text
  - **Display name**: Countdown Seconds
    - **API ID**: countdown_secs
    - **Field type**: Single line text

#### Image Field (Optional)
- **Display name**: Image
- **API ID**: image
- **Field type**: Media (image)
- **Help text**: Upload an image to replace the food emojis

### Save the Definition

Click the **Save** button to create your metaobject definition.

## 2. Creating Promotion Card Entries

### Navigate to Metaobjects Content

1. Go to your Shopify Admin dashboard
2. Click on **Content** in the left sidebar
3. Select **Metaobjects**

![Navigate to Metaobjects Content](https://shopify.dev/assets/custom-data/metaobjects/metaobjects-admin-content.png)

### Create the First Promotion Card (Sale of the Month)

1. Find the "Promotion Card" definition and click **Add entry**
2. Fill in the following details:
   - **Title**: Sale of the Month
   - **Subtitle**: BEST DEALS
   - **Background Color**: #2980b9
   - **Text Color**: white
   - **Link**: /collections/monthly-deals
   - **Countdown Days**: 00
   - **Countdown Hours**: 02
   - **Countdown Minutes**: 18
   - **Countdown Seconds**: 46
3. Click **Save**

### Create the Second Promotion Card (Low-Fat Meat)

1. Click **Add entry** again
2. Fill in the following details:
   - **Title**: Low-Fat Meat
   - **Subtitle**: 85% FAT FREE
   - **Background Color**: #000000
   - **Text Color**: white
   - **Link**: /collections/meat
   - **Price**: $79.99
3. Click **Save**

### Create the Third Promotion Card (Fresh Fruit)

1. Click **Add entry** again
2. Fill in the following details:
   - **Title**: 100% Fresh Fruit
   - **Subtitle**: SUMMER SALE
   - **Background Color**: #f1c40f
   - **Text Color**: black
   - **Link**: /collections/fruits
   - **Discount**: 64% OFF
3. Click **Save**

## 3. Viewing Your Promotion Cards

After setting up your promotion cards, visit your store's homepage to see them in action. You should see three cards:

1. **Sale of the Month** - Blue card with a countdown timer
2. **Low-Fat Meat** - Black card with a price tag
3. **100% Fresh Fruit** - Yellow card with a discount badge

Each card should have:
- The title and subtitle you specified
- The background and text colors you chose
- A "Shop Now" button that links to the specified collection
- Food emojis that match the card's theme (vegetables, meat, or fruit)

## 4. Editing Promotion Cards

To edit a promotion card:

1. Go to **Content > Metaobjects**
2. Find the "Promotion Card" definition
3. Click on the entry you want to edit
4. Make your changes
5. Click **Save**

Changes should be reflected on your homepage immediately.

## 5. Troubleshooting

If your promotion cards aren't displaying correctly:

- Make sure all required fields are filled in
- Check that the API IDs match exactly what's in the code
- Verify that the background and text colors are valid
- Try clearing your browser cache
- Check the browser console for any JavaScript errors

For more detailed instructions, refer to the [Metaobject Implementation Guide](./metaobject-implementation-guide.md).
