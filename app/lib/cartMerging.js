/**
 * Utility functions for merging carts when a customer logs in
 */

/**
 * Merges an anonymous cart with a customer's cart
 * @param {Object} context - The app context containing cart and customerAccount
 * @returns {Promise<Object>} - The result of the cart merge operation
 */
export async function mergeCartsOnLogin(context) {
  const { cart, customerAccount } = context;
  
  try {
    // Step 1: Check if the customer is logged in
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return { 
        success: false, 
        error: 'Customer not logged in',
        cart: null
      };
    }
    
    // Step 2: Get the current anonymous cart
    const currentCart = await cart.get();
    if (!currentCart || !currentCart.lines?.nodes?.length) {
      console.log('No items in current cart to merge');
      
      // Even with no items to merge, we still want to associate the cart with the customer
      return await associateCartWithCustomer(context);
    }
    
    // Step 3: Get the CustomerAccessToken
    const { accessToken } = await customerAccount.getAccessToken();
    if (!accessToken) {
      return { 
        success: false, 
        error: 'No access token available',
        cart: currentCart
      };
    }
    
    // Step 4: Create a new cart with the customer's access token and the items from the current cart
    const cartLines = currentCart.lines.nodes.map(line => ({
      merchandiseId: line.merchandise.id,
      quantity: line.quantity
    }));
    
    // Include any discount codes from the current cart
    const discountCodes = currentCart.discountCodes?.map(code => code.code) || [];
    
    // Create a new cart with the customer's access token and the items from the current cart
    const result = await cart.create({
      lines: cartLines,
      discountCodes,
      buyerIdentity: {
        customerAccessToken: accessToken
      }
    });
    
    if (result.errors?.length) {
      console.error('Error merging carts:', result.errors);
      return { 
        success: false, 
        error: result.errors[0]?.message || 'Error merging carts',
        cart: currentCart
      };
    }
    
    return { 
      success: true, 
      message: 'Carts merged successfully',
      cart: result.cart
    };
  } catch (error) {
    console.error('Error in mergeCartsOnLogin:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred',
      cart: null
    };
  }
}

/**
 * Associates a cart with a customer without creating a new cart
 * @param {Object} context - The app context containing cart and customerAccount
 * @returns {Promise<Object>} - The result of the cart association operation
 */
async function associateCartWithCustomer(context) {
  const { cart, customerAccount } = context;
  
  try {
    // Get the CustomerAccessToken
    const { accessToken } = await customerAccount.getAccessToken();
    if (!accessToken) {
      return { 
        success: false, 
        error: 'No access token available',
        cart: null
      };
    }
    
    // Update the cart's buyer identity with the customer access token
    const result = await cart.updateBuyerIdentity({
      customerAccessToken: accessToken
    });
    
    if (result.errors?.length) {
      console.error('Error associating cart with customer:', result.errors);
      return { 
        success: false, 
        error: result.errors[0]?.message || 'Error associating cart with customer',
        cart: null
      };
    }
    
    return { 
      success: true, 
      message: 'Cart associated with customer',
      cart: result.cart
    };
  } catch (error) {
    console.error('Error in associateCartWithCustomer:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred',
      cart: null
    };
  }
}
