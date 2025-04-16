/**
 * Defensive programming utilities to handle null/undefined values
 * and prevent runtime errors throughout the application
 */

/**
 * Global error handler for unhandled exceptions
 * @param error - The error that occurred
 * @param errorInfo - Additional error info (from React error boundaries)
 */
export function globalErrorHandler(error: Error, errorInfo?: React.ErrorInfo): void {
  // Log to console for development
  console.error('Unhandled error:', error);
  if (errorInfo) {
    console.error('Component stack trace:', errorInfo.componentStack);
  }
  
  // In production, you would send error to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // This would be replaced with actual error reporting integration
    try {
      // Sample code for error reporting (this would be replaced with real service)
      const errorReport = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      // Would send to error monitoring service in production
      console.info('Error report prepared:', errorReport);
      
      // Show user-friendly toast notification
      // You would use your toast notification system here
    } catch (reportingError) {
      // Fail silently if error reporting itself fails
      console.error('Error while reporting error:', reportingError);
    }
  }
}

/**
 * Type guard to check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Safely access a potentially undefined/null object property
 * @param obj - The object to access
 * @param key - The property key to access
 * @param fallback - Fallback value if property is undefined/null
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  fallback: T[K]
): T[K] {
  if (obj == null) return fallback;
  return obj[key] ?? fallback;
}

/**
 * Safely call a method on a potentially undefined/null object
 * @param obj - The object containing the method
 * @param method - The method name to call
 * @param args - Arguments to pass to the method
 * @param fallback - Fallback value if method can't be called
 */
export function safeCall<T, K extends keyof T, R>(
  obj: T | null | undefined,
  method: K,
  args: any[] = [],
  fallback: R
): R {
  if (obj == null) return fallback;
  const fn = obj[method];
  if (typeof fn !== 'function') return fallback;
  try {
    return fn.apply(obj, args) as R;
  } catch (error) {
    console.error(`Error calling ${String(method)}:`, error);
    return fallback;
  }
}

/**
 * Safely access a nested property on a potentially undefined/null object
 * @param obj - The root object
 * @param path - The path to the nested property (e.g. "user.address.street")
 * @param fallback - Fallback value if any part of the path is undefined/null
 */
export function safeGetNested<T>(
  obj: any,
  path: string,
  fallback: T
): T {
  if (obj == null) return fallback;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return fallback;
    }
    current = current[part];
  }
  
  return current ?? fallback;
}

/**
 * Safely formats a number with toLocaleString
 * @param value - The number to format
 * @param fallback - Fallback string if value is invalid
 * @param options - Locale string options
 */
export function safeFormatNumber(
  value: number | string | null | undefined,
  fallback: string = '0',
  options?: Intl.NumberFormatOptions
): string {
  if (value == null) return fallback;
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return fallback;
  
  try {
    return num.toLocaleString(undefined, options);
  } catch (error) {
    console.error('Error formatting number:', error);
    return fallback;
  }
}

/**
 * Safely format a number to a specific number of decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places
 * @param fallback - Fallback string if value is invalid
 */
export function safeToFixed(
  value: number | string | null | undefined,
  decimals: number = 2,
  fallback: string = '0.00'
): string {
  if (value == null) return fallback;
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return fallback;
  
  try {
    return num.toFixed(decimals);
  } catch (error) {
    console.error('Error formatting number with toFixed:', error);
    return fallback;
  }
}

/**
 * Safely formats a date
 * @param value - The date to format
 * @param fallback - Fallback string if value is invalid
 * @param options - Date format options
 */
export function safeFormatDate(
  value: Date | string | number | null | undefined,
  fallback: string = 'N/A',
  options?: Intl.DateTimeFormatOptions
): string {
  if (value == null) return fallback;
  
  try {
    const date = value instanceof Date ? value : new Date(value);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return fallback;
    
    return date.toLocaleString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
}

/**
 * Safely executes a function, catching any errors
 * @param fn - The function to execute
 * @param fallback - Fallback value if function throws
 * @param args - Arguments to pass to the function
 */
export function safeExecute<T>(
  fn: (...args: any[]) => T,
  fallback: T,
  ...args: any[]
): T {
  try {
    return fn(...args);
  } catch (error) {
    console.error('Error executing function:', error);
    return fallback;
  }
}

/**
 * Safely parse JSON from a string
 * @param jsonString - The JSON string to parse
 * @param fallback - Fallback value if parsing fails
 */
export function safeParseJson<T>(
  jsonString: string | null | undefined,
  fallback: T
): T {
  if (jsonString == null) return fallback;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

/**
 * Safely stringify an object to JSON
 * @param value - The value to stringify
 * @param fallback - Fallback string if stringification fails
 */
export function safeStringify(
  value: any,
  fallback: string = '{}'
): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('Error stringifying value:', error);
    return fallback;
  }
}

/**
 * Safely handle array operations to prevent errors from undefined arrays
 */
export const safeArray = {
  map<T, U>(arr: T[] | null | undefined, callback: (item: T, index: number) => U, fallback: U[] = []): U[] {
    if (!Array.isArray(arr)) return fallback;
    try {
      return arr.map(callback);
    } catch (error) {
      console.error('Error in safeArray.map:', error);
      return fallback;
    }
  },
  
  filter<T>(arr: T[] | null | undefined, predicate: (item: T) => boolean, fallback: T[] = []): T[] {
    if (!Array.isArray(arr)) return fallback;
    try {
      return arr.filter(predicate);
    } catch (error) {
      console.error('Error in safeArray.filter:', error);
      return fallback;
    }
  },
  
  find<T>(arr: T[] | null | undefined, predicate: (item: T) => boolean, fallback?: T): T | undefined {
    if (!Array.isArray(arr)) return fallback;
    try {
      return arr.find(predicate) ?? fallback;
    } catch (error) {
      console.error('Error in safeArray.find:', error);
      return fallback;
    }
  },
  
  some<T>(arr: T[] | null | undefined, predicate: (item: T) => boolean, fallback: boolean = false): boolean {
    if (!Array.isArray(arr)) return fallback;
    try {
      return arr.some(predicate);
    } catch (error) {
      console.error('Error in safeArray.some:', error);
      return fallback;
    }
  },
  
  every<T>(arr: T[] | null | undefined, predicate: (item: T) => boolean, fallback: boolean = true): boolean {
    if (!Array.isArray(arr)) return fallback;
    try {
      return arr.every(predicate);
    } catch (error) {
      console.error('Error in safeArray.every:', error);
      return fallback;
    }
  },
  
  reduce<T, U>(arr: T[] | null | undefined, callback: (acc: U, item: T) => U, initialValue: U): U {
    if (!Array.isArray(arr)) return initialValue;
    try {
      return arr.reduce(callback, initialValue);
    } catch (error) {
      console.error('Error in safeArray.reduce:', error);
      return initialValue;
    }
  },
  
  get<T>(arr: T[] | null | undefined, index: number, fallback?: T): T | undefined {
    if (!Array.isArray(arr) || index < 0 || index >= arr.length) return fallback;
    return arr[index] ?? fallback;
  }
};