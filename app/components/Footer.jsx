import React, {Suspense, useState, useCallback, memo, useEffect} from 'react';
import {Await, NavLink, Link} from '@remix-run/react';

/**
 * Custom hook for newsletter subscription
 * @returns {Object} Newsletter state and functions
 */
function useNewsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [validationError, setValidationError] = useState('');

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    setValidationError('');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validate email
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically make an API call to subscribe the user
      // For now, we'll simulate a successful subscription
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubscriptionStatus('success');
      setEmail('');
    } catch (error) {
      setSubscriptionStatus('error');
      console.error('Error subscribing to newsletter:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, validateEmail]);

  // Reset subscription status after 5 seconds
  useEffect(() => {
    if (subscriptionStatus) {
      const timer = setTimeout(() => {
        setSubscriptionStatus(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [subscriptionStatus]);

  return {
    email,
    isSubmitting,
    subscriptionStatus,
    validationError,
    handleEmailChange,
    handleSubmit
  };
}

/**
 * Custom hook for social media links
 * @returns {Array} Social media links
 */
function useSocialMedia() {
  return [
    {
      id: 'facebook',
      url: 'https://facebook.com',
      ariaLabel: 'Facebook',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="16" height="16" fill="currentColor">
          <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
        </svg>
      )
    },
    {
      id: 'twitter',
      url: 'https://twitter.com',
      ariaLabel: 'Twitter',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
          <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
        </svg>
      )
    },
    {
      id: 'pinterest',
      url: 'https://pinterest.com',
      ariaLabel: 'Pinterest',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="16" height="16" fill="currentColor">
          <path d="M204 6.5C101.4 6.5 0 74.9 0 185.6 0 256 39.6 296 63.6 296c9.9 0 15.6-27.6 15.6-35.4 0-9.3-23.7-29.1-23.7-67.8 0-80.4 61.2-137.4 140.4-137.4 68.1 0 118.5 38.7 118.5 109.8 0 53.1-21.3 152.7-90.3 152.7-24.9 0-46.2-18-46.2-43.8 0-37.8 26.4-74.4 26.4-113.4 0-66.2-93.9-54.2-93.9 25.8 0 16.8 2.1 35.4 9.6 50.7-13.8 59.4-42 147.9-42 209.1 0 18.9 2.7 37.5 4.5 56.4 3.4 3.8 1.7 3.4 6.9 1.5 50.4-69 48.6-82.5 71.4-172.8 12.3 23.4 44.1 36 69.3 36 106.2 0 153.9-103.5 153.9-196.8C384 71.3 298.2 6.5 204 6.5z"/>
        </svg>
      )
    },
    {
      id: 'instagram',
      url: 'https://instagram.com',
      ariaLabel: 'Instagram',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
        </svg>
      )
    }
  ];
}

/**
 * Custom hook for footer links
 * @returns {Object} Footer links by category
 */
function useFooterLinks() {
  return {
    account: [
      { id: 'account', title: 'My Account', url: '/account' },
      { id: 'orders', title: 'Order History', url: '/account/orders' },
      { id: 'cart', title: 'Shopping Cart', url: '/cart' },
      { id: 'wishlist', title: 'Wishlist', url: '/account/wishlist' }
    ],
    help: [
      { id: 'contact', title: 'Contact', url: '/contact' },
      { id: 'faqs', title: 'Faqs', url: '/faqs' },
      { id: 'terms', title: 'Terms & Condition', url: '/terms' },
      { id: 'privacy', title: 'Privacy Policy', url: '/privacy-policy' }
    ],
    company: [
      { id: 'about', title: 'About', url: '/about' },
      { id: 'shop', title: 'Shop', url: '/shop' },
      { id: 'products', title: 'Product', url: '/products' },
      { id: 'track-order', title: 'Track Order', url: '/track-order' }
    ]
  };
}

/**
 * Newsletter icon component
 * @returns {JSX.Element} Newsletter icon
 */
const NewsletterIcon = memo(() => (
  <div className="newsletter-icon">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
    </svg>
  </div>
));

NewsletterIcon.displayName = 'NewsletterIcon';

/**
 * Newsletter form component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Newsletter form
 */
const NewsletterForm = memo(({
  email,
  handleEmailChange,
  handleSubmit,
  isSubmitting,
  subscriptionStatus,
  validationError
}) => {
  return (
    <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
      <div className="newsletter-input-wrapper" style={{ width: '100%' }}>
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={handleEmailChange}
          disabled={isSubmitting}
          aria-label="Email address for newsletter"
          aria-invalid={!!validationError}
          aria-describedby={validationError ? "newsletter-error" : undefined}
          required
        />
        {validationError && (
          <div id="newsletter-error" className="newsletter-error" role="alert">
            {validationError}
          </div>
        )}
        {subscriptionStatus === 'success' && (
          <div className="newsletter-success" role="status">
            Thank you for subscribing!
          </div>
        )}
        {subscriptionStatus === 'error' && (
          <div className="newsletter-error" role="alert">
            Failed to subscribe. Please try again.
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
});

NewsletterForm.displayName = 'NewsletterForm';

/**
 * Social icons component
 * @returns {JSX.Element} Social icons
 */
const SocialIcons = memo(() => {
  const socialMedia = useSocialMedia();

  return (
    <div className="social-icons">
      {socialMedia.map(social => (
        <a
          key={social.id}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.ariaLabel}
        >
          {social.icon}
        </a>
      ))}
    </div>
  );
});

SocialIcons.displayName = 'SocialIcons';

/**
 * Newsletter section component
 * @returns {JSX.Element} Newsletter section
 */
const NewsletterSection = memo(() => {
  const {
    email,
    isSubmitting,
    subscriptionStatus,
    validationError,
    handleEmailChange,
    handleSubmit
  } = useNewsletter();

  return (
    <div className="footer-newsletter">
      <div className="newsletter-content">
        <NewsletterIcon />
        <div className="newsletter-text">
          <h3>Subscribe our Newsletter</h3>
          <p>Pellentesque eu nibh eget mauris congue mattis matti.</p>
        </div>
      </div>
      <NewsletterForm
        email={email}
        handleEmailChange={handleEmailChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        subscriptionStatus={subscriptionStatus}
        validationError={validationError}
      />
      <SocialIcons />
    </div>
  );
});

NewsletterSection.displayName = 'NewsletterSection';

/**
 * Footer column component
 * @param {Object} props - Component props
 * @param {string} props.title - Column title
 * @param {Array} props.links - Column links
 * @returns {JSX.Element} Footer column
 */
const FooterColumn = memo(({ title, links }) => {
  return (
    <div className="footer-column">
      <h4>{title}</h4>
      <ul>
        {links.map(link => (
          <li key={link.id}>
            <Link to={link.url}>{link.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
});

FooterColumn.displayName = 'FooterColumn';

/**
 * Logo column component
 * @returns {JSX.Element} Logo column
 */
const LogoColumn = memo(() => {
  return (
    <div className="footer-column footer-logo-column">
      <Link to="/" className="footer-logo">
        <img src="https://cdn.shopify.com/s/files/1/0616/6446/0862/files/logo.svg?v=1745081485" alt="Kaah" />
        <span>Kaah</span>
      </Link>
      <p>Morbi cursus porttitor enim lobortis molestie. Duis gravida turpis dui, eget bibendum magna congue nec.</p>
      <div className="footer-contact">
        <div className="contact-item">
          <span>(27) 555-0114</span>
          <span className="divider">or</span>
          <a href="mailto:support@kaah.co.za">support@kaah.co.za</a>
        </div>
      </div>
    </div>
  );
});

LogoColumn.displayName = 'LogoColumn';

/**
 * Footer navigation component
 * @returns {JSX.Element} Footer navigation
 */
const FooterNavigation = memo(() => {
  const footerLinks = useFooterLinks();

  return (
    <div className="footer-navigation">
      <LogoColumn />
      <FooterColumn title="My Account" links={footerLinks.account} />
      <FooterColumn title="Helps" links={footerLinks.help} />
      <FooterColumn title="Kaah" links={footerLinks.company} />
    </div>
  );
});

FooterNavigation.displayName = 'FooterNavigation';

/**
 * Payment methods component
 * @returns {JSX.Element} Payment methods
 */
const PaymentMethods = memo(() => {
  const paymentMethods = [
    { id: 'apple-pay', name: 'Apple Pay', image: '/images/payment/apple-pay.svg' },
    { id: 'visa', name: 'Visa', image: '/images/payment/visa.svg' },
    { id: 'discover', name: 'Discover', image: '/images/payment/discover.svg' },
    { id: 'mastercard', name: 'Mastercard', image: '/images/payment/mastercard.svg' }
  ];

  return (
    <div className="payment-methods">
      {paymentMethods.map(method => (
        <img
          key={method.id}
          src={method.image}
          alt={method.name}
          loading="lazy"
        />
      ))}
    </div>
  );
});

PaymentMethods.displayName = 'PaymentMethods';

/**
 * Footer bottom component
 * @returns {JSX.Element} Footer bottom
 */
const FooterBottom = memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer-bottom">
      <div className="copyright">
        <p>Kaah Supermarket © {currentYear}. All Rights Reserved</p>
      </div>
      <PaymentMethods />
    </div>
  );
});

FooterBottom.displayName = 'FooterBottom';

/**
 * Custom footer component
 * @returns {JSX.Element} Custom footer
 */
const CustomFooter = memo(() => {
  return (
    <footer className="custom-footer">
      <div className="footer-container">
        <NewsletterSection />
        <FooterNavigation />
        <FooterBottom />
      </div>
    </footer>
  );
});

CustomFooter.displayName = 'CustomFooter';

/**
 * Error boundary component
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Footer error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <footer className="custom-footer error">
          <div className="footer-container">
            <p>Something went wrong with the footer. Please refresh the page.</p>
          </div>
        </footer>
      );
    }

    return this.props.children;
  }
}

/**
 * Main Footer component
 * @param {FooterProps} props - Component props
 * @returns {JSX.Element} Footer component
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FooterSkeleton />}>
        <Await resolve={footerPromise}>
          {(footer) => (
            <CustomFooter />
          )}
        </Await>
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Footer skeleton component for loading state
 * @returns {JSX.Element} Footer skeleton
 */
function FooterSkeleton() {
  return (
    <footer className="custom-footer skeleton">
      <div className="footer-container">
        <div className="footer-skeleton-content">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
    </footer>
  );
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
