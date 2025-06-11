import React, {Suspense, useState, useCallback, memo, useEffect} from 'react';
import {Await, NavLink, Link, useRouteLoaderData} from '@remix-run/react';
import {transformSocialMediaData, DEFAULT_SOCIAL_MEDIA} from '../lib/social-media-queries';
import {SOCIAL_MEDIA_ICONS} from '../lib/social-media-icons';

/**
 * Custom hook for newsletter subscription
 * @returns {Object} Newsletter state and functions
 */
function useNewsletter() {
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [validationError, setValidationError] = useState('');

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateTelephone = useCallback((phone) => {
    // Basic phone validation - at least 10 digits
    const phoneRegex = /^\d{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }, []);

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    setValidationError('');
  }, []);

  const handleTelephoneChange = useCallback((e) => {
    setTelephone(e.target.value);
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

    // Validate telephone
    if (!telephone.trim()) {
      setValidationError('Phone number is required');
      return;
    }

    if (!validateTelephone(telephone)) {
      setValidationError('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically make an API call to subscribe the user
      // For now, we'll simulate a successful subscription
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubscriptionStatus('success');
      setEmail('');
      setTelephone('');
    } catch (error) {
      setSubscriptionStatus('error');
      console.error('Error subscribing to newsletter:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, telephone, validateEmail, validateTelephone]);

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
 * @param {Array} socialMediaData - Social media data from metaobjects
 * @returns {Array} Social media links with icons
 */
function useSocialMedia(socialMediaData = null) {
  // Use provided data or fall back to defaults
  const socialData = socialMediaData || DEFAULT_SOCIAL_MEDIA;

  return socialData.map(social => {
    // Make platform name lowercase for icon matching
    const platformKey = social.platform?.toLowerCase();
    const icon = SOCIAL_MEDIA_ICONS[platformKey];

    return {
      id: social.id,
      url: social.url,
      ariaLabel: social.ariaLabel,
      platform: social.platform,
      icon: icon || SOCIAL_MEDIA_ICONS.facebook
    };
  });
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
      { id: 'faqs', title: 'FAQ', url: '/faqs' },
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
  telephone,
  handleEmailChange,
  handleTelephoneChange,
  handleSubmit,
  isSubmitting,
  subscriptionStatus,
  validationError
}) => {
  return (
    <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
      <div className="newsletter-inputs">
        <div className="newsletter-input-wrapper">
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
        </div>
        <div className="newsletter-input-wrapper">
          <input
            type="tel"
            placeholder="Your phone number"
            value={telephone}
            onChange={handleTelephoneChange}
            disabled={isSubmitting}
            aria-label="Phone number for newsletter"
            aria-invalid={!!validationError}
            aria-describedby={validationError ? "newsletter-error" : undefined}
            required
          />
        </div>
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
 * @param {Object} props - Component props
 * @param {Array} props.socialMediaData - Social media data from metaobjects
 * @returns {JSX.Element} Social icons
 */
const SocialIcons = memo(({ socialMediaData }) => {
  const socialMedia = useSocialMedia(socialMediaData);

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
 * @param {Object} props - Component props
 * @param {Array} props.socialMediaData - Social media data from metaobjects
 * @returns {JSX.Element} Newsletter section
 */
const NewsletterSection = memo(({ socialMediaData }) => {
  const {
    email,
    telephone,
    isSubmitting,
    subscriptionStatus,
    validationError,
    handleEmailChange,
    handleTelephoneChange,
    handleSubmit
  } = useNewsletter();

  return (
    <div className="footer-newsletter">
      <div className="newsletter-content">
        <NewsletterIcon />
        <div className="newsletter-text">
          <h3>Subscribe our Newsletter</h3>
          <p>Be the first to access exclusive deals and giveaways! Join our VIP list today. Simply drop your email and phone number below.</p>
        </div>
      </div>
      <NewsletterForm
        email={email}
        telephone={telephone}
        handleEmailChange={handleEmailChange}
        handleTelephoneChange={handleTelephoneChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        subscriptionStatus={subscriptionStatus}
        validationError={validationError}
      />
      <SocialIcons socialMediaData={socialMediaData} />
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
      <p>At Kaah , we’re more than just a store—we’re your trusted partner in finding everything you need for your home, family, and lifestyle. Whether you're stocking up on everyday essentials, exploring fresh produce, or searching for exclusive deals on premium products, we’ve got you covered.</p>
      <div className="footer-contact">
        <div className="contact-item">
          <span>013 880 1534,
          076 969 6416
</span>
          <span className="divider">or</span>
          <a href="mailto:admin@kaah.co.za">admin@kaah.co.za</a>
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
 * @param {Object} props - Component props
 * @param {Array} props.socialMediaData - Social media data from metaobjects
 * @returns {JSX.Element} Custom footer
 */
const CustomFooter = memo(({ socialMediaData }) => {
  return (
    <footer className="custom-footer">
      <div className="footer-container">
        <NewsletterSection socialMediaData={socialMediaData} />
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
export function Footer({footer: footerPromise}) {
  const rootData = useRouteLoaderData('root');

  // Transform social media data from metaobjects
  const socialMediaData = rootData?.socialMedia?.metaobjects?.nodes
    ? transformSocialMediaData(rootData.socialMedia.metaobjects.nodes)
    : null;

  return (
    <ErrorBoundary>
      <Suspense fallback={<FooterSkeleton />}>
        <Await resolve={footerPromise}>
          {(footer) => (
            <CustomFooter socialMediaData={socialMediaData} />
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
