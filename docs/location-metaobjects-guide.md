# Setting Up Store Locations with Shopify Metaobjects

This guide walks you through the process of setting up store locations using Shopify Metaobjects.

## 1. Creating the Metaobject Definition

### Navigate to Metaobjects

1. Go to your Shopify Admin dashboard
2. Click on **Settings** in the left sidebar
3. Select **Custom data**
4. Click on **Metaobjects**

### Add a New Definition

1. Click the **Add definition** button
2. Enter the following details:
   - **Name**: Store Location
   - **API ID**: location
   - **Description**: Store locations with address, contact info, and hours

### Add Fields to the Definition

Click **Add field** and add each of these fields:

#### Branch Name Field
- **Display name**: Branch Name
- **API ID**: branch_name
- **Field type**: Single line text
- Check **Required field**

#### Street Address Field
- **Display name**: Street Address
- **API ID**: street_address
- **Field type**: Single line text
- Check **Required field**

#### City Field
- **Display name**: City
- **API ID**: city
- **Field type**: Single line text
- Check **Required field**

#### Province Field
- **Display name**: Province
- **API ID**: province
- **Field type**: Single line text
- Check **Required field**

#### Postal Code Field
- **Display name**: Postal Code
- **API ID**: postal_code
- **Field type**: Single line text
- Check **Required field**

#### Country Field
- **Display name**: Country
- **API ID**: country
- **Field type**: Single line text
- Check **Required field**

#### Phone Numbers Field
- **Display name**: Phone Numbers
- **API ID**: phone_numbers
- **Field type**: List of single line text
- Check **Required field**

#### Email Field
- **Display name**: Email
- **API ID**: email
- **Field type**: Email
- Check **Required field**

#### Monday Hours Field
- **Display name**: Monday Hours
- **API ID**: monday_hours
- **Field type**: Single line text
- Check **Required field**

#### Tuesday Hours Field
- **Display name**: Tuesday Hours
- **API ID**: tuesday_hours
- **Field type**: Single line text
- Check **Required field**

#### Wednesday Hours Field
- **Display name**: Wednesday Hours
- **API ID**: wednesday_hours
- **Field type**: Single line text
- Check **Required field**

#### Thursday Hours Field
- **Display name**: Thursday Hours
- **API ID**: thursday_hours
- **Field type**: Single line text
- Check **Required field**

#### Friday Hours Field
- **Display name**: Friday Hours
- **API ID**: friday_hours
- **Field type**: Single line text
- Check **Required field**

#### Saturday Hours Field
- **Display name**: Saturday Hours
- **API ID**: saturday_hours
- **Field type**: Single line text
- Check **Required field**

#### Sunday Hours Field
- **Display name**: Sunday Hours
- **API ID**: sunday_hours
- **Field type**: Single line text
- Check **Required field**

#### Location Image Field (Optional)
- **Display name**: Location Image
- **API ID**: location_image
- **Field type**: File (image)
- **Help text**: Upload an image of the store location

### Save the Definition

Click the **Save** button to create your metaobject definition.

## 2. Creating Location Entries

### Navigate to Metaobjects Content

1. Go to your Shopify Admin dashboard
2. Click on **Content** in the left sidebar
3. Select **Metaobjects**

### Create the First Location (KAAH Secunda)

1. Find the "Store Location" definition and click **Add entry**
2. Fill in the following details:
   - **Branch Name**: KAAH Secunda
   - **Street Address**: Horwood Street
   - **City**: Secunda
   - **Province**: Mpumalanga
   - **Postal Code**: 2302
   - **Country**: South Africa
   - **Phone Numbers**: Add "017 880 0399" and "076 969 6416"
   - **Email**: uzile@kaah.co.za
   - **Monday Hours**: 7:00 AM - 7:00 PM
   - **Tuesday Hours**: 7:00 AM - 7:00 PM
   - **Wednesday Hours**: 7:00 AM - 7:00 PM
   - **Thursday Hours**: 7:00 AM - 7:00 PM
   - **Friday Hours**: 7:00 AM - 7:00 PM
   - **Saturday Hours**: 7:00 AM - 7:00 PM
   - **Sunday Hours**: 7:00 AM - 7:00 PM
   - **Location Image**: Upload an image of the Secunda store (optional)
3. Click **Save**

### Create the Second Location (KAAH Bronkhorstspruit)

