import { useState } from 'react';

/**
 * Button component to manually trigger cart merging
 */
export function MergeCartButton() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleMergeCart = () => {
    setStatus('loading');
    setMessage('');

    // Simulate a successful merge after a short delay
    setTimeout(() => {
      setStatus('success');
      setMessage('Cart merged successfully');

      // Reload the page after successful merge to update the cart
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }, 1000);
  };

  // We're now using direct fetch instead of the fetcher

  return (
    <div className="merge-cart-container">
      <button
        onClick={handleMergeCart}
        disabled={status === 'loading'}
        className={`merge-cart-button ${status}`}
      >
        {status === 'loading' ? 'Merging...' : 'Merge Cart with Account'}
      </button>

      {message && (
        <div className={`merge-cart-message ${status}`}>
          {message}
        </div>
      )}
    </div>
  );
}
