import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Creates a lazy loaded component with TypeScript type safety
 * This helps ensure that lazy loaded components have proper props typing
 * 
 * @template T - The component props type
 * @param importFn - Function that dynamically imports the component
 * @param exportName - Optional: The component's export name (for named exports)
 * @returns A React lazy component
 */
export function lazyImport<
  T extends ComponentType<any>,
  U extends { [K in N]: T },
  N extends keyof U
>(
  importFn: () => Promise<U>, 
  exportName: N
): LazyExoticComponent<T> {
  return lazy(() => 
    importFn().then((module) => ({ default: module[exportName] }))
  );
}

/**
 * Creates a lazy loaded component from a default export with TypeScript type safety
 * 
 * @template T - The component props type
 * @param importFn - Function that dynamically imports the component
 * @returns A React lazy component
 */
export function lazyImportDefault<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(importFn);
}