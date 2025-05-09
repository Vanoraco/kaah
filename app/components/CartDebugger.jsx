import {useState} from 'react';

/**
 * A component to display debug information about the cart
 * @param {{
 *   cart: any;
 * }}
 */
export function CartDebugger({cart}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!cart) return null;
  
  const cartInfo = {
    id: cart.id,
    totalQuantity: cart.totalQuantity,
    lineCount: cart.lines?.nodes?.length || 0,
    checkoutUrl: cart.checkoutUrl,
    cost: cart.cost,
    lines: cart.lines?.nodes?.map(line => ({
      id: line.id,
      quantity: line.quantity,
      merchandise: {
        id: line.merchandise?.id,
        title: line.merchandise?.title,
        product: {
          title: line.merchandise?.product?.title,
          handle: line.merchandise?.product?.handle
        }
      }
    }))
  };
  
  return (
    <div className="cart-debugger">
     {/*<button 
        className="debug-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Hide' : 'Show'} Cart Debug Info
      </button> 
      
      {isExpanded && (
        <div className="debug-content">
          <h3>Cart Summary</h3>
          <ul>
            <li><strong>Cart ID:</strong> {cart.id || 'No ID'}</li>
            <li><strong>Total Quantity:</strong> {cart.totalQuantity || 0}</li>
            <li><strong>Line Count:</strong> {cart.lines?.nodes?.length || 0}</li>
          </ul>
          
          <h3>Cart Lines</h3>
          {cart.lines?.nodes?.length > 0 ? (
            <ul>
              {cart.lines.nodes.map((line, index) => (
                <li key={line.id || index}>
                  <strong>Line {index + 1}:</strong>
                  <ul>
                    <li>ID: {line.id || 'No ID'}</li>
                    <li>Quantity: {line.quantity || 0}</li>
                    <li>Merchandise ID: {line.merchandise?.id || 'No merchandise ID'}</li>
                    <li>Title: {line.merchandise?.title || 'No title'}</li>
                    <li>Product: {line.merchandise?.product?.title || 'No product'}</li>
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p>No items in cart</p>
          )}
          
          <h3>Raw Cart Data</h3>
          <pre>{JSON.stringify(cart, null, 2)}</pre>
        </div>
      )}
      
      <style jsx>{`
        .cart-debugger {
          margin-top: 2rem;
          padding: 1rem;
          border: 1px dashed #ccc;
          border-radius: 8px;
          background: #f9f9f9;
        }
        
        .debug-toggle {
          background: #eee;
          border: 1px solid #ddd;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .debug-content {
          margin-top: 1rem;
          padding: 1rem;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 4px;
        }
        
        pre {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          overflow: auto;
          max-height: 300px;
          font-size: 12px;
        }
      `}</style>
      */}
    </div> 
  );
}
