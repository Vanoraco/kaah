# MegaSaver Component

A modular, efficient, and maintainable implementation of the MegaSaver component for displaying special offers and deals.

## Component Structure

The MegaSaver component has been refactored into a modular structure:

```
MegaSaver/
├── index.jsx             # Main component that orchestrates everything
├── AddToCartButton.jsx   # Button component for adding items to cart
├── MegaSaverBanner.jsx   # Banner component for the section header
├── MegaSaverItem.jsx     # Individual item component
├── utils/
│   ├── colorUtils.js     # Utility functions for color manipulation
│   └── dataUtils.js      # Utility functions for data processing
└── README.md             # This documentation file
```

## Usage

```jsx
import { MegaSaver } from '~/components/MegaSaver';

// In your component:
<MegaSaver 
  megaSaverItems={megaSaverItemsData} 
  megaSaverBanner={megaSaverBannerData}
  showViewMoreButton={true} 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `megaSaverItems` | Object | - | Metaobjects data for mega saver items from Shopify |
| `megaSaverBanner` | Object | - | Metaobjects data for mega saver banner from Shopify |
| `showViewMoreButton` | Boolean | `true` | Whether to show the "View More" button |

## Features

- **Modular Design**: Each component has a single responsibility
- **Performance Optimized**: Uses React.memo and useMemo for efficient rendering
- **Error Handling**: Graceful fallbacks for missing data
- **Maintainable**: Clear separation of concerns
- **Type Safety**: PropTypes validation for all components
- **Responsive**: Maintains all responsive features from the original

## Data Processing

The component processes data from Shopify metaobjects:

1. **Banner Data**: Processes the banner metaobject for title, subtitle, and colors
2. **Item Data**: Processes item metaobjects for product details, pricing, and availability

## Styling

The component uses the existing CSS classes from the app.css file. No additional CSS files are needed.

## Add to Cart Functionality

The AddToCartButton component handles:

- Adding items to cart with proper metadata
- Displaying loading state during API calls
- Showing success messages after adding
- Tracking quantities in cart
- Handling out-of-stock scenarios

## Fallback Data

If no data is provided from the API, the component will display fallback items to ensure the section always appears properly.

## Animations

The component includes:

- Fade-in animation on initial load
- Intersection Observer for scroll-based animations
- Hover effects on items

## Maintenance

When updating this component:

1. Identify which subcomponent needs changes
2. Make targeted changes to that specific file
3. Update tests if applicable
4. Document any API changes in this README
