import {Await, Link} from '@remix-run/react';
import React, {Suspense, useId, useEffect, useCallback, memo, useState} from 'react';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

/**
 * Custom hook to handle URL parameter cleanup
 * @param {string[]} preserveParams - Parameters to preserve
 * @returns {void}
 */
function useUrlCleanup(preserveParams = ['nocache', 'refresh', 'q']) {
  useEffect(() => {
    const cleanupUrl = async () => {
      try {
        const {cleanupUrlParameters} = await import('~/lib/urlUtils');
        cleanupUrlParameters(preserveParams);
      } catch (error) {
        console.error('Error importing URL utilities:', error);
      }
    };

    cleanupUrl();
  }, [preserveParams]);
}

/**
 * Custom hook to handle checkout return
 * @returns {void}
 */
function useCheckoutReturn() {
  useEffect(() => {
    const handleCheckoutReturn = async () => {
      try {
        const {handleCheckoutReturnClient} = await import('~/lib/checkoutRedirect');
        handleCheckoutReturnClient();
      } catch (error) {
        console.error('Error importing checkout redirect utilities:', error);
      }
    };

    handleCheckoutReturn();
  }, []);
}

/**
 * Custom hook to manage page layout functionality
 * @returns {void}
 */
function usePageLayout() {
  // Handle URL cleanup
  useUrlCleanup();

  // Handle checkout return
  useCheckoutReturn();
}

/**
 * Main content component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Main content component
 */
const MainContent = memo(({children}) => {
  return (
    <main
      className="page-main-content"
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        padding: '0 0 150px 0',
        boxSizing: 'border-box',
        overflow: 'visible',
        position: 'relative',
        zIndex: 1,
        minHeight: 'calc(100vh - 300px)'
      }}
    >
      {children}
    </main>
  );
});

MainContent.displayName = 'MainContent';

/**
 * Cart error fallback component
 * @returns {JSX.Element} Cart error fallback
 */
