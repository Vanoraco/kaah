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
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return context.customerAccount.login();
  }

  try {
    // Query for customer information and orders
    const {data, errors} = await customerAccount.query(
      `#graphql
      query CustomerOrders {
        customer {
          firstName
          lastName
          emailAddress {
            emailAddress
          }
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
    }

    // Commit the session to persist any changes
    const headers = await session.commit();

    return json(
      {
        customer: data?.customer || null,
        orders: data?.customer?.orders?.nodes || [],
        pageInfo: data?.customer?.orders?.pageInfo || null
      },
      { headers }
    );
  } catch (error) {
    console.error('Error fetching customer orders:', error);

    // Commit the session to persist any changes
    const headers = await session.commit();

    return json(
      {
        customer: null,
        orders: [],
        pageInfo: null
      },
      { headers }
    );
  }
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer, orders, pageInfo} = useLoaderData();

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
  // Format the date
  const orderDate = new Date(order.processedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get the status badge class based on fulfillment status
  const getStatusBadgeClass = (status) => {
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

  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-number">
          <h3>Order #{order.orderNumber}</h3>
          <span className="order-date">{orderDate}</span>
        </div>
        <div className="order-status">
          <span className={`status-badge ${getStatusBadgeClass(order.fulfillmentStatus)}`}>
            {order.fulfillmentStatus || 'Processing'}
          </span>
        </div>
      </div>

      <div className="order-items">
        {order.lineItems.nodes.map((item, index) => (
          <div key={index} className="order-item">
            {item.variant?.image && (
              <img
                src={item.variant.image.url}
                alt={item.variant.image.altText || item.title}
                className="order-item-image"
                width="60"
                height="60"
              />
            )}
            <div className="order-item-details">
              <p className="order-item-title">{item.title}</p>
              {item.variant && item.variant.title !== 'Default Title' && (
                <p className="order-item-variant">{item.variant.title}</p>
              )}
              <p className="order-item-quantity">Qty: {item.quantity}</p>
            </div>
            <div className="order-item-price">
              <Money data={item.originalTotalPrice} />
            </div>
          </div>
        ))}

        {order.lineItems.nodes.length > 5 && (
          <p className="more-items">+ more items</p>
        )}
      </div>

      <div className="order-footer">
        <div className="order-total">
          <div className="order-total-row">
            <span>Subtotal:</span>
            <span><Money data={order.subtotalPrice} /></span>
          </div>
          <div className="order-total-row">
            <span>Shipping:</span>
            <span><Money data={order.totalShippingPrice} /></span>
          </div>
          <div className="order-total-row total">
            <span>Total:</span>
            <span className="order-price">
              <Money data={order.totalPrice} />
            </span>
          </div>
        </div>

        <div className="order-actions">
          {order.statusUrl && (
            <a href={order.statusUrl} target="_blank" rel="noopener noreferrer" className="track-order-btn">
              Track Order
            </a>
          )}
          <Link to={`/account/orders/${order.id}`} className="view-order-btn">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
