import React, { useEffect, useRef, useState } from 'react';

/**
 * A collection of accessibility-focused utilities and hooks
 * to improve the application's compliance with WCAG standards
 */

// Skip to content link component
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    >
      Skip to content
    </a>
  );
}

/**
 * Hook to trap focus within a component (e.g., modals, dropdowns)
 * Prevents focus from moving outside the container for keyboard users
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
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
    
    container.addEventListener('keydown', handleKeyDown);
    
    // Auto-focus the first element when trap activates
    firstElement.focus();
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);
  
  return containerRef;
}

/**
 * A component that traps focus for keyboard users
 */
export function FocusTrap({ 
  children, 
  isActive = true,
  autoFocus = true
}: { 
  children: React.ReactNode;
  isActive?: boolean;
  autoFocus?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current || !autoFocus) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, [isActive, autoFocus]);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);
  
  return <div ref={containerRef}>{children}</div>;
}

/**
 * Hook for detecting and responding to reduced motion preferences
 */
export function useReducedMotion() {
  // Default to false to ensure animations work by default
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Update value when preference changes
    const onChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);
    
    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, []);
  
  return prefersReducedMotion;
}

/**
 * Hook to manage ARIA live regions for announcements
 */
export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState<{
    message: string;
    priority: 'assertive' | 'polite';
  }>({ message: '', priority: 'polite' });
  
  const announce = (message: string, priority: 'assertive' | 'polite' = 'polite') => {
    setAnnouncement({ message, priority });
  };
  
  // Component to render
  const Announcer = () => (
    <>
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement.priority === 'assertive' ? announcement.message : ''}
      </div>
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement.priority === 'polite' ? announcement.message : ''}
      </div>
    </>
  );
  
  return {
    announce,
    Announcer
  };
}

// Helper function to provide accessible labels for elements that might lack them
export function createAccessibleLabel(
  visibleText: string | undefined, 
  purpose: string,
  id?: string | number
): string {
  if (!visibleText) return purpose;
  
  if (id) {
    return `${purpose} "${visibleText}" (ID: ${id})`;
  }
  
  return `${purpose} "${visibleText}"`;
}