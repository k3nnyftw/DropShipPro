import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMobile, useBreakpoint, breakpoints } from '@/hooks/use-mobile';

/**
 * Mobile optimization utilities for improving performance on mobile devices
 */

// Direct implementation of responsive components
/**
 * Component that only renders on mobile devices
 */
export const MobileOnly = ({ children }: { children: React.ReactNode }) => {
  const { isMobile } = useMobile();
  return isMobile ? <>{children}</> : null;
};

/**
 * Component that only renders on desktop devices
 */
export const DesktopOnly = ({ children }: { children: React.ReactNode }) => {
  const { isDesktop } = useMobile();
  return isDesktop ? <>{children}</> : null;
};

/**
 * Component that only renders on tablet devices
 */
export const TabletOnly = ({ children }: { children: React.ReactNode }) => {
  const { isTablet } = useMobile();
  return isTablet ? <>{children}</> : null;
};

/**
 * Component that renders on mobile and tablet devices
 */
export const MobileAndTablet = ({ children }: { children: React.ReactNode }) => {
  const { isMobile, isTablet } = useMobile();
  return (isMobile || isTablet) ? <>{children}</> : null;
};

/**
 * Component that renders on tablet and desktop devices
 */
export const TabletAndDesktop = ({ children }: { children: React.ReactNode }) => {
  const { isTablet, isDesktop } = useMobile();
  return (isTablet || isDesktop) ? <>{children}</> : null;
};

/**
 * Component that renders different content based on device type
 */
export const Responsive = ({ 
  mobile, 
  tablet, 
  desktop 
}: { 
  mobile: React.ReactNode;
  tablet?: React.ReactNode;
  desktop: React.ReactNode;
}) => {
  const { deviceType } = useMobile();
  
  if (deviceType === 'mobile') {
    return <>{mobile}</>;
  }
  
  if (deviceType === 'tablet') {
    return <>{tablet || desktop}</>;
  }
  
  return <>{desktop}</>;
};

/**
 * LazyLoad component for delaying rendering of non-critical components
 * until they are close to the viewport
 * @param children Component to lazy load
 * @param rootMargin Distance from viewport to trigger loading
 * @param threshold Visibility threshold to trigger loading
 * @param placeholder Component to render while loading
 */
export function LazyLoad({
  children,
  rootMargin = '100px',
  threshold = 0.1,
  placeholder = null,
}: {
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  placeholder?: React.ReactNode;
}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = ref.current;
    if (!current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(current);

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [rootMargin, threshold]);

  return (
    <div ref={ref}>
      {isInView ? children : placeholder}
    </div>
  );
}

/**
 * Progressively load images with low quality placeholders
 * @param src High quality image URL
 * @param lowQualitySrc Low quality placeholder image URL
 * @param alt Image alt text
 * @param className CSS classes
 * @param width Image width
 * @param height Image height
 */
export function ProgressiveImage({
  src,
  lowQualitySrc,
  alt,
  className = '',
  width,
  height,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  lowQualitySrc: string;
}) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="relative overflow-hidden">
      {!loaded && (
        <img
          src={lowQualitySrc}
          alt={alt}
          className={`${className} absolute inset-0 w-full h-full transition-opacity duration-300 blur-sm`}
          width={width}
          height={height}
          {...props}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  );
}

/**
 * Adaptive content component that displays different content based on device type
 * to optimize both performance and UX
 * @param mobile Content to show on mobile devices
 * @param tablet Content to show on tablet devices (optional)
 * @param desktop Content to show on desktop devices
 */
export function AdaptiveContent({
  mobile,
  tablet,
  desktop,
}: {
  mobile: React.ReactNode;
  tablet?: React.ReactNode;
  desktop: React.ReactNode;
}) {
  const { deviceType } = useMobile();
  
  if (deviceType === 'mobile') return <>{mobile}</>;
  if (deviceType === 'tablet') return <>{tablet ?? desktop}</>;
  return <>{desktop}</>;
}

/**
 * Simplified view for mobile devices to reduce clutter and improve performance
 * @param children Main content 
 * @param fullContent Complete content for larger screens
 * @param breakpoint Screen width threshold
 */
export function SimplifiedMobileView({
  children,
  fullContent,
  breakpoint = breakpoints.md,
}: {
  children: React.ReactNode;
  fullContent: React.ReactNode;
  breakpoint?: number;
}) {
  const isBelowBreakpoint = useBreakpoint(breakpoint);
  
  return (
    <>
      {isBelowBreakpoint ? children : fullContent}
    </>
  );
}

/**
 * Hook to limit unnecessary re-renders on mobile devices
 * @param value The value to track
 * @param delay Minimum delay between updates
 * @returns Throttled value that updates less frequently on mobile
 */
