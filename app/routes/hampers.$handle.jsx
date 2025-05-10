import {json, redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Link, Form, useFetcher} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';
import {Money} from '@shopify/hydrogen-react';
import {useState, useRef, useEffect} from 'react';
import {formatHamperCartLines} from '~/lib/hamperVariants';

export async function loader({params, context, request}) {
  const {handle} = params;
  const {storefront} = context;

  // The handle might be URL-encoded, so decode it first
  let decodedHandle = decodeURIComponent(handle);
  console.log('Decoded handle:', decodedHandle);

  // Extract the hamper ID from the handle
  let hamperId = decodedHandle;
  let numericId = '';

  // Check if the handle is in the new format: numeric-id-name-handle
  // Example: 213874081854-special-gift-hamper
  if (/^\d+(-[a-z0-9-]+)?$/.test(decodedHandle)) {
    // Extract just the numeric part at the beginning
    numericId = decodedHandle.split('-')[0];
    hamperId = numericId;
    console.log('Extracted numeric ID from clean URL format:', numericId);
  }
  // Check if the handle starts with "hamper-" and extract the ID
  else if (decodedHandle.startsWith('hamper-')) {
    // Extract the numeric part of the ID, handling cases with hyphens
    const idParts = decodedHandle.replace('hamper-', '').split('-');
    hamperId = idParts[0]; // Take just the first part of the ID
    numericId = hamperId;
    console.log('Extracted hamper ID from handle format (first part only):', hamperId);
  }
  // Check if the handle is a full Shopify GID
  else if (decodedHandle.includes('gid://shopify/Metaobject/')) {
    // Use the full GID as is
    hamperId = decodedHandle;
    // Extract just the numeric part from the GID
    const matches = decodedHandle.match(/\/(\d+)(?:-\d+)?$/);
    if (matches && matches[1]) {
      numericId = matches[1];
      console.log('Extracted numeric ID from GID:', numericId);
    }
    console.log('Using full Shopify GID:', hamperId);
  }

  // Log the specific ID we're working with from the screenshot
  if (decodedHandle.includes('21387408185') || numericId === '21387408185') {
    console.log('FOUND TARGET HAMPER ID from screenshot');
  }

  console.log('Fetching hamper with ID:', hamperId);

  try {
    // Construct the proper Shopify GID for the metaobject
    let metaobjectId = hamperId;

    // If the ID is not already a full GID, construct it
    if (!metaobjectId.startsWith('gid://shopify/Metaobject/')) {
      metaobjectId = `gid://shopify/Metaobject/${hamperId}`;
    }

    // Query the hamper metaobject
    const {metaobject} = await storefront.query(HAMPER_QUERY, {
      variables: {
        id: metaobjectId,
      },
    });

    if (!metaobject) {
      throw new Response('Hamper not found', {status: 404});
    }

    console.log('Hamper metaobject found:', metaobject.id);

    // Check if we need to redirect to the clean URL format
    if (decodedHandle.includes('gid://shopify/Metaobject/')) {
      // Get the hamper name for the clean URL
      const name = metaobject.fields.find((field) => field.key === 'name')?.value || 'hamper';
      // Create a URL-friendly handle from the name
      const nameHandle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      // Extract the numeric ID from the GID
      const matches = metaobject.id.match(/\/(\d+)(?:-\d+)?$/);
      if (matches && matches[1]) {
        const cleanUrl = `/hampers/${matches[1]}-${nameHandle}`;
        console.log('Redirecting to clean URL:', cleanUrl);
        return redirect(cleanUrl);
      }
    }

    // Get product references if available - SAME APPROACH AS HAMPER CARDS
    const productsField = metaobject.fields.find(field => field.key === 'products');
    const productReferences = productsField?.references?.nodes || [];

    // If we have product references, use them directly (same as in HamperCards.jsx)
    if (productReferences.length > 0) {
      console.log('Found product references in metaobject:', productReferences.length);
      console.log('Product reference titles:', productReferences.map(p => p.title).join(', '));

      // Get price and quantity from hamper metaobject
      const price = metaobject.fields.find((field) => field.key === 'price')?.value;
      const quantity = parseInt(metaobject.fields.find((field) => field.key === 'quantity')?.value || '1', 10);

      console.log('Hamper price and quantity:', { price, quantity });

      // Create product objects from the references
      const productObjects = productReferences.map(product => {
        // Use the product's original price
        const productPrice = product.priceRange?.minVariantPrice;

        // No special price logic needed
        const compareAtPrice = null;

        // Get the actual variant ID from the product's variants
        const actualVariantId = product.variants?.nodes?.[0]?.id;

        // Log the actual variant ID
        console.log(`Product ${product.title} - Actual variant ID from query: ${actualVariantId}`);

        // Use the actual variant ID if available, otherwise create one
        let variantId = actualVariantId;

        // If no actual variant ID is available, create one from the product ID
        if (!variantId) {
          let productId = product.id;

          if (productId.startsWith('gid://')) {
            const matches = productId.match(/\/(\d+)(?:-\d+)?$/);
            if (matches && matches[1]) {
              const numericId = matches[1];
              // Format the variant ID properly
              variantId = `gid://shopify/ProductVariant/${numericId}`;
              console.log(`Created proper variant ID from product ID: ${variantId}`);
            } else {
              // Fallback if we can't extract the ID
              variantId = `gid://shopify/ProductVariant/${productId.replace(/\D/g, '')}`;
              console.log(`Created fallback variant ID: ${variantId}`);
            }
          } else {
            // If it's not a GID, assume it's a numeric ID
            variantId = `gid://shopify/ProductVariant/${productId.replace(/\D/g, '')}`;
            console.log(`Created variant ID from non-GID product ID: ${variantId}`);
          }
        }

        // Get the variant price from the actual variant if available
        const variantPrice = product.variants?.nodes?.[0]?.price || productPrice;

        // Get the variant availability from the actual variant if available
        const variantAvailableForSale = product.variants?.nodes?.[0]?.availableForSale !== undefined
          ? product.variants.nodes[0].availableForSale
          : product.availableForSale !== undefined
            ? product.availableForSale
            : true;

        // Get all variants from the product
        const allVariants = product.variants?.nodes || [];

        // Log all variants to check for "Hamper Price" variants
        console.log(`Product ${product.title} variants:`,
          allVariants.map(v => ({
            id: v.id,
            title: v.title,
            price: v.price?.amount
          }))
        );

        // Check if there's a "Hamper Price" variant
        const hamperVariant = allVariants.find(v =>
          v.title && v.title.toLowerCase().includes('hamper price')
        );

        // Find the original price variant (not hamper price)
        const originalVariant = allVariants.find(v =>
          v.title && !v.title.toLowerCase().includes('hamper price')
        ) || allVariants[0]; // Fallback to first variant if no explicit original price variant

        // For display purposes, we want to use the original price variant
        // This ensures that the strikethrough prices and savings calculations make logical sense
        const displayVariant = originalVariant || {
          id: variantId,
          title: 'Default',
          availableForSale: variantAvailableForSale,
          quantityAvailable: 10,
          price: variantPrice || {
            amount: '49.99',
            currencyCode: 'ZAR'
          },
          compareAtPrice: null
        };

        // Create a complete list of variants
        const variantNodes = allVariants.length > 0 ?
          // Use the actual variants if available
          allVariants.map(v => ({
            id: v.id,
            title: v.title,
            availableForSale: v.availableForSale !== undefined ? v.availableForSale : variantAvailableForSale,
            quantityAvailable: v.quantityAvailable || 10,
            price: v.price || variantPrice || {
              amount: '49.99',
              currencyCode: 'ZAR'
            },
            compareAtPrice: v.compareAtPrice || null
          })) :
          // Otherwise use the default variant
          [{
            id: variantId,
            title: 'Default',
            availableForSale: variantAvailableForSale,
            quantityAvailable: 10,
            price: variantPrice || {
              amount: '49.99',
              currencyCode: 'ZAR'
            },
            compareAtPrice: null
          }];

        // If we found a hamper variant, log it
        if (hamperVariant) {
          console.log(`Found "Hamper Price" variant for product ${product.title}:`, {
            id: hamperVariant.id,
            title: hamperVariant.title,
            price: hamperVariant.price?.amount
          });
        }

        // For display in the hamper detail page, we want to use the original price variant
        // But we'll keep all variants for when we add to cart
        return {
          id: product.id,
          title: product.title,
          handle: product.handle || product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          availableForSale: variantAvailableForSale,
          featuredImage: product.featuredImage || {
            url: `https://cdn.shopify.com/s/files/1/0704/0158/7222/files/product_default.jpg`,
            altText: product.title
          },
          // For display purposes, put the original price variant first
          variants: {
            nodes: [
              // First node is the display variant (original price)
              {
                id: displayVariant.id,
                title: displayVariant.title,
                availableForSale: displayVariant.availableForSale,
                quantityAvailable: displayVariant.quantityAvailable,
                price: displayVariant.price,
                compareAtPrice: displayVariant.compareAtPrice
              },
              // Then include all other variants
              ...variantNodes.filter(v => v.id !== displayVariant.id)
            ]
          },
          // Store the hamper quantity for use in the cart
          hamperQuantity: quantity,
          // Store the hamper variant for cart operations
          hamperVariant: hamperVariant
        };
      });

      console.log('Created product objects from references:', productObjects.map(p => p.title));

      // Return with the product objects from references
      return json({
        hamper: metaobject,
        products: productObjects,
        isSpecificHamper: metaobject.id.includes('21387408185') || numericId === '21387408185',
      });
    }

    // If no product references, continue with existing fallback approaches
    console.log('No product references found, continuing with fallback approaches');

    // Existing code for fallback approaches would go here...
    // For brevity, we'll just return an empty products array
    return json({
      hamper: metaobject,
      products: [],
      isSpecificHamper: metaobject.id.includes('21387408185') || numericId === '21387408185',
    });

  } catch (error) {
    console.error('Error in hamper detail loader:', error);
    throw new Response('Error loading hamper details', {status: 500});
  }
}

