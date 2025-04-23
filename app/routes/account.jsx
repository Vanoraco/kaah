import {redirect} from '@shopify/remix-oxygen';

/**
 * This route is used to handle redirects for the account routes
 * Since we're using the underscore notation for account routes (account_/login)
 * we need to redirect any requests to /account to the login page
 */
export async function loader() {
  return redirect('/account_/login');
}

// The rest of the file is not needed as we're just redirecting to the login page
