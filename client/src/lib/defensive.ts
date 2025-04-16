/**
 * Defensive programming utilities to handle null/undefined values
 * and prevent runtime errors throughout the application
 */

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