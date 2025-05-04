import {Outlet, useLoaderData} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context}) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return context.customerAccount.login();
  }

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

  // Commit the session to persist any changes
  const headers = await context.session.commit();

  return json(
    { customer: data?.customer },
    { headers }
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData();

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>My Account</h1>
        {customer && (
          <div className="account-welcome">
            <p>Welcome, {customer.firstName || 'Valued Customer'}!</p>
            {customer.emailAddress?.emailAddress && (
              <p className="account-email">{customer.emailAddress.emailAddress}</p>
            )}
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
