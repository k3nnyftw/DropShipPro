import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Performance optimization utilities
 */

/**
 * Debounce function to limit how often a function is called
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn.apply(context, args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle function to limit how often a function is called
 * 
 * @param fn - Function to throttle
 * @param limit - Limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (!inThrottle) {
      fn.apply(context, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
        
        if (lastArgs) {
          const args = lastArgs;
          const context = lastThis;
          lastArgs = null;
          lastThis = null;
          fn.apply(context, args);
        }
      }, limit);
    } else {
      lastArgs = args;
      lastThis = context;
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        if (!inThrottle && lastArgs) {
          fn.apply(lastThis, lastArgs);
          lastArgs = null;
          lastThis = null;
        }
      }, limit);
    }
  };
}

/**
 * Memoize function to cache results of expensive calculations
 * 
 * @param fn - Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map();
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Hook to debounce a value
 * 
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Hook for implementing virtual scrolling/windowing for large lists
 * 
 * @param totalItems - Total number of items
 * @param itemHeight - Height of each item in pixels
 * @param visibleItems - Number of items visible in viewport
 * @returns Object with virtual list properties
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  visibleItems: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - visibleItems);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + visibleItems * itemHeight) / itemHeight) + visibleItems
  );
  
  const visibleData = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  
  const handleScroll = useCallback(
    throttle((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, 50),
    []
  );
  
  return {
    containerRef,
    totalHeight,
    visibleData,
    offsetY,
    handleScroll,
    startIndex,
    endIndex,
  };
}

/**
 * Hook for lazy loading images
 */
export function useLazyLoad(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);
  
  return isVisible;
}

/**
 * Hook to measure component render time
 * For development/debugging use only
 */
export function useRenderTime(componentName: string) {
  const startTime = useRef<number>(0);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PERF] ${componentName} rendered in ${performance.now() - startTime.current}ms`);
    }
  });
  
  if (process.env.NODE_ENV === 'development') {
    startTime.current = performance.now();
  }
}

/**
 * Measures execution time of a function
 * For development/debugging use only
 * 
 * @param fn - Function to measure
 * @param name - Name for logging
 * @returns Result of fn
 */
export function measureExecutionTime<T>(fn: () => T, name: string): T {
  if (process.env.NODE_ENV !== 'development') {
    return fn();
  }
  
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`[PERF] ${name} executed in ${end - start}ms`);
  
  return result;
}