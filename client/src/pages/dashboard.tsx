import React, { useState } from "react";
import StatCard from "@/components/dashboard/stat-card";
import RecentOrders from "@/components/dashboard/recent-orders";
import TopProducts from "@/components/dashboard/top-products";
import QuickActions from "@/components/dashboard/quick-actions";
import { ShoppingCart, DollarSign, Users, Package, BarChart3, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { 
  MobileOnly, 
  DesktopOnly, 
  SwipeHandler,
  ResponsiveRender
} from "@/lib/mobile-optimizations";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { measureExecutionTime, useDebounce } from "@/lib/performance";

const Dashboard: React.FC = () => {
  // Use performance optimizations for expensive data operations
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    initialData: {
      orders: { value: 12, change: 8.2 },
      revenue: { value: 438.75, change: 12.5 },
      visitors: { value: 892, change: 4.7 },
      products: { value: 24 }
    }
  });

  // Mobile-specific state for tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview');
  const { isMobile } = useMobile();
  
  // Debounce active tab to prevent UI jank during transitions
  const debouncedActiveTab = useDebounce(activeTab, 150);

  // Handler for swipe gestures on mobile
  const handleSwipeLeft = () => {
    if (activeTab === 'overview') setActiveTab('orders');
    else if (activeTab === 'orders') setActiveTab('products');
  };

  const handleSwipeRight = () => {
    if (activeTab === 'products') setActiveTab('orders');
    else if (activeTab === 'orders') setActiveTab('overview');
  };

  // Render different tabs for mobile view
  const renderMobileContent = () => {
    switch (debouncedActiveTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            {/* Stats cards with vertical layout on mobile */}
            {renderStatCards()}
          </div>
        );
      case 'orders':
        return <RecentOrders />;
      case 'products':
        return <TopProducts />;
      default:
        return null;
    }
  };

  // Shared stats card rendering logic
  const renderStatCards = () => (
    <>
      <StatCard 
        title="Orders"
        value={stats.orders.value}
        change={stats.orders.change}
        icon={<ShoppingCart />}
        iconBgColor="bg-blue-100"
        iconColor="text-primary-500"
      />
      <StatCard 
        title="Revenue"
        value={stats.revenue.value}
        change={stats.revenue.change}
        icon={<DollarSign />}
        iconBgColor="bg-green-100"
        iconColor="text-success-500"
        isCurrency={true}
      />
      <StatCard 
        title="Visitors"
        value={stats.visitors.value}
        change={stats.visitors.change}
        icon={<Users />}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-500"
      />
      <StatCard 
        title="Products"
        value={stats.products.value}
        subtitle="Active"
        icon={<Package />}
        iconBgColor="bg-orange-100"
        iconColor="text-orange-500"
      />
    </>
  );

  // Mobile navigation tabs
  const renderMobileTabs = () => (
    <div className="flex w-full border-b mb-4">
      <Button
        variant={activeTab === 'overview' ? "default" : "ghost"}
        className="flex-1 rounded-none border-b-2 border-transparent"
        onClick={() => setActiveTab('overview')}
        aria-selected={activeTab === 'overview'}
      >
        Overview
      </Button>
      <Button
        variant={activeTab === 'orders' ? "default" : "ghost"}
        className="flex-1 rounded-none border-b-2 border-transparent"
        onClick={() => setActiveTab('orders')}
        aria-selected={activeTab === 'orders'}
      >
        Orders
      </Button>
      <Button
        variant={activeTab === 'products' ? "default" : "ghost"}
        className="flex-1 rounded-none border-b-2 border-transparent"
        onClick={() => setActiveTab('products')}
        aria-selected={activeTab === 'products'}
      >
        Products
      </Button>
    </div>
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-display">Welcome back, Alex!</h1>
        <p className="text-gray-600">Here's what's happening with your store today.</p>
      </div>

      {/* Responsive layout with different UIs for mobile and desktop */}
      <ResponsiveRender
        mobile={
          <SwipeHandler onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight}>
            <div aria-live="polite">
              {renderMobileTabs()}
              {renderMobileContent()}
            </div>
          </SwipeHandler>
        }
        desktop={
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {renderStatCards()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RecentOrders />
              </div>
              <div>
                <TopProducts />
              </div>
            </div>
          </>
        }
      />

      {/* Mobile-specific floating action button for quick actions */}
      <MobileOnly>
        <div className="fixed bottom-20 right-4 z-10">
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-primary">
            <BarChart3 className="h-6 w-6" />
          </Button>
        </div>
      </MobileOnly>

      {/* Quick Actions */}
      <DesktopOnly>
        <QuickActions />
      </DesktopOnly>

      {/* Mobile quick actions drawer trigger */}
      <MobileOnly>
        <Card className="mt-4 p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-between"
            onClick={() => {
              // Would open a drawer in a real implementation
              console.log('Open quick actions drawer');
            }}
          >
            <span>Quick Actions</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </Card>
      </MobileOnly>
    </>
  );
};

export default Dashboard;