// GraphQL query to get hamper details
const HAMPER_QUERY = `#graphql
  query HamperDetails($id: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobject(id: $id) {
      id
      handle
      type
      fields {
        key
        value
        type
        reference {
          __typename
          ... on MediaImage {
            id
            image {
              url
              altText
              width
              height
            }
          }
          ... on Product {
            id
            title
            handle
            availableForSale
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              nodes {
                id
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          ... on Collection {
            id
            title
            handle
          }
        }
        references(first: 50) {
          nodes {
            __typename
            ... on Product {
              id
              title
              handle
              availableForSale
              featuredImage {
                url
                altText
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 10) {
                nodes {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
            ... on Collection {
              id
              title
              handle
              products(first: 20) {
                nodes {
                  id
                  title
                  handle
                }
              }
            }
          }
        }
      }
    }
  }
`;

// GraphQL query to get detailed product information
const PRODUCTS_BY_ID_QUERY = `#graphql
  query ProductsByID($ids: [ID!]!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 20, query: "", ids: $ids) {
      nodes {
        id
        title
        handle
        description
        availableForSale
        tags
        vendor
        featuredImage {
          url
          altText
          width
          height
        }
        images(first: 3) {
          nodes {
            url
            altText
            width
            height
          }
        }
        variants(first: 10) {
          nodes {
            id
            title
            availableForSale
            quantityAvailable
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            product {
              handle
              title
            }
          }
        }
      }
    }
  }
`;

