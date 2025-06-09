import {Link, useNavigate, useRouteLoaderData} from '@remix-run/react';
import {AddToCartButton} from './AddToCartButton';
import {SimpleAddToCartButton} from './SimpleAddToCartButton';
import {useAside} from './Aside';
import {useOnlineSalesStatus, getDisabledButtonProps} from '~/lib/onlineSalesControl';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 *   analytics?: unknown;
 * }}
 */
export function ProductForm({productOptions, selectedVariant, analytics}) {
  const navigate = useNavigate();
  const {open} = useAside();

  // Get root data for online sales status
  const rootData = useRouteLoaderData('root');
  const isOnlineSalesEnabled = useOnlineSalesStatus(rootData);

  // Get disabled button props based on online sales status and stock
  const isInStock = selectedVariant && selectedVariant.availableForSale;
  const disabledProps = getDisabledButtonProps(isOnlineSalesEnabled, isInStock);
  return (
    <div className="product-form">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options" key={option.name}>
            <h5>{option.name}</h5>
            <div className="product-options-grid">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                if (isDifferentProduct) {
                  // SEO
                  // When the variant is a combined listing child product
                  // that leads to a different url, we need to render it
                  // as an anchor tag
                  return (
                    <Link
                      className="product-options-item"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={{
                        border: selected
                          ? '1px solid black'
                          : '1px solid transparent',
                        opacity: available ? 1 : 0.3,
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  // SEO
                  // When the variant is an update to the search param,
                  // render it as a button with javascript navigating to
                  // the variant so that SEO bots do not index these as
                  // duplicated links
                  return (
                    <button
                      type="button"
                      className={`product-options-item${
                        exists && !selected ? ' link' : ''
                      }`}
                      key={option.name + name}
                      style={{
                        border: selected
                          ? '1px solid black'
                          : '1px solid transparent',
                        opacity: available ? 1 : 0.3,
                      }}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
            <br />
          </div>
        );
      })}

      <div className="product-form-buttons">
        {selectedVariant && selectedVariant.availableForSale ? (
          <>
            <SimpleAddToCartButton
              merchandiseId={selectedVariant.id}
              quantity={1}
            />

            <button
              className={`buy-now-button ${disabledProps.className}`}
              onClick={() => {
                // Don't proceed if online sales are disabled
                if (!isOnlineSalesEnabled) {
                  return;
                }
                // Redirect to cart page for checkout
                window.location.href = '/cart';
              }}
              disabled={disabledProps.disabled}
              title={disabledProps.title}
            >
              <span>{disabledProps.text || 'Buy Now'}</span>
              <i className="fas fa-bolt"></i>
            </button>
          </>
        ) : (
          <button
            className="add-to-cart-button"
            disabled={true}
          >
            <span className="add-to-cart-text">Sold out</span>
            <i className="fas fa-shopping-cart"></i>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * @param {{
 *   swatch?: Maybe<ProductOptionValueSwatch> | undefined;
 *   name: string;
 * }}
 */
function ProductOptionSwatch({swatch, name}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
