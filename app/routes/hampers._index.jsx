import {useLoaderData} from '@remix-run/react';
import {HamperCards} from '~/components/HamperCards';
import {HAMPER_METAOBJECTS_QUERY} from '~/lib/hamper-queries';
import {PageHeader} from '~/components/PageHeader';
import {createSeoMeta} from '~/lib/seo';

/**
 * @type {import('@remix-run/node').MetaFunction}
 */
export const meta = ({request}) => {
  if (!request) {
    return [
      {title: 'Special Hampers | Kaah Supermarket'},
      {name: 'description', content: 'Explore our exclusive hamper collections at Kaah Supermarket.'}
    ];
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  return createSeoMeta({
    title: 'Special Hampers & Gift Collections',
    description: 'Discover our exclusive hamper collections at Kaah Supermarket. Carefully curated premium products perfect for gifting or treating yourself. Exceptional value and delightful experience guaranteed.',
    pathname,
    searchParams: url.searchParams,
    keywords: ['special hampers', 'gift collections', 'premium products', 'curated hampers', 'gift baskets', 'exclusive offers']
  });
};

/**
 * @param {import('@remix-run/node').LoaderFunctionArgs}
 */
export async function loader({context}) {
  try {
    // Fetch hamper metaobjects
    const {metaobjects} = await context.storefront.query(HAMPER_METAOBJECTS_QUERY);

    return {
      hamperMetaobjects: metaobjects,
    };
  } catch (error) {
    console.error('Error loading hamper data:', error);
    return {
      hamperMetaobjects: { nodes: [] },
    };
  }
}

export default function HampersPage() {
  const {hamperMetaobjects} = useLoaderData();

  return (
    <div className="hampers-page">
      <PageHeader
        heading="Special Hampers"
        subheading="Explore our exclusive hamper collections"
        className="hampers-header"
      />

      <div className="hampers-content">
        <div className="hampers-description">
          <p>
            Our special hampers are carefully curated collections of premium products,
            perfect for gifting or treating yourself. Each hamper is thoughtfully assembled
            to provide exceptional value and a delightful experience.
          </p>
        </div>

        {/* Pass showViewAllButton={false} since we're already on the hampers page */}
        <HamperCards hamperMetaobjects={hamperMetaobjects} showViewAllButton={false} />
      </div>
    </div>
  );
}
