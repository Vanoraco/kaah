/**
 * Utility functions for handling checkout redirects and cart synchronization
 */

/**
 * Detects if the user is returning from checkout based on the referrer URL
 * @param {Request} request - The current request
 * @returns {boolean} - True if the user is returning from checkout
 */
export function isReturningFromCheckout(request) {
  const referrer = request.headers.get('referer') || '';

  // Check if the referrer contains checkout.shopify.com or other checkout domains
  const isFromCheckout =
    referrer.includes('checkout.shopify.com') ||
    referrer.includes('checkout.myshopify.com') ||
    referrer.includes('checkout.hydrogen.shop') ||
    referrer.includes('secure.checkout');

  return isFromCheckout;
}

/**
 * Client-side function to check if user is returning from checkout
 * This is used in the browser environment where we have access to localStorage
 * @returns {boolean} - True if the user is returning from checkout
 */
export function isReturningFromCheckoutClient() {
  try {
    // Check if we have a checkout timestamp in localStorage
    const checkoutStarted = localStorage.getItem('checkout_started');

    if (!checkoutStarted) {
      return false;
    }

    // Get the timestamp and check if it's recent (within the last hour)
    const checkoutTime = parseInt(checkoutStarted, 10);
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    // If checkout was started within the last hour, consider it a return from checkout
    if (currentTime - checkoutTime < oneHour) {
      // Clear the checkout timestamp
      localStorage.removeItem('checkout_started');
      return true;
    }

    // Checkout timestamp is too old, clear it
    localStorage.removeItem('checkout_started');
    return false;
  } catch (error) {
    console.error('Error checking localStorage for checkout return:', error);
    return false;
  }
}

/**
 * Client-side function to handle cart synchronization when returning from checkout
 * This function forces a full page reload to ensure the cart is properly synchronized
 */
export function handleCheckoutReturnClient() {
  try {
    // Check if user is returning from checkout
    if (isReturningFromCheckoutClient()) {
      console.log('Client: User returning from checkout, forcing cart refresh');

      // Store a flag in sessionStorage to indicate that we need to force a server refresh
      sessionStorage.setItem('force_cart_refresh', 'true');

      // Force a hard refresh of the page to ensure we get a fresh cart from the server
      // The '?nocache=' parameter ensures the browser doesn't use a cached version
      window.location.href = '/cart?nocache=' + Date.now();
      return true;
    }

    // Check if we have a force_cart_refresh flag in sessionStorage
    if (sessionStorage.getItem('force_cart_refresh') === 'true') {
      console.log('Client: Force cart refresh flag detected, clearing flag');

      // Clear the flag
      sessionStorage.removeItem('force_cart_refresh');

      // Force a hard refresh of the page
      window.location.reload(true);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error in handleCheckoutReturnClient:', error);
    return false;
  }
}

/**
 * Synchronizes the cart when returning from checkout
 * @param {Object} context - The app context containing cart
 * @param {Request} request - The current request
 * @returns {Promise<Object>} - The result of the cart operation
 */
export async function handleCheckoutReturn(context, request) {
  const { cart } = context;

  try {
    // Check if returning from checkout
    if (!isReturningFromCheckout(request)) {
      return {
        success: false,
        message: 'Not returning from checkout',
        cartSynced: false
      };
    }

    console.log('User returning from checkout, synchronizing cart');

    // Get the current cart
    const currentCart = await cart.get();

    // If there's no cart, no need to synchronize
    if (!currentCart) {
      console.log('No cart found, nothing to synchronize');
      return {
        success: true,
        message: 'No cart found',
        cartSynced: false
      };
    }

    // Create a new cart with the same lines as the current cart
    // This ensures we have a completely fresh cart state
    try {
      // Get the current cart lines
      const lines = currentCart?.lines?.nodes?.map(line => ({
        merchandiseId: line.merchandise.id,
        quantity: line.quantity,
        attributes: line.attributes
      })) || [];

      console.log('Creating new cart with', lines.length, 'lines');

      // Create a new cart with the same lines
      const newCartResult = await cart.create({ lines });

      if (!newCartResult || newCartResult.errors?.length) {
        console.error('Error creating new cart:', newCartResult?.errors || 'Unknown error');

        // Fall back to getting the cart with force refresh
        const result = await cart.get({ force: true });

        if (!result) {
          console.error('Error fetching latest cart state');
          return {
            success: false,
            error: 'Error fetching latest cart state',
            cartSynced: false
          };
        }

        return {
          success: true,
          message: 'Cart synchronized after checkout (fallback)',
          cartSynced: true,
          cart: result
        };
      }

      console.log('New cart created successfully with ID:', newCartResult.cart?.id);

      return {
        success: true,
        message: 'New cart created after checkout',
        cartSynced: true,
        cart: newCartResult.cart
      };
    } catch (error) {
      console.error('Error in cart creation:', error);

      // Fall back to getting the cart with force refresh
      const result = await cart.get({ force: true });

      if (!result) {
        console.error('Error fetching latest cart state');
        return {
          success: false,
          error: 'Error fetching latest cart state',
          cartSynced: false
        };
      }

      return {
        success: true,
        message: 'Cart synchronized after checkout (fallback)',
        cartSynced: true,
        cart: result
      };
    }
  } catch (error) {
    console.error('Error in handleCheckoutReturn:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      cartSynced: false
    };
  }
}
