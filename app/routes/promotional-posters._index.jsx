import {redirect} from '@shopify/remix-oxygen';

/**
 * Redirect from /promotional-posters to home page
 */
export async function loader() {
  return redirect('/');
}

/**
 * Promotional Posters Index Page - Redirects to home
 */
export default function PromotionalPostersRedirect() {
  return null;
}
