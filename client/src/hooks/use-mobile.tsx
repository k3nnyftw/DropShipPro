import * as React from "react"

const MOBILE_BREAKPOINT = 480
const TABLET_BREAKPOINT = 768
const DESKTOP_BREAKPOINT = 1024

interface DeviceBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Hook to detect device type based on screen width
 * @returns DeviceBreakpoints object with isMobile, isTablet, and isDesktop flags
 */
export function useMobile(): DeviceBreakpoints {
  const [deviceType, setDeviceType] = React.useState<DeviceBreakpoints>({
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setDeviceType({
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= DESKTOP_BREAKPOINT
      });
    };

    // Initial check
    checkDevice();

    // Add resize listener
    window.addEventListener('resize', checkDevice);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceType;
}

/**
 * Legacy hook that uses the same function name but returns only mobile status
 * @deprecated Use useMobile() instead which returns more device info
 */
export function useIsMobile(): boolean {
  const { isMobile } = useMobile();
  return isMobile;
}
