import { memo } from 'react';
import PropTypes from 'prop-types';
import { adjustColor } from './utils/colorUtils';

/**
 * MegaSaver Banner Component
 * Displays the header banner for the MegaSaver section
 * 
 * @param {Object} props - Component props
 * @param {Object} props.banner - Banner data with title, subtitle, backgroundColor, textColor
 * @returns {JSX.Element} The rendered component
 */
function MegaSaverBanner({ banner }) {
  return (
    <div
      className="mega-saver-banner"
      style={{
        background: `linear-gradient(135deg, ${banner.backgroundColor} 0%, ${adjustColor(banner.backgroundColor, -30)} 100%)`,
        color: banner.textColor
      }}
    >
      <div className="mega-saver-banner-content">
        <h2 className="mega-saver-title">{banner.title}</h2>
        <p className="mega-saver-subtitle">{banner.subtitle}</p>
      </div>

      {/* Decorative elements for banner */}
      <div style={{
        position: 'absolute',
        top: '-15px',
        left: '-15px',
        width: '30px',
        height: '30px',
        background: adjustColor(banner.backgroundColor, -40),
        borderRadius: '50%',
        zIndex: 0
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '-10px',
        right: '-10px',
        width: '20px',
        height: '20px',
        background: adjustColor(banner.backgroundColor, -40),
        borderRadius: '50%',
        zIndex: 0
      }}></div>
    </div>
  );
}

MegaSaverBanner.propTypes = {
  banner: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    textColor: PropTypes.string.isRequired
  }).isRequired
};

export default memo(MegaSaverBanner);
