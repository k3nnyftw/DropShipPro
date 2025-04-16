import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './error-boundary';

// Component that will throw an error
const ProblemComponent = () => {
  throw new Error('Test error');
};

// Mock console.error to prevent test output noise
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
  
  it('renders error UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemComponent />
      </ErrorBoundary>
    );
    
    // Check that error message is displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/Error details:/i)).toBeInTheDocument();
    expect(screen.getByText(/Error: Test error/i)).toBeInTheDocument();
    
    // Check that action buttons are displayed
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });
  
  it('uses custom fallback when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ProblemComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });
  
  it('resets error state when "Try Again" is clicked', () => {
    const TestComponent = ({ shouldThrow = true }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div data-testid="success">Success</div>;
    };
    
    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Verify error state is shown
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Update the component not to throw and click "Try Again"
    rerender(
      <ErrorBoundary>
        <TestComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    fireEvent.click(screen.getByText('Try Again'));
    
    // Verify component renders successfully now
    expect(screen.getByTestId('success')).toBeInTheDocument();
  });
});