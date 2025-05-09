import {useLoaderData} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import {MEGA_SAVER_METAOBJECTS_QUERY, MEGA_SAVER_BANNER_QUERY} from '~/lib/banner-queries';
import {MegaSaverGrid} from '~/components/MegaSaverGrid';

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
export const meta = () => {
  return [
    {title: 'Mega Saver Deals | Kaah'},
    {description: 'Explore all our Mega Saver deals with special offers and discounts on your favorite products.'},
  ];
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
