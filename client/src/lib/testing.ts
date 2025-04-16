/**
 * Testing utilities for unit, integration, and end-to-end tests
 * This file provides a foundation for testing throughout the application
 */

/**
 * Test IDs for components - centralizing them here helps maintain consistency
 * and makes it easier to update if needed
 */
export const TestIds = {
  // Layout
  header: 'header',
  footer: 'footer',
  navigation: 'navigation',
  mainContent: 'main-content',
  
  // Dashboard
  dashboardStats: 'dashboard-stats',
  quickActions: 'quick-actions',
  recentOrders: 'recent-orders',
  topProducts: 'top-products',
  
  // Product
  productGrid: 'product-grid',
  productItem: 'product-item',
  productFilter: 'product-filter',
  productSearch: 'product-search',
  
  // Orders
  orderList: 'order-list',
  orderItem: 'order-item',
  orderFilter: 'order-filter',
  orderStatus: 'order-status',
  
  // Forms
  submitButton: 'submit-button',
  cancelButton: 'cancel-button',
  formError: 'form-error',
  formSuccess: 'form-success',
  
  // Authentication
  loginForm: 'login-form',
  signupForm: 'signup-form',
  forgotPasswordForm: 'forgot-password-form',
  
  // Modals
  modal: 'modal',
  modalClose: 'modal-close',
  modalContent: 'modal-content',
  
  // Notifications
  toast: 'toast',
  notification: 'notification',
  
  // Pagination
  pagination: 'pagination',
  nextPage: 'next-page',
  prevPage: 'prev-page',
};

/**
 * Helper function to add data-testid to component props
 * This ensures consistent test ID application across components
 */
export function withTestId<T extends Record<string, any>>(
  props: T, 
  id: string,
  prefix?: string
): T {
  const testId = prefix ? `${prefix}-${id}` : id;
  return {
    ...props,
    'data-testid': testId,
  };
}

/**
 * Helper function to generate test data
 * For use in tests and development environment only
 */
export function generateTestData<T>(
  generator: () => T,
  count: number = 1
): T[] {
  return Array.from({ length: count }, generator);
}

/**
 * Mock API response for testing
 */
export function mockApiResponse<T>(
  data: T,
  status: number = 200,
  delay: number = 0
): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
}

/**
 * Mock API error for testing
 */
export function mockApiError(
  status: number = 500,
  message: string = 'Internal Server Error',
  delay: number = 0
): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error(message);
      (error as any).status = status;
      (error as any).statusText = message;
      reject(error);
    }, delay);
  });
}

/**
 * Test helper to wait for a specified condition
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    let elapsed = 0;
    
    const check = async () => {
      try {
        if (await condition()) {
          resolve(true);
          return;
        }
      } catch (error) {
        // Ignore errors in condition check
      }
      
      elapsed += interval;
      if (elapsed >= timeout) {
        reject(new Error(`Timed out waiting for condition after ${timeout}ms`));
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
}

/**
 * A list of standard test cases for common UI components
 * This helps ensure thorough test coverage
 */
export const TestCases = {
  button: [
    'renders correctly',
    'handles click events',
    'displays loading state',
    'can be disabled',
    'renders children correctly',
  ],
  form: [
    'renders all fields correctly',
    'validates required fields',
    'shows field-specific errors',
    'handles form submission',
    'displays loading state during submission',
    'handles submission errors',
    'handles submission success',
  ],
  list: [
    'renders empty state correctly',
    'renders items correctly',
    'handles item selection',
    'supports filtering',
    'supports sorting',
    'supports pagination',
  ],
  modal: [
    'renders correctly when open',
    'is not rendered when closed',
    'can be closed via close button',
    'can be closed via backdrop click',
    'can be closed via ESC key',
    'traps focus when open',
  ],
};