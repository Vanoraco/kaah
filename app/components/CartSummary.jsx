import {CartForm, Money} from '@shopify/hydrogen';
import {useRef, useMemo} from 'react';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  // Ensure cart is not null or undefined
  const safeCart = cart || {
    cost: { subtotalAmount: { amount: '0', currencyCode: 'ZAR' } },
    discountCodes: [],
    appliedGiftCards: [],
    checkoutUrl: '#',
    totalQuantity: 0,
    lines: { nodes: [] }
  };

  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  // Calculate total quantity
  const totalQuantity = safeCart.totalQuantity || 0;

  // Calculate custom subtotal that uses hamper_price and mega_saver_price for special items
  const customSubtotal = useMemo(() => {
    // If no lines, return default subtotal
    if (!safeCart.lines?.nodes || safeCart.lines.nodes.length === 0) {
      return safeCart.cost?.subtotalAmount;
    }

    // Calculate custom subtotal
    let subtotalAmount = 0;
    const currencyCode = safeCart.cost?.subtotalAmount?.currencyCode || 'ZAR';

    // Process each line item
    safeCart.lines.nodes.forEach(line => {
      if (!line || !line.merchandise) return;

      const {attributes, quantity} = line;

      // Check if this is a hamper or mega saver item
      const fromHamperAttr = attributes?.find(attr => attr.key === '_internal_from_hamper');
      const fromMegaSaverAttr = attributes?.find(attr => attr.key === 'from_mega_saver');

      const isFromHamper = fromHamperAttr && String(fromHamperAttr.value).toLowerCase() === 'true';
      const isFromMegaSaver = fromMegaSaverAttr && String(fromMegaSaverAttr.value).toLowerCase() === 'true';

      // Get special prices
      const hamperPrice = attributes?.find(attr => attr.key === '_internal_hamper_price')?.value;
      const megaSaverPrice = attributes?.find(attr => attr.key === 'mega_saver_price')?.value;

      // Calculate line total based on item type
      let lineTotal = 0;

      if (isFromHamper && hamperPrice) {
        // Use hamper price for hamper items
        lineTotal = parseFloat(hamperPrice) * quantity;
      } else if (isFromMegaSaver && megaSaverPrice) {
        // Use mega saver price for mega saver items
        lineTotal = parseFloat(megaSaverPrice) * quantity;
      } else {
        // Use regular price for normal items
        lineTotal = parseFloat(line.cost?.totalAmount?.amount || 0);
      }

      subtotalAmount += lineTotal;
    });

    return {
      amount: subtotalAmount.toFixed(2),
      currencyCode
    };
  }, [safeCart.lines?.nodes, safeCart.cost?.subtotalAmount]);

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <h4>Cart Summary</h4>
      <dl className="cart-subtotal">
        <dt>Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})</dt>
        <dd>
          {customSubtotal?.amount ? (
            <Money data={customSubtotal} />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      <CartDiscounts discountCodes={safeCart.discountCodes} />
      <CartGiftCard giftCardCodes={safeCart.appliedGiftCards} />
      <CartCheckoutActions
        checkoutUrl={safeCart.checkoutUrl}
        customSubtotal={customSubtotal}
      />
    </div>
  );
}
/**
 * @param {{
 *   checkoutUrl?: string;
 *   customSubtotal?: {amount: string, currencyCode: string};
 * }}
 */
function CartCheckoutActions({checkoutUrl, customSubtotal}) {
  if (!checkoutUrl) return null;

  // Format the custom subtotal for display
  const formattedSubtotal = customSubtotal ?
    `${customSubtotal.currencyCode} ${parseFloat(customSubtotal.amount).toFixed(2)}` : '';

  // Clean the checkout URL to remove hamper attributes
  const cleanCheckoutUrl = useMemo(() => {
    try {
      if (!checkoutUrl) return '';

      // Parse the URL
      const url = new URL(checkoutUrl);

      // Get the search params
      const params = new URLSearchParams(url.search);

      // Remove hamper-related attributes from the URL
      const attributesToRemove = [
        'hamper_id',
        'hamper_name',
        'original_price',
        'from_hamper',
        'product_title',
        'is_hamper_variant',
        'hamper_image_url',
        'hamper_price'
      ];

      // Remove each attribute
      attributesToRemove.forEach(attr => {
        if (params.has(attr)) {
          params.delete(attr);
        }
      });

      // Rebuild the URL with cleaned parameters
      url.search = params.toString();

      return url.toString();
    } catch (error) {
      console.error('Error cleaning checkout URL:', error);
      return checkoutUrl; // Return original URL if there's an error
    }
  }, [checkoutUrl]);

  // Function to handle checkout click
  const handleCheckoutClick = (event) => {
    // Store a timestamp in localStorage to detect return from checkout
    localStorage.setItem('checkout_started', Date.now().toString());

    // Continue with normal checkout flow
    return true;
  };

  return (
    <div>
      <div className="cart-total">
        <span className="cart-total-label">Total:</span>
        <span className="cart-total-value">
          {formattedSubtotal || 'Calculating...'}
        </span>
      </div>
      <a
        href={cleanCheckoutUrl || checkoutUrl}
        target="_self"
        className="cart-checkout-button"
        onClick={handleCheckoutClick}
      >
        <i className="fas fa-lock"></i>
        Proceed to Checkout
      </a>
    </div>
  );
}

/**
 * @param {{
 *   discountCodes?: CartApiQueryFragment['discountCodes'];
 * }}
 */
function CartDiscounts({discountCodes}) {
  const codes =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div>
      {/* Have existing discount, display it with a remove option */}
      <dl className="cart-discount" hidden={!codes.length}>
        <dt>Discount Applied</dt>
        <dd>
          <UpdateDiscountForm>
            <div className="discount-code">
              <code>{codes?.join(', ')}</code>
              <button className="remove-discount">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </UpdateDiscountForm>
        </dd>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="discount-form">
          <input
            type="text"
            name="discountCode"
            placeholder="Enter discount code"
            className="discount-input"
          />
          <button type="submit" className="discount-button">
            <i className="fas fa-tag"></i> Apply
          </button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

/**
 * @param {{
 *   discountCodes?: string[];
 *   children: React.ReactNode;
 * }}
 */
function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

/**
 * @param {{
 *   giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
 * }}
 */
function CartGiftCard({giftCardCodes}) {
  const appliedGiftCardCodes = useRef([]);
  const giftCardCodeInput = useRef(null);
  const codes =
    giftCardCodes?.map(({lastCharacters}) => `***${lastCharacters}`) || [];

  function saveAppliedCode(code) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
    giftCardCodeInput.current.value = '';
  }

  function removeAppliedCode() {
    appliedGiftCardCodes.current = [];
  }

  return (
    <div>
      {/* Have existing gift card applied, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Applied Gift Card(s)</dt>
          <UpdateGiftCardForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button onSubmit={() => removeAppliedCode}>Remove</button>
            </div>
          </UpdateGiftCardForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
      >
        <div>
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
          />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

/**
 * @param {{
 *   giftCardCodes?: string[];
 *   saveAppliedCode?: (code: string) => void;
 *   removeAppliedCode?: () => void;
 *   children: React.ReactNode;
 * }}
 */
function UpdateGiftCardForm({giftCardCodes, saveAppliedCode, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code);
        }
        return children;
      }}
    </CartForm>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
