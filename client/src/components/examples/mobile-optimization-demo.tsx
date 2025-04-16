import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  MobileOnly, 
  DesktopOnly, 
  SimplifiedMobileView,
  LazyLoad,
  SwipeHandler,
  ProgressiveImage,
  VirtualizedList,
  PerformanceAdaptiveUI,
  useThrottledValue
} from '@/lib/mobile-optimizations';
import { 
  useDebounce,
  measureExecutionTime
} from '@/lib/performance';
import { useMobile } from '@/hooks/use-mobile';
import { 
  Smartphone, 
  Monitor, 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  Layers, 
  ListFilter, 
  Eye
} from 'lucide-react';

/**
 * Demo component to showcase mobile optimization utilities
 */
export default function MobileOptimizationDemo() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [count, setCount] = useState(0);
  const debouncedCount = useDebounce(count, 500); // Debounce value changes
  const throttledCount = useThrottledValue(count, 300); // Throttle value changes
  const { isMobile, deviceType } = useMobile();
  
  // Demo list data
  const longList = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `This is item number ${i} in a very long list`
  }));
  
  // Measure page load performance
  React.useEffect(() => {
    measureExecutionTime(() => {
      // Simulating complex initialization
      for (let i = 0; i < 1000; i++) {
        Math.sqrt(i);
      }
    });
  }, []);
  
  const tabs = [
    { name: 'Conditional Rendering', icon: <Eye /> },
    { name: 'Progressive Loading', icon: <Layers /> },
    { name: 'Gestures', icon: <Smartphone /> },
    { name: 'Performance', icon: <Zap /> },
    { name: 'Virtualization', icon: <ListFilter /> },
  ];
  
  const handleSwipeLeft = () => {
    setActiveTabIndex(prev => Math.min(prev + 1, tabs.length - 1));
  };
  
  const handleSwipeRight = () => {
    setActiveTabIndex(prev => Math.max(prev - 1, 0));
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mobile Optimization Demos</h1>
      
      <div className="mb-4 bg-muted/30 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">Current device: <span className="font-semibold">{deviceType}</span></p>
        <p className="text-xs text-muted-foreground">Try viewing this page on different devices to see how the components adapt.</p>
      </div>
      
      {/* Tabs navigation - different for mobile vs desktop */}
      <MobileOnly>
        <div className="flex overflow-x-auto mb-6 pb-2">
          {tabs.map((tab, index) => (
            <Button
              key={tab.name}
              variant={activeTabIndex === index ? "default" : "outline"}
              className="mr-2 whitespace-nowrap"
              onClick={() => setActiveTabIndex(index)}
            >
              {tab.icon}
              <span className="ml-2">{tab.name}</span>
            </Button>
          ))}
        </div>
      </MobileOnly>
      
      <DesktopOnly>
        <div className="flex mb-6 border-b">
          {tabs.map((tab, index) => (
            <Button
              key={tab.name}
              variant="ghost"
              className={`mr-2 ${activeTabIndex === index ? 'border-b-2 border-primary rounded-none' : ''}`}
              onClick={() => setActiveTabIndex(index)}
            >
              {tab.icon}
              <span className="ml-2">{tab.name}</span>
            </Button>
          ))}
        </div>
      </DesktopOnly>
      
      {/* Swipeable content container for mobile */}
      <SwipeHandler onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight}>
        <div className="relative">
          {/* Swipe indicators for mobile */}
          <MobileOnly>
            <div className="flex justify-between text-muted-foreground text-sm mb-4">
              {activeTabIndex > 0 && (
                <div className="flex items-center">
                  <ArrowLeft size={16} className="mr-1" />
                  <span>Swipe right for previous</span>
                </div>
              )}
              
              {activeTabIndex < tabs.length - 1 && (
                <div className="flex items-center ml-auto">
                  <span>Swipe left for next</span>
                  <ArrowRight size={16} className="ml-1" />
                </div>
              )}
            </div>
          </MobileOnly>
          
          {/* Tab content */}
          <div>
            {/* 1. Conditional Rendering Demo */}
            {activeTabIndex === 0 && (
              <div className="space-y-6">
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Conditional Rendering</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">MobileOnly &amp; DesktopOnly Components</h3>
                      
                      <MobileOnly>
                        <p className="flex items-center text-blue-600">
                          <Smartphone className="mr-2" size={18} />
                          This text only appears on mobile devices
                        </p>
                      </MobileOnly>
                      
                      <DesktopOnly>
                        <p className="flex items-center text-green-600">
                          <Monitor className="mr-2" size={18} />
                          This text only appears on desktop devices
                        </p>
                      </DesktopOnly>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">SimplifiedMobileView Component</h3>
                      
                      <SimplifiedMobileView
                        children={
                          <div className="p-4 bg-blue-100 rounded-lg">
                            <p>Simplified content for mobile devices</p>
                          </div>
                        }
                        fullContent={
                          <div className="p-4 bg-green-100 rounded-lg">
                            <p>Full content with more details for larger screens</p>
                            <p className="mt-2">This includes additional information that would clutter a mobile interface</p>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <div className="bg-white p-2 rounded">Extra panel 1</div>
                              <div className="bg-white p-2 rounded">Extra panel 2</div>
                              <div className="bg-white p-2 rounded">Extra panel 3</div>
                            </div>
                          </div>
                        }
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            {/* 2. Progressive Loading Demo */}
            {activeTabIndex === 1 && (
              <div className="space-y-6">
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Progressive Loading</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">LazyLoad Component</h3>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        Scroll down to see content load when it enters viewport
                      </p>
                      
                      <div className="h-[300px] overflow-y-auto border rounded-lg p-4">
                        <div className="h-[200px] flex items-center justify-center border-b">
                          <p>Scroll down to reveal lazy loaded content</p>
                        </div>
                        
                        <LazyLoad 
                          placeholder={<div className="h-[200px] flex items-center justify-center">Loading...</div>}
                        >
                          <div className="h-[200px] bg-green-100 rounded-lg mt-4 flex items-center justify-center">
                            <p>✨ This content was lazy loaded when scrolled into view!</p>
                          </div>
                        </LazyLoad>
                        
                        <LazyLoad 
                          placeholder={<div className="h-[200px] flex items-center justify-center">Loading...</div>}
                        >
                          <div className="h-[200px] bg-blue-100 rounded-lg mt-4 flex items-center justify-center">
                            <p>✨ This content was also lazy loaded!</p>
                          </div>
                        </LazyLoad>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">ProgressiveImage Component</h3>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        Shows low-quality image while high-quality one loads
                      </p>
                      
                      <div className="border rounded-lg p-4">
                        <ProgressiveImage 
                          src="https://images.unsplash.com/photo-1682687982167-d7fb3ed8541d?w=1200"
                          lowQualitySrc="https://images.unsplash.com/photo-1682687982167-d7fb3ed8541d?w=50"
                          alt="Progressive loading demo image"
                          className="w-full h-auto rounded-lg"
                        />
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                          This image loads a low-res version first, then transitions to high-res
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            {/* 3. Gestures Demo */}
            {activeTabIndex === 2 && (
              <div className="space-y-6">
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Gesture Handling</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">SwipeHandler Component</h3>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        This entire tab interface uses SwipeHandler for navigation.
                        Try swiping left/right between tabs on a touch device.
                      </p>
                      
                      <div className="bg-primary/10 p-6 rounded-lg border-2 border-dashed border-primary/30">
                        <SwipeHandler
                          onSwipeLeft={() => alert('Swiped Left!')}
                          onSwipeRight={() => alert('Swiped Right!')}
                        >
                          <div className="h-32 flex items-center justify-center bg-primary/5 rounded-lg">
                            <p className="text-center">
                              {isMobile ? (
                                <span>Swipe left or right in this box to trigger an alert</span>
                              ) : (
                                <span>This demo requires a touch device</span>
                              )}
                            </p>
                          </div>
                        </SwipeHandler>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            {/* 4. Performance Demo */}
            {activeTabIndex === 3 && (
              <div className="space-y-6">
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Performance Optimizations</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Debounce &amp; Throttle</h3>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <Button 
                          onClick={() => setCount(c => c + 1)}
                          className="w-full"
                        >
                          Increment Counter: {count}
                        </Button>
                        
                        <Separator orientation="vertical" className="h-auto hidden md:block" />
                        <Separator className="md:hidden" />
                        
                        <div className="space-y-4 flex-1">
                          <div>
                            <p className="text-sm mb-1">Actual Value: <span className="font-mono">{count}</span></p>
                            <Progress value={count % 100} className="h-2" />
                          </div>
                          
                          <div>
                            <p className="text-sm mb-1">Debounced Value (500ms): <span className="font-mono">{debouncedCount}</span></p>
                            <Progress value={debouncedCount % 100} className="h-2" />
                          </div>
                          
                          <div>
                            <p className="text-sm mb-1">Throttled Value (300ms): <span className="font-mono">{throttledCount}</span></p>
                            <Progress value={throttledCount % 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-4">
                        Notice how debounced value only updates after you stop clicking, 
                        while throttled value updates at a steady rate.
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Adaptive UI Complexity</h3>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        PerformanceAdaptiveUI renders different UIs based on device performance
                      </p>
                      
                      <div className="space-y-4">
                        <PerformanceAdaptiveUI
                          complexity={1}
                          fallback={<div className="p-4 bg-red-100 rounded-lg">Fallback simple UI for very low-end devices</div>}
                        >
                          <div className="p-4 bg-green-100 rounded-lg">
                            <p>Low complexity UI - should render on most devices</p>
                          </div>
                        </PerformanceAdaptiveUI>
                        
                        <PerformanceAdaptiveUI
                          complexity={2}
                          fallback={<div className="p-4 bg-yellow-100 rounded-lg">Medium complexity fallback UI</div>}
                        >
                          <div className="p-4 bg-blue-100 rounded-lg">
                            <p>Medium complexity UI - might not render on low-end mobile devices</p>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="bg-white p-2 rounded">Panel 1</div>
                              <div className="bg-white p-2 rounded">Panel 2</div>
                            </div>
                          </div>
                        </PerformanceAdaptiveUI>
                        
                        <PerformanceAdaptiveUI
                          complexity={3}
                          fallback={<div className="p-4 bg-red-100 rounded-lg">High complexity fallback UI</div>}
                        >
                          <div className="p-4 bg-purple-100 rounded-lg">
                            <p>High complexity UI - may only render on high-end devices</p>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              <div className="bg-white p-2 rounded">Panel 1</div>
                              <div className="bg-white p-2 rounded">Panel 2</div>
                              <div className="bg-white p-2 rounded">Panel 3</div>
                              <div className="bg-white p-2 rounded">Panel 4</div>
                              <div className="bg-white p-2 rounded">Panel 5</div>
                              <div className="bg-white p-2 rounded">Panel 6</div>
                            </div>
                          </div>
                        </PerformanceAdaptiveUI>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            {/* 5. Virtualization Demo */}
            {activeTabIndex === 4 && (
              <div className="space-y-6">
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">List Virtualization</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">VirtualizedList Component</h3>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        Only renders items currently visible in the viewport,
                        greatly improving performance for long lists.
                      </p>
                      
                      <div className="border rounded-lg">
                        <div className="p-4 bg-primary/10 border-b">
                          <p>Virtualized list of 1,000 items (only ~10 are actually rendered)</p>
                        </div>
                        
                        <div className="h-[400px]">
                          <VirtualizedList
                            items={longList}
                            itemHeight={60}
                            renderItem={(item) => (
                              <div className="p-3 border-b flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                                  {item.id % 10}
                                </div>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-4">
                        Scroll through the list and notice how smooth it is, even with 1,000 items.
                        This is because only visible items are actually being rendered.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </SwipeHandler>
    </div>
  );
}