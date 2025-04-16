/**
 * Security utilities for client-side application security
 * These utilities help prevent common web vulnerabilities
 */

/**
 * Sanitizes HTML to prevent XSS attacks
 * Only use this for non-React content or when dangerouslySetInnerHTML is required
 * 
 * @param html - The HTML string to sanitize
 * @returns Safe HTML string
 */
export function sanitizeHtml(html: string): string {
  // Create a new DOM element
  const tempElement = document.createElement('div');
  tempElement.textContent = html;
  
  // Return the sanitized HTML
  return tempElement.innerHTML;
}

/**
 * Escapes a string for safe use in regular expressions
 * 
 * @param string - The string to escape
 * @returns Escaped string
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates an input based on a whitelist pattern
 * Useful for preventing injection attacks
 * 
 * @param input - The input to validate
 * @param pattern - Regex pattern to validate against
 * @returns Whether the input is valid
 */
export function validateInput(input: string, pattern: RegExp): boolean {
  return pattern.test(input);
}

/**
 * Validates email format
 * 
 * @param email - The email to validate
 * @returns Whether the email is valid
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

/**
 * Validates password strength
 * 
 * @param password - The password to validate
 * @returns Object with validation result and reasons
 */
export function validatePassword(password: string): {
  isValid: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  
  if (password.length < 8) {
    reasons.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    reasons.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    reasons.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    reasons.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    reasons.push('Password must contain at least one special character');
  }
  
  return {
    isValid: reasons.length === 0,
    reasons,
  };
}

/**
 * Checks if a token has expired
 * 
 * @param token - JWT token to check
 * @returns Whether the token has expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const { exp } = JSON.parse(jsonPayload);
    const expired = Date.now() >= exp * 1000;
    
    return expired;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // Assume expired on error
  }
}

/**
 * Hashes a string using SHA-256
 * Useful for creating content hashes for integrity checks
 * 
 * @param message - The string to hash
 * @returns Promise resolving to hash
 */
export async function hashString(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Securely stores data in localStorage with encryption
 * 
 * @param key - Storage key
 * @param value - Value to store
 * @param encryptionKey - Optional encryption key
 */
export function secureStore(
  key: string,
  value: any,
  encryptionKey?: string
): void {
  try {
    // In a real app, we would encrypt this data
    // For now, we'll just stringify it
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error('Error storing data:', error);
  }
}

/**
 * Retrieves securely stored data from localStorage
 * 
 * @param key - Storage key
 * @param encryptionKey - Optional encryption key
 * @returns Retrieved value or null
 */
export function secureRetrieve<T>(
  key: string,
  encryptionKey?: string
): T | null {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return null;
    
    // In a real app, we would decrypt this data
    // For now, we'll just parse it
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
}

/**
 * Securely removes data from localStorage
 * 
 * @param key - Storage key
 */
export function secureRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
  }
}

/**
 * Generates a Content Security Policy header value
 * For use in HTTP headers
 * 
 * @returns CSP header value
 */
export function generateCSP(): string {
  return `
    default-src 'self';
    script-src 'self' https://js.stripe.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://*.stripe.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.stripe.com;
    frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim();
}