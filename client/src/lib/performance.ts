/**
 * Performance utilities for optimizing the application
 */
import React, { useState, useEffect } from 'react';

/**
 * Measure and log the execution time of a function
 * @param fn - Function to measure
 * @param context - Text label for the measurement
 * @returns Function result
 */
export function measurePerformance<T>(fn: () => T, context: string = 'Execution'): T {
  if (process.env.NODE_ENV === 'production') {
    return fn();
  }

  console.time(`⏱️ ${context}`);
  const result = fn();
  console.timeEnd(`⏱️ ${context}`);
  return result;
}

/**
 * Higher-order function to memoize expensive calculations
 * @param fn - Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  // @ts-ignore
  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Debounce a function to limit how often it's called
 * @param fn - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}

/**
 * Throttle a function to execute at most once per time period
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>): void => {
    lastArgs = args;

    if (!inThrottle) {
      fn(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        if (lastArgs && lastArgs !== args) {
          fn(...lastArgs);
        }
      }, limit);
    }
  };
}

/**
 * Batch multiple state updates together for better performance
 * @param callback - Function to execute in batch
 */
export function batchUpdates(callback: () => void): void {
  // React 18+ automatically batches updates, this is for backward compatibility
  if (typeof window !== 'undefined') {
    // Use scheduler.unstable_batchedUpdates if available
    if (
      // @ts-ignore
      window.ReactDOM && window.ReactDOM.unstable_batchedUpdates
    ) {
      // @ts-ignore
      window.ReactDOM.unstable_batchedUpdates(callback);
    } else {
      // Use modern React's automatic batching
      callback();
    }
  } else {
    // SSR - just execute the callback
    callback();
  }
}

/**
 * Detect if requestAnimationFrame is available
 * @returns Whether requestAnimationFrame is available
 */
export function supportsRequestAnimationFrame(): boolean {
  return typeof window !== 'undefined' && 'requestAnimationFrame' in window;
}

/**
 * Execute a function in the next animation frame
 * @param callback - Function to execute
 * @returns Request ID or timeout ID
 */
export function nextFrame(callback: () => void): number {
  if (supportsRequestAnimationFrame()) {
    return window.requestAnimationFrame(callback);
  } else {
    return window.setTimeout(callback, 16); // ~60fps
  }
}

/**
 * Cancel a requested animation frame
 * @param requestId - Request ID from nextFrame
 */
export function cancelFrame(requestId: number): void {
  if (supportsRequestAnimationFrame()) {
    window.cancelAnimationFrame(requestId);
  } else {
    window.clearTimeout(requestId);
  }
}

/**
 * Detect if IntersectionObserver is available
 * @returns Whether IntersectionObserver is available
 */
export function supportsIntersectionObserver(): boolean {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}

/**
 * Save computational resources by only updating when a value changes meaningfully
 * @param value - Value to compare
 * @param threshold - Threshold for numeric values
 * @returns Memoize function that detects significant changes
 */
export function createSignificantChangeDetector<T>(
  initialValue: T,
  threshold: number = 0.01
): {
  hasChanged: (newValue: T) => boolean;
  update: (newValue: T) => void;
  currentValue: () => T;
} {
  let savedValue = initialValue;
  
  return {
    hasChanged: (newValue: T): boolean => {
      if (typeof newValue === 'number' && typeof savedValue === 'number') {
        return Math.abs(newValue - savedValue) >= threshold;
      }
      
      if (typeof newValue === 'object' && newValue !== null) {
        return JSON.stringify(newValue) !== JSON.stringify(savedValue);
      }
      
      return newValue !== savedValue;
    },
    update: (newValue: T): void => {
      savedValue = typeof newValue === 'object' ? JSON.parse(JSON.stringify(newValue)) : newValue;
    },
    currentValue: (): T => savedValue
  };
}

/**
 * Chunk a large workload into smaller pieces to avoid blocking the main thread
 * @param items - Array of items to process
 * @param processor - Function to process each item
 * @param chunkSize - Number of items to process in each chunk
 * @param delay - Delay between chunks in milliseconds
 * @returns Promise that resolves when all items are processed
 */
export function processInChunks<T, R>(
  items: T[],
  processor: (item: T) => R,
  chunkSize: number = 100,
  delay: number = 16
): Promise<R[]> {
  return new Promise((resolve) => {
    const results: R[] = [];
    const totalItems = items.length;
    let currentIndex = 0;
    
    function processChunk() {
      const endIndex = Math.min(currentIndex + chunkSize, totalItems);
      
      for (let i = currentIndex; i < endIndex; i++) {
        results.push(processor(items[i]));
      }
      
      currentIndex = endIndex;
      
      if (currentIndex < totalItems) {
        setTimeout(processChunk, delay);
      } else {
        resolve(results);
      }
    }
    
    processChunk();
  });
}

