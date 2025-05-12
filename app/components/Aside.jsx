import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
  useMemo
} from 'react';

/**
 * Custom hook to manage keyboard navigation
 * @param {Function} closeHandler - Function to close the aside
 * @param {boolean} isActive - Whether the aside is active
 * @returns {void}
 */
function useKeyboardNavigation(closeHandler, isActive) {
  useEffect(() => {
    const abortController = new AbortController();

    if (isActive) {
      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          closeHandler();
        }
      };

      document.addEventListener('keydown', handleKeyDown, {
        signal: abortController.signal,
      });
    }

    return () => abortController.abort();
  }, [closeHandler, isActive]);
}

/**
 * Custom hook to trap focus within the aside when open
 * @param {React.RefObject} containerRef - Reference to the container element
 * @param {boolean} isActive - Whether the aside is active
 * @returns {void}
 */
function useFocusTrap(containerRef, isActive) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Get all focusable elements
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element when opened
    firstElement.focus();

    const handleTabKey = (e) => {
      // If not tab key, return
      if (e.key !== 'Tab') return;

      // Shift + Tab
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      }
      // Tab
      else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, containerRef]);
}

/**
 * Custom hook to manage body scroll when aside is open
 * @param {boolean} isActive - Whether the aside is active
 * @returns {void}
 */
function useBodyScrollLock(isActive) {
  useEffect(() => {
    if (isActive) {
      // Save current scroll position and lock body
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }
  }, [isActive]);
}

/**
 * Aside header component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.heading - Heading content
 * @param {Function} props.onClose - Close handler
 * @returns {JSX.Element} Aside header component
 */
const AsideHeader = memo(({ heading, onClose }) => {
  return (
    <header className="aside-header">
      <h3>{heading}</h3>
      <button
        className="close reset"
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>
    </header>
  );
});

AsideHeader.displayName = 'AsideHeader';

/**
 * Aside content component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Aside content component
 */
const AsideContent = memo(({ children }) => {
  return (
    <main className="aside-content">
      {children}
    </main>
  );
});

AsideContent.displayName = 'AsideContent';

/**
 * Aside overlay component
 * @param {Object} props - Component props
 * @param {boolean} props.isExpanded - Whether the overlay is expanded
 * @param {Function} props.onClose - Close handler
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Aside overlay component
 */
const AsideOverlay = memo(({ isExpanded, onClose, children }) => {
  return (
    <div
      aria-modal={isExpanded}
      aria-hidden={!isExpanded}
      className={`overlay ${isExpanded ? 'expanded' : ''}`}
      role="dialog"
    >
      <button
        className="close-outside"
        onClick={onClose}
        aria-label="Close overlay"
        tabIndex={isExpanded ? 0 : -1}
      />
      {children}
    </div>
  );
});

AsideOverlay.displayName = 'AsideOverlay';

/**
 * Error boundary component for Aside
 */
class AsideErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Aside error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="aside-error">
          <p>Something went wrong with this component.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="reset"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {AsideType} props.type - Aside type
 * @param {React.ReactNode} props.heading - Heading content
 * @returns {JSX.Element} Aside component
 */
export function Aside({ children, heading, type }) {
  const { type: activeType, close } = useAside();
  const expanded = type === activeType;
  const asideRef = useRef(null);

  // Use custom hooks for functionality
  useKeyboardNavigation(close, expanded);
  useFocusTrap(asideRef, expanded);
  useBodyScrollLock(expanded);

  return (
    <AsideOverlay isExpanded={expanded} onClose={close}>
      <aside ref={asideRef} className="aside-container">
        <AsideHeader heading={heading} onClose={close} />
        <AsideContent>{children}</AsideContent>
      </aside>
    </AsideOverlay>
  );
}

// Create context for aside state
const AsideContext = createContext(null);

/**
 * Custom hook to manage aside state
 * @returns {Object} Aside state and functions
 */
function useAsideState() {
  const [type, setType] = useState('closed');

  const open = useCallback((asideType) => {
    setType(asideType);
  }, []);

  const close = useCallback(() => {
    setType('closed');
  }, []);

  return {
    type,
    open,
    close
  };
}

/**
 * Provider component for the Aside context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Aside provider component
 */
export function AsideProvider({ children }) {
  const asideState = useAsideState();

  const contextValue = useMemo(() => asideState, [
    asideState.type,
    asideState.open,
    asideState.close
  ]);

  return (
    <AsideContext.Provider value={contextValue}>
      {children}
    </AsideContext.Provider>
  );
}

// Keep the old API for backward compatibility
Aside.Provider = AsideProvider;

/**
 * Custom hook to access aside context
 * @returns {AsideContextValue} Aside context value
 * @throws {Error} If used outside of AsideProvider
 */
export function useAside() {
  const aside = useContext(AsideContext);

  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }

  return aside;
}

/** @typedef {'search' | 'cart' | 'mobile' | 'closed'} AsideType */
/**
 * @typedef {Object} AsideContextValue
 * @property {AsideType} type - Current aside type
 * @property {(mode: AsideType) => void} open - Function to open aside
 * @property {() => void} close - Function to close aside
 */

/** @typedef {import('react').ReactNode} ReactNode */
