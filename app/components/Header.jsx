import {Suspense, useState, useEffect, useRef} from 'react';
import {Await, NavLink, useAsyncValue, useLoaderData} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, collections}) {
  const {shop} = header;
  const [showCategories, setShowCategories] = useState(false);
  const categoriesRef = useRef(null);

  // Debug collections data
  console.log('Collections data:', collections);

  const toggleCategories = () => {
    setShowCategories(!showCategories);
  };

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
  }, [categoriesRef]);

  return (
    <>
      {/* Top Header */}
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="header-location">
              <i className="fas fa-map-marker-alt location-icon"></i>
              <span>Store Location: SouthAfrica</span>
            </div>
            <div className="header-top-right">
              <div className="language-currency">
                <div className="select-wrapper">
                  <select className="language-select">
                    <option value="eng">Eng</option>
                    <option value="fr">Fr</option>
                  </select>
                </div>
                <div className="select-wrapper">
                  <select className="currency-select">
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                  </select>
                </div>
              </div>
              <div className="auth-links">
                <NavLink to="/account/login">Sign In</NavLink>
                <span>/</span>
                <NavLink to="/account/register">Sign Up</NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="header">
        <div className="container">
          <div className="header-main">
            {/* Logo */}
            <NavLink prefetch="intent" to="/" className="logo">
              <img src="https://cdn.shopify.com/s/files/1/0616/6446/0862/files/logo.svg?v=1745081485" alt="KAAH" className="logo-image" />
              <div className="logo-text-container">
                <span className="logo-text">KAAH</span>
                <span className="logo-subtext">SUPER MARKET</span>
              </div>
            </NavLink>

            {/* Search Bar */}
            <form className="search-bar">
              <div className="search-input-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="search"
                  placeholder="Search"
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  Search
                </button>
              </div>
            </form>

            {/* Header Actions */}
            <div className="header-actions">
              <div className="cart-wrapper">
                <NavLink to="tel:2195550114" className="header-action-item cart-link">
                  <i className="fas fa-phone-alt"></i>
                  <div className="cart-info">
                    <span className="cart-label">Customer Services</span>
                    <span className="cart-amount">(219) 555-0114</span>
                  </div>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="main-nav">
        <div className="container">
          <div className="nav-content">
            <div className="categories-dropdown" ref={categoriesRef}>
              <button className={`categories-button ${showCategories ? 'active' : ''}`} onClick={toggleCategories}>
                <span className="menu-icon"><i className="fas fa-bars"></i></span>
                All Categories
                <span className="dropdown-icon"><i className="fas fa-chevron-down"></i></span>
              </button>
              {showCategories && (
                <div className="categories-menu">
                  <ul>
                    {collections && collections.nodes ? (
                      collections.nodes.map((collection) => {
                        // Map collection titles to appropriate icons
                       //S let iconClass = 'fas fa-tag'; // Default icon


                        // Map collection titles to appropriate icons
                        let iconClass = 'fas fa-tag'; // Default icon



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
            <ul className="main-menu">
              <li><NavLink to="/">Home</NavLink></li>
              <li><NavLink to="/shop">Shop</NavLink></li>
              <li><NavLink to="/pages">Pages</NavLink></li>
              <li><NavLink to="/blog">Blog</NavLink></li>
              <li><NavLink to="/about">About Us</NavLink></li>
              <li><NavLink to="/contact">Contact Us</NavLink></li>
            </ul>
            <div className="nav-icons">
              <NavLink to="/wishlist" className="nav-icon-link">
                <i className="far fa-heart"></i>
              </NavLink>
              <NavLink to="/cart" className="nav-icon-link cart-icon-link">
                <i className="fas fa-shopping-cart"></i>
                <span className="nav-cart-count">2</span>
              </NavLink>
              <NavLink to="/account" className="nav-icon-link">
                <i className="far fa-user"></i>
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

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

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
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
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
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

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      className="header-action-item"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <span className="action-icon">🛒</span>
      <span className="action-text">
        Cart {count === null ? '' : `(${count})`}
      </span>
    </button>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
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

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

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
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
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
