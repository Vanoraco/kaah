import {redirect} from '@shopify/remix-oxygen';

/**
 * Redirect from /promotional-posters/:handle to home page
 */
export async function loader() {
  return redirect('/');
}

/**
 * Promotional Poster Viewer Page - Redirects to home
 */
export default function PromotionalPosterRedirect() {
  return null;
}