function CartErrorFallback() {
  return (
    <div className="cart-error">
      <p>There was a problem loading your cart.</p>
      <button
        onClick={() => window.location.reload()}
        className="cart-error-button"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Cart aside component
 * @param {Object} props - Component props
 * @param {Promise<CartApiQueryFragment|null>} props.cart - Cart data
 * @returns {JSX.Element} Cart aside component
 */
const CartAside = memo(({cart}) => {
  return (
    <Aside type="cart" heading="CART">
      <ErrorBoundary fallback={<CartErrorFallback />}>
        <Suspense fallback={<CartLoadingFallback />}>
          <Await resolve={cart}>
            {(cart) => <CartMain cart={cart} layout="aside" />}
          </Await>
        </Suspense>
      </ErrorBoundary>
    </Aside>
  );
});

CartAside.displayName = 'CartAside';

/**
 * Cart loading fallback component
 * @returns {JSX.Element} Cart loading fallback
 */
function CartLoadingFallback() {
  return (
    <div className="cart-loading">
      <p>Loading cart...</p>
    </div>
  );
}

/**
 * Search input component
 * @param {Object} props - Component props
 * @param {Function} props.fetchResults - Function to fetch search results
 * @param {Function} props.goToSearch - Function to navigate to search page
 * @param {React.RefObject} props.inputRef - Reference to input element
 * @param {string} props.queriesDatalistId - ID for datalist element
 * @returns {JSX.Element} Search input component
 */
function SearchInput({fetchResults, goToSearch, inputRef, queriesDatalistId}) {
  return (
    <div className="search-input-container">
      <input
        name="q"
        onChange={fetchResults}
        onFocus={fetchResults}
        placeholder="Search"
        ref={inputRef}
        type="search"
        list={queriesDatalistId}
        aria-label="Search products"
        className="search-input"
      />
      <button
        onClick={goToSearch}
        className="search-button"
        aria-label="Submit search"
      >
        Search
      </button>
    </div>
  );
}

/**
 * Search results component
 * @param {Object} props - Component props
 * @param {Object} props.items - Search result items
 * @param {number} props.total - Total number of results
 * @param {Object} props.term - Search term
 * @param {string} props.state - Search state
 * @param {Function} props.closeSearch - Function to close search
 * @param {string} props.queriesDatalistId - ID for datalist element
 * @returns {JSX.Element} Search results component
 */
function SearchResults({items, total, term, state, closeSearch, queriesDatalistId}) {
  const {articles, collections, pages, products, queries} = items;

  if (state === 'loading' && term.current) {
    return <div className="search-loading">Loading...</div>;
  }

  if (!total) {
    return <SearchResultsPredictive.Empty term={term} />;
  }

  return (
    <div className="search-results-container">
      <SearchResultsPredictive.Queries
        queries={queries}
        queriesDatalistId={queriesDatalistId}
      />
      <SearchResultsPredictive.Products
        products={products}
        closeSearch={closeSearch}
        term={term}
      />
      <SearchResultsPredictive.Collections
        collections={collections}
        closeSearch={closeSearch}
        term={term}
      />
      <SearchResultsPredictive.Pages
        pages={pages}
        closeSearch={closeSearch}
        term={term}
      />
      <SearchResultsPredictive.Articles
        articles={articles}
        closeSearch={closeSearch}
        term={term}
      />
      {term.current && total ? (
        <Link
          onClick={closeSearch}
          to={`${SEARCH_ENDPOINT}?q=${term.current}`}
          className="view-all-results"
        >
          <p>
            View all results for <q>{term.current}</q>
            &nbsp; →
          </p>
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Search error fallback component
 * @returns {JSX.Element} Search error fallback
 */
function SearchErrorFallback() {
  return (
    <div className="search-error">
      <p>There was a problem loading the search functionality.</p>
      <button
        onClick={() => window.location.reload()}
        className="search-error-button"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Search aside component
 * @returns {JSX.Element} Search aside component
 */
const SearchAside = memo(() => {
  const queriesDatalistId = useId();

  return (
    <Aside type="search" heading="SEARCH">
      <ErrorBoundary fallback={<SearchErrorFallback />}>
        <div className="predictive-search">
          <SearchFormPredictive>
            {({fetchResults, goToSearch, inputRef}) => (
              <SearchInput
                fetchResults={fetchResults}
                goToSearch={goToSearch}
                inputRef={inputRef}
                queriesDatalistId={queriesDatalistId}
              />
            )}
          </SearchFormPredictive>

          <SearchResultsPredictive>
            {(searchProps) => (
              <SearchResults
                {...searchProps}
                queriesDatalistId={queriesDatalistId}
              />
            )}
          </SearchResultsPredictive>
        </div>
      </ErrorBoundary>
    </Aside>
  );
});

SearchAside.displayName = 'SearchAside';

/**
 * Mobile menu error fallback component
 * @returns {JSX.Element} Mobile menu error fallback
 */
function MobileMenuErrorFallback() {
  return (
    <div className="mobile-menu-error">
      <p>There was a problem loading the menu.</p>
      <button
        onClick={() => window.location.reload()}
        className="mobile-menu-error-button"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Mobile menu aside component
 * @param {Object} props - Component props
 * @param {HeaderQuery} props.header - Header data
 * @param {string} props.publicStoreDomain - Public store domain
 * @returns {JSX.Element|null} Mobile menu aside component
 */
const MobileMenuAside = memo(({header, publicStoreDomain}) => {
  if (!header.menu || !header.shop.primaryDomain?.url) {
    return null;
  }

  return (
    <Aside type="mobile" heading="MENU">
      <ErrorBoundary fallback={<MobileMenuErrorFallback />}>
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </ErrorBoundary>
    </Aside>
  );
});

MobileMenuAside.displayName = 'MobileMenuAside';

/**
 * Error boundary component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {React.ReactNode} props.fallback - Fallback UI
 * @returns {JSX.Element} Error boundary component
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Page layout error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Aside components container
 * @param {Object} props - Component props
 * @param {Promise<CartApiQueryFragment|null>} props.cart - Cart data
 * @param {HeaderQuery} props.header - Header data
 * @param {string} props.publicStoreDomain - Public store domain
 * @returns {JSX.Element} Aside components container
 */
function AsideComponents({cart, header, publicStoreDomain}) {
  return (
    <>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
    </>
  );
}

/**
 * Page layout component
 * @param {PageLayoutProps} props - Component props
 * @returns {JSX.Element} Page layout component
 */
export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  collections,
}) {
  // Use the page layout hook
  usePageLayout();

  return (
    <ErrorBoundary>
      <Aside.Provider>
        <AsideComponents
          cart={cart}
          header={header}
          publicStoreDomain={publicStoreDomain}
        />

        {header && (
          <Header
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
            collections={collections}
          />
        )}

        <MainContent>{children}</MainContent>

        <Footer
          footer={footer}
          header={header}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside.Provider>
    </ErrorBoundary>
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
