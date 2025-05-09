import {redirect} from '@shopify/remix-oxygen';

export async function loader() {
  return redirect('/mega_saver');
}

export default function MegaSaversRedirect() {
  return null;
}
