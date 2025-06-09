import {useLoaderData} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';
import {data, json} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';
import {CartDebugger} from '~/components/CartDebugger';
import {applyCustomPriceToVariant} from '~/lib/hamperMetafields';
import {createSeoMeta} from '~/lib/seo';

/**
 * @type {MetaFunction}
 */
export const meta = ({request}) => {
  if (!request) {
    return [
      {title: `Kaah | Shopping Cart`},
      {name: 'description', content: 'Review your shopping cart and proceed to checkout at Kaah Supermarket.'}
    ];
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  return createSeoMeta({
    title: 'Shopping Cart',
    description: 'Review your shopping cart items and proceed to secure checkout at Kaah Supermarket. Fast delivery and quality products guaranteed.',
    pathname,
    searchParams: url.searchParams,
    keywords: ['shopping cart', 'checkout', 'secure payment'],
    noIndex: true // Cart pages should not be indexed
  });
};

/**
 * @type {HeadersFunction}
 */
export const headers = ({actionHeaders}) => actionHeaders;

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  const {cart} = context;

  try {
    console.log('Cart action called with method:', request.method);
    console.log('Cart action URL:', request.url);
    console.log('Content-Type:', request.headers.get('Content-Type'));

    let action, inputs;
    let formData = null; // Initialize formData at the top level

    // Check if the request is JSON
    if (request.headers.get('Content-Type')?.includes('application/json')) {
      // Handle JSON request
      console.log('Processing JSON request');
      const jsonData = await request.json();
      console.log('JSON data:', jsonData);

      // Extract action and inputs from JSON
      action = jsonData.action;
      inputs = jsonData.inputs;

      console.log('Action from JSON:', action);
      console.log('Inputs from JSON:', inputs);
    } else {
      // Handle form data request
      console.log('Processing form data request');
      formData = await request.formData(); // Use the formData variable declared at the top level
      console.log('Form data entries:', [...formData.entries()]);

      // Log all form data entries for debugging
      console.log('All form data entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

    // Try to get the action from the form data
    action = formData.get('_action') || formData.get('cartAction');
    console.log('Action from form data:', action);

    // Initialize inputs if not already set
    if (!inputs) {
      inputs = {};
    }

    // Check for direct merchandiseId and quantity fields
    const directMerchandiseId = formData.get('merchandiseId');
    const directQuantity = formData.get('quantity');
    const cartAction = formData.get('cartAction');

    if (directMerchandiseId) {
      console.log('Found direct merchandiseId in form:', directMerchandiseId);
      console.log('Found direct quantity in form:', directQuantity);
      console.log('Found cartAction in form:', cartAction);

      // Check if this is a mega saver product
      const fromMegaSaver = formData.get('from_mega_saver');

      if (fromMegaSaver === 'true') {
        //


        for (const [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }

        inputs = {
          merchandiseId: directMerchandiseId,
          quantity: parseInt(directQuantity, 10) || 1,
          from_mega_saver: 'true',
          price: formData.get('price') || '0.00',
          originalPrice: formData.get('originalPrice') || '0.00',
          productTitle: formData.get('productTitle') || '',
          specialQuantity: formData.get('specialQuantity') || '1'
        };

        // Set action to add-to-cart for mega saver products
        action = 'add-to-cart';
        console.log('Setting action to add-to-cart for mega saver product');
      } else {
        // Regular product, create lines array
        inputs = {
          lines: [
            {
              merchandiseId: directMerchandiseId,
              quantity: parseInt(directQuantity, 10) || 1
            }
          ]
        };
      }

      // If we have a merchandiseId but no action, check for cartAction or use default
      if (!action) {
        if (cartAction === 'LinesAdd') {
          action = CartForm.ACTIONS.LinesAdd;
        } else if (cartAction === 'LinesUpdate') {
          action = CartForm.ACTIONS.LinesUpdate;
        } else if (cartAction === 'LinesRemove') {
          action = CartForm.ACTIONS.LinesRemove;
        } else {
          action = CartForm.ACTIONS.LinesAdd; // Default action
        }
        console.log('Setting action to:', action);
      }
    } else {
      // Try to parse the lines data from the form
      const linesJson = formData.get('lines');
      if (linesJson) {
        try {
          console.log('Lines JSON from form:', linesJson);
          const parsedLines = JSON.parse(linesJson);
          inputs = { lines: parsedLines };
          console.log('Parsed lines:', inputs.lines);

          // If we have lines but no action, assume it's a LinesAdd action
          if (!action && inputs.lines && inputs.lines.length > 0) {
            action = CartForm.ACTIONS.LinesAdd;
            console.log('Setting default action to LinesAdd');
          }
        } catch (error) {
          console.error('Error parsing lines JSON:', error);
        }
      }
    }

    // If we still don't have inputs or action, try using CartForm.getFormInput
    if (!action || !inputs) {
      try {
        console.log('Trying CartForm.getFormInput');
        const formInput = CartForm.getFormInput(formData);
        action = formInput.action;
        inputs = formInput.inputs;
        console.log('CartForm.getFormInput result:', { action, inputs });
      } catch (error) {
        console.error('Error in CartForm.getFormInput:', error);
        // Continue with manual parsing
      }
    }

    // If still no action or inputs, try manual parsing as a last resort
    if (!action || !inputs) {
      console.log('Trying manual form parsing');
      // Check if we have lines data directly in the form
      const hasLines = Array.from(formData.keys()).some(key => key.startsWith('lines['));
      if (hasLines) {
        action = CartForm.ACTIONS.LinesAdd;
        console.log('Found lines[] format, setting action to LinesAdd');

        // Parse the lines data manually
        inputs = { lines: [] };
        let currentIndex = 0;
        let merchandiseId = formData.get(`lines[${currentIndex}][merchandiseId]`);
        let quantity = formData.get(`lines[${currentIndex}][quantity]`);

        while (merchandiseId) {
          inputs.lines.push({
            merchandiseId,
            quantity: parseInt(quantity, 10) || 1
          });

          currentIndex++;
          merchandiseId = formData.get(`lines[${currentIndex}][merchandiseId]`);
          quantity = formData.get(`lines[${currentIndex}][quantity]`);
        }

        console.log('Manually parsed lines:', inputs.lines);
      }
    }
    } // Close the else block for form data handling

    console.log('Cart action:', action);
    console.log('Cart inputs:', inputs);

    if (!action) {
      console.error('No action found in form data:', formData ? [...formData.entries()] : 'No form data available');
      return json({ error: 'No action provided' }, { status: 400 });
    }

    let status = 200;
    let result;

    switch (action) {
      case 'add-to-cart':
        console.log('Cart action: add-to-cart (from mega saver)', inputs);

        // This is a special case for mega saver products
        if (!inputs || !inputs.merchandiseId) {
          console.error('No merchandiseId provided for add-to-cart');
          return json({ error: 'No merchandiseId provided' }, { status: 400 });
        }

        // Check if we have form data and extract from_mega_saver directly
        if (formData && !inputs.from_mega_saver) {
          const formFromMegaSaver = formData.get('from_mega_saver');
          if (formFromMegaSaver) {
            console.log('Found from_mega_saver in form data:', formFromMegaSaver);
            inputs.from_mega_saver = formFromMegaSaver;
          }
        }

        // Format the merchandiseId
        let merchandiseId = inputs.merchandiseId;
        if (!merchandiseId.startsWith('gid://shopify/ProductVariant/')) {
          // Extract the ID part
          let variantId = merchandiseId;

          // If it already has a gid:// prefix but not the correct one, extract the ID
          if (merchandiseId.startsWith('gid://')) {
            const parts = merchandiseId.split('/');
            variantId = parts[parts.length - 1];
          } else if (merchandiseId.includes('/')) {
            // Extract the last part after any slashes
            const parts = merchandiseId.split('/');
            variantId = parts[parts.length - 1];
          }

          // Remove any non-numeric characters
          variantId = variantId.replace(/\D/g, '');

          // Format with the correct prefix
          merchandiseId = `gid://shopify/ProductVariant/${variantId}`;
          console.log(`Reformatted merchandiseId from ${inputs.merchandiseId} to ${merchandiseId}`);
        }

        try {
          // First, get the current cart to check if this mega saver product already exists
          const currentCart = await cart.get();
          console.log('Current cart:', currentCart);

          // Ensure we're treating this as a mega saver product
          // Convert to string and compare to handle different data types
          const fromMegaSaver = String(inputs.from_mega_saver).toLowerCase();
          const isMegaSaverProduct = fromMegaSaver === 'true';



          // Check if this mega saver product already exists in the cart
          let existingLine = null;
          if (currentCart && currentCart.lines && currentCart.lines.nodes) {
            existingLine = currentCart.lines.nodes.find(line => {
              // Check if it's a mega saver product with the same merchandiseId
              const isMegaSaver = line.attributes?.some(attr =>
                attr.key === 'from_mega_saver' && attr.value === 'true'
              );

              // Check if it has the same merchandiseId
              const hasSameMerchandiseId = line.merchandise?.id === merchandiseId;

              // Log for debugging
              if (isMegaSaver) {
                console.log('Found existing mega saver product:', {
                  lineId: line.id,
                  merchandiseId: line.merchandise?.id,
                  inputMerchandiseId: merchandiseId,
                  match: hasSameMerchandiseId
                });
              }

              return isMegaSaver && hasSameMerchandiseId;
            });
          }

          console.log('Existing line:', existingLine);

          if (existingLine) {
            // If the product already exists, update its quantity
            const newQuantity = existingLine.quantity + (parseInt(inputs.quantity, 10) || 1);
            console.log(`Updating existing mega saver product quantity from ${existingLine.quantity} to ${newQuantity}`);

            // Update the line
            result = await cart.updateLines([{
              id: existingLine.id,
              quantity: newQuantity
            }]);

            console.log('Update mega saver result:', result);
          } else {
            // If the product doesn't exist, add it as a new line
            // Create a line item with the from_mega_saver attribute
            const megaSaverLine = {
              merchandiseId,
              quantity: parseInt(inputs.quantity, 10) || 1,
              attributes: [
                // Ensure the from_mega_saver attribute is set to 'true' as a string
                { key: 'from_mega_saver', value: 'true' },
                { key: 'mega_saver_price', value: String(inputs.price || '0.00') },
                { key: 'original_price', value: String(inputs.originalPrice || '0.00') },
                { key: 'product_title', value: String(inputs.productTitle || '') },
                { key: 'special_quantity', value: String(inputs.specialQuantity || '1') }
              ]
            };

            // Verify that the attributes are properly set
            console.log('Mega saver line created with attributes:');
            megaSaverLine.attributes.forEach(attr => {
              console.log(`${attr.key}: ${attr.value} (type: ${typeof attr.value})`);
            });

            // Log the exact attributes being added
            console.log('Mega saver line attributes:', megaSaverLine.attributes.map(attr => `${attr.key}: ${attr.value}`));

            console.log('Adding new mega saver product to cart with price:', inputs.price, megaSaverLine);

            // Add the line to the cart
            result = await cart.addLines([megaSaverLine]);
            console.log('Add mega saver result:', result);

            // Check if the result has the expected attributes
            if (result && result.cart && result.cart.lines && result.cart.lines.nodes) {
              const addedLine = result.cart.lines.nodes.find(line =>
                line.merchandise?.id === merchandiseId &&
                line.attributes?.some(attr => attr.key === 'from_mega_saver' && attr.value === 'true')
              );

              if (addedLine) {
                console.log('Successfully added mega saver product with attributes:',
                  addedLine.attributes?.map(attr => `${attr.key}: ${attr.value}`)
                );
              } else {
                console.warn('Mega saver product added but attributes may be missing');
              }
            }
          }

          if (result.errors && result.errors.length > 0) {
            console.error('Cart mega saver errors:', result.errors);
          }
        } catch (addError) {
          console.error('Error handling mega saver cart operation:', addError);
          return json({
            error: 'Failed to add mega saver item to cart',
            message: addError.message,
            cart: await cart.get()
          }, { status: 500 });
        }
        break;

      case CartForm.ACTIONS.LinesAdd:
        console.log('Cart action: LinesAdd', inputs?.lines);

        // Validate inputs
        if (!inputs) {
          console.error('No inputs provided');
          return json({ error: 'No inputs provided' }, { status: 400 });
        }

        // Ensure lines is an array
        if (!inputs.lines || !Array.isArray(inputs.lines) || inputs.lines.length === 0) {
          console.error('No lines array provided in inputs:', inputs);
          return json({ error: 'No lines provided' }, { status: 400 });
        }

        console.log('Lines before validation:', JSON.stringify(inputs.lines, null, 2));

        // Ensure each line has a merchandiseId and quantity
        const validLines = inputs.lines.filter(line => {
          const isValid = line && line.merchandiseId && (line.quantity > 0 || line.quantity === 1);
          if (!isValid) {
            console.error('Invalid line item:', line);
          }
          return isValid;
        });

        console.log('Valid lines:', JSON.stringify(validLines, null, 2));

        if (validLines.length === 0) {
          console.error('No valid lines found in:', inputs.lines);
          return json({ error: 'Invalid line items' }, { status: 400 });
        }

        try {
          // Log the exact format of the lines we're adding
          console.log('Calling cart.addLines with:', JSON.stringify(validLines, null, 2));

          // Ensure merchandiseId is properly formatted
          const formattedLines = validLines.map(line => {
            // If merchandiseId doesn't start with 'gid://', add the proper prefix
            let merchandiseId = line.merchandiseId;

            // Always ensure the merchandiseId is in the correct format
            if (!merchandiseId.startsWith('gid://shopify/ProductVariant/')) {
              // Extract the ID part - it might be a full ID or just the numeric part
              let variantId = merchandiseId;

              // If it already has a gid:// prefix but not the correct one, extract the ID
              if (merchandiseId.startsWith('gid://')) {
                const parts = merchandiseId.split('/');
                variantId = parts[parts.length - 1];
              } else if (merchandiseId.includes('/')) {
                // Extract the last part after any slashes
                const parts = merchandiseId.split('/');
                variantId = parts[parts.length - 1];
              }

              // Remove any non-numeric characters if it's not already clean
              variantId = variantId.replace(/\D/g, '');

              // Format with the correct prefix
              merchandiseId = `gid://shopify/ProductVariant/${variantId}`;

              console.log(`Reformatted merchandiseId from ${line.merchandiseId} to ${merchandiseId}`);
            }

            return {
              ...line,
              merchandiseId,
              quantity: parseInt(line.quantity, 10)
            };
          });

          console.log('Formatted lines:', JSON.stringify(formattedLines, null, 2));

          // Check if this is a hamper product with metafields
          const useMetafields = formData?.get('useMetafields') === 'true';
          const hamperName = formData?.get('hamperName');
          const hamperId = formData?.get('hamperId');
          const hamperPrice = parseFloat(formData?.get('hamperPrice') || '0');
          const isSingleProduct = formData?.get('singleProduct') === 'true';

          console.log('Hamper metafields information:', {
            useMetafields,
            hamperName,
            hamperId,
            hamperPrice,
            isSingleProduct
          });

          // If using metafields, apply custom prices to variants before adding to cart
          if (useMetafields) {
            console.log('Using metafields for hamper pricing');

            // Process each line to apply custom pricing via metafields
            for (const line of formattedLines) {
              const hamperPrice = line.attributes?.find(attr => attr.key === 'hamper_price')?.value;

              if (hamperPrice) {
                console.log(`Applying custom price ${hamperPrice} to variant ${line.merchandiseId}`);

                try {
                  // Apply custom price to variant using metafields
                  await applyCustomPriceToVariant(context, line.merchandiseId, parseFloat(hamperPrice));
                } catch (error) {
                  console.error('Error applying custom price to variant:', error);
                }
              }
            }
          }

          // Add the lines to the cart
          result = await cart.addLines(formattedLines);
          console.log('Add lines result:', result);

          if (result.errors && result.errors.length > 0) {
            console.error('Cart add lines errors:', result.errors);
          }

          if (result.cart) {
            console.log('Updated cart:', result.cart);
            console.log('Cart total quantity:', result.cart.totalQuantity);
            console.log('Cart lines:', result.cart.lines?.nodes?.length || 0);
          } else {
            console.error('No cart returned from addLines');
          }
        } catch (addLinesError) {
          console.error('Error in cart.addLines:', addLinesError);
          console.error('Error details:', addLinesError.message);
          console.error('Error stack:', addLinesError.stack);
          return json({
            error: 'Failed to add items to cart',
            message: addLinesError.message,
            cart: await cart.get()
          }, { status: 500 });
        }
        break;
    case CartForm.ACTIONS.LinesUpdate:
      // Optimize line updates by processing them immediately
      console.log('Updating cart lines:', inputs.lines);
      result = await cart.updateLines(inputs.lines);

      // Set a shorter cache time for faster updates
      headers.set('Cache-Control', 'no-store');
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;

      // User inputted gift card code
      const giftCardCodes = formGiftCardCode ? [formGiftCardCode] : [];

      // Combine gift card codes already applied on cart
      giftCardCodes.push(...inputs.giftCardCodes);

      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  // Check for redirect parameter (only if formData exists)
  const redirectTo = formData ? formData.get('redirectTo') ?? null : null;
  const redirectAfterAdd = formData ? formData.get('redirectAfterAdd') ?? null : null;

  // Determine which redirect to use
  let finalRedirect = null;
  if (typeof redirectTo === 'string' && redirectTo) {
    finalRedirect = redirectTo;
  } else if (typeof redirectAfterAdd === 'string' && redirectAfterAdd) {
    finalRedirect = redirectAfterAdd;
  }

  // Set redirect header if needed
  if (finalRedirect) {
    console.log('Redirecting to:', finalRedirect);
    status = 303;
    headers.set('Location', finalRedirect);
  }

  // Clean up the cart data to remove any debug information
  const cleanCartResult = cartResult ? {
    ...cartResult,
    // Only include essential data needed for checkout
    id: cartResult.id,
    checkoutUrl: cartResult.checkoutUrl,
    totalQuantity: cartResult.totalQuantity,
    cost: cartResult.cost,
    lines: cartResult.lines,
    attributes: cartResult.attributes,
    discountCodes: cartResult.discountCodes,
    buyerIdentity: cartResult.buyerIdentity
  } : null;

  return data(
    {
      cart: cleanCartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
  } catch (error) {
    console.error('Cart action error:', error);
    return json(
      {
        error: error.message || 'An error occurred while updating the cart',
        cart: await cart.get()
      },
      { status: 500 }
    );
  }
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context, request}) {
  const {cart} = context;

  try {
    // Import the checkout return handler
    const { handleCheckoutReturn } = await import('~/lib/checkoutRedirect');

    // Check if user is returning from checkout and handle cart synchronization
    const checkoutReturnResult = await handleCheckoutReturn(context, request);
    if (checkoutReturnResult.success && checkoutReturnResult.cartSynced) {
      console.log('Cart synchronized after returning from checkout');
    }

    console.log('Cart loader: Fetching cart data');
    let cartData = await cart.get();

    // If cartData is null or undefined, create an empty cart structure
    if (!cartData) {
      console.log('Cart loader: Cart data is null, creating empty cart');

      // Try to create a new cart
      try {
        const newCart = await cart.create({
          lines: [],
        });

        if (newCart && newCart.cart) {
          console.log('Cart loader: Created new cart', newCart.cart.id);
          cartData = newCart.cart;
        } else {
          // If cart creation fails, use a fallback empty cart structure
          cartData = {
            id: null,
            lines: { nodes: [] },
            totalQuantity: 0,
            buyerIdentity: {},
            cost: { totalAmount: { amount: '0', currencyCode: 'ZAR' } }
          };
        }
      } catch (createError) {
        console.error('Error creating new cart:', createError);
        // Use fallback empty cart structure
        cartData = {
          id: null,
          lines: { nodes: [] },
          totalQuantity: 0,
          buyerIdentity: {},
          cost: { totalAmount: { amount: '0', currencyCode: 'ZAR' } }
        };
      }
    }

    // Ensure lines and nodes are always defined
    if (!cartData.lines) {
      cartData.lines = { nodes: [] };
    }

    if (!cartData.lines.nodes) {
      cartData.lines.nodes = [];
    }

    // Filter out items with quantity 0 and null/undefined lines
    const validLines = cartData.lines.nodes.filter(line => line && line.merchandise && line.quantity > 0);
    const validItemCount = validLines.length;

    console.log('Cart loader: Cart data processed', {
      id: cartData.id,
      totalQuantity: cartData.totalQuantity,
      totalLineCount: cartData.lines.nodes.length,
      validItemCount
    });

    // If we have no valid items but the cart shows items, update the UI to match reality
    if (validItemCount === 0 && cartData.totalQuantity > 0) {
      console.log('Cart has items with totalQuantity > 0 but no valid lines - this is inconsistent');

      // Create a corrected version of the cart data
      return {
        ...cartData,
        totalQuantity: validItemCount
      };
    }

    // Ensure the cart has all required properties
    return {
      ...cartData,
      lines: {
        ...cartData.lines,
        nodes: validLines
      }
    };
  } catch (error) {
    console.error('Error loading cart:', error);
    return json(
      {
        error: 'Failed to load cart data',
        message: error.message || 'An unexpected error occurred',
        id: null,
        lines: { nodes: [] },
        totalQuantity: 0,
        buyerIdentity: {},
        cost: { totalAmount: { amount: '0', currencyCode: 'ZAR' } }
      },
      { status: 500 }
    );
  }
}

export default function Cart() {
  /** @type {LoaderReturnData} */
  const cart = useLoaderData();

  // Only log in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log('Cart page rendered with cart data:', cart);
  }

  return (
    <div className="cart cart-page-container">
      <h1>Your Shopping Cart</h1>
      <CartMain layout="page" cart={cart} />

      {/* Add a spacer div to push the footer down */}
      <div className="cart-footer-spacer"></div>
    </div>
  );
}

/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').HeadersFunction} HeadersFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
