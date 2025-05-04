/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context}) {
  return context.customerAccount.login();
}

export const meta = () => {
  return [{title: 'Sign In - Kaah Store'}];
};

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
