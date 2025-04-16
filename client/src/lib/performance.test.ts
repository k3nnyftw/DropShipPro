import { debounce, throttle, memoize } from './performance';

// Mock timers for testing debounce and throttle
jest.useFakeTimers();

describe('Performance Utilities', () => {
  describe('debounce', () => {
    it('delays function execution until after wait time', () => {
      const callback = jest.fn();
      const debounced = debounce(callback, 1000);
      
      // Call the debounced function
      debounced();
      
      // Verify callback was not called immediately
      expect(callback).not.toBeCalled();
      
      // Fast-forward time
      jest.advanceTimersByTime(500);
      expect(callback).not.toBeCalled();
      
      // Fast-forward to just before the wait time
      jest.advanceTimersByTime(499);
      expect(callback).not.toBeCalled();
      
      // Now complete the wait time
      jest.advanceTimersByTime(1);
      expect(callback).toBeCalled();
      expect(callback).toHaveBeenCalledTimes(1);
    });
    
    it('resets the timer when called again before wait time', () => {
      const callback = jest.fn();
      const debounced = debounce(callback, 1000);
      
      // Call the debounced function
      debounced();
      
      // Fast-forward half the wait time
      jest.advanceTimersByTime(500);
      
      // Call it again
      debounced();
      
      // Fast-forward to just after the original wait time
      jest.advanceTimersByTime(501);
      
      // Callback should not have been called yet
      expect(callback).not.toBeCalled();
      
      // Fast-forward the remaining time
      jest.advanceTimersByTime(500);
      
      // Now it should be called
      expect(callback).toBeCalled();
      expect(callback).toHaveBeenCalledTimes(1);
    });
    
    it('passes arguments to the callback', () => {
      const callback = jest.fn();
      const debounced = debounce(callback, 1000);
      
      // Call with arguments
      debounced('hello', 123);
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      // Check arguments were passed
      expect(callback).toHaveBeenCalledWith('hello', 123);
    });
  });
  
  describe('throttle', () => {
    it('executes function immediately', () => {
      const callback = jest.fn();
      const throttled = throttle(callback, 1000);
      
      // Call the throttled function
      throttled();
      
      // Verify callback was called immediately
      expect(callback).toBeCalled();
      expect(callback).toHaveBeenCalledTimes(1);
    });
    
    it('limits execution to once per wait time', () => {
      const callback = jest.fn();
      const throttled = throttle(callback, 1000);
      
      // Call initially
      throttled();
      expect(callback).toHaveBeenCalledTimes(1);
      
      // Call again before wait time
      throttled();
      throttled();
      expect(callback).toHaveBeenCalledTimes(1); // Should still be 1
      
      // Fast-forward past wait time
      jest.advanceTimersByTime(1000);
      
      // Another call should happen since we called during wait time
      expect(callback).toHaveBeenCalledTimes(2);
    });
    
    it('uses the most recent arguments for delayed calls', () => {
      const callback = jest.fn();
      const throttled = throttle(callback, 1000);
      
      // Initial call
      throttled('first');
      expect(callback).toHaveBeenCalledWith('first');
      expect(callback).toHaveBeenCalledTimes(1);
      
      // Multiple calls with different args during wait time
      throttled('second');
      throttled('third');
      throttled('last');
      
      // Should still only have been called once with initial args
      expect(callback).toHaveBeenCalledTimes(1);
      
      // Fast-forward past wait time
      jest.advanceTimersByTime(1000);
      
      // Should now be called again with the last args
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith('last');
    });
  });
  
  describe('memoize', () => {
    it('caches results for repeated calls with same arguments', () => {
      // Create a spy on a computationally expensive function
      const expensive = jest.fn((a, b) => a + b);
      const memoized = memoize(expensive);
      
      // First call should compute the result
      expect(memoized(5, 10)).toBe(15);
      expect(expensive).toHaveBeenCalledTimes(1);
      
      // Second call with same args should use cached result
      expect(memoized(5, 10)).toBe(15);
      expect(expensive).toHaveBeenCalledTimes(1); // Still only called once
      
      // Call with different args should compute a new result
      expect(memoized(10, 20)).toBe(30);
      expect(expensive).toHaveBeenCalledTimes(2);
      
      // Call with original args should still use cache
      expect(memoized(5, 10)).toBe(15);
      expect(expensive).toHaveBeenCalledTimes(2); // No additional calls
    });
    
    it('preserves function context (this value)', () => {
      // Create an object with a method
      const obj = {
        value: 10,
        method: function(x: number) {
          return this.value + x;
        }
      };
      
      // Spy on the method
      const methodSpy = jest.spyOn(obj, 'method');
      
      // Memoize the method
      obj.method = memoize(obj.method);
      
      // Call the memoized method
      expect(obj.method(5)).toBe(15);
      expect(methodSpy).toHaveBeenCalledTimes(1);
      
      // Call again with same args
      expect(obj.method(5)).toBe(15);
      expect(methodSpy).toHaveBeenCalledTimes(1); // Still only called once
      
      // Change the value property
      obj.value = 20;
      
      // Call again with same args
      // Note: This will still return 15 because the context at call time
      // isn't part of the cache key in our implementation
      expect(obj.method(5)).toBe(15);
      expect(methodSpy).toHaveBeenCalledTimes(1);
    });
  });
});