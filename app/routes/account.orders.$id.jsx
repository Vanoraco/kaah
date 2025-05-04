import {redirect, json} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {Money, Image, flattenConnection} from '@shopify/hydrogen';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Order ${data?.order?.name} - Kaah Store`}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({params, context}) {
  const {customerAccount, session} = context;

  if (!params.id) {
    return redirect('/account/orders');
  }

  // Check if the customer is logged in
  let isLoggedIn = false;
  try {
    isLoggedIn = await customerAccount.isLoggedIn();
  } catch (loginError) {
    console.error('Error checking login status:', loginError);
    return redirect('/account/orders');
  }

  if (!isLoggedIn) {
    try {
      return context.customerAccount.login();
    } catch (loginRedirectError) {
      console.error('Error redirecting to login:', loginRedirectError);
      return redirect('/account/orders');
    }
  }

  try {
    const orderId = params.id;

    // First, verify the customer account is accessible
    const customerInfoQuery = await customerAccount.query(
      `#graphql
      query CustomerBasicInfo {
        customer {
          firstName
          lastName
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

    // Query for the specific order
    const {data, errors} = await customerAccount.query(
      `#graphql
      query CustomerOrder($orderId: ID!) {
        customer {
          order(id: $orderId) {
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
            totalTax {
              amount
              currencyCode
            }
            lineItems(first: 50) {
              nodes {
                title
                quantity
                originalTotalPrice {
                  amount
                  currencyCode
                }
                variant {
                  id
                  title
                  image {
                    url
                    altText
                    width
                    height
                  }
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    handle
                    title
                  }
                }
              }
            }
            shippingAddress {
              firstName
              lastName
              address1
              address2
              city
              provinceCode
              zip
              country
              phone
            }
            discountApplications(first: 10) {
              nodes {
                value {
                  ... on MoneyV2 {
                    amount
                    currencyCode
                  }
                  ... on PricingPercentageValue {
                    percentage
                  }
                }
              }
            }
            fulfillments(first: 10) {
              nodes {
                status
              }
            }
          }
        }
      }
      `,
      {
        variables: {orderId},
      }
    );

    if (errors?.length) {
      console.error('Customer order query errors:', errors);
      throw new Error(errors[0].message || 'Error fetching order details');
    }

    if (!data?.customer?.order) {
      console.error('Order not found:', orderId);
      return redirect('/account/orders');
    }

    const order = data.customer.order;
    const lineItems = order.lineItems?.nodes || [];
    const discountApplications = order.discountApplications?.nodes || [];
    const fulfillments = order.fulfillments?.nodes || [];

    const fulfillmentStatus = fulfillments[0]?.status || 'UNFULFILLED';

    const firstDiscount = discountApplications[0]?.value;

    const discountValue =
      firstDiscount && 'amount' in firstDiscount ? firstDiscount : null;

    const discountPercentage =
      firstDiscount && 'percentage' in firstDiscount ? firstDiscount.percentage : null;

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
        order,
        lineItems,
        discountValue,
        discountPercentage,
        fulfillmentStatus,
      },
      { headers }
    );
  } catch (error) {
    console.error('Error fetching order details:', error);

    // Try to commit the session but don't fail if it doesn't work
    let headers;
    try {
      headers = await session.commit();
    } catch (sessionError) {
      console.error('Error committing session after error:', sessionError);
    }

    // Redirect to orders page with error message
    return redirect(`/account/orders?error=${encodeURIComponent(error.message || 'Error loading order details')}`,
      { headers }
    );
  }
}

export default function OrderRoute() {
  /** @type {LoaderReturnData} */
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData();

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
    <div className="account-order-details">
      <div className="account-section-header">
        <Link to="/account/orders" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Orders
        </Link>
        <h2 className="account-section-title">Order {order.name}</h2>
      </div>

      <div className="order-details-card">
        <div className="order-details-header">
          <div className="order-details-meta">
            <div className="order-meta-item">
              <span className="meta-label">Order Date:</span>
              <span className="meta-value">{orderDate}</span>
            </div>
            <div className="order-meta-item">
              <span className="meta-label">Status:</span>
              <span className={`status-badge ${getStatusBadgeClass(fulfillmentStatus)}`}>
                {fulfillmentStatus}
              </span>
            </div>
            {order.financialStatus && (
              <div className="order-meta-item">
                <span className="meta-label">Payment:</span>
                <span className="meta-value">{order.financialStatus}</span>
              </div>
            )}
          </div>

          {order.statusUrl && (
            <a href={order.statusUrl} target="_blank" rel="noopener noreferrer" className="track-order-btn">
              <i className="fas fa-truck"></i> Track Order
            </a>
          )}
        </div>

        <div className="order-details-section">
          <h3 className="section-title">Items</h3>
          <div className="order-items-table">
            <div className="order-items-header">
              <div className="item-col product-col">Product</div>
              <div className="item-col price-col">Price</div>
              <div className="item-col quantity-col">Quantity</div>
              <div className="item-col total-col">Total</div>
            </div>

            <div className="order-items-body">
              {lineItems.map((lineItem, index) => (
                <OrderLineRow key={index} lineItem={lineItem} />
              ))}
            </div>
          </div>
        </div>

        <div className="order-details-section">
          <h3 className="section-title">Order Summary</h3>
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span><Money data={order.subtotalPrice} /></span>
            </div>

            {((discountValue && discountValue.amount) || discountPercentage) && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>
                  {discountPercentage ? (
                    <span>-{discountPercentage}% OFF</span>
                  ) : (
                    discountValue && <Money data={discountValue} />
                  )}
                </span>
              </div>
            )}

            <div className="summary-row">
              <span>Tax</span>
              <span><Money data={order.totalTax} /></span>
            </div>

            <div className="summary-row total">
              <span>Total</span>
              <span><Money data={order.totalPrice} /></span>
            </div>
          </div>
        </div>

        {order?.shippingAddress && (
          <div className="order-details-section">
            <h3 className="section-title">Shipping Address</h3>
            <div className="shipping-address">
              <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.provinceCode} {order.shippingAddress.zip}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
            </div>
          </div>
        )}

        <div className="order-details-actions">
          <Link to="/account/orders" className="back-to-orders-btn">
            Back to Orders
          </Link>
          {order.statusUrl && (
            <a href={order.statusUrl} target="_blank" rel="noopener noreferrer" className="track-order-btn large">
              Track Order
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{lineItem: any}}
 */
function OrderLineRow({lineItem}) {
  return (
    <div className="order-item-row">
      <div className="item-col product-col">
        <div className="product-info">
          {lineItem?.variant?.image && (
            <div className="product-image">
              <img
                src={lineItem.variant.image.url}
                alt={lineItem.variant.image.altText || lineItem.title}
                width="70"
                height="70"
              />
            </div>
          )}
          <div className="product-details">
            <p className="product-title">{lineItem.title}</p>
            {lineItem.variant?.title && lineItem.variant.title !== 'Default Title' && (
              <p className="product-variant">{lineItem.variant.title}</p>
            )}
          </div>
        </div>
      </div>
      <div className="item-col price-col">
        {lineItem.variant?.price && (
          <Money data={lineItem.variant.price} />
        )}
      </div>
      <div className="item-col quantity-col">
        {lineItem.quantity}
      </div>
      <div className="item-col total-col">
        <Money data={lineItem.originalTotalPrice} />
      </div>
    </div>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
