// Import jest-dom's custom assertions
import '@testing-library/jest-dom';

// Mock IntersectionObserver which isn't available in test environment
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(element) {
    // Do nothing
  }

  unobserve(element) {
    // Do nothing
  }

  disconnect() {
    // Do nothing
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock matchMedia which isn't available in test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo which isn't available in test environment
window.scrollTo = jest.fn();

// Mock fetch API
global.fetch = jest.fn();

// Setup console error and warning mocks to keep test output clean
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});