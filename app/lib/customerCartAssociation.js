/**
 * Utility functions for associating a customer with a cart
 */

/**
 * Associates a logged-in customer with the current cart
 * @param {Object} context - The app context containing customerAccount and cart
 * @returns {Promise<Object>} - The result of the cart update operation
 */
export async function associateCustomerWithCart(context) {
  const { customerAccount, cart } = context;
  
  try {
    // Check if the customer is logged in
    const isLoggedIn = await customerAccount.isLoggedIn();
    
    if (!isLoggedIn) {
      console.log('Customer not logged in, skipping cart association');
      return { success: false, error: 'Customer not logged in' };
    }
    
    // Get the CustomerAccessToken from the Customer Account API
    const { accessToken } = await customerAccount.getAccessToken();
    
    if (!accessToken) {
      console.log('No access token available, skipping cart association');
      return { success: false, error: 'No access token available' };
    }
    
    // Update the cart's buyer identity with the customer access token
    const result = await cart.updateBuyerIdentity({
      customerAccessToken: accessToken,
    });
    
    if (result.errors?.length) {
      console.error('Error associating customer with cart:', result.errors);
      return { 
        success: false, 
        error: result.errors[0]?.message || 'Error associating customer with cart' 
      };
    }
    
    return { success: true, cart: result.cart };
  } catch (error) {
    console.error('Error in associateCustomerWithCart:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    };
  }
}
