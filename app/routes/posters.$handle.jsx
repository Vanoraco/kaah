import { useLoaderData } from '@remix-run/react';
import { json } from '@shopify/remix-oxygen';
import { PRODUCT_POSTER_BY_HANDLE_QUERY, processPosterData, isPosterActive } from '~/lib/poster-queries';
import { ProductPoster } from '~/components/ProductPoster';

/**
 * @type {import('@remix-run/node').MetaFunction<typeof loader>}
 */
export const meta = ({ data }) => {
  return [
    { title: `${data?.poster?.title || 'Special Offers'} | Kaah Supermarket` },
    { description: 'View our special offers and promotions at Kaah Supermarket.' }
  ];
};

/**
 * @param {import('@remix-run/node').LoaderFunctionArgs}
 */
export async function loader({ context, params }) {
  const { handle } = params;
  
  try {
    // Fetch the product poster by handle
    const { metaobject } = await context.storefront.query(
      PRODUCT_POSTER_BY_HANDLE_QUERY,
      {
        variables: {
          handle,
        },
      }
    );
    
    // Process the poster data
    const poster = processPosterData(metaobject);
    
    // Check if the poster is active
    const isActive = isPosterActive(poster);
    
    if (!poster || !isActive) {
      throw new Response('Poster not found or no longer active', { status: 404 });
    }
    
    return json({
      poster
    });
  } catch (error) {
    console.error(`Error loading product poster with handle ${handle}:`, error);
    throw new Response('Poster not found', { status: 404 });
  }
}

export default function PosterDetails() {
  const { poster } = useLoaderData();
  
  return (
    <div className="poster-details-page">
      <div className="poster-details-container">
        <ProductPoster 
          poster={poster} 
          printable={true}
        />
        
        <div className="poster-navigation">
          <a href="/posters" className="back-to-posters-link">
            <i className="fas fa-arrow-left"></i> Back to All Offers
          </a>
        </div>
      </div>
    </div>
  );
}
