import {Image} from '@shopify/hydrogen';

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export function ProductImage({image}) {
  if (!image) {
    return <div className="product-image" />;
  }
  return (
    <div className="product-image">
      {image.url ? (
        <img
          src={image.url}
          alt={image.altText || 'Product Image'}
          className="product-img"
          loading="eager"
        />
      ) : (
        <Image
          alt={image.altText || 'Product Image'}
          data={image}
          key={image.id}
          sizes="(min-width: 45em) 50vw, 100vw"
          className="product-img"
          loading="eager"
        />
      )}
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
