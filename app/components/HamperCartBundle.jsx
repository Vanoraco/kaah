import {useState} from 'react';
import {CartForm, Image} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';

/**
 * A component that displays a hamper as a bundle in the cart
 * @param {{
 *   layout: CartLayout;
 *   lines: CartLine[];
 *   hamperName: string;
 * }}
 */
export function HamperCartBundle({layout, lines, hamperName}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {close} = useAside();

  if (!lines || !lines.length) return null;

  // Get the first line to use for the main display
  const firstLine = lines[0];
  const {merchandise} = firstLine;
  const {product} = merchandise;

  // Try to get the hamper image URL from attributes
  const hamperImageAttr = lines.find(line =>
    line.attributes?.find(attr => attr.key === '_internal_hamper_image_url')
  )?.attributes?.find(attr => attr.key === '_internal_hamper_image_url')?.value;

  // Create an image object from the hamper image URL or use the first product's image
  const image = hamperImageAttr
    ? {
        url: hamperImageAttr,
        altText: hamperName || "Hamper Bundle",
        width: 500,
        height: 500
      }
    : merchandise.image;

  // Calculate total price of all items in the hamper
  const totalPrice = {
    amount: lines.reduce((sum, line) => {
      const hamperPrice = line.attributes?.find(attr => attr.key === '_internal_hamper_price')?.value;
      if (hamperPrice) {
        return sum + (parseFloat(hamperPrice) * line.quantity);
      }
      return sum + parseFloat(line.cost?.totalAmount?.amount || 0);
    }, 0).toFixed(2),
    currencyCode: lines[0]?.cost?.totalAmount?.currencyCode || 'ZAR'
  };

  // Calculate original total price for comparison
  const originalTotalPrice = {
    amount: lines.reduce((sum, line) => {
      const originalPrice = line.attributes?.find(attr => attr.key === '_internal_original_price')?.value;
      if (originalPrice) {
        return sum + (parseFloat(originalPrice) * line.quantity);
      }
      return sum + parseFloat(line.cost?.totalAmount?.amount || 0);
    }, 0).toFixed(2),
    currencyCode: lines[0]?.cost?.totalAmount?.currencyCode || 'ZAR'
  };

  // Calculate savings percentage
  const savingsPercentage = originalTotalPrice.amount > 0 ?
    Math.round((1 - (parseFloat(totalPrice.amount) / parseFloat(originalTotalPrice.amount))) * 100) : 0;

  // Get all line IDs for removal
  const allLineIds = lines.map(line => line.id);

  return (
    <li className="cart-line hamper-bundle">
      <div className="hamper-bundle-main">
        {image && (
          <Image
            alt={hamperName || "Hamper Bundle"}
            aspectRatio="1/1"
            data={image}
            height={100}
            loading="lazy"
            width={100}
          />
        )}

        <div className="hamper-bundle-content">
          <div className="hamper-bundle-header">
            <div className="hamper-bundle-title-section">
              <h3 className="hamper-bundle-title">
                <i className="fas fa-gift"></i> {hamperName || "Hamper Bundle"}
              </h3>
              <div className="hamper-bundle-count">
                {lines.length} {lines.length === 1 ? 'item' : 'items'}
              </div>
            </div>

            <div className="hamper-bundle-price">
              <ProductPrice price={totalPrice} />
            </div>
          </div>

          <button
            className="hamper-bundle-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="hamper-items-list"
          >
            {isExpanded ? 'Hide items' : 'Show items'}
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
          </button>

          <div className="hamper-bundle-actions">
            <CartLineRemoveButton lineIds={allLineIds} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="hamper-bundle-items" id="hamper-items-list">
          <ul>
            {lines.map((line) => (
              <li key={line.id} className="hamper-bundle-item">
                <div className="hamper-item-image">
                  {line.merchandise.image && (
                    <Image
                      alt={line.merchandise.product.title}
                      aspectRatio="1/1"
                      data={line.merchandise.image}
                      height={50}
                      loading="lazy"
                      width={50}
                    />
                  )}
                </div>
                <div className="hamper-item-details">
                  <Link
                    prefetch="intent"
                    to={`/products/${line.merchandise.product.handle}`}
                    onClick={() => {
                      if (layout === 'aside') {
                        close();
                      }
                    }}
                    className="hamper-item-title"
                  >
                    {line.merchandise.product.title}
                  </Link>
                  {/* Price display removed for individual hamper items */}
                </div>
                <div className="hamper-item-quantity">
                  Qty: {line.quantity}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

/**
 * A button that removes all hamper items from the cart.
 * @param {{
 *   lineIds: string[];
 * }}
 */
function CartLineRemoveButton({lineIds}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        type="submit"
        className="remove-button"
      >
        <i className="fas fa-trash-alt"></i>
        Remove Hamper
      </button>
    </CartForm>
  );
}

/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */
