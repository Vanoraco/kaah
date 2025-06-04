import {useLoaderData} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import {MEGA_SAVER_METAOBJECTS_QUERY, MEGA_SAVER_BANNER_QUERY} from '~/lib/banner-queries';
import {MegaSaverGrid} from '~/components/MegaSaverGrid';
import {createSeoMeta} from '~/lib/seo';

/**
 * Loader function to fetch all mega saver items
 */
export async function loader({context}) {
  try {
    // Fetch mega saver items and banner
    const [megaSaverItemsData, megaSaverBannerData] = await Promise.all([
      // Fetch all mega saver items (increased limit to 50)
      context.storefront.query(MEGA_SAVER_METAOBJECTS_QUERY.replace('first: 12', 'first: 50')),
      // Fetch mega saver banner
      context.storefront.query(MEGA_SAVER_BANNER_QUERY),
    ]);

    return json({
      megaSaverItems: megaSaverItemsData.metaobjects,
      megaSaverBanner: megaSaverBannerData.metaobjects,
    });
  } catch (error) {
    console.error('Error loading mega saver data:', error);
    return json({
      megaSaverItems: { nodes: [] },
      megaSaverBanner: { nodes: [] },
    });
  }
}

/**
 * Meta function for SEO
 */
export const meta = ({request}) => {
  if (!request) {
    return [
      {title: 'Mega Saver Deals | Kaah Supermarket'},
      {name: 'description', content: 'Explore all our Mega Saver deals with special offers and discounts on your favorite products.'}
    ];
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  return createSeoMeta({
    title: 'Mega Saver Deals & Special Offers',
    description: 'Discover incredible Mega Saver deals and special offers at Kaah Supermarket. Save big on quality groceries, fresh produce, and household essentials with our exclusive discounts.',
    pathname,
    searchParams: url.searchParams,
    keywords: ['mega saver', 'deals', 'special offers', 'discounts', 'savings', 'promotions', 'bulk deals']
  });
};

/**
 * Mega Saver page component
 */
export default function MegaSaverRoute() {
  const {megaSaverItems, megaSaverBanner} = useLoaderData();

  return (
    <div className="mega-saver-page">
      <div className="page-header">
        <h1>Mega Saver Deals</h1>
        <p>Explore all our special offers and save big on your favorite products</p>
      </div>

      {/* Display all mega saver items */}
      <MegaSaverGrid
        megaSaverItems={megaSaverItems}
        megaSaverBanner={megaSaverBanner}
        showViewMoreButton={false}
      />
    </div>
  );
}
