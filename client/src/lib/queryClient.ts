import { QueryClient, QueryFunction, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

/**
 * Enhanced error handling for API responses
 * Attempts to parse and return structured error information when available
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to parse as JSON first
    let errorMessage: string;
    let errorData: any = null;
    
    try {
      // Check if content type is JSON
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await res.json();
        errorMessage = errorData.error || errorData.message || res.statusText;
      } else {
        errorMessage = await res.text() || res.statusText;
      }
    } catch (parseError) {
      // If JSON parsing fails, fall back to text
      errorMessage = await res.text() || res.statusText;
    }
    
    // Create a custom error with status code, message, and any additional error data
    const error = new Error(`${res.status}: ${errorMessage}`);
    (error as any).status = res.status;
    (error as any).statusText = res.statusText;
    (error as any).errorData = errorData;
    
    throw error;
  }
}

/**
 * Enhanced API request function with better error handling and retry logic
 */
export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: {
    retries?: number;
    retryDelay?: number;
    headers?: Record<string, string>;
  }
): Promise<T> {
  const { 
    retries = 0, 
    retryDelay = 300,
    headers = {} 
  } = options || {};
  
  let attempts = 0;
  
  const executeRequest = async (): Promise<T> => {
    try {
      attempts++;
      
      const res = await fetch(url, {
        method,
        headers: {
          ...(data ? { "Content-Type": "application/json" } : {}),
          ...headers
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      
      await throwIfResNotOk(res);
      return await res.json() as T;
    } catch (error: any) {
      // Only retry on network errors or 5xx server errors
      if (attempts <= retries && (
          !error.status || // Network error
          (error.status >= 500 && error.status < 600) // Server error
      )) {
        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, attempts - 1) * (0.9 + Math.random() * 0.2);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeRequest();
      }
      
      throw error;
    }
  };
  
  return executeRequest();
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Enhanced query function with better caching and error handling
 */
export const getQueryFn = <TData>(options: {
  on401: UnauthorizedBehavior;
  cacheTTL?: number; // Time in ms to consider cache valid
}): QueryFunction<TData> => {
  const { on401: unauthorizedBehavior, cacheTTL = 600000 } = options; // Default 10 minutes cache
  
  return async ({ queryKey, signal }) => {
    // Support for AbortController
    const controller = new AbortController();
    // Merge with existing signal if provided
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }
    
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
        signal: controller.signal,
        headers: {
          // Add cache control headers
          'Cache-Control': 'max-age=600', // 10 minutes browser cache
        }
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null as unknown as TData;
      }

      await throwIfResNotOk(res);
      
      // Get data from response
      const data = await res.json();
      
      // Just return the data directly
      return data as TData;
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        // Handle query cancellation
        throw new Error('Query was cancelled');
      }
      throw error;
    }
  };
};

// Create query cache with global error handling
const queryCache = new QueryCache({
  onError: (error: any, query) => {
    // Show toast for query errors, except for specifically flagged queries
    if (query.meta?.suppressErrorToast !== true) {
      toast({
        title: "Data fetch error",
        description: error?.message || "An error occurred while fetching data",
        variant: "destructive"
      });
    }
    
    // Log error to console or error monitoring service
    console.error(`Query error: ${error?.message}`, error);
  }
});

// Create mutation cache with global error handling
const mutationCache = new MutationCache({
  onError: (error: any, _variables, _context, mutation) => {
    // Show toast for mutation errors, except for specifically flagged mutations
    if (mutation.meta?.suppressErrorToast !== true) {
      toast({
        title: "Operation failed",
        description: error?.message || "An error occurred while processing your request",
        variant: "destructive"
      });
    }
    
    // Log error to console or error monitoring service
    console.error(`Mutation error: ${error?.message}`, error);
  }
});

// Create and export the enhanced query client
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      retry: 1, // Retry failed queries once
      refetchOnWindowFocus: true, // Enable refetching when window regains focus
      refetchOnReconnect: true, // Enable refetching when reconnecting
      refetchOnMount: true, // Enable refetching when component mounts
      staleTime: 300000, // Consider data stale after 5 minutes (300000ms)
      gcTime: 3600000, // Keep data in cache for 1 hour (3600000ms) - renamed from cacheTime in v5
      // Add structure data validation here when needed
    },
    mutations: {
      retry: 1, // Retry failed mutations once
      onSuccess: () => {
        // Optionally show success toast for all mutations
        // We're leaving this commented out to avoid excessive notifications
        // toast({ title: "Success", description: "Operation completed successfully" });
      }
    },
  },
});
