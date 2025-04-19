import {Link} from '@remix-run/react';

export function MainBanner() {
  return (
    <div className="main-banner">
      <h1>Fresh & Healthy Organic Food</h1>
      <p>Discover the best organic products for a healthier lifestyle.</p>
      <Link to="/collections/all-products">
        <button>Shop Now</button>
      </Link>
    </div>
  );
}