import {Link} from '@remix-run/react';

export function ShopByTopCategories() {
  return (
    <div className="shop-by-top-categories">
      <h2>Shop by Top Categories</h2>
      <div className="categories-grid">
        <Link to="/collections/category1" className="category">
          <h3>Category 1</h3>
        </Link>
        <Link to="/collections/category2" className="category">
          <h3>Category 2</h3>
        </Link>
        <Link to="/collections/category3" className="category">
          <h3>Category 3</h3>
        </Link>
      </div>
    </div>
  );
}