import {Link} from '@remix-run/react';

export function PromotionalBanners() {
  return (
    <div className="promotional-banners">
      <div className="banner">
        <h2>Banner 1</h2>
        <p>Description for banner 1.</p>
        <Link to="/collections/banner1">
          <button>Shop Now</button>
        </Link>
      </div>
      <div className="banner">
        <h2>Banner 2</h2>
        <p>Description for banner 2.</p>
        <Link to="/collections/banner2">
          <button>Shop Now</button>
        </Link>
      </div>
      <div className="banner">
        <h2>Banner 3</h2>
        <p>Description for banner 3.</p>
        <Link to="/collections/banner3">
          <button>Shop Now</button>
        </Link>
      </div>
    </div>
  );
}