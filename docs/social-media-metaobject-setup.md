# Social Media Metaobject Setup Guide

This guide will help you set up a Shopify metaobject to manage your social media links dynamically from the Shopify admin panel.

## Overview

The social media metaobject allows you to:
- Add, edit, and remove social media links from the Shopify admin
- Control which social media links are displayed on your site
- Set custom URLs for each platform
- Control the order of social media icons
- Add accessibility labels for better SEO

## Step 1: Create the Metaobject Definition

1. Go to your Shopify admin panel
2. Navigate to **Settings** > **Custom data**
3. Click **Metaobjects** in the sidebar
4. Click **Add definition**
5. Fill in the following details:

### Basic Information
- **Name**: `Social Media Link`
- **Type**: `social_media_link` (this will be auto-generated)
- **Description**: `Social media links for the website footer`

### Field Definitions

Add the following fields to your metaobject:

#### 1. Platform (Required)
- **Field name**: `Platform`
- **Field key**: `platform`
- **Field type**: `Single line text`
- **Required**: Yes
- **Description**: The social media platform name (e.g., facebook, twitter, instagram, pinterest, linkedin, youtube, tiktok)

#### 2. URL (Required)
- **Field name**: `URL`
- **Field key**: `url`
- **Field type**: `Single line text`
- **Required**: Yes
- **Description**: The full URL to your social media profile

#### 3. Aria Label
- **Field name**: `Aria Label`
- **Field key**: `aria_label`
- **Field type**: `Single line text`
- **Required**: No
- **Description**: Accessibility label for screen readers (e.g., "Visit our Facebook page")

#### 4. Is Active
- **Field name**: `Is Active`
- **Field key**: `is_active`
- **Field type**: `True or false`
- **Required**: No
- **Default**: `true`
- **Description**: Whether to display this social media link

#### 5. Sort Order
- **Field name**: `Sort Order`
- **Field key**: `sort_order`
- **Field type**: `Integer`
- **Required**: No
- **Description**: Order in which to display the links (lower numbers appear first)

## Step 2: Create Social Media Link Entries

After creating the metaobject definition, create entries for each social media platform:

### Example: Facebook Entry
1. Click **Add entry** in your Social Media Link metaobject
2. Fill in the fields:
   - **Platform**: `facebook`
   - **URL**: `https://facebook.com/yourpage`
   - **Aria Label**: `Visit our Facebook page`
   - **Is Active**: `true`
   - **Sort Order**: `1`

### Example: Instagram Entry
1. Click **Add entry**
2. Fill in the fields:
   - **Platform**: `instagram`
   - **URL**: `https://instagram.com/youraccount`
   - **Aria Label**: `Follow us on Instagram`
   - **Is Active**: `true`
   - **Sort Order**: `2`

### Supported Platforms

The system includes built-in icons for these platforms:
- `facebook`
- `twitter`
- `instagram`
- `pinterest`
- `linkedin`
- `youtube`
- `tiktok`

If you use a platform not in this list, it will fall back to the Facebook icon.

## Step 3: Configure Platform Names

Make sure to use the exact platform names as they appear in the supported list above. The platform name is case-sensitive and must match exactly for the correct icon to display.

## Step 4: Test Your Setup

1. Save your metaobject entries
2. Visit your website
3. Check the footer to see your social media icons
4. Verify that the links work correctly
5. Test with a screen reader to ensure accessibility labels work

## Advanced Configuration

### Adding Custom Platforms

If you need to add a platform that's not in the supported list:

1. Add the entry with your custom platform name
2. The system will use the Facebook icon as a fallback
3. To add a custom icon, you'll need to modify the `SOCIAL_MEDIA_ICONS` object in `app/lib/social-media-queries.js`

### Troubleshooting

**Icons not showing up?**
- Check that the platform name exactly matches the supported platforms list
- Ensure the entry is marked as "Is Active"
- Verify the metaobject type is exactly `social_media_link`

**Links not working?**
- Make sure URLs include the full protocol (https://)
- Test the URLs directly in your browser

**Wrong order?**
- Check the Sort Order values - lower numbers appear first
- Make sure each entry has a unique sort order number

## GraphQL Query

The system uses this GraphQL query to fetch your social media data:

```graphql
query SocialMediaLinks($country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
  metaobjects(type: "social_media_link", first: 10) {
    nodes {
      id
      handle
      type
      fields {
        key
        value
      }
    }
  }
}
```

## Fallback Behavior

If no metaobjects are found or there's an error fetching them, the system will fall back to default social media links defined in the code. This ensures your footer always has social media icons even if the metaobject setup isn't complete.

## Best Practices

1. **Keep URLs up to date**: Regularly check that your social media URLs are current
2. **Use descriptive aria labels**: This improves accessibility for users with screen readers
3. **Limit the number of platforms**: Too many social media icons can clutter your footer
4. **Test regularly**: Verify that all links work and icons display correctly
5. **Use consistent branding**: Make sure your social media profiles match your brand

## Need Help?

If you encounter issues setting up the social media metaobject:
1. Double-check the field keys match exactly as specified
2. Ensure the metaobject type is `social_media_link`
3. Verify that at least one entry is marked as active
4. Check the browser console for any error messages
