import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 * @param {Class<Pagination<NodesType>>['connection']>}
 */
export function PaginatedResourceSection({
  connection,
  children,
  resourcesClassName,
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        // Check if there are no products in the collection
        if (nodes.length === 0 && !isLoading) {
          return (
            <div className="empty-collection-container">
              <div className="empty-collection-message">
                <h2>No products available at the moment</h2>
                <p>We're working on adding new products to this collection.</p>
                <p>Please come back later or check out our other collections.</p>
                <div className="empty-collection-actions">
                  <Link to="/collections" className="empty-collection-button">
                    Browse Collections
                  </Link>
                  <Link to="/" className="empty-collection-button secondary">
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          );
        }

        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}

            <div className="pagination-controls">
              <PreviousLink className="pagination-link">
                {isLoading ? (
                  <span className="loading">
                    <i className="fas fa-spinner fa-spin"></i> Loading...
                  </span>
                ) : (
                  <span>
                    <i className="fas fa-chevron-left"></i> Previous
                  </span>
                )}
              </PreviousLink>

              <NextLink className="pagination-link">
                {isLoading ? (
                  <span className="loading">
                    <i className="fas fa-spinner fa-spin"></i> Loading...
                  </span>
                ) : (
                  <span>
                    Next <i className="fas fa-chevron-right"></i>
                  </span>
                )}
              </NextLink>
            </div>
          </div>
        );
      }}
    </Pagination>
  );
}
