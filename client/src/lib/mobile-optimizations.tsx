import React, { useEffect, useState } from 'react';
import { useMobile } from '@/hooks/use-mobile';

/**
 * A collection of components and utilities to enhance 
 * the mobile experience of the application
 */

interface MobileOptimizedProps {
  children: React.ReactNode;
  mobileClassName?: string;
  desktopClassName?: string;
  tabletClassName?: string;
}

/**
 * Renders content with different classes based on device type
 */
export function MobileOptimized({
  children,
  mobileClassName = '',
  desktopClassName = '',
  tabletClassName = '',
}: MobileOptimizedProps) {
  const { isMobile, isTablet } = useMobile();
  
  let className = '';
  if (isMobile) className = mobileClassName;
  else if (isTablet) className = tabletClassName;
  else className = desktopClassName;
  
  return (
    <div className={className}>
      {children}
    </div>
  );
}

/**
 * Only renders content on mobile devices
 */
export function MobileOnly({ children }: { children: React.ReactNode }) {
  const { isMobile } = useMobile();
  
  if (!isMobile) return null;
  
  return <>{children}</>;
}

/**
 * Only renders content on desktop devices
 */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  const { isMobile, isTablet } = useMobile();
  
  if (isMobile || isTablet) return null;
  
  return <>{children}</>;
}

/**
 * Renders different content based on device type
 */
export function ResponsiveRender({
  mobile,
  desktop,
  tablet,
}: {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
  tablet?: React.ReactNode;
}) {
  const { isMobile, isTablet } = useMobile();
  
  if (isMobile) return <>{mobile}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  return <>{desktop}</>;
}

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

/**
 * A component that detects swipe gestures on mobile devices
 */
export function SwipeHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: SwipeHandlers & {
  children: React.ReactNode;
  threshold?: number;
}) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  
  // Reset touch state when component unmounts
  useEffect(() => {
    return () => {
      setTouchStart(null);
      setTouchEnd(null);
    };
  }, []);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    if (isHorizontalSwipe) {
      if (distanceX > threshold && onSwipeLeft) {
        onSwipeLeft();
      } else if (distanceX < -threshold && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      if (distanceY > threshold && onSwipeUp) {
        onSwipeUp();
      } else if (distanceY < -threshold && onSwipeDown) {
        onSwipeDown();
      }
    }
    
    // Reset touch state
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
 * Utility hook for implementing infinite scroll
 */
export function useInfiniteScroll(
  callback: () => void,
  options?: {
    threshold?: number;
    disabled?: boolean;
  }
) {
  const { threshold = 100, disabled = false } = options || {};
  
  useEffect(() => {
    if (disabled) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // If we're near the bottom, call the callback
      if (scrollY + windowHeight >= documentHeight - threshold) {
        callback();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [callback, threshold, disabled]);
}

/**
 * A component to optimize image loading on mobile
 */
export function MobileOptimizedImage({
  src,
  alt,
  mobileSrc,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  mobileSrc?: string;
}) {
  const { isMobile } = useMobile();
  
  const imageSrc = isMobile && mobileSrc ? mobileSrc : src;
  
  return (
    <img
      src={imageSrc || ''}
      alt={alt || ''}
      className={className}
      loading="lazy" // Add lazy loading for better performance
      {...props}
    />
  );
}