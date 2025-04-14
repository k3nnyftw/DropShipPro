import React from "react";
import { Button } from "@/components/ui/button";
import StatusCards from "@/components/orders/status-cards";
import OrderList from "@/components/orders/order-list";
import OrderActivity from "@/components/orders/order-activity";
import { Filter, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const Orders: React.FC = () => {
  const { data: orderStats } = useQuery({
    queryKey: ['/api/orders/stats'],
    initialData: {
      new: { count: 12, change: 8 },
      processing: { count: 8, change: -12 },
      shipped: { count: 24, change: 18 },
      delivered: { count: 18, change: 6 }
    }
  });

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">Order Management</h1>
          <p className="text-gray-600">Track and manage your customer orders</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="default">
            <Filter className="w-4 h-4 mr-1" /> Filter
          </Button>
          <Button variant="outline" size="default">
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <StatusCards stats={orderStats} />

      {/* Order List */}
      <OrderList />

      {/* Order Activity */}
      <OrderActivity />
    </>
  );
};

export default Orders;
