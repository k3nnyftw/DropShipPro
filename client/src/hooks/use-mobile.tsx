import { useState, useEffect, useMemo } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';
type Orientation = 'portrait' | 'landscape';

interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  orientation: Orientation;
  width: number;
  height: number;
  supportsTouch: boolean;
}

/**
 * Detect device type, screen size, orientation and touch support
 * This hook provides comprehensive information about the user's device
 * and automatically updates when device parameters change
 */
export function useMobile(): MobileState {
  // Default to desktop for SSR
  const initialState: MobileState = {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: 'desktop',
    orientation: 'landscape',
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    supportsTouch: false,
  };
  
  const [state, setState] = useState<MobileState>(initialState);
  
  useEffect(() => {
    // Skip if not in browser
    if (typeof window === 'undefined') return;
    
    // Detect touch support
    const hasTouch = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0);
    
    // Helper to determine device type based on screen width
    const getDeviceType = (width: number): DeviceType => {
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    };
    
    // Helper to determine orientation
    const getOrientation = (): Orientation => {
      return window.matchMedia('(orientation: portrait)').matches 
        ? 'portrait' 
        : 'landscape';
    };
    
    // Update state with current values
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const deviceType = getDeviceType(width);
      
      setState({
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
        deviceType,
        orientation: getOrientation(),
        width,
        height,
        supportsTouch: hasTouch,
      });
    };
    
    // Set initial values
    updateDimensions();
    
    // Listen for window resize
    window.addEventListener('resize', updateDimensions);
    
    // Listen for orientation change
    window.addEventListener('orientationchange', updateDimensions);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);
  
  return state;
}

/**
 * Common mobile breakpoints for responsive design
 */
export const breakpoints = {
  xs: 320,  // Extra small devices (phones)
  sm: 576,  // Small devices (large phones)
  md: 768,  // Medium devices (tablets)
  lg: 992,  // Large devices (desktops)
  xl: 1200, // Extra large devices (large desktops)
  xxl: 1400, // Extra extra large devices
};

/**
 * Hook to check if the current screen width is below a specified breakpoint
 * @param breakpoint - The breakpoint to check against (in pixels)
 * @returns Whether the current screen width is below the breakpoint
 */
export function useBreakpoint(breakpoint: number): boolean {
  const { width } = useMobile();
  return width < breakpoint;
}

/**
 * Predefined breakpoint hooks for common screen sizes
 */
export const useBreakpoints = {
  /**
   * Whether the screen is extra small (phone)
   */
  isXs: () => useBreakpoint(breakpoints.sm),
  
  /**
   * Whether the screen is small (large phone)
   */
  isSm: () => useBreakpoint(breakpoints.md),
  
  /**
   * Whether the screen is medium (tablet)
   */
  isMd: () => useBreakpoint(breakpoints.lg),
  
  /**
   * Whether the screen is large (desktop)
   */
  isLg: () => useBreakpoint(breakpoints.xl),
  
  /**
   * Whether the screen is extra large (large desktop)
   */
  isXl: () => useBreakpoint(breakpoints.xxl),
};

/**
 * Hook to conditionally render components based on mobile status
 * @returns Object with components for conditional rendering
 */
export function useResponsiveComponents() {
  const { isMobile, isTablet, isDesktop } = useMobile();
  
  return useMemo(() => ({
    /**
     * Only rendered on mobile devices
     */
    MobileOnly: ({ children }: { children: React.ReactNode }) => (
      isMobile ? <>{children}</> : null
    ),
    
    /**
     * Only rendered on tablet devices
     */
    TabletOnly: ({ children }: { children: React.ReactNode }) => (
      isTablet ? <>{children}</> : null
    ),
    
    /**
     * Only rendered on desktop devices
     */
    DesktopOnly: ({ children }: { children: React.ReactNode }) => (
      isDesktop ? <>{children}</> : null
    ),
    
    /**
     * Rendered on mobile and tablet devices
     */
    MobileAndTablet: ({ children }: { children: React.ReactNode }) => (
      (isMobile || isTablet) ? <>{children}</> : null
    ),
    
    /**
     * Rendered on tablet and desktop devices
     */
    TabletAndDesktop: ({ children }: { children: React.ReactNode }) => (
      (isTablet || isDesktop) ? <>{children}</> : null
    ),
    
    /**
     * Renders different content based on device type
     */
    Responsive: ({ 
      mobile, 
      tablet, 
      desktop 
    }: { 
      mobile: React.ReactNode;
      tablet?: React.ReactNode;
      desktop: React.ReactNode;
    }) => {
      if (isMobile) return <>{mobile}</>;
      if (isTablet) return <>{tablet ?? desktop}</>;
      return <>{desktop}</>;
    },
  }), [isMobile, isTablet, isDesktop]);
}

/**
 * CSS classes for responsive design
 * Use these with the className prop to conditionally apply styles
 */
export const responsiveClasses = {
  // Visibility classes
  mobileOnly: 'md:hidden',
  tabletOnly: 'hidden md:block lg:hidden',
  desktopOnly: 'hidden lg:block',
  mobileAndTablet: 'lg:hidden',
  tabletAndDesktop: 'hidden md:block',
  
  // Spacing classes
  mobilePadding: 'p-4 md:p-6 lg:p-8',
  mobileMargin: 'm-4 md:m-6 lg:m-8',
  mobileGap: 'gap-4 md:gap-6 lg:gap-8',
  
  // Layout classes
  responsiveGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  responsiveFlex: 'flex flex-col md:flex-row',
  
  // Text classes
  responsiveText: 'text-sm md:text-base lg:text-lg',
  responsiveHeading: 'text-xl md:text-2xl lg:text-3xl font-bold',
};

/**
 * Detect if user has enabled iOS "Reduce Motion" accessibility setting
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', onChange);
    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, []);
  
  return prefersReducedMotion;
}