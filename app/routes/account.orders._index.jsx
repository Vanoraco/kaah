import {Link, useLoaderData} from '@remix-run/react';
import {json, redirect} from '@shopify/remix-oxygen';
import {Money} from '@shopify/hydrogen';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Orders - Kaah Store'}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context}) {
  const {customerAccount, session} = context;

  // Check if the customer is logged in
  let isLoggedIn = false;
  try {
    isLoggedIn = await customerAccount.isLoggedIn();
  } catch (loginError) {
    console.error('Error checking login status:', loginError);
    return json(
      {
        customer: null,
        orders: [],
        pageInfo: null,
        error: {
          message: 'Error checking login status. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? loginError.message : null
        }
      },
      { status: 500 }
    );
  }

  if (!isLoggedIn) {
    try {
      return context.customerAccount.login();
    } catch (loginRedirectError) {
      console.error('Error redirecting to login:', loginRedirectError);
      return json(
        {
          customer: null,
          orders: [],
          pageInfo: null,
          error: {
            message: 'Error redirecting to login. Please try again later.',
            details: process.env.NODE_ENV === 'development' ? loginRedirectError.message : null
          }
        },
        { status: 500 }
      );
    }
  }

  try {
    // First, try a simple query to verify the API connection
    const customerInfoQuery = await customerAccount.query(
      `#graphql
      query CustomerBasicInfo {
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

    if (customerInfoQuery.errors?.length) {
      console.error('Customer basic info query errors:', customerInfoQuery.errors);
      throw new Error(customerInfoQuery.errors[0].message || 'Error fetching customer information');
    }

    if (!customerInfoQuery.data?.customer) {
      throw new Error('Customer information not available');
    }

    // If basic query succeeds, proceed with orders query
    const {data, errors} = await customerAccount.query(
      `#graphql
      query CustomerOrders {
        customer {
          orders(first: 10) {
            nodes {
              id
              name
              orderNumber
              processedAt
              fulfillmentStatus
              financialStatus
              statusUrl
              totalPrice {
                amount
                currencyCode
              }
              subtotalPrice {
                amount
                currencyCode
              }
              totalShippingPrice {
                amount
                currencyCode
              }
              lineItems(first: 5) {
                nodes {
                  title
                  quantity
                  originalTotalPrice {
                    amount
                    currencyCode
                  }
                  variant {
                    image {
                      url
                      altText
                    }
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      handle
                    }
                  }
                }
              }
            }
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
          }
        }
      }
      `
    );

    if (errors?.length) {
      console.error('Customer orders query errors:', errors);
      throw new Error(errors[0].message || 'Error fetching orders');
    }

    // Validate the data structure to prevent potential errors in the UI
    const orders = data?.customer?.orders?.nodes || [];
    const validatedOrders = orders.map(order => {
      // Ensure all required fields exist to prevent UI errors
      return {
        ...order,
        lineItems: {
          nodes: (order.lineItems?.nodes || []).map(item => ({
            ...item,
            variant: item.variant || {
              image: null,
              title: 'Product Variant',
              price: item.originalTotalPrice
            }
          }))
        }
      };
    });

    // Commit the session to persist any changes
    let headers;
    try {
      headers = await session.commit();
    } catch (sessionError) {
      console.error('Error committing session:', sessionError);
      // Continue without headers if session commit fails
    }

    return json(
      {
        customer: customerInfoQuery.data.customer,
        orders: validatedOrders,
        pageInfo: data?.customer?.orders?.pageInfo || null
      },
      { headers }
    );
  } catch (error) {
    console.error('Error fetching customer orders:', error);

    // Try to commit the session but don't fail if it doesn't work
    let headers;
    try {
      headers = await session.commit();
    } catch (sessionError) {
      console.error('Error committing session after error:', sessionError);
    }

    return json(
      {
        customer: null,
        orders: [],
        pageInfo: null,
        error: {
          message: error.message || 'An error occurred while fetching your orders.',
          details: process.env.NODE_ENV === 'development' ? error.stack : null
        }
      },
      { headers, status: 500 }
    );
  }
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer, orders, pageInfo, error} = useLoaderData();

  // If there's an error, display it
  if (error) {
    return (
      <div className="account-orders">
        <h2 className="account-section-title">Your Orders</h2>

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
            <Link to="/account" className="back-to-account-btn">
              <i className="fas fa-user"></i> Back to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-orders">
      <h2 className="account-section-title">Your Orders</h2>

      {orders && orders.length > 0 ? (
        <div className="orders-list">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}

          {/* Pagination controls */}
          {pageInfo && (
            <div className="pagination-controls">
              {pageInfo.hasPreviousPage && (
                <Link
                  to={`/account/orders?before=${pageInfo.startCursor}`}
                  className="pagination-link prev"
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </Link>
              )}

              {pageInfo.hasNextPage && (
                <Link
                  to={`/account/orders?after=${pageInfo.endCursor}`}
                  className="pagination-link next"
                >
                  Next <i className="fas fa-chevron-right"></i>
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="empty-orders">
          <div className="empty-orders-icon">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <h3>No orders yet</h3>
          <p>You haven't placed any orders yet. Start shopping to see your orders here.</p>
          <Link to="/collections" className="start-shopping-btn">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * @param {{ order: any }}
 */
function OrderCard({ order }) {
  if (!order) {
    return null;
  }

  // Format the date safely
  let orderDate = 'N/A';
  try {
    if (order.processedAt) {
      orderDate = new Date(order.processedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  } catch (error) {
    console.error('Error formatting order date:', error);
  }

  // Get the status badge class based on fulfillment status
  const getStatusBadgeClass = (status) => {
    if (!status) return 'pending';

    switch (status) {
      case 'FULFILLED':
        return 'fulfilled';
      case 'IN_PROGRESS':
        return 'in-progress';
      case 'PARTIALLY_FULFILLED':
        return 'partially-fulfilled';
      case 'RESTOCKED':
        return 'restocked';
      case 'PENDING_FULFILLMENT':
        return 'pending';
      case 'UNFULFILLED':
        return 'unfulfilled';
      default:
        return 'pending';
    }
  };

  // Safely get line items
  const lineItems = order.lineItems?.nodes || [];

  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-number">
          <h3>Order #{order.orderNumber || 'Unknown'}</h3>
          <span className="order-date">{orderDate}</span>
        </div>
        <div className="order-status">
          <span className={`status-badge ${getStatusBadgeClass(order.fulfillmentStatus)}`}>
            {order.fulfillmentStatus || 'Processing'}
          </span>
        </div>
      </div>

      <div className="order-items">
        {lineItems.length > 0 ? (
          <>
            {lineItems.map((item, index) => {
              if (!item) return null;

              return (
                <div key={index} className="order-item">
                  {item.variant?.image?.url ? (
                    <img
                      src={item.variant.image.url}
                      alt={item.variant.image.altText || item.title || 'Product image'}
                      className="order-item-image"
                      width="60"
                      height="60"
                    />
                  ) : (
                    <div className="order-item-image-placeholder">
                      <i className="fas fa-box"></i>
                    </div>
                  )}
                  <div className="order-item-details">
                    <p className="order-item-title">{item.title || 'Product'}</p>
                    {item.variant && item.variant.title && item.variant.title !== 'Default Title' && (
                      <p className="order-item-variant">{item.variant.title}</p>
                    )}
                    <p className="order-item-quantity">Qty: {item.quantity || 1}</p>
                  </div>
                  <div className="order-item-price">
                    {item.originalTotalPrice ? (
                      <Money data={item.originalTotalPrice} />
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
              );
            })}

            {lineItems.length > 5 && (
              <p className="more-items">+ more items</p>
            )}
          </>
        ) : (
          <p className="no-items-message">No items available</p>
        )}
      </div>

      <div className="order-footer">
        <div className="order-total">
          <div className="order-total-row">
            <span>Subtotal:</span>
            <span>
              {order.subtotalPrice ? (
                <Money data={order.subtotalPrice} />
              ) : (
                'N/A'
              )}
            </span>
          </div>
          <div className="order-total-row">
            <span>Shipping:</span>
            <span>
              {order.totalShippingPrice ? (
                <Money data={order.totalShippingPrice} />
              ) : (
                'N/A'
              )}
            </span>
          </div>
          <div className="order-total-row total">
            <span>Total:</span>
            <span className="order-price">
              {order.totalPrice ? (
                <Money data={order.totalPrice} />
              ) : (
                'N/A'
              )}
            </span>
          </div>
        </div>

        <div className="order-actions">
          {order.statusUrl && (
            <a href={order.statusUrl} target="_blank" rel="noopener noreferrer" className="track-order-btn">
              Track Order
            </a>
          )}
          {order.id && (
            <Link to={`/account/orders/${order.id}`} className="view-order-btn">
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
