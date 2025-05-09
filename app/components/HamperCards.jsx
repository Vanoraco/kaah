import {Link} from '@remix-run/react';

export function HamperCards({hamperMetaobjects, showViewAllButton = true}) {
  // Ensure hamperMetaobjects has nodes property to prevent errors
  const hampers = hamperMetaobjects?.nodes || [];

 

  return (
    <div className="hamper-cards">
      <div className="hamper-header-wrapper">
        <div className="hamper-header-inner">
          <div className="hamper-header-content">
            <div className="hamper-header-top">
              <span className="hamper-label">Exclusive Offers</span>
            </div>
            <h2 className="hamper-heading">Special Hampers</h2>
            <div className="hamper-header-bottom">
              <span className="hamper-divider"></span>
            </div>
          </div>
        </div>
      </div>

      <div className="hamper-container">
        <div className="hamper-grid">
          {hampers.length > 0 ? (
            hampers.map((hamper) => {
              const name = hamper.fields.find((field) => field.key === 'name')?.value;
              const price = hamper.fields.find((field) => field.key === 'price')?.value;
              const image = hamper.fields.find((field) => field.key === 'image')?.reference?.image?.url;

              // Get products field
              const productsField = hamper.fields.find((field) => field.key === 'products');
              const products = productsField?.value;

              // Get product references if available
              const productReferences = productsField?.references?.nodes || [];

              // Check for direct product reference
              const directProductReference = productsField?.reference;

            

            



              // If we have product references, use those
              let productsList = [];

              if (productReferences.length > 0) {
                // We have product references from the API, use their titles
                productsList = productReferences.map(product => product.title);
               
              }
              // Check for direct product reference
              else if (directProductReference && directProductReference.title) {
                productsList = [directProductReference.title];
                
              }
              // Fallback to parsing the products value
              else {
                try {
                  if (products) {
                    
                    // First try to parse as JSON
                    const parsedProducts = JSON.parse(products);

                    // Check if the parsed products are product IDs (starting with gid://)
                    // and extract just the product name if possible
                    productsList = parsedProducts.map(product => {
                      if (typeof product === 'string') {
                        if (product.startsWith('gid://shopify/Product/')) {
                          // Extract product ID from the GID
                          const productId = product.split('/').pop();



                          return productMap[productId] || `Product ${productId.slice(-4)}`;
                        }
                        return product; // Already a product name
                      }
                      return "Product"; // Fallback
                    });
                   
                  }
                } catch (e) {
                  console.error(`Error parsing products for hamper ${name}:`, e);
                }
              }

              return (
                <div key={hamper.id} className="hamper-card">
                  <div className="hamper-image-container">
                    {image ? (
                      <img src={image} alt={name} className="hamper-image" />
                    ) : (
                      <div className="hamper-placeholder">
                        <i className="fas fa-gift"></i>
                      </div>
                    )}
                    <div className="hamper-badge">Special</div>
                  </div>

                  <div className="hamper-content">
                    <h3 className="hamper-title">{name}</h3>

                    {productsList.length > 0 && (
                      <div className="hamper-products">
                        <h4>Includes:</h4>
                        <ul>
                          {productsList.slice(0, 3).map((product, index) => (
                            <li key={index}>{product}</li>
                          ))}
                          {productsList.length > 3 && (
                            <li className="more-items">+{productsList.length - 3} more items</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="hamper-price">
                      <span className="price-value">R {price}</span>
                    </div>

                    
                    {/* Extract numeric ID from the GID for cleaner URLs */}
                    {(() => {
                      // Extract the numeric ID from the GID
                      const matches = hamper.id.match(/\/(\d+)(?:-\d+)?$/);
                      const numericId = matches && matches[1] ? matches[1] : '';
                      // Create a URL-friendly handle from the name
                      const nameHandle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                      // Combine for a clean URL: /hampers/numeric-id-name-handle
                      const cleanUrl = `/hampers/${numericId}-${nameHandle}`;
                      
                      return (
                        <Link
                          to={cleanUrl}
                          className="hamper-button"
                          
                        >
                      <span className="button-text">Shop Now</span>
                      <span className="button-icon">
                        <i className="fas fa-arrow-right"></i>
                      </span>
                    </Link>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-hampers">
              <div className="no-hampers-icon">
                <i className="fas fa-box-open"></i>
              </div>
              <p>No special hampers available at the moment. Please check back later!</p>
            </div>
          )}
        </div>

        {/* View All Hampers Button - only show when there are hampers and showViewAllButton is true */}
        {hampers.length > 0 && showViewAllButton && (
          <div className="view-all-collections-container">
            <Link to="/hampers" className="view-all-products-button">
              <span className="view-all-text">
                <i className="fas fa-gift" style={{ marginRight: '8px' }}></i>
                View All Hampers
              </span>
              <span className="view-all-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
