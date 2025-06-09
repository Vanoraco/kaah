import { useFetcher, useRouteLoaderData } from '@remix-run/react';
import { useEffect, useState, memo } from 'react';
import PropTypes from 'prop-types';
import { ICONS } from './utils/dataUtils';
import {useOnlineSalesStatus, getDisabledButtonProps} from '~/lib/onlineSalesControl';

/**
 * Add to Cart Button Component for MegaSaver items
 * 
 * @param {Object} props - Component props
 * @param {Object} props.item - The item to add to cart
 * @param {number} [props.quantity=1] - The quantity to add
 * @returns {JSX.Element} The rendered component
 */
function AddToCartButton({ item, quantity = 1 }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const fetcher = useFetcher();

  // Get root data for online sales status
  const rootData = useRouteLoaderData('root');
  const isOnlineSalesEnabled = useOnlineSalesStatus(rootData);

  // Handle special offers (e.g., "BUY 2 FOR")
  const specialQuantity = item.quantity || quantity;

  // Check if item is in stock
  const isInStock = item.availableForSale !== false;
  const stockLevel = item.quantityAvailable;
  const hasLimitedStock = stockLevel !== null && stockLevel <= 10 && stockLevel > 0;

  // Reset the "Added" state after a delay
  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => {
        setIsAdded(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAdded]);

  // Track the fetcher state
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setIsAdding(true);
    } else if (fetcher.state === 'idle' && isAdding) {
      setIsAdding(false);
      setIsAdded(true);
      setAddedCount(prev => prev + specialQuantity);
    }
  }, [fetcher.state, isAdding, specialQuantity]);

  // Get disabled button props based on online sales status and stock
  const disabledProps = getDisabledButtonProps(isOnlineSalesEnabled, isInStock);

  // Handle the add to cart action
  const handleAddToCart = () => {
    if (!item.variantId || isAdding || !isInStock || !isOnlineSalesEnabled) return;

    // Create a FormData object for more reliable form submission
    const formData = new FormData();

    // Add all fields with explicit string values
    formData.append('action', 'add-to-cart');
    formData.append('merchandiseId', item.variantId);
    formData.append('quantity', specialQuantity.toString());
    formData.append('price', (item.price || '0.00').toString());
    formData.append('originalPrice', (item.originalPrice || '0.00').toString());
    formData.append('productTitle', (item.title || '').toString());
    formData.append('specialQuantity', (item.quantity || 1).toString());
    formData.append('from_mega_saver', 'true'); // Explicitly mark as from mega saver

    // Submit the form with the FormData object
    fetcher.submit(
      formData,
      { method: 'post', action: '/cart' }
    );
  };

  return (
    <div className="mega-saver-add-to-cart-container">
      {/* Stock indicator */}
      {hasLimitedStock && (
        <div className="mega-saver-stock-indicator">
          Only {stockLevel} left
        </div>
      )}

      {/* Quantity indicator for special offers */}
      {specialQuantity > 1 && (
        <div className="mega-saver-quantity-badge">
          {specialQuantity}x
        </div>
      )}

      <button
        className={`mega-saver-add-to-cart ${isInStock ? '' : 'out-of-stock'} ${disabledProps.className}`}
        onClick={handleAddToCart}
        disabled={isAdding || !item.variantId || !isInStock || disabledProps.disabled}
        title={disabledProps.title || (isInStock ? '' : 'Out of stock')}
        style={{
          backgroundColor: isAdded ? '#4caf50' :
                          (!isInStock || disabledProps.disabled) ? '#999999' : '#0066cc',
          opacity: !item.variantId || !isInStock || disabledProps.disabled ? 0.7 : 1
        }}
      >
        {isAdding ? (
          <div className="mega-saver-button-content">
            <div className="mega-saver-loading-spinner"></div>
            <span>Adding...</span>
          </div>
        ) : isAdded ? (
          <div className="mega-saver-button-content">
            <span>{ICONS.CART} Added to Cart!</span>
            {addedCount > 0 && (
              <span className="mega-saver-added-count">{addedCount} in cart</span>
            )}
          </div>
        ) : !isInStock ? (
          <span>Out of Stock</span>
        ) : disabledProps.disabled ? (
          <span>{disabledProps.text}</span>
        ) : (
          <div className="mega-saver-button-content">
            {item.specialText ? (
              <>
                <div className="mega-saver-special-offer-label">
                  <span className="mega-saver-offer-icon">{ICONS.SPECIAL}</span>
                  <span>Special Offer</span>
                </div>
                <span className="mega-saver-add-text">Add to Cart</span>
              </>
            ) : (
              <span>{ICONS.CART} Add to Cart</span>
            )}
            {specialQuantity > 1 && (
              <span className="mega-saver-quantity-text">Qty: {specialQuantity}</span>
            )}
          </div>
        )}
      </button>
    </div>
  );
}

AddToCartButton.propTypes = {
  item: PropTypes.shape({
    variantId: PropTypes.string,
    price: PropTypes.string,
    originalPrice: PropTypes.string,
    title: PropTypes.string,
    quantity: PropTypes.number,
    availableForSale: PropTypes.bool,
    quantityAvailable: PropTypes.number,
    specialText: PropTypes.string
  }).isRequired,
  quantity: PropTypes.number
};

export default memo(AddToCartButton);
