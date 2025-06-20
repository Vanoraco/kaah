import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from '@remix-run/react';
import favicon from '~/assets/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {COLLECTIONS_QUERY} from '~/lib/queries';
import {ONLINE_SALES_CONTROL_QUERY} from '~/lib/banner-queries';
import {SOCIAL_MEDIA_QUERY} from '~/lib/social-media-queries';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import homeStyles from '~/styles/home.css?url';
import headerStyles from '~/styles/header.css?url';
import navigationStyles from '~/styles/navigation.css?url';
import productDetailStyles from '~/styles/product-detail.css?url';
import productFormStyles from '~/styles/product-form.css?url';
import responsiveStyles from '~/styles/responsive.css?url';
import slideShowStyles from '~/styles/slide-show.css?url';
import promotionStyles from '~/styles/promobanner.css?url';
import collectionStyles from '~/styles/collection.css?url';
import emptyCollectionStyles from '~/styles/empty-collection.css?url';
import customFooterStyles from '~/styles/custom-footer.css?url';
import notFoundStyles from '~/styles/not-found.css?url';
import productsStyles from '~/styles/products.css?url';
import searchDropdownStyles from '~/styles/search-dropdown.css?url';
import searchResultsStyles from '~/styles/search-results.css?url';
import cartStyles from '~/styles/cart.css?url';
import accountStyles from '~/styles/account.css?url';
import cartAssociationStyles from '~/styles/cart-association.css?url';
import hamperDetailStyles from '~/styles/hamper-detail.css?url';
import hampersPageStyles from '~/styles/hampers-page.css?url';
import allProductsStyles from '~/styles/all-products.css?url';
import asideStyles from '~/styles/aside.css?url';
import locationsStyles from '~/styles/locations.css?url';
import productPosterStyles from '~/styles/product-poster.css?url';
import posterOverlayStyles from '~/styles/poster-overlay.css?url';
import compactPosterStyles from '~/styles/compact-poster.css?url';
import promotionalPosterStyles from '~/styles/promotional-poster.css?url';
import onlineSalesBannerStyles from '~/styles/online-sales-banner.css?url';
import {PageLayout} from './components/PageLayout';
import variablesStyles from '~/styles/variables.css?url';
import {NotFound} from './components/NotFound';
import {createOrganizationSchema, createWebsiteSchema} from '~/lib/seo';
import {StructuredData} from '~/components/StructuredData';
import {OnlineSalesNotificationBanner} from './components/OnlineSalesNotificationBanner';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl, defaultShouldRevalidate, formAction, actionResult}) => {
  // Always revalidate after cart actions for immediate feedback
  if (formAction && formAction.includes('/cart') && actionResult) {
    return true;
  }

  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Don't revalidate on cart page to prevent unnecessary refreshes
  // unless it's a direct navigation to the cart page
  if (nextUrl.pathname === '/cart' && currentUrl.pathname === '/cart') {
    return false;
  }

  // For other pages, use the default behavior
  return defaultShouldRevalidate;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const {context, request} = args;

  try {
    // Check if user is returning from checkout and handle cart clearing
    const { isReturningFromCheckout, handleCheckoutReturn } = await import('~/lib/checkoutRedirect');

    if (isReturningFromCheckout(request)) {
      console.log('Root loader: User returning from checkout, handling cart synchronization');
      const result = await handleCheckoutReturn(context, request);
      if (result.success && result.cartSynced) {
        console.log('Root loader: Cart synchronized successfully');
      }
    }
  } catch (error) {
    console.error('Error handling checkout return:', error);
    // Continue with the loader even if there's an error handling checkout return
  }

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  const [header, collectionsData, onlineSalesControlData, socialMediaData] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    storefront.query(COLLECTIONS_QUERY, {
      cache: storefront.CacheNone(),
    }),
    // Fetch online sales control settings
    storefront.query(ONLINE_SALES_CONTROL_QUERY, {
      cache: storefront.CacheShort(), // Cache for a short time since this controls site functionality
    }).catch(() => ({ metaobjects: { nodes: [] } })), // Graceful fallback if metaobject doesn't exist
    // Fetch social media links
    storefront.query(SOCIAL_MEDIA_QUERY, {
      cache: storefront.CacheLong(), // Cache for a long time since social media links don't change often
    }).catch(() => ({ metaobjects: { nodes: [] } })), // Graceful fallback if metaobject doesn't exist
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    header,
    collections: collectionsData.collections,
    onlineSalesControl: onlineSalesControlData,
    socialMedia: socialMediaData
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');

  // Create site-wide structured data
  const organizationSchema = createOrganizationSchema();
  const websiteSchema = createWebsiteSchema();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kaah Supermarket" />
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <link rel="stylesheet" href={homeStyles}></link>
        <link rel="stylesheet" href={headerStyles}></link>
        <link rel="stylesheet" href={navigationStyles}></link>
        <link rel="stylesheet" href={slideShowStyles}></link>
        <link rel="stylesheet" href={promotionStyles}></link>
        <link rel="stylesheet" href={productDetailStyles}></link>
        <link rel="stylesheet" href={productFormStyles}></link>
        <link rel="stylesheet" href={responsiveStyles}></link>
        <link rel="stylesheet" href={emptyCollectionStyles}></link>
        <link rel="stylesheet" href={collectionStyles}></link>
        <link rel="stylesheet" href={customFooterStyles}></link>
        <link rel="stylesheet" href={notFoundStyles}></link>
        <link rel="stylesheet" href={productsStyles}></link>
        <link rel="stylesheet" href={searchDropdownStyles}></link>
        <link rel="stylesheet" href={searchResultsStyles}></link>
        <link rel="stylesheet" href={variablesStyles}></link>
        <link rel="stylesheet" href={cartStyles}></link>
        <link rel="stylesheet" href={accountStyles}></link>
        <link rel="stylesheet" href={cartAssociationStyles}></link>
        <link rel="stylesheet" href={hamperDetailStyles}></link>
        <link rel="stylesheet" href={hampersPageStyles}></link>
        <link rel="stylesheet" href={allProductsStyles}></link>
        <link rel="stylesheet" href={asideStyles}></link>
        <link rel="stylesheet" href={locationsStyles}></link>
        <link rel="stylesheet" href={productPosterStyles}></link>
        <link rel="stylesheet" href={posterOverlayStyles}></link>
        <link rel="stylesheet" href={compactPosterStyles}></link>
        <link rel="stylesheet" href={promotionalPosterStyles}></link>
        <link rel="stylesheet" href={onlineSalesBannerStyles}></link>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <Meta />
        <Links />
        {/* Site-wide structured data */}
        <StructuredData schema={organizationSchema} />
        <StructuredData schema={websiteSchema} />
      </head>
      <body>
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <OnlineSalesNotificationBanner />
            <PageLayout {...data}>{children}</PageLayout>
          </Analytics.Provider>
        ) : (
          children
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;

    // Return custom 404 page for not found errors
    if (errorStatus === 404) {
      return (
        <html lang="en">
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <link rel="stylesheet" href={resetStyles}></link>
            <link rel="stylesheet" href={appStyles}></link>
            <link rel="stylesheet" href={homeStyles}></link>
            <link rel="stylesheet" href={customFooterStyles}></link>
            <link rel="stylesheet" href={notFoundStyles}></link>
            <link rel="stylesheet" href={productsStyles}></link>
            <link rel="stylesheet" href={searchResultsStyles}></link>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            <title>Page Not Found - Kaah</title>
            <Meta />
            <Links />
          </head>
          <body>
            <NotFound />
            <ScrollRestoration />
            <Scripts />
          </body>
        </html>
      );
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@remix-run/react').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
