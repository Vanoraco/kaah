# Product Poster Feature - Technical Documentation

This document provides technical details about the Product Poster feature implementation for developers who need to maintain, modify, or extend the functionality.

## Architecture Overview

The Product Poster feature is built using Shopify's metaobject system to store poster data and Hydrogen/Remix for the frontend implementation. The feature consists of the following components:

### 1. Metaobject Definitions

Two metaobject types are used:

- **product_poster**: Stores poster metadata and references to poster items
- **poster_product_item**: Stores individual product items with positioning and custom pricing

### 2. Backend Scripts

- `scripts/create-product-poster-metaobjects.js`: Creates the metaobject definitions
- `scripts/create-sample-product-poster.js`: Creates a sample poster with products

### 3. GraphQL Queries

- `app/lib/poster-queries.js`: Contains queries for fetching poster data and utility functions for processing the data

### 4. React Components

- `app/components/ProductPoster.jsx`: Main component for displaying the poster

### 5. Routes

- `app/routes/posters._index.jsx`: Displays all available posters
- `app/routes/posters.$handle.jsx`: Displays a single poster by its handle

### 6. Styles

- `app/styles/product-poster.css`: Styles for the poster components

## Metaobject Schema Details

### product_poster

| Field Name | API ID | Type | Description |
|------------|--------|------|-------------|
| Title | title | single_line_text_field | Poster title |
| Background Image | background_image | file_reference | Background image for the poster |
| Background Color | background_color | single_line_text_field | Hex color code for background |
| Layout Type | layout_type | single_line_text_field | "grid" or "freestyle" |
| Products | products | list.product_reference | Products to display (optional) |
| Poster Items | poster_items | list.metaobject_reference | References to poster_product_item metaobjects |
| Effective Date | effective_date | date | Start date for the promotion |
| Expiry Date | expiry_date | date | End date for the promotion |

### poster_product_item

| Field Name | API ID | Type | Description |
|------------|--------|------|-------------|
| Product | product | product_reference | Reference to a product |
| Custom Price | custom_price | number_decimal | Custom price for the poster |
| Position X | position_x | number_integer | X coordinate (0-100) |
| Position Y | position_y | number_integer | Y coordinate (0-100) |
| Size | size | number_integer | Size of the product image (1-100) |
| Highlight | highlight | boolean | Whether to highlight this product |
| Custom Label | custom_label | single_line_text_field | Custom label text |

## GraphQL Queries

### PRODUCT_POSTERS_QUERY

Fetches all product posters:

```graphql
query ProductPosters($country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
  metaobjects(type: "product_poster", first: 10) {
    nodes {
      id
      handle
      type
      fields {
        key
        value
        reference {
          ... on MediaImage {
            id
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
}
```

### PRODUCT_POSTER_BY_HANDLE_QUERY

Fetches a single product poster by handle:

```graphql
query ProductPosterByHandle($handle: String!, $country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
  metaobject(handle: $handle) {
    id
    handle
    type
    fields {
      key
      value
      reference {
        ... on MediaImage {
          id
          image {
            url
            altText
            width
            height
          }
        }
      }
      references(first: 50) {
        nodes {
          ... on Metaobject {
            id
            type
            fields {
              key
              value
              reference {
                ... on Product {
                  id
                  title
                  handle
                  featuredImage {
                    url
                    altText
                    width
                    height
                  }
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## Data Processing

The `processPosterData` function in `app/lib/poster-queries.js` transforms the raw metaobject data into a more usable format for the components:

```javascript
export function processPosterData(posterMetaobject) {
  // Creates a structured object with poster data and items
  // See the implementation for details
}
```

## Component Structure

### ProductPoster Component

The main component for displaying a poster:

```jsx
export function ProductPoster({ poster, printable = false }) {
  // Renders the poster with its items
  // Handles printing functionality
}
```

Props:
- `poster`: The processed poster data object
- `printable`: Boolean to show/hide the print button

## Routes

### posters._index.jsx

Displays all active posters:

```jsx
export default function PostersIndex() {
  const { posters } = useLoaderData();
  
  return (
    <div className="posters-page">
      <PageHeader heading="Weekly Special Offers" />
      <div className="posters-container">
        {posters.map(poster => (
          <ProductPoster key={poster.id} poster={poster} printable={true} />
        ))}
      </div>
    </div>
  );
}
```

### posters.$handle.jsx

Displays a single poster by its handle:

```jsx
export default function PosterDetails() {
  const { poster } = useLoaderData();
  
  return (
    <div className="poster-details-page">
      <div className="poster-details-container">
        <ProductPoster poster={poster} printable={true} />
        <div className="poster-navigation">
          <a href="/posters" className="back-to-posters-link">
            <i className="fas fa-arrow-left"></i> Back to All Offers
          </a>
        </div>
      </div>
    </div>
  );
}
```

## Styling

The styles are defined in `app/styles/product-poster.css` and follow a responsive design approach:

- Mobile-first design with breakpoints at 576px, 768px, and 992px
- Grid layout uses CSS Grid with responsive columns
- Freestyle layout uses absolute positioning
- Animations for item appearance and hover effects

## Printing Implementation

The printing functionality works by:

1. Opening a new window with a simplified HTML version of the poster
2. Adding print-specific CSS
3. Automatically triggering the browser's print dialog
4. The print version is optimized for paper output with proper margins and sizing

## Extending the Feature

### Adding New Fields to Posters

1. Update the metaobject definition in `create-product-poster-metaobjects.js`
2. Update the GraphQL queries in `poster-queries.js`
3. Update the `processPosterData` function to handle the new fields
4. Modify the `ProductPoster` component to display the new fields

### Adding New Layout Types

1. Add the new layout type to the `layout_type` field validation in the metaobject definition
2. Update the `ProductPoster` component to handle the new layout type
3. Add CSS for the new layout in `product-poster.css`

### Enhancing Print Functionality

The print functionality can be enhanced by:

1. Adding more print options (paper size, orientation)
2. Adding a QR code to link back to the digital version
3. Adding store branding and contact information

## Performance Considerations

- Images are loaded with the `loading="lazy"` attribute to improve performance
- The component uses the Intersection Observer API to animate items only when they are visible
- CSS animations use hardware acceleration where possible

## Security Considerations

- All data is fetched server-side in the loader functions
- User input is properly sanitized before being used in the UI
- The print functionality uses a new window to avoid security issues

## Known Limitations

1. The maximum number of products per poster is limited by the Shopify GraphQL API (typically 250)
2. The freestyle layout requires manual positioning which can be time-consuming
3. Print quality depends on the browser's print capabilities and the quality of product images

## Future Improvements

1. Add drag-and-drop editor for freestyle layout positioning
2. Add templates for common poster layouts
3. Add ability to schedule posters for automatic publishing/unpublishing
4. Add analytics to track poster views and prints
