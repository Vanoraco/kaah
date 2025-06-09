/**
 * Utility functions for managing online sales control
 */

/**
 * Process online sales control metaobject data
 * @param {Object} metaobjectNode - The metaobject node from GraphQL
 * @returns {boolean} - Whether online sales are enabled
 */
export function processOnlineSalesControlData(metaobjectNode) {
  if (!metaobjectNode || !metaobjectNode.fields) {
    // Default to enabled if no metaobject is found
    return true;
  }

  const enabledField = metaobjectNode.fields.find(field => field.key === 'enabled');
  
  if (!enabledField) {
    // Default to enabled if no enabled field is found
    return true;
  }

  // Convert string value to boolean
  // Shopify metaobject boolean fields return "true" or "false" as strings
  return enabledField.value === 'true';
}

/**
 * Get online sales status from metaobjects data
 * @param {Object} metaobjectsData - The metaobjects data from GraphQL query
 * @returns {boolean} - Whether online sales are enabled
 */
export function getOnlineSalesStatus(metaobjectsData) {
  if (!metaobjectsData || !metaobjectsData.metaobjects || !metaobjectsData.metaobjects.nodes) {
    // Default to enabled if no data is available
    return true;
  }

  const nodes = metaobjectsData.metaobjects.nodes;
  
  if (nodes.length === 0) {
    // Default to enabled if no metaobject is found
    return true;
  }

  // Use the first (and should be only) online sales control metaobject
  return processOnlineSalesControlData(nodes[0]);
}

/**
 * Hook to get online sales status from root loader data
 * @param {Object} rootData - The root loader data
 * @returns {boolean} - Whether online sales are enabled
 */
export function useOnlineSalesStatus(rootData) {
  if (!rootData || !rootData.onlineSalesControl) {
    // Default to enabled if no data is available
    return true;
  }

  return getOnlineSalesStatus(rootData.onlineSalesControl);
}

/**
 * Get disabled button props for when online sales are disabled
 * @param {boolean} isOnlineSalesEnabled - Whether online sales are enabled
 * @param {boolean} isInStock - Whether the product is in stock (optional)
 * @returns {Object} - Props for disabled button state
 */
export function getDisabledButtonProps(isOnlineSalesEnabled, isInStock = true) {
  if (!isOnlineSalesEnabled) {
    return {
      disabled: true,
      text: 'Available In-Store Only',
      className: 'disabled-online-sales',
      title: 'Online sales are currently unavailable. Please visit our store for immediate purchase.'
    };
  }

  if (!isInStock) {
    return {
      disabled: true,
      text: 'Sold Out',
      className: 'disabled-out-of-stock',
      title: 'This item is currently out of stock.'
    };
  }

  return {
    disabled: false,
    text: null,
    className: '',
    title: ''
  };
}

/**
 * Get cart messaging for when online sales are disabled
 * @param {boolean} isOnlineSalesEnabled - Whether online sales are enabled
 * @returns {Object} - Cart messaging configuration
 */
export function getCartMessaging(isOnlineSalesEnabled) {
  if (!isOnlineSalesEnabled) {
    return {
      showMessage: true,
      title: 'Online Sales Coming Soon!',
      message: 'Browse our products and visit us in-store for immediate purchase. We\'re working to bring online shopping back to you soon.',
      type: 'info',
      icon: 'fas fa-store'
    };
  }

  return {
    showMessage: false,
    title: '',
    message: '',
    type: '',
    icon: ''
  };
}
