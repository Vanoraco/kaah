import {useState, useEffect, useRef} from 'react';
import {Form, useNavigate, useNavigation} from '@remix-run/react';

/**
 * A reliable Add to Cart button component that uses standard HTML forms
 * @param {{
 *   merchandiseId: string;
 *   quantity?: number;
 *   className?: string;
 *   disabled?: boolean;
 *   redirectToCart?: boolean;
 *   showSuccessMessage?: boolean;
 * }}
 */
export function ReliableAddToCartButton({
  merchandiseId,
  quantity = 1,
  className = '',
  disabled = false,
  redirectToCart = false,
  showSuccessMessage = true
}) {
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const navigation = useNavigation();

  // Check if we're in the process of submitting the form
  const isAdding = navigation.state === 'submitting' &&
                  navigation.formData?.get('merchandiseId') === merchandiseId;

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
    };
  }, []);

  // Show success message when form submission completes
  useEffect(() => {
    if (navigation.state === 'idle' && isAdding) {
      // Form submission completed
      if (showSuccessMessage) {
        setAddedToCart(true);

        // Hide success message after 3 seconds
        timeoutRef.current = setTimeout(() => {
          if (isMounted.current) {
            setAddedToCart(false);
          }
        }, 3000);
      }

      // If redirectToCart is true, the redirect will happen automatically via the form
    }
  }, [navigation.state, isAdding, showSuccessMessage, redirectToCart]);

  // Handle form submission
  const handleSubmit = (event) => {
    // Don't prevent default - we want the form to submit normally
    console.log('Add to cart form submitted');
    console.log('MerchandiseId:', merchandiseId);
    console.log('Quantity:', quantity);

    // Validate merchandiseId format
    if (!merchandiseId.startsWith('gid://shopify/ProductVariant/')) {
      console.warn('MerchandiseId may not be in the correct format:', merchandiseId);
      console.log('This might cause issues with the cart. The correct format should be: gid://shopify/ProductVariant/{id}');
    }

    // Reset any previous errors
    setError(null);
  };

  return (
    <div className="add-to-cart-wrapper">
      {showSuccessMessage && addedToCart && (
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
            onClick={() => setError(null)}
            className="retry-button"
          >
            <i className="fas fa-redo-alt"></i>
            Retry
          </button>
        </div>
      )}

      <Form method="post" action="/cart" onSubmit={handleSubmit}>
        <input
          type="hidden"
          name="cartAction"
          value="LinesAdd"
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
        {redirectToCart && (
          <input
            type="hidden"
            name="redirectAfterAdd"
            value="/cart"
          />
        )}

        <button
          type="submit"
          disabled={isAdding || disabled}
          className={`add-to-cart-button ${className}`}
          aria-label="Add to cart"
        >
          <span className="add-to-cart-text">
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </span>
          <i className="fas fa-shopping-cart"></i>
        </button>
      </Form>
    </div>
  );
}
