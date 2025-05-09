import { mergeCartsOnLogin } from '~/lib/cartMerging';

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  // First authorize the customer
  const response = await context.customerAccount.authorize();

  // After successful authorization, try to merge carts and associate the customer with their cart
  try {
    // Use context.waitUntil to handle the cart merging asynchronously
    // This ensures the login flow isn't blocked by the cart merging process
    context.waitUntil(
      (async () => {
        try {
          // Wait a brief moment to ensure authorization is fully processed
          await new Promise(resolve => setTimeout(resolve, 100));

          // Merge carts and associate with customer
          const result = await mergeCartsOnLogin(context);

          if (result.success) {
            console.log('Successfully merged carts and associated with customer');
          } else {
            console.warn('Failed to merge carts:', result.error);
          }
        } catch (err) {
          console.error('Error in waitUntil cart merging:', err);
        }
      })()
    );
  } catch (error) {
    console.error('Error setting up cart merging:', error);
    // Continue with the response even if cart merging setup fails
    // This ensures the login flow isn't disrupted
  }

  return response;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
