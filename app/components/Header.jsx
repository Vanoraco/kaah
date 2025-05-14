import {Suspense, useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {SearchDropdown} from '~/components/SearchDropdown';

/**
 * Custom hook to manage header state and logic
 * @returns {Object} Header state and functions
 */
function useHeader() {
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  const toggleSearchOverlay = useCallback((e) => {
    // Prevent event from propagating to document which would trigger handleClickOutside
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowSearchOverlay(prevState => !prevState);
  }, []);

  const closeSearchOverlay = useCallback(() => {
    setShowSearchOverlay(false);
  }, []);

  return {
    showSearchOverlay,
    toggleSearchOverlay,
    closeSearchOverlay
  };
}

/**
 * Custom hook to manage categories dropdown
 * @returns {Object} Categories state and functions
 */
function useCategories() {
  const [showCategories, setShowCategories] = useState(false);
  const categoriesRef = useRef(null);

  const toggleCategories = useCallback(() => {
    setShowCategories(prevState => !prevState);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setShowCategories(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return {
    showCategories,
    toggleCategories,
    categoriesRef
  };
}

/**
 * Logo component
 * @returns {JSX.Element} Logo component
 */
function Logo() {
  return (
    <NavLink prefetch="intent" to="/" className="logo">
      <img
        src="https://cdn.shopify.com/s/files/1/0616/6446/0862/files/logo.svg?v=1745081485"
        alt="KAAH"
        className="logo-image"
      />
      <div className="logo-text-container">
        <span className="logo-text">KAAH</span>
        <span className="logo-subtext">SUPER MARKET</span>
      </div>
    </NavLink>
  );
}

/**
 * CustomerService component
 * @returns {JSX.Element} CustomerService component
 */
function CustomerService() {
  return (
    <div className="customer-service-wrapper">
      <NavLink
        to="mailto:Info@kaah.co.za"
        className="header-action-item customer-service-link"
        aria-label="Contact Customer Services at Info@kaah.co.za"
      >
        <i className="fas fa-envelope"></i>
        <div className="customer-service-info">
          <span className="cart-label">Customer Services</span>
          <span className="cart-amount">Info@kaah.co.za</span>
        </div>
      </NavLink>
    </div>
  );
}

/**
 * TopHeader component
 * @returns {JSX.Element} TopHeader component
 */
function TopHeader() {
  return (
    <div className="header-top">
      <div className="container">
        <div className="header-top-content">
          <div className="header-location">
            <i className="fas fa-map-marker-alt location-icon"></i>
            <span>Store Location: SouthAfrica</span>
          </div>
          <div className="header-top-right">
            {/* Additional top header content can be added here */}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MainHeader component
 * @returns {JSX.Element} MainHeader component
 */
function MainHeader() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-main">
          <div className="logo-service-container">
            <Logo />
            <CustomerService />
          </div>
          <div className="header-actions">
            {/* Additional header actions can be added here */}
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * CategoriesDropdown component
 * @param {Object} props - Component props
 * @param {Array} props.collections - Collections data
 * @param {boolean} props.showCategories - Whether to show categories
 * @param {Function} props.toggleCategories - Function to toggle categories
 * @param {Object} props.categoriesRef - Ref for categories dropdown
 * @returns {JSX.Element} CategoriesDropdown component
 */
function CategoriesDropdown({ collections, showCategories, toggleCategories, categoriesRef }) {
  // Map collection titles to appropriate icons
  const getIconClass = useCallback((title) => {
    // Default icon
    return 'fas fa-tag';
  }, []);

  return (
    <div className="categories-dropdown" ref={categoriesRef}>
      <button
        className={`categories-button ${showCategories ? 'active' : ''}`}
        onClick={toggleCategories}
        aria-expanded={showCategories}
        aria-controls="categories-menu"
      >
        <span className="menu-icon"><i className="fas fa-bars"></i></span>
        All Categories
        <span className="dropdown-icon"><i className="fas fa-chevron-down"></i></span>
      </button>
      {showCategories && (
        <div className="categories-menu" id="categories-menu">
          <ul>
            {collections && collections.nodes ? (
              collections.nodes.map((collection) => {
                const iconClass = getIconClass(collection.title);
                return (
                  <li key={collection.id}>
                    <NavLink to={`/collections/${collection.handle}`}>
                      <span className="category-icon"><i className={iconClass}></i></span>
                      <span className="category-text">{collection.title}</span>
                    </NavLink>
                  </li>
                );
              })
            ) : (
              <li>
                <div className="loading-categories">Loading categories...</div>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * MainMenu component
 * @returns {JSX.Element} MainMenu component
 */
function MainMenu() {
  return (
    <ul className="main-menu">
      <li><NavLink to="/">Home</NavLink></li>
      <li><NavLink to="/about">About Us</NavLink></li>
      <li><NavLink to="/locations">Locations</NavLink></li>
      <li><NavLink to="/contact">Contact Us</NavLink></li>
    </ul>
  );
}

/**
 * SearchIcon component
 * @param {Object} props - Component props
 * @param {boolean} props.isActive - Whether search is active
 * @param {Function} props.onClick - Click handler
 * @param {Function} props.onClose - Close handler
 * @returns {JSX.Element} SearchIcon component
 */
function SearchIcon({ isActive, onClick, onClose }) {
  return (
    <div className="nav-icon-link search-icon-link">
      <button
        className={`search-icon-button ${isActive ? 'active' : ''}`}
        onClick={onClick}
        aria-label="Search"
        aria-expanded={isActive}
      >
        <i className="fas fa-search"></i>
      </button>
      <SearchDropdown isOpen={isActive} onClose={onClose} />
    </div>
  );
}

/**
 * UserIcon component
 * @param {Object} props - Component props
 * @param {Promise} props.isLoggedIn - Promise resolving to login status
 * @returns {JSX.Element} UserIcon component
 */
function UserIcon({ isLoggedIn }) {
  return (
    <Suspense fallback={
      <NavLink to="/account/login" className="nav-icon-link user-icon-link">
        <i className="far fa-user"></i>
      </NavLink>
    }>
      <Await resolve={isLoggedIn}>
        {(isLoggedIn) => (
          isLoggedIn ? (
            <NavLink to="/account" className="nav-icon-link user-icon-link logged-in">
              <i className="fas fa-user"></i>
            </NavLink>
          ) : (
            <NavLink to="/account/login" className="nav-icon-link user-icon-link">
              <i className="far fa-user"></i>
            </NavLink>
          )
        )}
      </Await>
    </Suspense>
  );
}

/**
 * CartIcon component
 * @param {Object} props - Component props
 * @param {Promise} props.cart - Promise resolving to cart data
 * @returns {JSX.Element} CartIcon component
 */
function CartIcon({ cart }) {
  return (
    <NavLink to="/cart" className="nav-icon-link cart-icon-link">
      <i className="fas fa-shopping-bag"></i>
      <Suspense fallback={<span className="cart-badge">0</span>}>
        <Await resolve={cart}>
          {(cart) => {
            const count = cart?.totalQuantity || 0;
            return count > 0 ? <span className="cart-badge">{count}</span> : null;
          }}
        </Await>
      </Suspense>
    </NavLink>
  );
}

/**
 * Navigation component
 * @param {Object} props - Component props
 * @param {Array} props.collections - Collections data
 * @param {Promise} props.isLoggedIn - Promise resolving to login status
 * @param {Promise} props.cart - Promise resolving to cart data
 * @returns {JSX.Element} Navigation component
 */
function Navigation({ collections, isLoggedIn, cart }) {
  const { showCategories, toggleCategories, categoriesRef } = useCategories();
  const { showSearchOverlay, toggleSearchOverlay, closeSearchOverlay } = useHeader();

  return (
    <nav className="main-nav">
      <div className="container">
        <div className="nav-content">
          <CategoriesDropdown
            collections={collections}
            showCategories={showCategories}
            toggleCategories={toggleCategories}
            categoriesRef={categoriesRef}
          />
          <MainMenu />
          <div className="nav-icons">
            <SearchIcon
              isActive={showSearchOverlay}
              onClick={toggleSearchOverlay}
              onClose={closeSearchOverlay}
            />
            <UserIcon isLoggedIn={isLoggedIn} />
            <CartIcon cart={cart} />
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Main Header component
 * @param {HeaderProps} props - Component props
 * @returns {JSX.Element} Header component
 */
export function Header({ header, isLoggedIn, cart, collections }) {
  return (
    <>
      <TopHeader />
      <MainHeader />
      <Navigation
        collections={collections}
        isLoggedIn={isLoggedIn}
        cart={cart}
      />
    </>
  );
}

/**
 * HeaderMenu component for mobile and desktop navigation
 * @param {Object} props - Component props
 * @param {Object} props.menu - Menu data
 * @param {string} props.primaryDomainUrl - Primary domain URL
 * @param {'desktop' | 'mobile'} props.viewport - Viewport type
 * @param {string} props.publicStoreDomain - Public store domain
 * @returns {JSX.Element} HeaderMenu component
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  // Process menu items to get clean URLs
  const processUrl = useCallback((url) => {
    if (!url) return null;

    // If the URL is internal, strip the domain
    if (
      url.includes('myshopify.com') ||
      url.includes(publicStoreDomain) ||
      url.includes(primaryDomainUrl)
    ) {
      return new URL(url).pathname;
    }

    return url;
  }, [publicStoreDomain, primaryDomainUrl]);

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        const url = processUrl(item.url);

        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * HeaderCtas component for header call-to-actions
 * @param {Object} props - Component props
 * @param {Promise<boolean>} props.isLoggedIn - Promise resolving to login status
 * @param {Promise<Object>} props.cart - Promise resolving to cart data
 * @returns {JSX.Element} HeaderCtas component
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account/login" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

/**
 * HeaderMenuMobileToggle component for mobile menu toggle
 * @returns {JSX.Element} HeaderMenuMobileToggle component
 */
function HeaderMenuMobileToggle() {
  const {open} = useAside();

  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
      aria-label="Toggle mobile menu"
    >
      <h3>☰</h3>
    </button>
  );
}

/**
 * SearchToggle component for search toggle
 * @returns {JSX.Element} SearchToggle component
 */
function SearchToggle() {
  const {open} = useAside();

  return (
    <button
      className="reset"
      onClick={() => open('search')}
      aria-label="Open search"
    >
      Search
    </button>
  );
}

/**
 * CartBadge component for cart badge
 * @param {Object} props - Component props
 * @param {number|null} props.count - Cart item count
 * @returns {JSX.Element} CartBadge component
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  const handleCartClick = useCallback((e) => {
    e.preventDefault();
    open('cart');
    publish('cart_viewed', {
      cart,
      prevCart,
      shop,
      url: window.location.href || '',
    });
  }, [open, publish, cart, prevCart, shop]);

  return (
    <button
      className="header-action-item"
      onClick={handleCartClick}
      aria-label="Open cart"
    >
      <span className="action-icon">🛒</span>
      <span className="action-text">
        Cart {count === null ? '' : `(${count})`}
      </span>
    </button>
  );
}

/**
 * CartToggle component for cart toggle
 * @param {Object} props - Component props
 * @param {Promise<Object>} props.cart - Promise resolving to cart data
 * @returns {JSX.Element} CartToggle component
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

/**
 * CartBanner component for cart banner
 * @returns {JSX.Element} CartBanner component
 */
function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

/**
 * Fallback header menu data
 */
const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * Active link style function
 * @param {Object} props - Component props
 * @param {boolean} props.isActive - Whether link is active
 * @param {boolean} props.isPending - Whether link is pending
 * @returns {Object} Style object
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
