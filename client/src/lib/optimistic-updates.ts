import { QueryClient } from '@tanstack/react-query';

/**
 * Helper utility for implementing optimistic UI updates with TanStack Query
 * This allows UI to update immediately before the server request completes
 */

interface OptimisticUpdateOptions<TData, TVariables> {
  queryClient: QueryClient;
  queryKey: unknown[];
  variables: TVariables;
  // Function to update the existing data optimistically
  updateFn: (oldData: TData | undefined) => TData;
  // Optional: keys to include in the rollback data from the original data
  rollbackKeys?: (keyof TData)[];
}

/**
 * Prepares an optimistic update configuration for TanStack Query mutations
 * 
 * @example
 * ```tsx
 * const mutation = useMutation({
 *   mutationFn: (newTodo) => apiRequest('POST', '/api/todos', newTodo),
 *   ...prepareOptimisticUpdate({
 *     queryClient,
 *     queryKey: ['/api/todos'],
 *     variables: newTodo,
 *     updateFn: (old) => [...(old || []), { ...newTodo, id: 'temp-id' }]
 *   })
 * });
 * ```
 */
export function prepareOptimisticUpdate<TData, TVariables>({
  queryClient,
  queryKey,
  variables,
  updateFn,
  rollbackKeys = [],
}: OptimisticUpdateOptions<TData, TVariables>) {
  return {
    // Update the data optimistically before the mutation
    onMutate: async (variables: TVariables) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // If we have specific keys to preserve for rollback, create a focused backup
      const rollbackData = rollbackKeys.length > 0 && previousData
        ? Object.fromEntries(
            rollbackKeys.map(key => [key, previousData[key]])
          )
        : previousData;

      // Optimistically update to the new value
      queryClient.setQueryData<TData>(queryKey, (old) => updateFn(old));

      // Return a context object with the snapshot
      return { previousData: rollbackData, variables };
    },

    // If the mutation fails, use the rollback context returned from onMutate
    onError: (_err: Error, _variables: TVariables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  };
}

/**
 * Helper function to create an optimistic update for an array of items
 * Handles common operations like adding, updating, or removing items
 */
export function optimisticArrayUpdate<TItem extends { id: string | number }, TVariables>({
  queryClient,
  queryKey,
  variables,
  action = 'add',
  getId = (item: TItem) => item.id,
  transformItem = (item: TVariables) => item as unknown as TItem,
}: {
  queryClient: QueryClient;
  queryKey: unknown[];
  variables: TVariables;
  action: 'add' | 'update' | 'remove';
  getId?: (item: TItem) => string | number;
  transformItem?: (item: TVariables) => TItem;
}) {
  return prepareOptimisticUpdate({
    queryClient,
    queryKey,
    variables,
    updateFn: (old: TItem[] | undefined) => {
      const currentData = old || [];
      
      switch (action) {
        case 'add':
          return [...currentData, transformItem(variables)];
        
        case 'update': {
          const transformedItem = transformItem(variables);
          const itemId = getId(transformedItem);
          return currentData.map(item => 
            getId(item) === itemId ? transformedItem : item
          );
        }
        
        case 'remove': {
          // For remove, variables is expected to be the id or an object with id
          const idToRemove = typeof variables === 'string' || typeof variables === 'number'
            ? variables
            : getId(transformItem(variables));
            
          return currentData.filter(item => getId(item) !== idToRemove);
        }
        
        default:
          return currentData;
      }
    }
  });
}