/**
 * Defensive programming utilities for error prevention
 * These utilities help protect against common programming errors
 */

// Global error handler for uncaught errors
export function globalErrorHandler(error: Error): void {
  console.error('Uncaught error:', error);
  
  // Here you might also send the error to a monitoring service like Sentry
  // sendErrorToMonitoring(error);
}

/**
 * Safely access nested object properties without throwing errors
 * @param obj - Object to access properties from
 * @param path - Path to the property as a dot-separated string
 * @param defaultValue - Value to return if the property doesn't exist
 * @returns The value at the path or the default value
 */
export function safeGet<T = any>(
  obj: Record<string, any> | null | undefined, 
  path: string, 
  defaultValue: T
): T {
  if (obj == null) return defaultValue;
  
  const parts = path.split('.');
  let current: any = obj;
  
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[part];
  }
  
  return current !== undefined ? current : defaultValue;
}

/**
 * Safely convert value to number
 * @param value - Value to convert
 * @param defaultValue - Default value if conversion fails
 * @returns Converted number or default value
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue;
  
  const converted = Number(value);
  return isNaN(converted) ? defaultValue : converted;
}

/**
 * Safely convert value to boolean
 * @param value - Value to convert
 * @param defaultValue - Default value if conversion is uncertain
 * @returns Converted boolean or default value
 */
export function safeBoolean(value: any, defaultValue: boolean = false): boolean {
  if (value === null || value === undefined) return defaultValue;
  
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    if (lowered === 'true' || lowered === 'yes' || lowered === '1') return true;
    if (lowered === 'false' || lowered === 'no' || lowered === '0') return false;
  }
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  
  return defaultValue;
}

/**
 * Safely convert value to date
 * @param value - Value to convert
 * @param defaultValue - Default value if conversion fails
 * @returns Converted date or default value
 */
export function safeDate(value: any, defaultValue: Date = new Date()): Date {
  if (value instanceof Date) return value;
  
  if (value) {
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? defaultValue : date;
    } catch (e) {
      return defaultValue;
    }
  }
  
  return defaultValue;
}

/**
 * Safely trim a string
 * @param value - Value to trim
 * @param defaultValue - Default value if value is not a string
 * @returns Trimmed string or default value
 */
