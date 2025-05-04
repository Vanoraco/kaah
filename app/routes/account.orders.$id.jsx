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
  // For now, just redirect to the orders page
  // This is a temporary solution until we can fix the API integration
  return redirect('/account/orders');
}

export default function OrderRoute() {
  // This component should never be rendered since we're redirecting in the loader
  return null;
}

// We don't need the OrderLineRow component since we're redirecting

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
