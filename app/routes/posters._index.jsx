import { useLoaderData } from '@remix-run/react';
import { json } from '@shopify/remix-oxygen';
import { PRODUCT_POSTERS_QUERY, processPosterData, isPosterActive } from '~/lib/poster-queries';
import { PageHeader } from '~/components/PageHeader';
import { ProductPoster } from '~/components/ProductPoster';

/**
 * @type {import('@remix-run/node').MetaFunction}
 */
export const meta = () => {
  return [
    { title: 'Weekly Special Offers | Kaah Supermarket' },
    { description: 'View our weekly special offers and promotions at Kaah Supermarket.' }
  ];
};

/**
 * @param {import('@remix-run/node').LoaderFunctionArgs}
 */
export async function loader({ context }) {
  try {
    // Fetch product posters
    const { metaobjects } = await context.storefront.query(PRODUCT_POSTERS_QUERY);
    
    // Process the poster data
    const posters = metaobjects.nodes.map(node => processPosterData(node))
      .filter(poster => poster !== null && isPosterActive(poster));
    
    return json({
      posters
    });
  } catch (error) {
    console.error('Error loading product posters:', error);
    return json({
      posters: []
    });
  }
}

export default function PostersIndex() {
  const { posters } = useLoaderData();
  
  return (
    <div className="posters-page">
      <PageHeader heading="Weekly Special Offers" />
      
      <div className="posters-container">
        {posters.length > 0 ? (
          posters.map(poster => (
            <ProductPoster 
              key={poster.id} 
              poster={poster} 
              printable={true}
            />
          ))
        ) : (
          <div className="no-posters-message">
            <h2>No current special offers</h2>
            <p>Check back soon for our upcoming promotions!</p>
          </div>
        )}
      </div>
    </div>
  );
}
