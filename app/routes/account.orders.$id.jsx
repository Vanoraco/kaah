import {redirect, json} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {Money, Image, flattenConnection} from '@shopify/hydrogen';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

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
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return context.customerAccount.login();
  }

  try {
    const orderId = params.id;
    const {data, errors} = await customerAccount.query(
      CUSTOMER_ORDER_QUERY,
      {
        variables: {orderId},
      },
    );

    if (errors?.length) {
      console.error('Customer order query errors:', errors);
    }

    if (!data?.order) {
      return redirect('/account/orders');
    }

    const {order} = data;

    const lineItems = flattenConnection(order.lineItems);
    const discountApplications = flattenConnection(order.discountApplications);

    const fulfillmentStatus =
      flattenConnection(order.fulfillments)[0]?.status ?? 'UNFULFILLED';

    const firstDiscount = discountApplications[0]?.value;

    const discountValue =
      firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

    const discountPercentage =
      firstDiscount?.__typename === 'PricingPercentageValue' &&
      firstDiscount?.percentage;

    // Commit the session to persist any changes
    const headers = await session.commit();

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

    // Commit the session to persist any changes
    const headers = await session.commit();

    return redirect('/account/orders', { headers });
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

          {order.statusPageUrl && (
            <a href={order.statusPageUrl} target="_blank" rel="noopener noreferrer" className="track-order-btn">
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
              <span><Money data={order.subtotal} /></span>
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
              <p>{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted ? (
                <p>{order.shippingAddress.formatted}</p>
              ) : (
                ''
              )}
              {order.shippingAddress.formattedArea ? (
                <p>{order.shippingAddress.formattedArea}</p>
              ) : (
                ''
              )}
            </div>
          </div>
        )}

        <div className="order-details-actions">
          <Link to="/account/orders" className="back-to-orders-btn">
            Back to Orders
          </Link>
          {order.statusPageUrl && (
            <a href={order.statusPageUrl} target="_blank" rel="noopener noreferrer" className="track-order-btn large">
              Track Order
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{lineItem: OrderLineItemFullFragment}}
 */
function OrderLineRow({lineItem}) {
  return (
    <div className="order-item-row">
      <div className="item-col product-col">
        <div className="product-info">
          {lineItem?.image && (
            <div className="product-image">
              <Image data={lineItem.image} width={70} height={70} />
            </div>
          )}
          <div className="product-details">
            <p className="product-title">{lineItem.title}</p>
            {lineItem.variantTitle && lineItem.variantTitle !== 'Default Title' && (
              <p className="product-variant">{lineItem.variantTitle}</p>
            )}
          </div>
        </div>
      </div>
      <div className="item-col price-col">
        <Money data={lineItem.price} />
      </div>
      <div className="item-col quantity-col">
        {lineItem.quantity}
      </div>
      <div className="item-col total-col">
        <Money data={lineItem.totalDiscount} />
      </div>
    </div>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
