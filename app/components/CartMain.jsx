import {useOptimisticCart} from '@shopify/hydrogen';
import {Link, useFetcher, useRouteLoaderData} from '@remix-run/react';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {HamperCartBundle} from '~/components/HamperCartBundle';
import {CartSummary} from './CartSummary';
import {useEffect} from 'react';
import {useOnlineSalesStatus, getCartMessaging} from '~/lib/onlineSalesControl';

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 * @param {CartMainProps}
 */
export function CartMain({layout, cart: originalCart}) {
  // Create a fetcher to refresh the cart
  const cartFetcher = useFetcher();

  // Ensure originalCart is not null or undefined
  const safeOriginalCart = originalCart || {
    lines: { nodes: [] },
    totalQuantity: 0,
    cost: { totalAmount: { amount: '0', currencyCode: 'ZAR' } }
  };

  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(safeOriginalCart);

  // Refresh the cart when the component mounts to ensure it's in sync
  // and clean up URL parameters
  useEffect(() => {
    // Only refresh if we're on the cart page (not in the aside)
    if (layout === 'page') {
      // Import the URL utilities and clean up URL parameters
      import('~/lib/urlUtils').then(({ cleanupUrlParameters }) => {
        // Clean up URL parameters (remove Price=Original+Price)
        cleanupUrlParameters(['nocache', 'refresh']);
      }).catch(error => {
        console.error('Error importing URL utilities:', error);
      });

      // Import the checkout return handler
      import('~/lib/checkoutRedirect').then(({ handleCheckoutReturnClient }) => {
        // Handle checkout return (this will redirect if needed)
        const handled = handleCheckoutReturnClient();

        // If not returning from checkout, just refresh the cart normally
        if (!handled) {
          console.log('CartMain: Refreshing cart data on mount');
          cartFetcher.load('/cart');
        }
      }).catch(error => {
        console.error('Error importing checkout redirect utilities:', error);
        // Refresh the cart anyway
        cartFetcher.load('/cart');
      });
    }
  }, []);

  // Add a button to force refresh the cart if needed
  const forceRefreshCart = () => {
    console.log('Forcing cart refresh...');
    window.location.href = '/cart?nocache=' + Date.now();
  };

  // Ensure lines and nodes are always defined
  if (!cart.lines) {
    cart.lines = { nodes: [] };
  }

  if (!cart.lines.nodes) {
    cart.lines.nodes = [];
  }

  // Filter out items with quantity 0 and null/undefined lines
  const validLines = cart.lines.nodes
    .filter(line => line && line.merchandise && line.quantity > 0) || [];

  // Group hamper items by hamper name
  const hamperGroups = {};
  const nonHamperLines = [];

  validLines.forEach(line => {
    // Check if this is a hamper item
    const fromHamperAttr = line.attributes?.find(attr => attr.key === '_internal_from_hamper');
    const isFromHamper = fromHamperAttr && String(fromHamperAttr.value).toLowerCase() === 'true';

    if (isFromHamper) {
      // Get the hamper name
      const hamperName = line.attributes?.find(attr => attr.key === '_internal_hamper_name')?.value;

      if (hamperName) {
        // Add to hamper group
        if (!hamperGroups[hamperName]) {
          hamperGroups[hamperName] = [];
        }
        hamperGroups[hamperName].push(line);
      } else {
        // If no hamper name, treat as regular item
        nonHamperLines.push(line);
      }
    } else {
      // Not a hamper item
      nonHamperLines.push(line);
    }
  });

  // Convert hamper groups to array
  const hamperBundles = Object.entries(hamperGroups).map(([hamperName, lines]) => ({
    hamperName,
    lines
  }));

  // Ensure cart and lines are properly defined
  const hasLines = validLines.length > 0;
  const linesCount = hasLines;

  // Check for applicable discount codes
  const withDiscount =
    cart &&
    cart.discountCodes &&
    Array.isArray(cart.discountCodes) &&
    cart.discountCodes.filter((code) => code?.applicable).length > 0;

  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;

  // Check if cart has items - use our filtered lines to determine this
  const cartHasItems = validLines.length > 0;

  // Only log in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log('CartMain rendering with:', {
      originalLineCount: cart?.lines?.nodes?.length || 0,
      validLineCount: validLines.length,
      hasLines,
      linesCount,
      cartHasItems,
      totalQuantity: cart?.totalQuantity
    });
  }

  return (
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} />
      {linesCount && (
        <div className="cart-details">

          <div className="cart-lines-container" aria-labelledby="cart-lines">
            <ul>
              {/* Render hamper bundles */}
              {hamperBundles.map((bundle, index) => (
                <HamperCartBundle
                  key={`hamper-${bundle.hamperName}-${index}`}
                  hamperName={bundle.hamperName}
                  lines={bundle.lines}
                  layout={layout}
                />
              ))}

              {/* Render non-hamper items */}
              {nonHamperLines.map((line, index) => (
                <CartLineItem key={line.id || `line-${index}`} line={line} layout={layout} />
              ))}
            </ul>
          </div>
          {cartHasItems && (
            <div className="cart-summary-container">
              <CartSummary cart={cart} layout={layout} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * @param {{
 *   hidden: boolean;
 *   layout?: CartMainProps['layout'];
 * }}
 */
function CartEmpty({hidden = false, layout}) {
  const {close} = useAside();

  // Get root data for online sales status
  const rootData = useRouteLoaderData('root');
  const isOnlineSalesEnabled = useOnlineSalesStatus(rootData);
  const cartMessaging = getCartMessaging(isOnlineSalesEnabled);

  // Only log in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log('CartEmpty component with hidden:', hidden);
  }

  return (
    <div className="cart-empty" style={{ display: hidden ? 'none' : 'block' }}>
      {/* Show online sales messaging if applicable */}
      {cartMessaging.showMessage && (
        <div className={`cart-online-sales-message ${cartMessaging.type}`}>
          <div className="cart-message-icon">
            <i className={cartMessaging.icon}></i>
          </div>
          <div className="cart-message-content">
            <h3>{cartMessaging.title}</h3>
            <p>{cartMessaging.message}</p>
          </div>
        </div>
      )}

      <div className="cart-empty-illustration">
        <div className="empty-cart-image">
          <i className="fas fa-shopping-cart"></i>
          <div className="empty-cart-sparkle sparkle-1"></div>
          <div className="empty-cart-sparkle sparkle-2"></div>
          <div className="empty-cart-sparkle sparkle-3"></div>
        </div>
      </div>

      <h2 className="cart-empty-title">
        {cartMessaging.showMessage ? 'Browse Our Products' : 'Your Cart is Empty'}
      </h2>

      <p className="cart-empty-message">
        {cartMessaging.showMessage
          ? 'Discover amazing products and visit us in-store for immediate purchase.'
          : 'Looks like you haven\'t added anything yet. Explore our collections and discover amazing products that match your style!'
        }
      </p>

      <div className="cart-empty-actions">
        <Link
          to="/collections"
          onClick={layout === 'aside' ? close : undefined}
          prefetch="viewport"
          className="cart-empty-button"
        >
          <i className="fas fa-shopping-bag"></i>
          Browse Collections
        </Link>

        <Link
          to="/products"
          onClick={layout === 'aside' ? close : undefined}
          prefetch="viewport"
          className="cart-empty-button secondary"
        >
          <i className="fas fa-th-large"></i>
          View All Products
        </Link>
      </div>

      <div className="cart-empty-features">
        <div className="cart-feature">
          <div className="cart-feature-icon">
            <i className="fas fa-truck"></i>
          </div>
          <div className="cart-feature-text">
            <h3>Free Shipping</h3>
            <p>On all orders over R500</p>
          </div>
        </div>

        <div className="cart-feature">
          <div className="cart-feature-icon">
            <i className="fas fa-undo"></i>
          </div>
          <div className="cart-feature-text">
            <h3>Easy Returns</h3>
            <p>30-day return policy</p>
          </div>
        </div>

        <div className="cart-feature">
          <div className="cart-feature-icon">
            <i className="fas fa-lock"></i>
          </div>
          <div className="cart-feature-text">
            <h3>Secure Checkout</h3>
            <p>Safe & protected shopping</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
