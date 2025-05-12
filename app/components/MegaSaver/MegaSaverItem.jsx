import { Link } from '@remix-run/react';
import { memo } from 'react';
import PropTypes from 'prop-types';
import { ICONS, DEFAULT_VALUES } from './utils/dataUtils';
import { adjustColor, calculateSavings } from './utils/colorUtils';
import AddToCartButton from './AddToCartButton';

/**
 * MegaSaver Item Component
 * Displays an individual product item in the MegaSaver grid
 * 
 * @param {Object} props - Component props
 * @param {Object} props.item - The item data to display
 * @param {boolean} props.isVisible - Whether the item should be visible (for animation)
 * @returns {JSX.Element} The rendered component
 */
function MegaSaverItem({ item, isVisible }) {
  const savingsPercent = calculateSavings(item.price, item.originalPrice);

  return (
    <div
      key={item.id}
      className="mega-saver-item"
      style={{
        animationDelay: '0s',
        animation: isVisible ? 'fadeInUpBounce 0.6s ease forwards' : 'none'
      }}
    >
      <div className="mega-saver-item-inner">
        {item.specialText && (
          <div className="mega-saver-special-text">
            <span className="mega-saver-offer-icon">{ICONS.SPECIAL}</span>
            <span>{item.specialText}</span>
            <div className="shine-effect"></div>
          </div>
        )}

        {savingsPercent && !item.specialText && (
          <div className="mega-saver-special-text" style={{
            background: `linear-gradient(135deg, ${DEFAULT_VALUES.HIGHLIGHT_COLOR} 0%, ${adjustColor(DEFAULT_VALUES.HIGHLIGHT_COLOR, -30)} 100%)`
          }}>
            <span className="mega-saver-offer-icon">{ICONS.SAVINGS}</span>
            <span>SAVE {savingsPercent}%</span>
            <div className="shine-effect"></div>
          </div>
        )}

        <Link to={item.link} className="mega-saver-item-link">
          <div className="mega-saver-image-container">
            <div className="mega-saver-image-wrapper">
              <img
                src={item.image}
                alt={item.title}
                className="mega-saver-image"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_VALUES.FALLBACK_IMAGE;
                }}
              />
            </div>
          </div>
          <div className="mega-saver-content">
            <div className="mega-saver-brand">{item.brand}</div>
            <h3 className="mega-saver-item-title">{item.title}</h3>
            <div className="mega-saver-price-container">
              {savingsPercent && (
                <div className="mega-saver-save-badge">Save {savingsPercent}%</div>
              )}
              <div className="mega-saver-price-row">
                <span className="mega-saver-price">{item.price}</span>
                {item.originalPrice && (
                  <span className="mega-saver-original-price">{item.originalPrice}</span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Add to Cart Button */}
        <div className="mega-saver-actions">
          <AddToCartButton
            item={item}
            quantity={item.specialText && item.specialText.includes("BUY 2") ? 2 :
                     item.specialText && item.specialText.includes("BUY 3") ? 3 : 1}
          />
        </div>
      </div>
    </div>
  );
}

MegaSaverItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    brand: PropTypes.string,
    price: PropTypes.string.isRequired,
    originalPrice: PropTypes.string,
    specialText: PropTypes.string,
    image: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    variantId: PropTypes.string,
    specialOffer: PropTypes.string,
    quantity: PropTypes.number,
    availableForSale: PropTypes.bool,
    quantityAvailable: PropTypes.number
  }).isRequired,
  isVisible: PropTypes.bool.isRequired
};

export default memo(MegaSaverItem);
