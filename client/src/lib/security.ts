/**
 * Security utilities for client-side protection
 * These utilities help protect against common security issues in web applications
 */

/**
 * Sanitizes a string to prevent XSS attacks
 * @param input - String to sanitize
 * @returns Sanitized string with potentially dangerous characters escaped
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Creates a content security policy nonce for use with inline scripts
 * @returns Random nonce string
 */
export function generateNonce(): string {
  // Generate random string for CSP nonce
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Validates a URL to prevent open redirects
 * @param url - URL to validate
 * @param allowedDomains - List of allowed domains for external links
 * @returns Whether the URL is safe
 */
export function isSafeUrl(url: string, allowedDomains: string[] = []): boolean {
  if (!url) return false;
  
  try {
    // Allow relative URLs
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true;
    }
    
    // Check for javascript: URLs
    if (url.toLowerCase().startsWith('javascript:')) {
      return false;
    }
    
    // Check for data: URLs
    if (url.toLowerCase().startsWith('data:')) {
      return false;
    }
    
    // Parse the URL to check against allowed domains
    const parsedUrl = new URL(url);
    
    // Allow same origin
    if (parsedUrl.origin === window.location.origin) {
      return true;
    }
    
    // Check against allowed external domains
    return allowedDomains.some(domain => 
      parsedUrl.hostname === domain || 
      parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch (error) {
    // URL parsing failed - reject the URL
    console.error('Invalid URL:', url, error);
    return false;
  }
}

/**
 * Safely opens external links to prevent tab nabbing attacks
 * @param url - URL to open
 * @param allowedDomains - List of allowed domains for external links
 * @returns Whether the URL was opened
 */
export function safeOpenExternalLink(url: string, allowedDomains: string[] = []): boolean {
  if (!isSafeUrl(url, allowedDomains)) {
    console.error('Attempted to open unsafe URL:', url);
    return false;
  }
  
  // Open URL with security features enabled
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * Sets security headers in fetch requests
 * @param headers - Existing headers to extend
 * @returns Headers with security enhancements
 */
export function enhanceRequestHeaders(headers: HeadersInit = {}): Headers {
  const enhancedHeaders = new Headers(headers);
  
  // Prevent MIME type sniffing
  enhancedHeaders.set('X-Content-Type-Options', 'nosniff');
  
  // CSRF protection
  if (document.cookie) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      enhancedHeaders.set('X-CSRF-Token', csrfToken);
    }
  }
  
  return enhancedHeaders;
}

/**
 * Gets CSRF token from meta tag
 * This assumes your backend sets a CSRF token in a meta tag named "csrf-token"
 */
function getCsrfToken(): string | null {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
}

/**
 * Detects if the application is running in a secure context (HTTPS)
 */
export function isSecureContext(): boolean {
  return window.isSecureContext;
}

/**
 * Detects if the application is loaded in an iframe
 * Used to prevent clickjacking
 */
export function isInIframe(): boolean {
  try {
    return window !== window.top;
  } catch (e) {
    // If we can't access window.top, we're in a cross-origin iframe
    return true;
  }
}

/**
 * Prevents the application from running in iframes (clickjacking protection)
 * Call this early in your application initialization
 */
export function preventFraming(): void {
  if (isInIframe()) {
    // Break out of the iframe if possible
    try {
      // TypeScript doesn't know that we've already checked this with isInIframe()
      // Use non-null assertion with proper safeguards
      const topWindow = window.top as Window;
      topWindow.location.href = window.location.href;
    } catch (e) {
      // If we can't break out, show an error or redirect
      document.body.innerHTML = '<h1>For security reasons, this application cannot run in an iframe.</h1>';
    }
  }
}

/**
 * Rate limits a function to prevent abuse
 * @param fn - Function to rate limit
 * @param maxCalls - Maximum number of calls allowed in the time window
 * @param timeWindow - Time window in milliseconds
 * @returns Rate-limited function
 */
export function rateLimit<T extends (...args: any[]) => any>(
  fn: T,
  maxCalls: number = 5,
  timeWindow: number = 1000
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  const calls: number[] = [];
  
  return function(...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    
    // Remove calls outside the time window
    while (calls.length > 0 && calls[0] < now - timeWindow) {
      calls.shift();
    }
    
    // Check if we're over the rate limit
    if (calls.length >= maxCalls) {
      console.warn('Rate limit exceeded');
      return undefined;
    }
    
    // Add this call to the log
    calls.push(now);
    
    // Execute the function
    return fn(...args);
  };
}