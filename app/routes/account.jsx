import {Outlet, useLoaderData} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import {mergeCartsOnLogin} from '~/lib/cartMerging';
import {CustomerCartStatus} from '~/components/CustomerCartStatus';

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context}) {
  const {customerAccount} = context;

  // Check if the customer is logged in with error handling
  let isLoggedIn = false;
  try {
    isLoggedIn = await customerAccount.isLoggedIn();
  } catch (loginError) {
    console.error('Error checking login status:', loginError);
    // Try to redirect to login anyway
    try {
      return context.customerAccount.login();
    } catch (redirectError) {
      console.error('Error redirecting to login:', redirectError);
      return json(
        {
          customer: null,
          error: {
            message: 'Error checking login status. Please try again later.',
            details: process.env.NODE_ENV === 'development' ? loginError.message : null
          }
        },
        { status: 500 }
      );
    }
  }

  if (!isLoggedIn) {
    try {
      return context.customerAccount.login();
    } catch (loginRedirectError) {
      console.error('Error redirecting to login:', loginRedirectError);
      return json(
        {
          customer: null,
          error: {
            message: 'Error redirecting to login. Please try again later.',
            details: process.env.NODE_ENV === 'development' ? loginRedirectError.message : null
          }
        },
        { status: 500 }
      );
    }
  }

  // If customer is logged in, try to merge carts and associate them with the cart
  try {
    context.waitUntil(
      (async () => {
        try {
          const result = await mergeCartsOnLogin(context);
          if (!result.success) {
            console.warn('Failed to merge carts in account page:', result.error);
          }
        } catch (err) {
          console.error('Error in account page cart merging:', err);
        }
      })()
    );
  } catch (error) {
    console.error('Error setting up cart merging in account page:', error);
    // Continue with the response even if cart merging fails
  }

  try {
    // Query for customer information
    const {data, errors} = await customerAccount.query(
      `#graphql
      query CustomerDetails {
        customer {
          firstName
          lastName
          emailAddress {
            emailAddress
          }
        }
      }
      `
    );

    if (errors?.length) {
      console.error('Customer details query errors:', errors);
      throw new Error(errors[0].message || 'Error fetching customer information');
    }

    if (!data?.customer) {
      throw new Error('Customer information not available');
    }

    // Commit the session to persist any changes
    let responseInit = {};

    try {
      if (context.session.isPending) {
        const sessionHeaders = await context.session.commit();
        if (sessionHeaders) {
          responseInit.headers = { 'Set-Cookie': sessionHeaders };
        }
      }
    } catch (sessionError) {
      console.error('Error committing session:', sessionError);
      // Continue without headers if session commit fails
    }

    return json(
      { customer: data.customer },
      responseInit
    );
  } catch (error) {
    console.error('Error in account loader:', error);

    // Try to commit the session but don't fail if it doesn't work
    let responseInit = { status: 500 };

    try {
      if (context.session.isPending) {
        const sessionHeaders = await context.session.commit();
        if (sessionHeaders) {
          responseInit.headers = { 'Set-Cookie': sessionHeaders };
        }
      }
    } catch (sessionError) {
      console.error('Error committing session after error:', sessionError);
    }

    return json(
      {
        customer: null,
        error: {
          message: error.message || 'An error occurred while loading your account.',
          details: process.env.NODE_ENV === 'development' ? error.stack : null
        }
      },
      responseInit
    );
  }
}

export default function AccountLayout() {
  const {customer, error} = useLoaderData();

  // If there's an error at the account level, display it
  if (error) {
    return (
      <div className="account-container">
        <div className="account-header">
          <h1>My Account</h1>
        </div>

        <div className="account-content">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h3>We encountered a problem</h3>
            <p>{error.message}</p>
            {error.details && (
              <details>
                <summary>Technical Details</summary>
                <pre>{error.details}</pre>
              </details>
            )}
            <div className="error-actions">
              <button
                onClick={() => window.location.reload()}
                className="retry-btn"
              >
                <i className="fas fa-sync-alt"></i> Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-header">
        {/* <h1>My Account</h1>*/}
        
        {customer && (
          <div className="account-welcome">
            <CustomerCartStatus />
          </div>
        )}
      </div>

      <div className="account-content">
        <Outlet />
      </div>
    </div>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
