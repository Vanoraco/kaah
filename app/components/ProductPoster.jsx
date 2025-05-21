import { useRef, useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { Image } from '@shopify/hydrogen';
import { formatPrice } from '~/lib/utils';

/**
 * ProductPoster Component
 * Displays a poster with multiple products and their prices
 * 
 * @param {Object} props - Component props
 * @param {Object} props.poster - The poster data
 * @param {boolean} [props.printable=false] - Whether to show print button
 * @returns {JSX.Element} The rendered component
 */
export function ProductPoster({ poster, printable = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const posterRef = useRef(null);
  
  // Set up visibility for animation
  useEffect(() => {
    setIsVisible(true);
    
    // Add scroll animation
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (posterRef.current) {
      observer.observe(posterRef.current);
    }

    return () => {
      if (posterRef.current) {
        observer.unobserve(posterRef.current);
      }
    };
  }, []);
  
  // Handle printing the poster
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-ups to print the poster');
      return;
    }
    
    // Create a simplified version of the poster for printing
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${poster.title} - Print</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: ${poster.backgroundColor};
              font-family: Arial, sans-serif;
            }
            .print-poster {
              width: 100%;
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
              box-sizing: border-box;
              position: relative;
              page-break-inside: avoid;
            }
            .print-poster-header {
              text-align: center;
              margin-bottom: 20px;
            }
            .print-poster-title {
              font-size: 36px;
              font-weight: bold;
              margin: 0;
            }
            .print-poster-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
            }
            .print-poster-item {
              background-color: white;
              border-radius: 10px;
              padding: 15px;
              text-align: center;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .print-poster-item-image {
              width: 100%;
              height: auto;
              max-height: 200px;
              object-fit: contain;
            }
            .print-poster-item-title {
              font-size: 18px;
              margin: 10px 0;
            }
            .print-poster-item-price {
              font-size: 24px;
              font-weight: bold;
              color: #e53935;
            }
            .print-poster-item-highlight {
              border: 3px solid #e53935;
            }
            .print-poster-item-label {
              position: absolute;
              top: 10px;
              right: 10px;
              background-color: #e53935;
              color: white;
              padding: 5px 10px;
              border-radius: 5px;
              font-weight: bold;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-poster">
            <div class="print-poster-header">
              <h1 class="print-poster-title">${poster.title}</h1>
              ${poster.effectiveDate && poster.expiryDate ? 
                `<p>Valid from ${poster.effectiveDate} to ${poster.expiryDate}</p>` : ''}
            </div>
            <div class="print-poster-grid">
              ${poster.posterItems.map(item => `
                <div class="print-poster-item ${item.highlight ? 'print-poster-item-highlight' : ''}">
                  ${item.customLabel ? `<div class="print-poster-item-label">${item.customLabel}</div>` : ''}
                  <img 
                    src="${item.product.featuredImage?.url}" 
                    alt="${item.product.title}" 
                    class="print-poster-item-image"
                  />
                  <h3 class="print-poster-item-title">${item.product.title}</h3>
                  <div class="print-poster-item-price">
                    ${formatPrice(item.customPrice || item.product.priceRange.minVariantPrice.amount, 
                      item.product.priceRange.minVariantPrice.currencyCode)}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  
  // If no poster data, show a message
  if (!poster || !poster.posterItems || poster.posterItems.length === 0) {
    return (
      <div className="product-poster-empty">
        <h2>No poster data available</h2>
      </div>
    );
  }
  
  // Determine the layout class based on the layout type
  const layoutClass = poster.layoutType === 'freestyle' ? 'product-poster-freestyle' : 'product-poster-grid';
  
  return (
    <div 
      className={`product-poster ${isVisible ? 'visible' : ''}`}
      ref={posterRef}
      style={{ backgroundColor: poster.backgroundColor }}
    >
      {/* Poster Header */}
      <div className="product-poster-header">
        <h2 className="product-poster-title">{poster.title}</h2>
        {poster.effectiveDate && poster.expiryDate && (
          <div className="product-poster-dates">
            Valid from {poster.effectiveDate} to {poster.expiryDate}
          </div>
        )}
        
        {/* Print Button */}
        {printable && (
          <button 
            className="product-poster-print-button"
            onClick={handlePrint}
            aria-label="Print Poster"
          >
            <i className="fas fa-print"></i> Print Poster
          </button>
        )}
      </div>
      
      {/* Poster Content */}
      <div className={`product-poster-content ${layoutClass}`}>
        {poster.posterItems.map((item, index) => (
          <div 
            key={item.id || `item-${index}`}
            className={`product-poster-item ${item.highlight ? 'highlight' : ''}`}
            style={{
              left: poster.layoutType === 'freestyle' ? `${item.positionX}%` : 'auto',
              top: poster.layoutType === 'freestyle' ? `${item.positionY}%` : 'auto',
              transform: poster.layoutType === 'freestyle' ? `scale(${item.size / 100})` : 'none',
              animationDelay: `${index * 0.1}s`
            }}
          >
            {/* Custom Label */}
            {item.customLabel && (
              <div className="product-poster-item-label">{item.customLabel}</div>
            )}
            
            {/* Product Image */}
            <Link to={`/products/${item.product.handle}`} className="product-poster-item-image-link">
              <div className="product-poster-item-image-container">
                {item.product.featuredImage ? (
                  <Image
                    data={item.product.featuredImage}
                    alt={item.product.title}
                    className="product-poster-item-image"
                    loading="lazy"
                    sizes="(min-width: 768px) 33vw, 50vw"
                  />
                ) : (
                  <div className="product-poster-item-image-placeholder">
                    <i className="fas fa-image"></i>
                  </div>
                )}
              </div>
            </Link>
            
            {/* Product Info */}
            <div className="product-poster-item-info">
              <h3 className="product-poster-item-title">{item.product.title}</h3>
              <div className="product-poster-item-price">
                {formatPrice(
                  item.customPrice || item.product.priceRange.minVariantPrice.amount,
                  item.product.priceRange.minVariantPrice.currencyCode
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
