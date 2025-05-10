import {CartForm, Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * @param {{
 *   layout: CartLayout;
 *   line: CartLine;
 * }}
 */
export function CartLineItem({layout, line}) {
  if (!line || !line.merchandise) return null;

  const {id, merchandise, attributes} = line;
  const {product, title, image, selectedOptions} = merchandise;

  // Safely extract quantityAvailable with fallback
  const quantityAvailable = merchandise.quantityAvailable !== undefined ?
    merchandise.quantityAvailable :
    Number.MAX_SAFE_INTEGER; // If quantityAvailable is undefined, assume large inventory

  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  // Check inventory status - only if quantityAvailable is defined
  const isLowStock = quantityAvailable !== Number.MAX_SAFE_INTEGER && quantityAvailable > 0 && quantityAvailable <= 5;
  const isOutOfStock = quantityAvailable !== Number.MAX_SAFE_INTEGER && quantityAvailable === 0;
  const isAtMaxInventory = quantityAvailable !== Number.MAX_SAFE_INTEGER && line.quantity >= quantityAvailable;

  // Check if this product is from a hamper or mega saver
  // Convert attribute values to strings and compare to handle different data types
  const fromHamperAttr = attributes?.find(attr => attr.key === '_internal_from_hamper');
  const fromMegaSaverAttr = attributes?.find(attr => attr.key === 'from_mega_saver');
  const useMetafieldsAttr = attributes?.find(attr => attr.key === 'use_metafields');
  const isHamperVariantAttr = attributes?.find(attr => attr.key === '_internal_is_hamper_variant');

  const isFromHamper = fromHamperAttr && String(fromHamperAttr.value).toLowerCase() === 'true';
  const isFromMegaSaver = fromMegaSaverAttr && String(fromMegaSaverAttr.value).toLowerCase() === 'true';
  const usesMetafields = useMetafieldsAttr && String(useMetafieldsAttr.value).toLowerCase() === 'true';
  const isHamperVariant = isHamperVariantAttr && String(isHamperVariantAttr.value).toLowerCase() === 'true';


  // Get hamper-specific attributes
  const hamperName = attributes?.find(attr => attr.key === '_internal_hamper_name')?.value;
  const hamperPrice = attributes?.find(attr => attr.key === '_internal_hamper_price')?.value;

  // Get mega saver-specific attributes
  const megaSaverPrice = attributes?.find(attr => attr.key === 'mega_saver_price')?.value;
  const productTitle = attributes?.find(attr => attr.key === 'product_title')?.value;
  const specialQuantity = attributes?.find(attr => attr.key === 'special_quantity')?.value;

  // Get common attributes
  const originalPrice = attributes?.find(attr => attr.key === '_internal_original_price')?.value;

  // Create a custom price object for special items
  // For hamper products, we're now using the variant price directly, so no need to override
  const customPrice = (isFromMegaSaver && megaSaverPrice) ? {
    amount: megaSaverPrice,
    currencyCode: line?.cost?.totalAmount?.currencyCode || 'ZAR'
  } : null;

  // Create a custom original price object for comparison
  const customOriginalPrice = (isFromHamper || isFromMegaSaver) && originalPrice ? {
    amount: originalPrice,
    currencyCode: line?.cost?.totalAmount?.currencyCode || 'ZAR'
  } : null;

  return (
    <li key={id} className={`cart-line ${isFromHamper ? 'hamper-item' : ''} ${isFromMegaSaver ? 'mega-saver-item' : ''}`} data-from-hamper={isFromHamper} data-from-mega-saver={isFromMegaSaver}>
      {/* Show inventory limit message at the top right of the cart line */}
      {isAtMaxInventory && quantityAvailable > 0 && (
        <div className="inventory-limit-message">
          Max available: {quantityAvailable}
        </div>
      )}

      {image && (
        <Image
          alt={title}
          aspectRatio="1/1"
          data={image}
          height={100}
          loading="lazy"
          width={100}
        />
      )}

      <div className="cart-line-content">
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => {
            if (layout === 'aside') {
              close();
            }
          }}
          className="cart-line-title"
        >
          {product.title}
        </Link>

        {isFromHamper && hamperName && (
          <div className="hamper-badge">
            <i className="fas fa-gift"></i> {hamperName}
            {isHamperVariant && (
              <span className="hamper-variant-badge" title="Special price">
                <i className="fas fa-tag"></i>
              </span>
            )}
          </div>
        )}

        {isFromMegaSaver && (
          <div className="mega-saver-badge">
            <i className="fas fa-bolt"></i> MEGA SAVER
            {specialQuantity && specialQuantity !== '1' && (
              <span className="mega-saver-quantity-info"> (Qty: {specialQuantity})</span>
            )}
          </div>
        )}



        {isLowStock && (
          <div className="inventory-status low-stock">
            <i className="fas fa-exclamation-circle"></i> Low stock
          </div>
        )}

        {isOutOfStock && (
          <div className="inventory-status out-of-stock">
            <i className="fas fa-times-circle"></i> Out of stock
          </div>
        )}

        <div className="cart-line-price">
          {isFromMegaSaver && customPrice ? (
            <>
              <ProductPrice price={customPrice} />
            </>
          ) : (
            <ProductPrice price={line?.cost?.totalAmount} />
          )}
        </div>

        <div className="cart-line-options">
          {selectedOptions.map((option) => (
            <div key={option.name} className="cart-line-option">
              {option.name}: {option.value}
            </div>
          ))}
        </div>

        <CartLineQuantity line={line} />
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 * @param {{line: CartLine}}
 */
function CartLineQuantity({line}) {
  if (!line || typeof line?.quantity === 'undefined' || !line.merchandise) return null;

  const {id: lineId, quantity, isOptimistic, merchandise, attributes} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  // Check if the product is available for sale
  const isAvailableForSale = merchandise?.availableForSale !== false;

  // Safely extract quantityAvailable with fallback
  const quantityAvailable = merchandise.quantityAvailable !== undefined ?
    merchandise.quantityAvailable :
    Number.MAX_SAFE_INTEGER; // If quantityAvailable is undefined, assume large inventory

  // Check if we've reached the maximum inventory - only if quantityAvailable is defined
  const isAtMaxInventory = quantityAvailable !== Number.MAX_SAFE_INTEGER && quantity >= quantityAvailable;

  // Check if this product is from a hamper or mega saver
  // Convert attribute values to strings and compare to handle different data types
  const fromHamperAttr = attributes?.find(attr => attr.key === '_internal_from_hamper');
  const fromMegaSaverAttr = attributes?.find(attr => attr.key === 'from_mega_saver');

  const isFromHamper = fromHamperAttr && String(fromHamperAttr.value).toLowerCase() === 'true';
  const isFromMegaSaver = fromMegaSaverAttr && String(fromMegaSaverAttr.value).toLowerCase() === 'true';



  // Get mega saver-specific attributes
  const megaSaverPrice = attributes?.find(attr => attr.key === 'mega_saver_price')?.value;
  const productTitle = attributes?.find(attr => attr.key === 'product_title')?.value;
  const specialQuantity = attributes?.find(attr => attr.key === 'special_quantity')?.value;
  const originalPrice = attributes?.find(attr => attr.key === '_internal_original_price')?.value;

  // Disable quantity adjustments for hamper and mega saver products
  const isSpecialProduct = isFromHamper || isFromMegaSaver;





  // Add a visual indicator for optimistic updates
  const quantityClass = isOptimistic
    ? 'quantity-input updating'
    : isSpecialProduct
      ? 'quantity-input fixed-quantity'
      : 'quantity-input';

  return (
    <div className="cart-line-quantity">
      {/* No debug info for special products */}

      <div className={`cart-line-quantity-adjust ${isSpecialProduct ? 'special-product' : ''}`}>
        {isSpecialProduct ? (
          <button
            className="quantity-button disabled"
            aria-label="Decrease quantity"
            disabled={true}
            title="Quantity cannot be changed for this product"
          >
            <i className="fas fa-minus"></i>
          </button>
        ) : (
          <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
            <button
              className="quantity-button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1 || !!isOptimistic}
              name="decrease-quantity"
              value={prevQuantity}
            >
              <i className="fas fa-minus"></i>
            </button>
          </CartLineUpdateButton>
        )}

        <span className={quantityClass}>
          {quantity}
          {isOptimistic && <span className="updating-indicator"></span>}
          {isSpecialProduct && (
            <span className="fixed-indicator" title="Fixed quantity"></span>
          )}
        </span>

        {isSpecialProduct ? (
          <button
            className="quantity-button disabled"
            aria-label="Increase quantity"
            disabled={true}
            title="Quantity cannot be changed for this product"
          >
            <i className="fas fa-plus"></i>
          </button>
        ) : (
          <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
            <button
              className="quantity-button"
              aria-label="Increase quantity"
              name="increase-quantity"
              value={nextQuantity}
              disabled={!!isOptimistic || !isAvailableForSale || isAtMaxInventory}
              title={isAtMaxInventory ? `Maximum available: ${quantityAvailable}` : ""}
            >
              <i className="fas fa-plus"></i>
            </button>
          </CartLineUpdateButton>
        )}
      </div>

      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 * @param {{
 *   lineIds: string[];
 *   disabled: boolean;
 * }}
 */
function CartLineRemoveButton({lineIds, disabled}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className="remove-button"
      >
        <i className="fas fa-trash-alt"></i>
        Remove
      </button>
    </CartForm>
  );
}

/**
 * @param {{
 *   children: React.ReactNode;
 *   lines: CartLineUpdateInput[];
 * }}
 */
function CartLineUpdateButton({children, lines}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
      fetcherKey={`update-${lines[0]?.id}-${lines[0]?.quantity}`}
    >
      {children}
    </CartForm>
  );
}

/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */

/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
