import { json } from '@shopify/remix-oxygen';
import { useLoaderData, useRouteLoaderData } from '@remix-run/react';
import { SimpleAddToCartButton } from '~/components/SimpleAddToCartButton';
import { ReliableAddToCartButton } from '~/components/ReliableAddToCartButton';
import { useOnlineSalesStatus } from '~/lib/onlineSalesControl';

/**
 * Meta function for SEO
 */
export const meta = () => {
  return [
    { title: 'Online Sales Control Test | Kaah' },
    { description: 'Test page for online sales control functionality' },
  ];
};

/**
 * Loader function to get test product data
 */
export async function loader({ context }) {
  const { storefront } = context;

  // Get a sample product for testing
  const { products } = await storefront.query(TEST_PRODUCTS_QUERY);

  return json({
    products: products.nodes.slice(0, 3) // Get first 3 products for testing
  });
}

/**
 * Test page component
 */
export default function TestOnlineSalesPage() {
  const { products } = useLoaderData();
  const rootData = useRouteLoaderData('root');
  const isOnlineSalesEnabled = useOnlineSalesStatus(rootData);

  return (
    <div className="test-online-sales-page">
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Status Display */}
        <div className="status-section" style={{ 
          background: isOnlineSalesEnabled ? '#e8f5e8' : '#fff3cd', 
          border: `2px solid ${isOnlineSalesEnabled ? '#4caf50' : '#ffc107'}`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '40px',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 10px 0', color: isOnlineSalesEnabled ? '#2e7d32' : '#f57c00' }}>
            Online Sales Status: {isOnlineSalesEnabled ? 'ENABLED' : 'DISABLED'}
          </h2>
          <p style={{ margin: 0, fontSize: '16px' }}>
            {isOnlineSalesEnabled 
              ? 'Online purchasing is currently available. All buttons should work normally.'
              : 'Online purchasing is currently disabled. All add to cart buttons should show "Available In-Store Only".'
            }
          </p>
        </div>

        {/* Instructions */}
        <div className="instructions-section" style={{ marginBottom: '40px' }}>
          <h1>Online Sales Control Test Page</h1>
          <p>This page demonstrates the online sales control functionality. Use this page to test:</p>
          <ul>
            <li>Button disabled states when online sales are off</li>
            <li>Consistent messaging across different button types</li>
            <li>Site-wide notification banner (should appear at top when disabled)</li>
            <li>Cart page messaging (visit /cart when online sales are disabled)</li>
          </ul>
          
          <div style={{ 
            background: '#e3f2fd', 
            border: '1px solid #2196f3', 
            borderRadius: '4px', 
            padding: '15px', 
            marginTop: '20px' 
          }}>
            <strong>How to test:</strong>
            <ol>
              <li>Go to Shopify Admin → Settings → Custom data → Metaobjects</li>
              <li>Find "Online Sales Control" and edit the "main-control" entry</li>
              <li>Toggle the "Enabled" field between true/false</li>
              <li>Refresh this page to see the changes</li>
            </ol>
          </div>
        </div>

        {/* Test Products */}
        <div className="test-products-section">
          <h2>Test Products</h2>
          <div className="products-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px',
            marginTop: '20px'
          }}>
            {products.map((product, index) => {
              const variant = product.variants.edges[0]?.node;
              if (!variant) return null;

              return (
                <div key={product.id} className="test-product-card" style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  background: '#fff'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
                    {product.title}
                  </h3>
                  
                  {product.featuredImage && (
                    <img 
                      src={product.featuredImage.url} 
                      alt={product.title}
                      style={{ 
                        width: '100%', 
                        height: '200px', 
                        objectFit: 'cover', 
                        borderRadius: '4px',
                        marginBottom: '15px'
                      }}
                    />
                  )}
                  
                  <p style={{ margin: '0 0 15px 0', color: '#666' }}>
                    Price: ${variant.price.amount} {variant.price.currencyCode}
                  </p>
                  
                  <div className="button-tests" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>
                        SimpleAddToCartButton:
                      </h4>
                      <SimpleAddToCartButton 
                        merchandiseId={variant.id}
                        quantity={1}
                      />
                    </div>
                    
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>
                        ReliableAddToCartButton:
                      </h4>
                      <ReliableAddToCartButton 
                        merchandiseId={variant.id}
                        quantity={1}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Test Links */}
        <div className="test-links-section" style={{ marginTop: '40px', textAlign: 'center' }}>
          <h3>Additional Test Areas</h3>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/cart" style={{ 
              padding: '10px 20px', 
              background: '#2196f3', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '4px' 
            }}>
              Test Cart Page
            </a>
            <a href="/products" style={{ 
              padding: '10px 20px', 
              background: '#4caf50', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '4px' 
            }}>
              Test Products Page
            </a>
            <a href="/mega-saver" style={{ 
              padding: '10px 20px', 
              background: '#ff9800', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '4px' 
            }}>
              Test MegaSaver
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// GraphQL query to get test products
const TEST_PRODUCTS_QUERY = `#graphql
  query TestProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 10) {
      nodes {
        id
        title
        handle
        featuredImage {
          id
          url
          altText
          width
          height
        }
        variants(first: 1) {
          edges {
            node {
              id
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;
