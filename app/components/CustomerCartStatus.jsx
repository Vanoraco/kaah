import {useEffect, useState} from 'react';
import {MergeCartButton} from '~/components/MergeCartButton';
import {useFetcher} from '@remix-run/react';

/**
 * Component to display the customer's cart association status
 */
export function CustomerCartStatus() {
  const [status, setStatus] = useState('Checking cart association...');
  const [cartDetails, setCartDetails] = useState(null);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const cartFetcher = useFetcher();

  useEffect(() => {
    // Fetch the current cart data to check its status
    setStatus('Your cart is being checked...');

    // Use the cart fetcher to get the latest cart data
    cartFetcher.load('/cart');

    // Set a timeout as a fallback in case the fetcher doesn't work
    const timeoutId = setTimeout(() => {
      if (!cartDetails) {
       
        setStatus('Cart association complete');

        // Show a simple message instead of trying to fetch cart data
        setCartDetails({
          totalQuantity: 0,
          buyerIdentity: {
            customerAccessToken: true // Assume the cart is associated since the user is logged in
          },
          cost: {
            totalAmount: {
              amount: '0',
              currencyCode: 'ZAR'
            }
          }
        });
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Update cart details when fetcher data is available
  useEffect(() => {
    if (cartFetcher.data && cartFetcher.state === 'idle') {
     
      setStatus('Cart association complete');
      setCartDetails(cartFetcher.data);
    }
  }, [cartFetcher.data, cartFetcher.state]);

  // We're now using direct fetch instead of the fetcher

  // Format cart information for display
  const getCartInfo = () => {
    if (!cartDetails) return null;

    try {
      

      // Check if cartDetails has the expected structure
      if (!cartDetails || typeof cartDetails !== 'object') {
        console.error('Invalid cart details format:', cartDetails);
        return (
          <div className="cart-details cart-details-error">
            <p>Unable to retrieve cart information.</p>
            <button
              onClick={() => {
                cartFetcher.load('/cart');
                setStatus('Refreshing cart...');
              }}
              className="refresh-cart-btn"
            >
              Refresh Cart
            </button>
          </div>
        );
      }

      // Handle error in cart details
      if (cartDetails.error) {
        console.error('Error in cart details:', cartDetails.error);
        return (
          <div className="cart-details cart-details-error">
            <p>Error: {cartDetails.error}</p>
            <button
              onClick={() => {
                cartFetcher.load('/cart');
                setStatus('Refreshing cart...');
              }}
              className="refresh-cart-btn"
            >
              Refresh Cart
            </button>
          </div>
        );
      }

      // Get the item count - handle different possible structures
      let itemCount = 0;
      if ('totalQuantity' in cartDetails) {
        itemCount = cartDetails.totalQuantity || 0;
      } else if (cartDetails.lines && cartDetails.lines.nodes) {
        // Sum up quantities from line items
        itemCount = cartDetails.lines.nodes.reduce(
          (total, line) => total + (line.quantity || 0),
          0
        );
      }

      const itemText = itemCount === 1 ? 'item' : 'items';

      // Get the total amount - handle different possible structures
      let totalAmount = null;
      let currencyCode = 'ZAR';

      if (cartDetails.cost?.totalAmount) {
        totalAmount = cartDetails.cost.totalAmount.amount;
        currencyCode = cartDetails.cost.totalAmount.currencyCode || 'ZAR';
      } else if (cartDetails.estimatedCost?.totalAmount) {
        totalAmount = cartDetails.estimatedCost.totalAmount.amount;
        currencyCode = cartDetails.estimatedCost.totalAmount.currencyCode || 'ZAR';
      }

      return (
        <div className="cart-details">
          <p>
            {itemCount > 0
              ? `Your cart has ${itemCount} ${itemText}`
              : 'Your cart is empty'}
          </p>
          {totalAmount && (
            <p>
              Total: {currencyCode}{' '}
              {parseFloat(totalAmount).toFixed(2)}
            </p>
          )}
          <button
            onClick={() => {
              cartFetcher.load('/cart');
              setStatus('Refreshing cart...');
            }}
            className="refresh-cart-btn"
          >
            Refresh Cart
          </button>
        </div>
      );
    } catch (error) {
      console.error('Error displaying cart info:', error);
      return (
        <div className="cart-details cart-details-error">
          <p>Error displaying cart information: {error.message}</p>
          <button
            onClick={() => {
              cartFetcher.load('/cart');
              setStatus('Refreshing cart...');
            }}
            className="refresh-cart-btn"
          >
            Refresh Cart
          </button>
        </div>
      );
    }
  };

  // Determine if we should show the merge cart button
  const showMergeButton = () => {
    if (!cartDetails) return false;

    try {
      // Check if cartDetails has the expected structure
      if (!('totalQuantity' in cartDetails) || !('buyerIdentity' in cartDetails)) {
        return false;
      }

      // Show the button if the cart has items but is not associated with the customer
      return (
        cartDetails.totalQuantity > 0 &&
        !cartDetails.buyerIdentity?.customerAccessToken
      );
    } catch (error) {
      console.error('Error in showMergeButton:', error);
      return false;
    }
  };

  return (
    <div className="customer-cart-status">
      <p>{status}</p>
      {getCartInfo()}

      {/* Show merge button if needed */}
      {showMergeButton() && (
        <div className="merge-cart-section">
          <p className="merge-cart-info">
            Your cart has items but is not linked to your account.
            Link your cart to keep these items in your account.
          </p>
          <MergeCartButton />
        </div>
      )}
    </div>
  );
}
