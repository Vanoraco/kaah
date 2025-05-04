import {useLoaderData} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';
import {data, json} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: `Hydrogen | Cart`}];
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
    const formData = await request.formData();
    console.log('Form data entries:', [...formData.entries()]);

    const {action, inputs} = CartForm.getFormInput(formData);
    console.log('CartForm action:', action);
    console.log('CartForm inputs:', inputs);

    if (!action) {
      return json({ error: 'No action provided' }, { status: 400 });
    }

    let status = 200;
    let result;

    switch (action) {
      case CartForm.ACTIONS.LinesAdd:
        console.log('Cart action: LinesAdd', inputs.lines);
        if (!inputs.lines || !inputs.lines.length) {
          return json({ error: 'No lines provided' }, { status: 400 });
        }

        // Ensure each line has a merchandiseId and quantity
        const validLines = inputs.lines.filter(line =>
          line && line.merchandiseId && line.quantity && line.quantity > 0
        );

        if (validLines.length === 0) {
          return json({ error: 'Invalid line items' }, { status: 400 });
        }

        result = await cart.addLines(validLines);
        console.log('Add lines result:', result);
        break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
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

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
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
export async function loader({context}) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  /** @type {LoaderReturnData} */
  const cart = useLoaderData();

  return (
    <div className="cart cart-page-container">
      <h1>Your Shopping Cart</h1>
      <CartMain layout="page" cart={cart} />
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
