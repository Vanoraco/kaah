import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {ReliableAddToCartButton} from '~/components/ReliableAddToCartButton';

export async function loader({context}) {
  // Get a few products to test with
  const {storefront} = context;
  
  const {products} = await storefront.query(PRODUCTS_QUERY);
  
  return json({
    products: products.nodes
  });
}

export default function TestCartPage() {
  const {products} = useLoaderData();
  
  return (
    <div className="test-cart-page">
      <h1>Test Cart Functionality</h1>
      
      <div className="test-instructions">
        <p>This page demonstrates the new ReliableAddToCartButton component.</p>
        <p>Try adding products to your cart using the different button configurations below.</p>
      </div>
      
      <div className="test-products">
        {products.map((product) => {
          const variant = product.variants.nodes[0];
          
          return (
            <div key={product.id} className="test-product">
              <h2>{product.title}</h2>
              <p>{product.description}</p>
              
              <div className="test-buttons">
                <div className="button-test">
                  <h3>Standard Button</h3>
                  <ReliableAddToCartButton 
                    merchandiseId={variant.id}
                    quantity={1}
                  />
                </div>
                
                <div className="button-test">
                  <h3>Redirect to Cart</h3>
                  <ReliableAddToCartButton 
                    merchandiseId={variant.id}
                    quantity={1}
                    redirectToCart={true}
                    showSuccessMessage={false}
                  />
                </div>
                
                <div className="button-test">
                  <h3>Custom Styling</h3>
                  <ReliableAddToCartButton 
                    merchandiseId={variant.id}
                    quantity={1}
                    className="custom-button"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .test-cart-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .test-instructions {
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 8px;
        }
        
        .test-products {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .test-product {
          padding: 1.5rem;
          border: 1px solid #eee;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .test-buttons {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .button-test {
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 6px;
        }
        
        .button-test h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }
        
        .custom-button {
          background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%);
          border-radius: 30px;
          padding: 12px 24px;
        }
      `}</style>
    </div>
  );
}

const PRODUCTS_QUERY = `#graphql
  query TestProducts {
    products(first: 3) {
      nodes {
        id
        title
        description
        variants(first: 1) {
          nodes {
            id
            title
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
