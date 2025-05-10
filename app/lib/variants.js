import {useLocation} from '@remix-run/react';
import {useMemo} from 'react';

/**
 * @param {string} handle
 * @param {SelectedOption[]} [selectedOptions]
 * @param {Object} [product] - Optional product object to find Original Price variant
 */
export function useVariantUrl(handle, selectedOptions, product) {
  const {pathname} = useLocation();

  return useMemo(() => {
    // If we have a product object, try to find the Original Price variant
    if (product && product.options) {
      // Find the Price option if it exists
      const priceOption = product.options.find(option => option.name === 'Price');

      if (priceOption) {
        // Find the Original Price option value
        const originalPriceOptionValue = priceOption.optionValues.find(
          value => value.name === 'Original Price'
        );

        // If we found an Original Price option value and it has a variant, use its options
        if (originalPriceOptionValue?.firstSelectableVariant?.selectedOptions) {
          console.log(`Found Original Price variant for ${handle}, using it for URL`);
          selectedOptions = originalPriceOptionValue.firstSelectableVariant.selectedOptions;
        }
      }
    }

    return getVariantUrl({
      handle,
      pathname,
      searchParams: new URLSearchParams(),
      selectedOptions,
    });
  }, [handle, selectedOptions, pathname, product]);
}

/**
 * @param {{
 *   handle: string;
 *   pathname: string;
 *   searchParams: URLSearchParams;
 *   selectedOptions?: SelectedOption[];
 * }}
 */
export function getVariantUrl({
  handle,
  pathname,
  searchParams,
  selectedOptions,
}) {
  const match = /(\/[a-zA-Z]{2}-[a-zA-Z]{2}\/)/g.exec(pathname);
  const isLocalePathname = match && match.length > 0;

  const path = isLocalePathname
    ? `${match[0]}products/${handle}`
    : `/products/${handle}`;

  selectedOptions?.forEach((option) => {
    // Skip adding the Price parameter to the URL
    if (option.name !== 'Price') {
      searchParams.set(option.name, option.value);
    }
  });

  const searchString = searchParams.toString();

  return path + (searchString ? '?' + searchParams.toString() : '');
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').SelectedOption} SelectedOption */
