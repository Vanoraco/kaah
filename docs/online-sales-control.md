# Online Sales Control System

This document explains how to use the dynamic online sales control system that allows you to enable or disable online purchasing functionality across the entire website.

## Overview

The online sales control system provides a centralized way to toggle online sales on/off without requiring code changes. When disabled, customers can still browse products but cannot add items to cart or make purchases online. Instead, they see professional messaging directing them to visit the store.

## Features

### 1. **Dynamic Button States**
- **Add to Cart buttons** are disabled and show "Available In-Store Only"
- **Buy Now buttons** are disabled with the same messaging
- **MegaSaver buttons** are disabled with appropriate styling
- All disabled buttons maintain professional appearance with clear messaging

### 2. **Cart Page Messaging**
- When online sales are disabled, the cart page shows a prominent message:
  - "Online Sales Coming Soon!"
  - "Browse our products and visit us in-store for immediate purchase."
- The messaging is professionally styled with icons and clear call-to-action

### 3. **Site-wide Notification Banner**
- Prominent banner at the top of all pages when online sales are disabled
- Professional styling with clear messaging about in-store availability
- Responsive design that works on all devices
- Optional dismissal with session storage
- Automatic layout adjustment to prevent content overlap

### 4. **Consistent User Experience**
- All affected areas show consistent messaging
- Disabled states are visually clear but don't detract from design
- Users receive clear guidance about in-store purchasing options

## Setup Instructions

### Step 1: Create the Metaobject Definition

You can create the required metaobject definition in two ways:

#### Option A: Using the Script (Recommended)
1. Set environment variables:
   ```bash
   export SHOPIFY_STORE_URL="your-store.myshopify.com"
   export SHOPIFY_ADMIN_API_TOKEN="your-admin-api-token"
   ```

2. Run the setup script:
   ```bash
   node scripts/create-online-sales-control-metaobject.js
   ```

#### Option B: Manual Setup via Shopify Admin
1. Go to **Shopify Admin > Settings > Custom data > Metaobjects**
2. Click **Add definition**
3. Fill in the details:
   - **Name**: Online Sales Control
   - **API ID**: `online_sales_control`
   - **Description**: Controls whether online sales are enabled or disabled

4. Add a field:
   - **Name**: Enabled
   - **API ID**: `enabled`
   - **Type**: Boolean
   - **Required**: Yes
   - **Description**: Whether online sales are currently enabled

5. Save the definition

### Step 2: Create the Control Instance

1. Go to **Shopify Admin > Settings > Custom data > Metaobjects**
2. Find "Online Sales Control" and click **Add entry**
3. Set:
   - **Handle**: `main-control`
   - **Enabled**: `true` (to start with online sales enabled)
4. Save the entry

## Usage

### Enabling/Disabling Online Sales

1. Go to **Shopify Admin > Settings > Custom data > Metaobjects**
2. Find "Online Sales Control" and click on the "main-control" entry
3. Toggle the **Enabled** field:
   - `true` = Online sales enabled (normal operation)
   - `false` = Online sales disabled (in-store only)
4. Save the changes

The website will automatically reflect the changes within a few minutes due to caching.

### What Happens When Disabled

When online sales are disabled (`enabled = false`):

1. **Product Pages**:
   - Add to Cart button shows "Available In-Store Only"
   - Buy Now button shows "Available In-Store Only"
   - Both buttons are disabled and styled appropriately

2. **Collection Pages**:
   - Add to Cart buttons on product cards show "Available In-Store Only"
   - Buttons are disabled with professional styling

3. **MegaSaver Section**:
   - Add to Cart buttons show "Available In-Store Only"
   - Buttons are disabled with consistent styling

4. **Site-wide Banner**:
   - Fixed banner at the top of all pages
   - Clear messaging: "Online sales temporarily unavailable - Visit us in-store for immediate purchase"
   - Professional blue styling with store location link
   - Responsive design for mobile devices
   - Optional dismissal (can be configured as non-dismissible)

5. **Cart Page**:
   - Shows prominent messaging about online sales being unavailable
   - Encourages customers to visit the store
   - Maintains professional appearance

## Technical Implementation

### Components Modified

The following components have been updated to support online sales control:

- `AddToCartButton.jsx` - Main add to cart component
- `SimpleAddToCartButton.jsx` - Simplified add to cart component  
- `ReliableAddToCartButton.jsx` - Reliable add to cart component
- `MegaSaver/AddToCartButton.jsx` - MegaSaver add to cart component
- `ProductForm.jsx` - Product form with buy now button
- `CartMain.jsx` - Cart page with messaging
- `OnlineSalesNotificationBanner.jsx` - Site-wide notification banner
- `PageLayout.jsx` - Updated to account for banner spacing

### Utility Functions

The system uses utility functions in `app/lib/onlineSalesControl.js`:

- `useOnlineSalesStatus()` - Hook to get online sales status
- `getDisabledButtonProps()` - Get props for disabled button states
- `getCartMessaging()` - Get cart messaging configuration

### Styling

Custom CSS classes for disabled states:

- `.disabled-online-sales` - Applied to disabled buttons
- `.cart-online-sales-message` - Cart page messaging styles

## Customization

### Changing Button Text

To change the disabled button text, modify the `getDisabledButtonProps()` function in `app/lib/onlineSalesControl.js`:

```javascript
return {
  disabled: true,
  text: 'Your Custom Message', // Change this
  className: 'disabled-online-sales',
  title: 'Your custom tooltip message'
};
```

### Changing Cart Messaging

To change the cart page messaging, modify the `getCartMessaging()` function in `app/lib/onlineSalesControl.js`:

```javascript
return {
  showMessage: true,
  title: 'Your Custom Title',
  message: 'Your custom message text',
  type: 'info',
  icon: 'fas fa-store'
};
```

### Styling Customization

Modify the CSS in:
- `app/styles/product-form.css` - For button disabled styles
- `app/styles/cart.css` - For cart messaging styles
- `app/styles/online-sales-banner.css` - For notification banner styles

## Troubleshooting

### Changes Not Reflecting
- Check that the metaobject exists and has the correct API ID (`online_sales_control`)
- Verify the field API ID is `enabled`
- Clear browser cache or wait a few minutes for Shopify's cache to update

### Buttons Still Working
- Ensure the metaobject field value is exactly `false` (not `"false"` string)
- Check browser console for any JavaScript errors
- Verify the root loader is fetching the metaobject data

### Styling Issues
- Check that CSS files are properly loaded
- Verify the disabled classes are being applied in browser dev tools
- Ensure CSS specificity is sufficient to override existing styles

## Support

For technical support or customization requests, refer to the development team or check the component documentation in the codebase.
