import {json, redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';

export async function loader({context}) {
  const {customerAccount} = context;

  try {
    // Check if the customer is logged in
    const isLoggedIn = await customerAccount.isLoggedIn();

    if (!isLoggedIn) {
      return redirect('/account/login');
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
          orders(first: 3) {
            nodes {
              id
              name
              processedAt
              statusPageUrl
              totalPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
      `
    );

    if (errors?.length) {
      console.error('Customer details query errors:', errors);
      throw new Error(errors[0].message || 'Error fetching customer information');
    }

    return json({
      customer: data.customer
    });
  } catch (error) {
    console.error('Error in account dashboard loader:', error);
    return json(
      {
        customer: null,
        error: {
          message: error.message || 'An error occurred while loading your account dashboard.',
          details: process.env.NODE_ENV === 'development' ? error.stack : null
        }
      },
      { status: 500 }
    );
  }
}

export default function AccountDashboard() {
  const {customer, error} = useLoaderData();

  // If there's an error, display it
  if (error) {
    return (
      <div className="account-dashboard">
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
    );
  }

  // Format the customer's name
  const customerName = customer?.firstName
    ? `${customer.firstName} ${customer.lastName || ''}`
    : 'Valued Customer';

  // Get the customer's email
  const customerEmail = customer?.emailAddress?.emailAddress || '';

  // Get recent orders
  const recentOrders = customer?.orders?.nodes || [];

  return (
    <div className="account-dashboard">
      <div className="dashboard-welcome">
        <div className="welcome-header">
          <div className="welcome-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="welcome-text">
            <h2>Welcome, {customerName}!</h2>
            <p className="welcome-email">{customerEmail}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-header">
            <i className="fas fa-shopping-bag"></i>
            <h3>Orders</h3>
          </div>
          <div className="card-content">
            {recentOrders.length > 0 ? (
              <>
                <p>Your recent orders:</p>
                <ul className="recent-orders-list">
                  {recentOrders.map((order) => {
                    // Format the date
                    const orderDate = new Date(order.processedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <li key={order.id} className="recent-order-item">
                        <div className="order-info">
                          <span className="order-name">{order.name}</span>
                          <span className="order-date">{orderDate}</span>
                        </div>
                        <Link to={`/account/orders/${order.id}`} className="view-order-btn">
                          View Details
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Link to="/account/orders" className="card-action-btn">
                  View All Orders <i className="fas fa-arrow-right"></i>
                </Link>
              </>
            ) : (
              <>
                <p>You haven't placed any orders yet.</p>
                <Link to="/collections" className="card-action-btn">
                  Start Shopping <i className="fas fa-arrow-right"></i>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <i className="fas fa-address-book"></i>
            <h3>Account</h3>
          </div>
          <div className="card-content">
            <ul className="account-links">
              <li>
                <Link to="/account/profile">
                  <i className="fas fa-user"></i> Profile Information
                </Link>
              </li>
              <li>
                <Link to="/account/addresses">
                  <i className="fas fa-map-marker-alt"></i> Addresses
                </Link>
              </li>
              <li>
                <Link to="/account/logout">
                  <i className="fas fa-sign-out-alt"></i> Log Out
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
