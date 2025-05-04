import {CartForm} from '@shopify/hydrogen';
import {useState} from 'react';

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

  const handleAddToCart = (e) => {
    if (onClick) onClick(e);

    // Show success message
    setAddedToCart(true);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  return (
    <div className="add-to-cart-wrapper">
      {addedToCart && (
        <div className="add-to-cart-success">
          <i className="fas fa-check-circle"></i>
          Product added to cart!
        </div>
      )}

      <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
        {(fetcher) => (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <button
              type="submit"
              onClick={handleAddToCart}
              disabled={disabled ?? fetcher.state !== 'idle'}
              className={className}
            >
              {children}
            </button>
          </>
        )}
      </CartForm>
    </div>
  );
}

/** @typedef {import('@remix-run/react').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
