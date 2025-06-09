/**
 * StructuredData component for adding JSON-LD structured data to pages
 * This component should be used in route components to add structured data
 */

import { generateJsonLdString } from '~/lib/seo';

/**
 * StructuredData component that renders JSON-LD script tags
 * @param {Object} props - Component props
 * @param {Object|Array} props.schema - Schema object or array of schemas
 * @returns {JSX.Element|null} Script tag with JSON-LD or null
 */
export function StructuredData({ schema }) {
  const jsonLd = generateJsonLdString(schema);
  
  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

/**
 * Hook to get structured data for the current route
 * This can be used in route components to add structured data
 */
export function useStructuredData() {
  return {
    StructuredData,
    generateJsonLdString
  };
}