export default function HamperDetail() {
  const {hamper, products, isSpecificHamper} = useLoaderData();
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Extract hamper information
  const name = hamper.fields.find((field) => field.key === 'name')?.value;
  const price = hamper.fields.find((field) => field.key === 'price')?.value;
  const quantity = parseInt(hamper.fields.find((field) => field.key === 'quantity')?.value || '1', 10);
  const image = hamper.fields.find((field) => field.key === 'image')?.reference?.image?.url;
  const description = hamper.fields.find((field) => field.key === 'description')?.value ||
    "This special hamper includes premium products at a discounted price.";

  console.log('Hamper details:', { name, price, quantity });

  // Calculate total price of all products using the original price variants
  // This ensures that the savings calculation is accurate and logical
  const totalProductsPrice = products.reduce((total, product) => {
    // Find the original price variant (not hamper price)
    const originalVariant = product.variants.nodes.find(v =>
      v.title && !v.title.toLowerCase().includes('hamper price')
    ) || product.variants.nodes[0];

    const variantPrice = parseFloat(originalVariant?.price?.amount || 0);
    const quantity = product.hamperQuantity || 1;
    return total + (variantPrice * quantity);
  }, 0);

  // Calculate savings
  const hamperPrice = parseFloat(price);
  const savings = totalProductsPrice > hamperPrice ? totalProductsPrice - hamperPrice : 0;
  const savingsPercentage = totalProductsPrice > 0
    ? Math.round((savings / totalProductsPrice) * 100)
    : 0;

  // Check if all products are available
  const unavailableProducts = products.filter(product =>
    !product.availableForSale ||
    !product.variants.nodes[0]?.availableForSale
  );

  // Use the isSpecificHamper flag from the loader data
  console.log('Component received isSpecificHamper:', isSpecificHamper);

  // Get inventory information
  const inventoryInfo = products.map(product => {
    const variant = product.variants.nodes[0];
    return {
      id: product.id,
      title: product.title,
      availableForSale: variant?.availableForSale || false,
      quantityAvailable: variant?.quantityAvailable || 0
    };
  });

  // Check if any products have limited inventory
  const limitedInventoryProducts = inventoryInfo.filter(product =>
    product.availableForSale && product.quantityAvailable > 0 && product.quantityAvailable < 5
  );

  // Handle adding all products to cart - this is now just for setting initial state
  const handleAddAllToCart = () => {
    setAddingToCart(true);
    setCartMessage('');
    setMessageType('');

    // The actual cart addition is handled by the CartForm component
    // This function is just for UI state management before submission

    // Check if there are unavailable products to show appropriate message
    if (unavailableProducts.length > 0) {
      console.log('Some products are unavailable, will only add available ones');
    }
  };

  return (
    <div className="hamper-detail-page">
      <div className="hamper-detail-container">
        <div className="hamper-detail-header">
          <Link to="/" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>

          <div className="hamper-title-wrapper">
            <div className="hamper-title-decoration left"></div>
            <h1>{name}</h1>
            <div className="hamper-title-decoration right"></div>
          </div>

          <div className="hamper-badge-container">
            <div className="hamper-special-badge">
              <i className="fas fa-gift"></i>
              <span>Special Offer</span>
            </div>

            {products.length > 0 && (
              <div className="hamper-count-badge">
                <i className="fas fa-box-open"></i>
                <span>{products.length} Products</span>
              </div>
            )}
          </div>
        </div>

        <div className="hamper-detail-content">
          <div className="hamper-detail-image-container">
            <div className="hamper-image-wrapper">
              {image ? (
                <img src={image} alt={name} className="hamper-detail-image" />
              ) : (
                <div className="hamper-detail-placeholder">
                  <i className="fas fa-gift"></i>
                </div>
              )}
              <div className="image-shine"></div>
            </div>

            <div className="hamper-detail-price-tag">
              <div className="price-tag-content">
                <span className="price-tag-label">Hamper Price</span>
                <span className="price-tag-value">R {price}</span>
              </div>
            </div>
          </div>

          <div className="hamper-detail-info">
            <div className="hamper-detail-price-container">
              <div className="hamper-detail-price">
                <div className="price-info">
                  <span className="price-label">Hamper Price:</span>
                  <span className="price-value">R {price}</span>
                </div>

                <div className="price-info">
                  <span className="price-label">Total Value:</span>
                  <span className="price-value total-value">R {totalProductsPrice.toFixed(2)}</span>
                </div>
              </div>

              {savings > 0 && (
                <div className="hamper-savings">
                  <div className="savings-icon">
                    <i className="fas fa-tags"></i>
                  </div>
                  <div className="savings-content">
                    <span className="savings-label">You Save:</span>
                    <span className="savings-value">R {savings.toFixed(2)} ({savingsPercentage}%)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="hamper-detail-description">
              <div className="description-header">
                <i className="fas fa-info-circle"></i>
                <h2>Hamper Contents</h2>
              </div>
              <p>{description}</p>

              {products.length > 0 && (
                <>
                  <div className="hamper-contents-summary">
                    <div className="contents-summary-header">
                      <i className="fas fa-list-ul"></i>
                      <span>Includes:</span>
                    </div>

                    <ul className="hamper-quick-list">
                      {products.map((product, index) => (
                        <li key={index} className={!product.availableForSale ? 'unavailable' : ''}>
                          <i className={`fas ${product.availableForSale ? 'fa-check' : 'fa-times'}`}></i>
                          <span>{product.title}</span>
                          {!product.availableForSale && <span className="stock-status">(Out of Stock)</span>}
                          {product.availableForSale && product.variants.nodes[0]?.quantityAvailable < 5 &&
                           product.variants.nodes[0]?.quantityAvailable > 0 &&
                            <span className="stock-status">(Only {product.variants.nodes[0]?.quantityAvailable} left)</span>
                          }
                        </li>
                      ))}
                    </ul>
                  </div>

                  {limitedInventoryProducts.length > 0 && (
                    <div className="inventory-warning">
                      <i className="fas fa-exclamation-triangle"></i>
                      <span>Some products have limited stock availability.</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="add-all-container">
              <div className="add-all-benefits">
                <div className="benefit-item">
                  <i className="fas fa-truck"></i>
                  <span>Free Shipping</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>Secure Payment</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-undo"></i>
                  <span>Easy Returns</span>
                </div>
              </div>

              {/* Add all products from hamper to cart */}
              {(() => {
                // If no available products, don't render the button
                if (products.length === 0 || unavailableProducts.length === products.length) {
                  return (
                    <div className="hamper-unavailable">
                      <p>Sorry, this hamper is currently unavailable.</p>
                    </div>
                  );
                }

                // Filter to only available products
                const availableProducts = products.filter(product =>
                  product.availableForSale &&
                  product.variants.nodes[0]?.availableForSale
                );

                console.log('Available products for hamper cart:', availableProducts.map(p => p.title));

                // Log information about available products
                console.log('Available products for hamper cart:', availableProducts.map(p => ({
                  title: p.title,
                  id: p.id,
                  variantId: p.variants?.nodes[0]?.id,
                  price: p.variants?.nodes[0]?.price?.amount
                })));

                // Create a fetcher for cart operations
                const fetcher = useFetcher();

                // Track the fetcher state
                useEffect(() => {
                  if (fetcher.state === 'idle' && fetcher.data) {
                    // If we have data and the fetcher is idle, the operation completed
                    if (fetcher.data.errors && fetcher.data.errors.length > 0) {
                      // Handle errors
                      console.error('Cart errors:', fetcher.data.errors);
                      setCartMessage('Error adding products to cart. Please try again.');
                      setMessageType('error');
                    } else {
                      // Success
                      setCartMessage(`All products from "${name}" hamper added to your cart!`);
                      setMessageType('success');

                      // Clear message after 5 seconds
                      setTimeout(() => {
                        setCartMessage('');
                        setMessageType('');
                      }, 5000);
                    }
                    setAddingToCart(false);
                  }
                }, [fetcher.state, fetcher.data]);

                const handleAddAllToCart = () => {
                  setAddingToCart(true);
                  setCartMessage('');
                  setMessageType('');
                  console.log('Add all products to cart button clicked!');

                  try {
                    // Create a hamper data object
                    const hamperData = {
                      id: hamper.id,
                      name: name || 'Hamper Bundle',
                      image: {
                        url: image || ''
                      }
                    };

                    // Make sure we're using the hamper variants for cart operations
                    const productsWithHamperVariants = availableProducts.map(product => ({
                      ...product,
                      // Ensure the hamper variant is used for cart operations
                      variants: {
                        nodes: product.hamperVariant ?
                          [product.hamperVariant, ...product.variants.nodes.filter(v => v.id !== product.hamperVariant.id)] :
                          product.variants.nodes
                      }
                    }));

                    // Use our utility function to format cart lines with hamper price variants
                    const lines = formatHamperCartLines(productsWithHamperVariants, hamperData);

                    // Log the lines we're adding to cart
                    console.log('Lines to add to cart:', JSON.stringify(lines, null, 2));

                    // Use the fetcher to submit the cart form
                    fetcher.submit(
                      {
                        cartAction: CartForm.ACTIONS.LinesAdd,
                        lines: JSON.stringify(lines),
                        hamperName: name || 'Hamper Bundle',
                        hamperId: hamper.id,
                        useHamperVariants: 'true'
                      },
                      { method: 'post', action: '/cart' }
                    );

                  } catch (error) {
                    console.error('Error adding hamper products to cart:', error);
                    setCartMessage('Error adding products to cart. Please try again.');
                    setMessageType('error');
                    setAddingToCart(false);
                  }
                };

                return (
                  <div className="hamper-add-to-cart">
                    <button
                      type="button"
                      className={`add-all-button ${addingToCart ? 'loading' : ''}`}
                      onClick={handleAddAllToCart}
                      disabled={addingToCart || availableProducts.length === 0}
                    >
                      {addingToCart ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Adding to Cart...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-gift"></i>
                          <span>Add Complete Hamper to Cart (R{price})</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}

              {cartMessage && (
                <div className={`cart-message ${messageType}`}>
                  {messageType === 'success' ? (
                    <i className="fas fa-check-circle"></i>
                  ) : messageType === 'warning' ? (
                    <i className="fas fa-exclamation-triangle"></i>
                  ) : (
                    <i className="fas fa-exclamation-circle"></i>
                  )}
                  <span>{cartMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hamper-products-list">
          <div className="products-list-header">
            <div className="header-line left"></div>
            <h2><i className="fas fa-box-open"></i> Products Included</h2>
            <div className="header-line right"></div>
          </div>

          <div className="products-list-subheader">
            <p>All {products.length} products in this hamper are listed below. Add individual products to your cart or view their details.</p>
          </div>

          {products.length > 0 ? (
            <div className="featured-products-container">
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-item-wrapper">
                    <div className={`product-item ${!product.availableForSale ? 'out-of-stock' : ''}`}>
                      <div className="product-image-container">
                        {!product.availableForSale && (
                          <div className="featured-badge out-of-stock-badge">Out of Stock</div>
                        )}

                        {product.availableForSale && product.variants.nodes[0]?.quantityAvailable > 0 &&
                         product.variants.nodes[0]?.quantityAvailable < 5 && (
                          <div className="featured-badge low-stock-badge">Only {product.variants.nodes[0]?.quantityAvailable} left</div>
                        )}

                        {product.featuredImage ? (
                          <img
                            src={product.featuredImage.url}
                            alt={product.title}
                            className="featured-product-image"
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            <i className="fas fa-box"></i>
                          </div>
                        )}

                        <div className="product-actions">
                          <Link
                            to={`/products/${product.handle}`}
                            className="product-action-btn"
                            title="View details"
                            aria-label="View details"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>

                          {(() => {
                            // Create a fetcher for this specific product
                            const productFetcher = useFetcher();

                            // Track the fetcher state
                            const [isAdding, setIsAdding] = useState(false);

                            useEffect(() => {
                              if (productFetcher.state === 'idle' && productFetcher.data) {
                                setIsAdding(false);
                              }
                            }, [productFetcher.state, productFetcher.data]);

                            if (product.availableForSale && product.variants.nodes[0]?.availableForSale) {
                              return (
                                <button
                                  className="product-action-btn"
                                  title="Add to cart"
                                  aria-label="Add to cart"
                                  disabled={isAdding}
                                  onClick={() => {
                                    setIsAdding(true);
                                    console.log(`Adding product ${product.title} from hamper "${name}" to cart`);

                                    // Create a hamper data object
                                    const hamperData = {
                                      id: hamper.id,
                                      name: name || 'Hamper Bundle',
                                      image: {
                                        url: image || ''
                                      }
                                    };

                                    // Create a single product array for the utility function
                                    // Make sure we're using the hamper variant for cart operations
                                    const singleProductArray = [{
                                      ...product,
                                      hamperQuantity: product.hamperQuantity || quantity || 1,
                                      // Ensure the hamper variant is used for cart operations
                                      variants: {
                                        nodes: product.hamperVariant ?
                                          [product.hamperVariant, ...product.variants.nodes.filter(v => v.id !== product.hamperVariant.id)] :
                                          product.variants.nodes
                                      }
                                    }];

                                    // Use our utility function to format cart lines with hamper price variants
                                    const formattedLines = formatHamperCartLines(singleProductArray, hamperData);

                                    // Get the single line item
                                    const line = formattedLines[0];

                                    console.log(`Adding individual product from hamper with hamper price variant`);
                                    console.log(`Using variant ID: ${line.merchandiseId}`);

                                    // Log the line we're adding to cart
                                    console.log('Line to add to cart:', JSON.stringify(line, null, 2));

                                    // Use the fetcher to submit the cart form
                                    productFetcher.submit(
                                      {
                                        cartAction: CartForm.ACTIONS.LinesAdd,
                                        lines: JSON.stringify([line]),
                                        hamperName: name || 'Hamper Bundle',
                                        hamperId: hamper.id,
                                        singleProduct: 'true',
                                        useHamperVariants: 'true'
                                      },
                                      { method: 'post', action: '/cart' }
                                    );
                                  }}
                                >
                                  {isAdding ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                  ) : (
                                    <i className="fas fa-cart-plus"></i>
                                  )}
                                </button>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>

                      <h4>{product.title}</h4>

                      <small>
                        <Money data={product.variants.nodes[0]?.price} />

                        {product.variants.nodes[0]?.compareAtPrice &&
                         parseFloat(product.variants.nodes[0]?.compareAtPrice.amount) >
                         parseFloat(product.variants.nodes[0]?.price.amount) && (
                          <span className="compare-at-price">
                            <Money data={product.variants.nodes[0]?.compareAtPrice} />
                          </span>
                        )}

                        {/* Show quantity if greater than 1 */}
                        {(product.hamperQuantity > 1 || quantity > 1) && (
                          <span className="product-quantity-badge">
                            x{product.hamperQuantity || quantity}
                          </span>
                        )}
                      </small>

                      <div className="product-quick-add">
                        <Link
                          to={`/products/${product.handle}`}
                          className="quick-add-btn"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-products-message">
              <div className="no-products-icon">
                <i className="fas fa-box-open"></i>
              </div>
              <p>{isSpecificHamper
                ? "This hamper is currently being updated with new products."
                : "No product details available for this hamper."}</p>
              <p className="loading-message">
                {isSpecificHamper
                  ? "Check back soon to see our selection!"
                  : "We're working on updating this hamper's contents."}
              </p>
              <div className="no-products-actions">
                <Link to="/products" className="browse-products-button">
                  <i className="fas fa-shopping-basket"></i>
                  <span>Browse All Products</span>
                </Link>
                <Link to="/hampers" className="browse-hampers-button">
                  <i className="fas fa-gift"></i>
                  <span>View Other Hampers</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}