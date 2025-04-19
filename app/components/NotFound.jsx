import {Link} from '@remix-run/react';

export function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-status">404</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-message">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-button primary">
            Back to Home
          </Link>
          <Link to="/collections/all" className="not-found-button secondary">
            Browse Products
          </Link>
        </div>
      </div>
      <div className="not-found-illustration">
        <div className="not-found-image"></div>
      </div>
    </div>
  );
}
