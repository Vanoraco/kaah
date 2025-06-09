import {CartForm} from '@shopify/hydrogen';
import {useState, useEffect, useRef} from 'react';
import {useNavigate, useRouteLoaderData} from '@remix-run/react';
import {useOnlineSalesStatus, getDisabledButtonProps} from '~/lib/onlineSalesControl';

/**
 * @param {{
 *   analytics?: unknown;
 *   children: React.ReactNode;
 *   disabled?: boolean;
 *   lines: Array<OptimisticCartLineInput>;
 *   onClick?: () => void;
 *   className?: string;
 * }}
 */
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className,
}) {
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // Get root data for online sales status
  const rootData = useRouteLoaderData('root');
  const isOnlineSalesEnabled = useOnlineSalesStatus(rootData);

  // Get disabled button props based on online sales status
  const disabledProps = getDisabledButtonProps(isOnlineSalesEnabled, true);

  // Combine disabled states
  const isDisabled = disabled || disabledProps.disabled;

  // Reference to track if component is mounted
  const isMounted = useRef(true);
  // Reference to track timeout IDs for cleanup
  const timeoutRef = useRef(null);

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

  // Safety timeout to reset loading state if no response
  useEffect(() => {
    if (isAdding) {
      // Set a timeout to reset the loading state if no response is received
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current && isAdding) {
          
          setIsAdding(false);
          setError('Request timed out. Please try again.');
        }
      }, 15000); // 15 second timeout

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isAdding]);

  const handleAddToCart = (e) => {
    // Don't proceed if online sales are disabled
    if (!isOnlineSalesEnabled) {
      e.preventDefault();
      return;
    }

    // Reset any previous errors and states
    setError(null);
    setAddedToCart(false);

    // Set loading state
    setIsAdding(true);

    // Increment retry count to ensure unique submissions
    setRetryCount(prev => prev + 1);

    // Call the onClick handler if provided
    if (onClick) onClick(e);
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
            onClick={() => {
              setError(null);
              setIsAdding(true);
              setRetryCount(prev => prev + 1);
            }}
            className="retry-button"
          >
            <i className="fas fa-redo-alt"></i>
            Retry
          </button>
        </div>
      )}

      <CartForm
        route="/cart"
        inputs={{lines}}
        action={CartForm.ACTIONS.LinesAdd}
        onSubmit={(e) => {
          
        }}
        onSuccess={(data) => {
          
          if (isMounted.current) {
            setIsAdding(false);
            setAddedToCart(true);

            // Hide success message after 3 seconds
            timeoutRef.current = setTimeout(() => {
              if (isMounted.current) {
                setAddedToCart(false);
              }
            }, 3000);
          }
        }}
        onError={(errors) => {
          console.error('Cart form errors:', errors);
          if (isMounted.current) {
            setError('Failed to add product to cart. Please try again.');
            setIsAdding(false);
          }
        }}
      >
        {(fetcher) => {
          

          // Update states based on fetcher state
          if (fetcher.state === 'loading' || fetcher.state === 'submitting') {
            if (!isAdding && isMounted.current) setIsAdding(true);
          } else if (fetcher.state === 'idle' && fetcher.data) {
            if (fetcher.data.errors && fetcher.data.errors.length > 0) {
              if (isMounted.current) {
                setError(`Error: ${fetcher.data.errors[0].message}`);
                setIsAdding(false);
              }
            } else if (fetcher.data.cart) {
              // Only set success if we haven't already
              if (isAdding && isMounted.current) {
                setIsAdding(false);
                setAddedToCart(true);

                // Hide success message after 3 seconds
                timeoutRef.current = setTimeout(() => {
                  if (isMounted.current) {
                    setAddedToCart(false);
                  }
                }, 3000);
              }
            }
          }

          return (
            <>
              <input
                name="analytics"
                type="hidden"
                value={JSON.stringify(analytics)}
              />
              <input
                name="retryCount"
                type="hidden"
                value={retryCount}
              />
              <button
                type="submit"
                onClick={handleAddToCart}
                disabled={isDisabled ?? isAdding ?? fetcher.state !== 'idle'}
                className={`${className || 'add-to-cart-button'} ${disabledProps.className}`}
                title={disabledProps.title}
                aria-label={disabledProps.disabled ? disabledProps.title : "Add to cart"}
              >
                {isAdding ? 'Adding...' : (disabledProps.text || children)}
              </button>
            </>
          );
        }}
      </CartForm>
    </div>
  );
}

/** @typedef {import('@remix-run/react').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