export function useThrottledValue<T>(value: T, delay: number = 300): T {
  const { isMobile } = useMobile();
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(Date.now());
  
  useEffect(() => {
    if (!isMobile) {
      // On desktop, update immediately
      setThrottledValue(value);
      lastUpdated.current = Date.now();
      return;
    }
    
    // On mobile, throttle updates
    const timeSinceLastUpdate = Date.now() - lastUpdated.current;
    
    if (timeSinceLastUpdate >= delay) {
      // Enough time has passed, update immediately
      setThrottledValue(value);
      lastUpdated.current = Date.now();
    } else {
      // Not enough time has passed, schedule update
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, delay - timeSinceLastUpdate);
      
      return () => clearTimeout(timeoutId);
    }
  }, [value, delay, isMobile]);
  
  return throttledValue;
}

/**
 * Hook to reduce animations on mobile devices to improve performance
 * @param enabled Whether the animations should be enabled by default
 * @returns Whether animations should be shown based on device and preferences
 */
export function useReducedAnimations(enabled: boolean = true): boolean {
  const { isMobile } = useMobile();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  
  useEffect(() => {
    // Try to access battery info if available
    if ('getBattery' in navigator) {
      // @ts-ignore
      navigator.getBattery().then((battery) => {
        setBatteryLevel(battery.level);
        
        // Update when battery level changes
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(battery.level);
        });
      }).catch(() => {
        // Battery API not available or permission denied
        setBatteryLevel(null);
      });
    }
  }, []);
  
  // Disable animations on mobile with low battery
  const shouldReduceAnimations = 
    !enabled || 
    (isMobile && batteryLevel !== null && batteryLevel < 0.2);
  
  return !shouldReduceAnimations;
}

/**
 * Network connection types
 */
interface NetworkInformation {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  saveData: boolean;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
}

/**
 * Load different image quality based on network speed
 * @param highQualitySrc High quality image URL for fast connections
 * @param lowQualitySrc Low quality image URL for slow connections
 * @returns The appropriate image source based on connection speed
 */
export function useAdaptiveImageQuality(
  highQualitySrc: string,
  lowQualitySrc: string
): string {
  const [imageSrc, setImageSrc] = useState(highQualitySrc);
  
  useEffect(() => {
    // Check if Network Information API is available
    if (navigator.connection) {
      const connection = navigator.connection;
      
      // Handler function to update image source based on connection
      const updateImageQuality = () => {
        if (
          connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g' ||
          connection.saveData
        ) {
          setImageSrc(lowQualitySrc);
        } else {
          setImageSrc(highQualitySrc);
        }
      };
      
      // Set initial image quality
      updateImageQuality();
      
      // Listen for connection changes
      connection.addEventListener('change', updateImageQuality);
      
      // Cleanup
      return () => {
        connection.removeEventListener('change', updateImageQuality);
      };
    }
  }, [highQualitySrc, lowQualitySrc]);
  
  return imageSrc;
}

/**
 * Virtualized list component that only renders items in or near the viewport
 * Dramatically reduces rendering workload for long lists on mobile
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  windowSize = 5,
  className = '',
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  windowSize?: number;
  className?: string;
}) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollTop);
    }
  }, []);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);
  
  // Calculate which items should be rendered
  const startIndex = Math.max(0, Math.floor(scrollPosition / itemHeight) - windowSize);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollPosition + (containerRef.current?.clientHeight || 0)) / itemHeight) + windowSize
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return (
    <div 
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ position: 'relative', height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Component to handle swipe gestures
 * @param children Children components
 * @param onSwipeLeft Callback for left swipe
 * @param onSwipeRight Callback for right swipe
 * @param threshold Minimum distance for swipe detection
 */
export function SwipeHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null); // Reset end position
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;
    
    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

/**
 * Render different content based on device type
 * @param mobile Content for mobile devices
 * @param desktop Content for desktop devices
 */
export function ResponsiveRender({
  mobile,
  desktop,
}: {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
}) {
  const { isMobile } = useMobile();
  
  return (
    <>
      {isMobile ? mobile : desktop}
    </>
  );
}

/**
 * Component for dynamically reducing UI complexity on slower devices
 * @param complexity Complexity level of the UI (1-3, with 3 being most complex)
 * @param children Children components
 * @param fallback Optional fallback component for low-performance devices
 */
export function PerformanceAdaptiveUI({
  complexity = 1,
  children,
  fallback,
}: {
  complexity?: 1 | 2 | 3;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [canRender, setCanRender] = useState(false);
  const { isMobile } = useMobile();
  
  useEffect(() => {
    // Simple performance test to measure rendering capability
    const startTime = performance.now();
    let counter = 0;
    
    // Create a simple computational task
    const iterations = complexity * 50000;
    for (let i = 0; i < iterations; i++) {
      counter += Math.sqrt(i);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // If the test takes too long, use simpler UI for better performance
    // Thresholds based on complexity level
    const threshold = isMobile 
      ? 50 * complexity // Stricter threshold for mobile
      : 100 * complexity; // More lenient for desktop
      
    setCanRender(duration < threshold);
  }, [complexity, isMobile]);
  
  return <>{canRender ? children : fallback}</>;
}