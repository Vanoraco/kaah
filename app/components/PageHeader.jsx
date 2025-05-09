import React from 'react';

/**
 * A reusable page header component with heading and optional subheading
 * 
 * @param {Object} props
 * @param {string} props.heading - The main heading text
 * @param {string} [props.subheading] - Optional subheading text
 * @param {string} [props.className] - Optional additional CSS class
 * @returns {JSX.Element}
 */
export function PageHeader({ heading, subheading, className = '' }) {
  return (
    <div className={`page-header ${className}`}>
      <div className="page-header-content">
        <h1 className="page-heading">{heading}</h1>
        {subheading && <p className="page-subheading">{subheading}</p>}
      </div>
    </div>
  );
}
