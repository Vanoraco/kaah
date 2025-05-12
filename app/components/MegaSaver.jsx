/**
 * MegaSaver Component
 *
 * This file is a wrapper around the modular MegaSaver implementation.
 * It imports and re-exports the MegaSaver component from the MegaSaver directory.
 *
 * This approach maintains backward compatibility while allowing for a more
 * modular and maintainable codebase.
 */

import { MegaSaver as ModularMegaSaver } from './MegaSaver/index';

/**
 * MegaSaver Component
 * Displays a grid of special offer products with a banner
 *
 * @param {Object} props - Component props
 * @param {Object} props.megaSaverItems - Metaobjects data for mega saver items
 * @param {Object} props.megaSaverBanner - Metaobjects data for mega saver banner
 * @param {boolean} [props.showViewMoreButton=true] - Whether to show the "View More" button
 * @returns {JSX.Element} The rendered component
 */
export function MegaSaver(props) {
  return <ModularMegaSaver {...props} />;
}

export default MegaSaver;
