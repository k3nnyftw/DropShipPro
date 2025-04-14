import React from "react";
import StatCard from "@/components/dashboard/stat-card";
import RecentOrders from "@/components/dashboard/recent-orders";
import TopProducts from "@/components/dashboard/top-products";
import QuickActions from "@/components/dashboard/quick-actions";
import { ShoppingCart, DollarSign, Users, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const Dashboard: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    initialData: {
      orders: { value: 12, change: 8.2 },
      revenue: { value: 438.75, change: 12.5 },
      visitors: { value: 892, change: 4.7 },
      products: { value: 24 }
    }
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-display">Welcome back, Alex!</h1>
        <p className="text-gray-600">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div>
          <TopProducts />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </>
  );
};

export default Dashboard;