export function safeTrim(value: any, defaultValue: string = ''): string {
  if (typeof value === 'string') return value.trim();
  if (value === null || value === undefined) return defaultValue;
  
  try {
    return String(value).trim();
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Safely execute a function without throwing errors
 * @param fn - Function to execute
 * @param defaultValue - Value to return if function throws
 * @param args - Arguments to pass to the function
 * @returns Result of function or default value
 */
export function safeExecute<T, Args extends any[]>(
  fn: (...args: Args) => T,
  defaultValue: T,
  ...args: Args
): T {
  try {
    return fn(...args);
  } catch (e) {
    console.error('Error executing function:', e);
    return defaultValue;
  }
}

/**
 * Safe array operations - prevent common array-related errors
 */
export const safeArray = {
  /**
   * Safely get an element from an array
   * @param arr - Array to get element from
   * @param index - Index of the element
   * @param defaultValue - Default value if index is out of bounds
   * @returns Element at index or default value
   */
  get<T>(arr: T[] | null | undefined, index: number, defaultValue: T): T {
    if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
      return defaultValue;
    }
    return arr[index] === undefined || arr[index] === null ? defaultValue : arr[index]!;
  },
  
  /**
   * Safely get the first element of an array
   * @param arr - Array to get first element from
   * @param defaultValue - Default value if array is empty
   * @returns First element or default value
   */
  first<T>(arr: T[] | null | undefined, defaultValue: T): T {
    return this.get(arr, 0, defaultValue);
  },
  
  /**
   * Safely get the last element of an array
   * @param arr - Array to get last element from
   * @param defaultValue - Default value if array is empty
   * @returns Last element or default value
   */
  last<T>(arr: T[] | null | undefined, defaultValue: T): T {
    if (!Array.isArray(arr) || arr.length === 0) {
      return defaultValue;
    }
    return this.get(arr, arr.length - 1, defaultValue);
  },
  
  /**
   * Check if an array contains a specific value
   * @param arr - Array to check
   * @param value - Value to look for
   * @returns Whether the array contains the value
   */
  includes<T>(arr: T[] | null | undefined, value: T): boolean {
    return Array.isArray(arr) && arr.includes(value);
  },
  
  /**
   * Safely map over an array without throwing errors
   * @param arr - Array to map
   * @param mapFn - Mapping function
   * @returns Mapped array or empty array if input is not an array
   */
  map<T, U>(arr: T[] | null | undefined, mapFn: (item: T, index: number) => U): U[] {
    if (!Array.isArray(arr)) return [];
    
    const result: U[] = [];
    for (let i = 0; i < arr.length; i++) {
      try {
        result.push(mapFn(arr[i], i));
      } catch (e) {
        console.error(`Error mapping array item at index ${i}:`, e);
      }
    }
    return result;
  },
  
  /**
   * Safely filter an array without throwing errors
   * @param arr - Array to filter
   * @param filterFn - Filter function
   * @returns Filtered array or empty array if input is not an array
   */
  filter<T>(arr: T[] | null | undefined, filterFn: (item: T, index: number) => boolean): T[] {
    if (!Array.isArray(arr)) return [];
    
    const result: T[] = [];
    for (let i = 0; i < arr.length; i++) {
      try {
        if (filterFn(arr[i], i)) {
          result.push(arr[i]);
        }
      } catch (e) {
        console.error(`Error filtering array item at index ${i}:`, e);
      }
    }
    return result;
  },
  
  /**
   * Create a new array with the specified length and fill value
   * @param length - Length of the array
   * @param fillValue - Value to fill the array with
   * @returns New array
   */
  create<T>(length: number, fillValue: T): T[] {
    const safeLength = Math.max(0, Math.floor(safeNumber(length, 0)));
    return Array(safeLength).fill(fillValue);
  },
  
  /**
   * Safely join array elements into a string
   * @param arr - Array to join
   * @param separator - Separator to use
   * @returns Joined string or empty string if input is not an array
   */
  join(arr: any[] | null | undefined, separator: string = ','): string {
    if (!Array.isArray(arr)) return '';
    
    return arr
      .map(item => (item === null || item === undefined ? '' : String(item)))
      .join(separator);
  },
  
  /**
   * Safely reduce an array without throwing errors
   * @param arr - Array to reduce
   * @param reduceFn - Reduce function
   * @param initialValue - Initial value
   * @returns Reduced value
   */
  reduce<T, U>(
    arr: T[] | null | undefined, 
    reduceFn: (accumulator: U, item: T, index: number) => U, 
    initialValue: U
  ): U {
    if (!Array.isArray(arr)) return initialValue;
    
    let result = initialValue;
    for (let i = 0; i < arr.length; i++) {
      try {
        result = reduceFn(result, arr[i], i);
      } catch (e) {
        console.error(`Error reducing array item at index ${i}:`, e);
      }
    }
    return result;
  },
  
  /**
   * Safely slice an array without throwing errors
   * @param arr - Array to slice
   * @param start - Start index
   * @param end - End index
   * @returns Sliced array or empty array if input is not an array
   */
  slice<T>(arr: T[] | null | undefined, start?: number, end?: number): T[] {
    if (!Array.isArray(arr)) return [];
    
    try {
      return arr.slice(start, end);
    } catch (e) {
      console.error('Error slicing array:', e);
      return [];
    }
  },
  
  /**
   * Sort an array using a stable sorting algorithm
   * @param arr - Array to sort
   * @param compareFn - Compare function
   * @returns Sorted array or empty array if input is not an array
   */
  sort<T>(
    arr: T[] | null | undefined, 
    compareFn?: (a: T, b: T) => number
  ): T[] {
    if (!Array.isArray(arr)) return [];
    
    try {
      // Create a copy to avoid mutating the original array
      const copy = [...arr];
      return copy.sort(compareFn);
    } catch (e) {
      console.error('Error sorting array:', e);
      return Array.isArray(arr) ? [...arr] : [];
    }
  },
  
  /**
   * Safely return a unique set of array elements
   * @param arr - Array to deduplicate
   * @returns Deduplicated array or empty array if input is not an array
   */
  unique<T>(arr: T[] | null | undefined): T[] {
    if (!Array.isArray(arr)) return [];
    
    try {
      // Manual deduplication to avoid Set iteration issues in older browsers
      const result: T[] = [];
      const seen = new Set<string>();
      
      for (const item of arr) {
        // Use string representation for uniqueness check
        const key = typeof item === 'object' && item !== null
          ? JSON.stringify(item)
          : String(item);
          
        if (!seen.has(key)) {
          seen.add(key);
          result.push(item);
        }
      }
      
      return result;
    } catch (e) {
      console.error('Error deduplicating array:', e);
      return Array.isArray(arr) ? [...arr] : [];
    }
  }
};

/**
 * Convert any value to a string array
 * @param value - Value to convert (string, array, or any other type)
 * @param separator - Separator to use if value is a string
 * @returns String array
 */
export function toStringArray(
  value: string | string[] | any[] | null | undefined,
  separator: string = ','
): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  
  if (Array.isArray(value)) {
    return value.map(item => (item === null || item === undefined ? '' : String(item)));
  }
  
  if (typeof value === 'string') {
    return value.split(separator).map(s => s.trim()).filter(Boolean);
  }
  
  return [String(value)];
}

/**
 * Create a promise that will be rejected after the specified timeout
 * @param ms - Timeout in milliseconds
 * @param message - Error message
 * @returns Promise that rejects after timeout
 */
export function createTimeoutPromise(ms: number, message: string = 'Operation timed out'): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Execute a promise with a timeout
 * @param promise - Promise to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutMessage - Error message on timeout
 * @returns Promise result or timeout error
 */
export function promiseWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    createTimeoutPromise(timeoutMs, timeoutMessage)
  ]);
}

/**
 * Retry a function multiple times with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelayMs - Base delay in milliseconds
 * @returns Promise with the function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 300
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

/**
 * Type guard to check if a value is not null or undefined
 * @param value - Value to check
 * @returns Whether the value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is a non-empty string
 * @param value - Value to check
 * @returns Whether the value is a non-empty string
 */
export function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Type guard to check if a value is a number
 * @param value - Value to check
 * @returns Whether the value is a number
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a valid date
 * @param value - Value to check
 * @returns Whether the value is a valid date
 */
export function isValidDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if a value is an array
 * @param value - Value to check
 * @returns Whether the value is an array
 */
export function isArray<T>(value: any): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is an object
 * @param value - Value to check
 * @returns Whether the value is an object
 */
export function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is a function
 * @param value - Value to check
 * @returns Whether the value is a function
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}