// Use any to bypass TypeScript's built-in requestIdleCallback types
// This is a temporary workaround for the type conflicts
declare global {
  interface Window {
    // Use any to avoid conflicts with built-in types
    _requestIdleCallback?: any;
    _cancelIdleCallback?: any;
  }
}

/**
 * Schedule a task when the browser is idle
 * @param callback - Function to execute
 * @param timeout - Maximum timeout in milliseconds
 * @returns Request ID
 */
export function scheduleIdleTask(
  callback: () => void,
  timeout: number = 2000
): number {
  if (typeof window !== 'undefined') {
    // @ts-ignore - Using the browser's requestIdleCallback if available
    if (window.requestIdleCallback) {
      // @ts-ignore - TypeScript doesn't handle this API well
      return window.requestIdleCallback(
        (deadline: any) => {
          // Execute callback regardless of deadline status
          callback();
        },
        { timeout }
      );
    } else {
      // Fallback to setTimeout for browsers without requestIdleCallback
      return window.setTimeout(callback, 1) as unknown as number;
    }
  }
  return 0; // Return 0 if window is not available (SSR)
}

/**
 * Cancel a scheduled idle task
 * @param requestId - Request ID from scheduleIdleTask
 */
export function cancelIdleTask(requestId: number): void {
  if (typeof window !== 'undefined') {
    // @ts-ignore - Using the browser's cancelIdleCallback if available
    if (window.cancelIdleCallback) {
      // @ts-ignore - TypeScript doesn't handle this API well
      window.cancelIdleCallback(requestId);
    } else {
      window.clearTimeout(requestId);
    }
  }
}

/**
 * Track the frame rate of the application
 * @param duration - Duration to track FPS for in milliseconds
 * @param callback - Function to call with FPS measurement
 * @returns Function to stop tracking
 */
export function trackFrameRate(
  duration: number = 5000,
  callback: (fps: number) => void
): () => void {
  const startTime = performance.now();
  let frameCount = 0;
  let requestId: number;
  let stopped = false;
  
  function countFrame() {
    if (stopped) return;
    
    frameCount++;
    const elapsed = performance.now() - startTime;
    
    if (elapsed < duration) {
      requestId = nextFrame(countFrame);
    } else {
      const fps = Math.round((frameCount * 1000) / elapsed);
      callback(fps);
    }
  }
  
  requestId = nextFrame(countFrame);
  
  return () => {
    stopped = true;
    cancelFrame(requestId);
  };
}

/**
 * Get performance metrics about the user's device
 * @returns Object with performance metrics
 */
export function getDevicePerformanceMetrics(): {
  deviceMemory: number;
  hardwareConcurrency: number;
  connectionType: string;
  isLowEndDevice: boolean;
} {
  const memory = 
    // @ts-ignore
    typeof navigator !== 'undefined' && navigator.deviceMemory 
      // @ts-ignore
      ? navigator.deviceMemory 
      : 4; // default assumption

  const cores = 
    typeof navigator !== 'undefined' && navigator.hardwareConcurrency 
      ? navigator.hardwareConcurrency 
      : 4; // default assumption

  const connection = 
    typeof navigator !== 'undefined' && 
    // @ts-ignore
    navigator.connection &&
    // @ts-ignore
    navigator.connection.effectiveType 
      // @ts-ignore
      ? navigator.connection.effectiveType 
      : '4g'; // default assumption

  // Consider a device low-end if it has limited memory or processing power
  const isLowEndDevice = memory <= 2 || cores <= 2 || ['slow-2g', '2g', '3g'].includes(connection);

  return {
    deviceMemory: memory,
    hardwareConcurrency: cores,
    connectionType: connection,
    isLowEndDevice
  };
}

/**
 * Optimize rendering frequency based on device performance
 * @param callback - Function to execute on render
 * @param fps - Target FPS for low-end devices
 * @returns Function to call on each frame
 */
export function createAdaptiveRenderer(
  callback: (deltaTime: number) => void,
  fps: number = 30
): (timestamp: number) => void {
  const { isLowEndDevice } = getDevicePerformanceMetrics();
  const targetFps = isLowEndDevice ? fps : 60;
  const frameTime = 1000 / targetFps;
  
  let lastFrameTime = 0;
  
  return (timestamp: number) => {
    const deltaTime = timestamp - lastFrameTime;
    
    if (deltaTime >= frameTime) {
      lastFrameTime = timestamp;
      callback(deltaTime);
    }
  };
}

/**
 * A convenient hook that wraps a value in a debounced state
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Utility to measure execution time of a function
 * @param fn Function to measure
 * @returns Result of the function
 */
export function measureExecutionTime<T>(fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Execution time: ${end - start}ms`);
  }
  
  return result;
}