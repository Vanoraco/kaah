import {NotFound} from '~/components/NotFound';

export function meta() {
  return [
    {title: 'Page Not Found - Kaah'},
    {description: 'The page you are looking for does not exist.'}
  ];
}

export default function CatchAllRoute() {
  return <NotFound />;
}
