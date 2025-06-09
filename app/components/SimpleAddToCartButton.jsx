import {CartForm} from '@shopify/hydrogen';
import {useState, useEffect, useRef} from 'react';
import {useNavigate, Form, useFetcher, useRouteLoaderData} from '@remix-run/react';
import {useOnlineSalesStatus, getDisabledButtonProps} from '~/lib/onlineSalesControl';

/**
 * A simplified version of the AddToCartButton component
 * @param {{
 *   merchandiseId: string;
 *   quantity?: number;
 * }}
 */
export function SimpleAddToCartButton({merchandiseId, quantity = 1}) {
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Get root data for online sales status
  const rootData = useRouteLoaderData('root');
  const isOnlineSalesEnabled = useOnlineSalesStatus(rootData);

  // Get disabled button props based on online sales status
  const disabledProps = getDisabledButtonProps(isOnlineSalesEnabled, true);

  // Reference to track if component is mounted
  const isMounted = useRef(true);
  // Reference to track timeout IDs for cleanup
  const timeoutRef = useRef(null);
  // Reference to track the form element
  const formRef = useRef(null);

  // Set up and clean up
  useEffect(() => {
    isMounted.current = true;

    return () => {
      // Clean up when component unmounts
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setAddedToCart(false);
      setIsAdding(false);
      setError(null);
    };
  }, []);

  // Monitor fetcher state
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setIsAdding(true);
      setError(null);
    } else if (fetcher.state === 'idle' && fetcher.data) {
      setIsAdding(false);

      // Check for errors in the response
      if (fetcher.data.errors && fetcher.data.errors.length > 0) {
        setError(`Error: ${fetcher.data.errors[0].message}`);
      } else if (fetcher.data.error) {
        setError(`Error: ${fetcher.data.error}`);
      } else if (fetcher.data.cart) {
        // Success!
        setAddedToCart(true);

        // Hide success message after 3 seconds
        timeoutRef.current = setTimeout(() => {
          if (isMounted.current) {
            setAddedToCart(false);
          }
        }, 3000);
      }
    }
  }, [fetcher.state, fetcher.data]);

  // Safety timeout to reset loading state if no response
  useEffect(() => {
    if (isAdding) {
      // Set a timeout to reset the loading state if no response is received
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current && isAdding) {
          console.log('Timeout: No response received, resetting loading state');
          setIsAdding(false);
          setError('Request timed out. Please try again.');
        }
      }, 15000); // 15 second timeout (increased from 10)

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isAdding]);

  const handleAddToCart = (e) => {
    // Prevent default to use our fetcher instead
    e.preventDefault();

    // Don't proceed if online sales are disabled
    if (!isOnlineSalesEnabled) {
      return;
    }

    console.log('Add to cart button clicked');
    console.log('MerchandiseId:', merchandiseId);
    console.log('Quantity:', quantity);

    // Reset any previous errors and states
    setError(null);
    setAddedToCart(false);
    setIsAdding(true);

    // Use fetcher to submit the form
    if (formRef.current) {
      // Use fetcher to submit the form data
      const formData = new FormData(formRef.current);
      fetcher.submit(formData, { method: 'post', action: '/cart' });

      // Increment retry count
      setRetryCount(prev => prev + 1);
    }
  };

  // Function to handle manual retry
  const handleRetry = () => {
    setError(null);
    setIsAdding(true);

    // Use fetcher to submit the form data
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      fetcher.submit(formData, { method: 'post', action: '/cart' });

      // Increment retry count
      setRetryCount(prev => prev + 1);
    }
  };

  return (
    <div className="add-to-cart-wrapper">
      {addedToCart && (
        <div className="add-to-cart-success">
          <i className="fas fa-check-circle"></i>
          Product added to cart!
          <button
            className="view-cart-button"
            onClick={() => navigate('/cart')}
          >
            View Cart
          </button>
        </div>
      )}

      {error && (
        <div className="add-to-cart-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <button
            onClick={handleRetry}
            className="retry-button"
          >
            <i className="fas fa-redo-alt"></i>
            Retry
          </button>
        </div>
      )}

      {/* Use fetcher form for better control */}
      <Form ref={formRef} method="post" action="/cart" onSubmit={handleAddToCart}>
        <input
          type="hidden"
          name="cartAction"
          value={CartForm.ACTIONS.LinesAdd}
        />
        <input
          type="hidden"
          name="merchandiseId"
          value={merchandiseId}
        />
        <input
          type="hidden"
          name="quantity"
          value={quantity}
        />
        {/* Add a retry count to ensure unique submissions */}
        <input
          type="hidden"
          name="retryCount"
          value={retryCount}
        />

        <button
          type="submit"
          disabled={isAdding || disabledProps.disabled}
          className={`add-to-cart-button ${disabledProps.className}`}
          aria-label={disabledProps.disabled ? disabledProps.title : "Add to cart"}
          title={disabledProps.title}
        >
          <span className="add-to-cart-text">
            {isAdding ? 'Adding...' : (disabledProps.text || 'Add to Cart')}
          </span>
          <i className="fas fa-shopping-cart"></i>
        </button>
      </Form>
    </div>
  );
}