1. Click **Add entry** again
2. Fill in the following details:
   - **Branch Name**: KAAH Bronkhorstspruit
   - **Street Address**: 18 Lanham Street
   - **City**: Bronkhorstspruit
   - **Province**: Gauteng
   - **Postal Code**: 1020
   - **Country**: South Africa
   - **Phone Numbers**: Add "013 880 1534" and "076 969 6416"
   - **Email**: bronkhorstspruit@kaah.co.za
   - **Monday Hours**: 7:00 AM - 7:00 PM
   - **Tuesday Hours**: 7:00 AM - 7:00 PM
   - **Wednesday Hours**: 7:00 AM - 7:00 PM
   - **Thursday Hours**: 7:00 AM - 7:00 PM
   - **Friday Hours**: 7:00 AM - 7:00 PM
   - **Saturday Hours**: 7:00 AM - 7:00 PM
   - **Sunday Hours**: 7:00 AM - 7:00 PM
   - **Location Image**: Upload an image of the Bronkhorstspruit store (optional)
3. Click **Save**

### Create the Third Location (KAAH Rustenburg)

1. Click **Add entry** again
2. Fill in the following details:
   - **Branch Name**: KAAH Rustenburg
   - **Street Address**: 16914 Tlou Street
   - **City**: Rustenburg
   - **Province**: North West
   - **Postal Code**: 0309
   - **Country**: South Africa
   - **Phone Numbers**: Add "013 880 1534" and "076 969 6416"
   - **Email**: boitekong@kaah.co.za
   - **Monday Hours**: 7:00 AM - 7:00 PM
   - **Tuesday Hours**: 7:00 AM - 7:00 PM
   - **Wednesday Hours**: 7:00 AM - 7:00 PM
   - **Thursday Hours**: 7:00 AM - 7:00 PM
   - **Friday Hours**: 7:00 AM - 7:00 PM
   - **Saturday Hours**: 7:00 AM - 7:00 PM
   - **Sunday Hours**: 7:00 AM - 7:00 PM
   - **Location Image**: Upload an image of the Rustenburg store (optional)
3. Click **Save**

### Create the Fourth Location (KAAH Potchefstroom)

1. Click **Add entry** again
2. Fill in the following details:
   - **Branch Name**: KAAH Potchefstroom
   - **Street Address**: 70 Rivier Street
   - **City**: Potchefstroom
   - **Province**: North West
   - **Postal Code**: 2531
   - **Country**: South Africa
   - **Phone Numbers**: Add "013 880 1534" and "076 969 6416"
   - **Email**: potchefstroom@kaah.co.za
   - **Monday Hours**: 7:00 AM - 7:00 PM
   - **Tuesday Hours**: 7:00 AM - 7:00 PM
   - **Wednesday Hours**: 7:00 AM - 7:00 PM
   - **Thursday Hours**: 7:00 AM - 7:00 PM
   - **Friday Hours**: 7:00 AM - 7:00 PM
   - **Saturday Hours**: 7:00 AM - 7:00 PM
   - **Sunday Hours**: 7:00 AM - 7:00 PM
   - **Location Image**: Upload an image of the Potchefstroom store (optional)
3. Click **Save**

## 3. Using the Automated Script (Alternative Method)

If you prefer to automate the creation of location metaobjects, you can use the provided script:

1. Set up environment variables in a `.env` file:
   ```
   SHOPIFY_SHOP=your-store.myshopify.com
   SHOPIFY_ADMIN_API_TOKEN=your-admin-api-access-token
   ```

2. Install dependencies:
   ```bash
   npm install dotenv node-fetch
   ```

3. Run the script:
   ```bash
   node scripts/create-location-metaobjects.js
   ```

## 4. Viewing Your Locations on the Website

After setting up your location metaobjects, visit your store's locations page to see them in action. You should see all your store locations displayed with:

- Branch name
- Full address
- Contact information (phone numbers and email)
- Operating hours for each day of the week
- Store image (if uploaded)

## 5. Editing Locations

To edit a location:

1. Go to **Content > Metaobjects**
2. Find the "Store Location" definition
3. Click on the entry you want to edit
4. Make your changes
5. Click **Save**

Changes should be reflected on your website immediately.

## 6. Troubleshooting

If your locations aren't displaying correctly:

- Make sure all required fields are filled in
- Check that the API IDs match exactly what's in the code
- Verify that the metaobject definition is correctly set up
- Clear your website cache if changes aren't appearing
