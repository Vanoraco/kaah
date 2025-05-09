import { json, redirect } from '@shopify/remix-oxygen';
import { mergeCartsOnLogin } from '~/lib/cartMerging';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Merge Cart'}];
};

/**
 * @param {ActionFunctionArgs}
 */
export async function action({ request, context }) {
  const { customerAccount, session } = context;

  // Check if the customer is logged in
  const isLoggedIn = await customerAccount.isLoggedIn();
  if (!isLoggedIn) {
    return redirect('/account/login');
  }

  try {
    // Attempt to merge carts
    const result = await mergeCartsOnLogin(context);

    // Commit the session to persist any changes
    let responseInit = { status: result.success ? 200 : 400 };

    try {
      if (session.isPending) {
        const sessionHeaders = await session.commit();
        if (sessionHeaders) {
          responseInit.headers = { 'Set-Cookie': sessionHeaders };
        }
      }
    } catch (sessionError) {
      console.error('Error committing session:', sessionError);
      // Continue without headers if session commit fails
    }

    if (result.success) {
      return json(
        {
          success: true,
          message: 'Cart merged successfully'
        },
        responseInit
      );
    } else {
      return json(
        {
          success: false,
          error: result.error || 'Failed to merge cart'
        },
        responseInit
      );
    }
  } catch (error) {
    console.error('Error in cart merge action:', error);

    // Try to commit the session but don't fail if it doesn't work
    let responseInit = { status: 500 };

    try {
      if (session.isPending) {
        const sessionHeaders = await session.commit();
        if (sessionHeaders) {
          responseInit.headers = { 'Set-Cookie': sessionHeaders };
        }
      }
    } catch (sessionError) {
      console.error('Error committing session after error:', sessionError);
    }

    return json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred'
      },
      responseInit
    );
  }
}

// This route doesn't render anything directly, it's just for the action
export default function MergeCart() {
  return null;
}

/** @typedef {import('@remix-run/react').MetaFunction} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
