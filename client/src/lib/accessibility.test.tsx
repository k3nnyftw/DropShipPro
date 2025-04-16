import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  SkipToContent, 
  FocusTrap, 
  useReducedMotion,
  useAnnouncement,
  createAccessibleLabel
} from './accessibility';

describe('Accessibility Utilities', () => {
  describe('SkipToContent', () => {
    it('renders a skip link that is visually hidden by default', () => {
      render(<SkipToContent />);
      
      const skipLink = screen.getByText('Skip to content');
      
      // Check that it's in the document but visually hidden
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveClass('sr-only');
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
    
    it('becomes visible when focused', () => {
      render(<SkipToContent />);
      
      const skipLink = screen.getByText('Skip to content');
      
      // Focus the link
      skipLink.focus();
      
      // It should now have focus-specific classes
      expect(skipLink).toHaveClass('focus:not-sr-only');
    });
  });
  
  describe('FocusTrap', () => {
    it('renders children correctly', () => {
      render(
        <FocusTrap>
          <button>Button 1</button>
          <button>Button 2</button>
        </FocusTrap>
      );
      
      expect(screen.getByText('Button 1')).toBeInTheDocument();
      expect(screen.getByText('Button 2')).toBeInTheDocument();
    });
  });
  
  describe('useReducedMotion hook', () => {
    // Create a test component that uses the hook
    const TestComponent = () => {
      const prefersReducedMotion = useReducedMotion();
      return <div data-testid="test">{prefersReducedMotion ? 'reduced' : 'normal'}</div>;
    };
    
    it('provides motion preference state', () => {
      render(<TestComponent />);
      
      // Default should be false (normal motion)
      expect(screen.getByTestId('test')).toHaveTextContent('normal');
      
      // We can't easily test the media query listener in JSDOM,
      // but we've verified the hook returns an initial value
    });
  });
  
  describe('useAnnouncement hook', () => {
    // Create a test component that uses the hook
    const TestComponent = () => {
      const { announce, Announcer } = useAnnouncement();
      
      return (
        <div>
          <Announcer />
          <button 
            onClick={() => announce('Information updated', 'polite')}
            data-testid="announce-polite"
          >
            Announce Politely
          </button>
          <button 
            onClick={() => announce('Error occurred', 'assertive')}
            data-testid="announce-assertive"
          >
            Announce Assertively
          </button>
        </div>
      );
    };
    
    it('renders hidden announcement regions', () => {
      render(<TestComponent />);
      
      // Should have both polite and assertive regions
      const regions = screen.getAllByRole('region', { hidden: true });
      
      // Find aria-live regions
      const politeRegion = screen.getByRole('region', { 
        hidden: true,
        name: '', // aria-label is empty
      });
      
      const assertiveRegion = screen.getByRole('region', {
        hidden: true,
        name: '', // aria-label is empty
      });
      
      expect(politeRegion).toHaveAttribute('aria-live', 'polite');
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
    });
    
    it('announces messages in appropriate regions', () => {
      render(<TestComponent />);
      
      // Get the announcement buttons
      const announcePolite = screen.getByTestId('announce-polite');
      const announceAssertive = screen.getByTestId('announce-assertive');
      
      // Announce a polite message
      fireEvent.click(announcePolite);
      
      // Find the polite region and check its content
      const politeRegion = screen.getByText('Information updated');
      expect(politeRegion).toBeInTheDocument();
      
      // Announce an assertive message
      fireEvent.click(announceAssertive);
      
      // Find the assertive region and check its content
      const assertiveRegion = screen.getByText('Error occurred');
      expect(assertiveRegion).toBeInTheDocument();
    });
  });
  
  describe('createAccessibleLabel', () => {
    it('creates labels with visibleText and purpose', () => {
      expect(createAccessibleLabel('Product Name', 'Edit')).toBe('Edit "Product Name"');
    });
    
    it('creates labels with visibleText, purpose, and id', () => {
      expect(createAccessibleLabel('Product Name', 'Edit', 123)).toBe('Edit "Product Name" (ID: 123)');
    });
    
    it('returns just the purpose when visibleText is undefined', () => {
      expect(createAccessibleLabel(undefined, 'Create New')).toBe('Create New');
    });
  });
});