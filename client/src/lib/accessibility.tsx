import React, { useEffect, useState, useRef, useCallback, createContext, useContext } from 'react';

/**
 * Accessibility components and utilities
 * Provides improved accessibility features throughout the application
 */

/**
 * Skip to content link component for keyboard navigation
 * Allows keyboard users to bypass navigation and jump to main content
 */
export function SkipToContent({ label = 'Skip to content' }: { label?: string }) {
  return (
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
    >
      {label}
    </a>
  );
}

/**
 * Component to trap focus within a dialog or menu
 * Prevents tabbing outside the contained elements
 */
export function FocusTrap({ 
  children, 
  active = true 
}: { 
  children: React.ReactNode;
  active?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active) return;
    
    const root = rootRef.current;
    if (!root) return;
    
    // Find all focusable elements
    const focusableElements = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Focus first element when trap is activated
    firstElement.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      // Shift + Tab
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } 
      // Tab
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    root.addEventListener('keydown', handleKeyDown);
    
    return () => {
      root.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);
  
  return <div ref={rootRef}>{children}</div>;
}

/**
 * Hook to detect reduced motion preference
 * Used to disable animations for users who prefer reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return prefersReducedMotion;
}

/**
 * Creates an accessible label combining visible text, action purpose, and optional ID
 */
export function createAccessibleLabel(
  visibleText?: string | number,
  purpose?: string,
  id?: string | number
): string {
  let label = purpose || '';
  
  if (visibleText) {
    label += ` "${visibleText}"`;
  }
  
  if (id) {
    label += ` (ID: ${id})`;
  }
  
  return label.trim();
}

// Screen reader announcement context
type AnnouncementContextType = {
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
};

const AnnouncementContext = createContext<AnnouncementContextType | null>(null);

/**
 * Provider component for screen reader announcements
 */
export function AnnouncementProvider({ children }: { children: React.ReactNode }) {
  const { announce, Announcer } = useAnnouncement();
  
  return (
    <AnnouncementContext.Provider value={{ announce }}>
      <Announcer />
      {children}
    </AnnouncementContext.Provider>
  );
}

/**
 * Hook to access the announcement context
 */
export function useAnnouncer() {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncer must be used within an AnnouncementProvider');
  }
  return context;
}

/**
 * Hook for screen reader announcements
 * Used to announce dynamic changes to screen readers
 */
export function useAnnouncement() {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  
  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (politeness === 'polite') {
      setPoliteMessage(''); // Clear first to ensure re-announcement
      setTimeout(() => setPoliteMessage(message), 50);
    } else {
      setAssertiveMessage('');
      setTimeout(() => setAssertiveMessage(message), 50);
    }
  }, []);
  
  // Component to render the live regions
  const Announcer = useCallback(() => (
    <>
      <div 
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="region"
      >
        {politeMessage}
      </div>
      <div 
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="region"
      >
        {assertiveMessage}
      </div>
    </>
  ), [politeMessage, assertiveMessage]);
  
  return { announce, Announcer };
}

/**
 * Component to provide keyboard shortcuts
 */
export function KeyboardShortcuts({ 
  shortcuts, 
  disabled = false 
}: { 
  shortcuts: Record<string, () => void>;
  disabled?: boolean;
}) {
  useEffect(() => {
    if (disabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in form controls
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }
      
      // Find the key or key combo in shortcuts
      const key = e.key.toLowerCase();
      const withModifiers = [
        e.ctrlKey ? 'ctrl+' : '',
        e.altKey ? 'alt+' : '',
        e.shiftKey ? 'shift+' : '',
        e.metaKey ? 'meta+' : '',
        key
      ].join('');
      
      // Check both simple key and key with modifiers
      const handler = shortcuts[key] || shortcuts[withModifiers];
      
      if (handler) {
        e.preventDefault();
        handler();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, disabled]);
  
  return null;
}

/**
 * Component to display a list of available keyboard shortcuts
 */
export function ShortcutHelp({ 
  shortcuts,
  className = '',
  title = 'Keyboard Shortcuts'
}: {
  shortcuts: Record<string, string>;
  className?: string;
  title?: string;
}) {
  return (
    <div className={`p-4 border rounded-md ${className}`}>
      <h3 className="font-medium mb-2">{title}</h3>
      <ul className="space-y-1 text-sm">
        {Object.entries(shortcuts).map(([key, description]) => (
          <li key={key} className="flex justify-between">
            <span>{description}</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
              {key}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Component to mark current focus visually for keyboard navigation
 */
export function FocusRing({ children }: { children: React.ReactNode }) {
  return (
    <div className="focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
      {children}
    </div>
  );
}