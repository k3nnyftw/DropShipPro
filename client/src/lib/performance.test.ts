import { 
  memoize, 
  debounce, 
  throttle,
  processInChunks,
  createSignificantChangeDetector
} from './performance';

// Mock timeout functions
jest.useFakeTimers();

describe('Performance utilities', () => {
  describe('memoize', () => {
    it('should cache function results based on arguments', () => {
      // Setup
      const expensiveFunction = jest.fn((a: number, b: number) => a + b);
      const memoizedFunction = memoize(expensiveFunction);
      
      // First call should execute the function
      expect(memoizedFunction(1, 2)).toBe(3);
      expect(expensiveFunction).toHaveBeenCalledTimes(1);
      
      // Second call with same arguments should use cached result
      expect(memoizedFunction(1, 2)).toBe(3);
      expect(expensiveFunction).toHaveBeenCalledTimes(1);
      
      // Call with different arguments should execute the function again
      expect(memoizedFunction(2, 3)).toBe(5);
      expect(expensiveFunction).toHaveBeenCalledTimes(2);
      
      // Verify cache is working as expected
      expect(memoizedFunction(1, 2)).toBe(3);
      expect(memoizedFunction(2, 3)).toBe(5);
      expect(expensiveFunction).toHaveBeenCalledTimes(2);
    });
    
    it('should handle object arguments correctly', () => {
      // Setup
      const processObject = jest.fn((obj: Record<string, any>) => obj.value * 2);
      const memoizedFunction = memoize(processObject);
      
      // First call
      expect(memoizedFunction({ value: 5 })).toBe(10);
      expect(processObject).toHaveBeenCalledTimes(1);
      
      // Call with equivalent object should use cache
      expect(memoizedFunction({ value: 5 })).toBe(10);
      expect(processObject).toHaveBeenCalledTimes(1);
      
      // Call with different object
      expect(memoizedFunction({ value: 10 })).toBe(20);
      expect(processObject).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('debounce', () => {
    it('should delay function execution until wait time has passed', () => {
      // Setup
      const mockFunction = jest.fn();
      const debouncedFunction = debounce(mockFunction, 1000);
      
      // Call the debounced function
      debouncedFunction();
      
      // Function should not be called yet
      expect(mockFunction).not.toHaveBeenCalled();
      
      // Fast-forward time
      jest.advanceTimersByTime(500);
      expect(mockFunction).not.toHaveBeenCalled();
      
      // Call it again (should reset the timer)
      debouncedFunction();
      
      // Advance halfway
      jest.advanceTimersByTime(500);
      expect(mockFunction).not.toHaveBeenCalled();
      
      // Advance the rest of the way
      jest.advanceTimersByTime(500);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });
    
    it('should pass the latest arguments to the function', () => {
      // Setup
      const mockFunction = jest.fn();
      const debouncedFunction = debounce(mockFunction, 1000);
      
      // Call with initial arguments
      debouncedFunction('first');
      
      // Update arguments before timeout expires
      debouncedFunction('second');
      
      // Advance time to trigger function
      jest.advanceTimersByTime(1000);
      
      // Should be called with the latest arguments
      expect(mockFunction).toHaveBeenCalledWith('second');
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('throttle', () => {
    it('should limit function execution frequency', () => {
      // Setup
      const mockFunction = jest.fn();
      const throttledFunction = throttle(mockFunction, 1000);
      
      // First call should execute immediately
      throttledFunction();
      expect(mockFunction).toHaveBeenCalledTimes(1);
      
      // Calling again before limit should not execute
      throttledFunction();
      throttledFunction();
      expect(mockFunction).toHaveBeenCalledTimes(1);
      
      // Advance time past limit
      jest.advanceTimersByTime(1000);
      
      // Should have executed once more with the last arguments
      expect(mockFunction).toHaveBeenCalledTimes(2);
    });
    
    it('should execute with the latest arguments after throttle period', () => {
      const mockFunction = jest.fn();
      const throttledFunction = throttle(mockFunction, 1000);
      
      // First call executes immediately
      throttledFunction('first');
      expect(mockFunction).toHaveBeenCalledWith('first');
      
      // These calls are throttled, but the last argument is saved
      throttledFunction('second');
      throttledFunction('third');
      throttledFunction('fourth');
      
      // Still only called once
      expect(mockFunction).toHaveBeenCalledTimes(1);
      
      // Advance time past throttle period
      jest.advanceTimersByTime(1000);
      
      // Should execute with the latest arguments
      expect(mockFunction).toHaveBeenCalledWith('fourth');
      expect(mockFunction).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('processInChunks', () => {
    it('should process all items in chunks', async () => {
      // Setup - create an array of numbers and a processor that doubles them
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const processor = jest.fn((num: number) => num * 2);
      
      // Start processing in chunks of 3
      const resultPromise = processInChunks(items, processor, 3, 100);
      
      // First chunk should be processed immediately
      expect(processor).toHaveBeenCalledTimes(3);
      expect(processor).toHaveBeenNthCalledWith(1, 1);
      expect(processor).toHaveBeenNthCalledWith(2, 2);
      expect(processor).toHaveBeenNthCalledWith(3, 3);
      
      // Advance time for the next chunk
      jest.advanceTimersByTime(100);
      expect(processor).toHaveBeenCalledTimes(6);
      
      // Advance for remaining chunks
      jest.advanceTimersByTime(100);
      expect(processor).toHaveBeenCalledTimes(9);
      
      jest.advanceTimersByTime(100);
      expect(processor).toHaveBeenCalledTimes(10);
      
      // Get the result
      const result = await resultPromise;
      
      // Verify the result
      expect(result).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    });
  });
  
  describe('createSignificantChangeDetector', () => {
    it('should detect significant numeric changes', () => {
      const detector = createSignificantChangeDetector(10, 5);
      
      // Small change (less than threshold)
      expect(detector.hasChanged(12)).toBe(false);
      
      // Significant change
      expect(detector.hasChanged(16)).toBe(true);
      
      // Update the tracked value
      detector.update(16);
      
      // Small change from new value
      expect(detector.hasChanged(18)).toBe(false);
      
      // Significant change from new value
      expect(detector.hasChanged(22)).toBe(true);
      
      // Verify current value
      expect(detector.currentValue()).toBe(16);
    });
    
    it('should detect changes in objects', () => {
      const initialObject = { name: 'John', age: 30 };
      const detector = createSignificantChangeDetector(initialObject);
      
      // Same object structure and values
      expect(detector.hasChanged({ name: 'John', age: 30 })).toBe(false);
      
      // Changed value
      expect(detector.hasChanged({ name: 'John', age: 31 })).toBe(true);
      
      // Update the tracked object
      detector.update({ name: 'Jane', age: 25 });
      
      // Verify tracking the new object
      expect(detector.hasChanged({ name: 'Jane', age: 25 })).toBe(false);
      expect(detector.hasChanged({ name: 'Jane', age: 26 })).toBe(true);
      
      // Verify current value
      const currentValue = detector.currentValue();
      expect(currentValue).toEqual({ name: 'Jane', age: 25 });
      
      // Ensure we have a copy, not the original reference
      expect(currentValue).not.toBe(initialObject);
    });
  });
});