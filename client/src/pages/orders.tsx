import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusCards from "@/components/orders/status-cards";
import OrderList from "@/components/orders/order-list";
import OrderActivity from "@/components/orders/order-activity";
import { AutoFulfillment } from "@/components/orders/auto-fulfillment";
import { Filter, Download, ClipboardList, Truck, BarChart4 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
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
          <p className="text-gray-600">Track and manage your customer orders with automated fulfillment</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="fulfillment" className="flex items-center gap-1.5">
            <Truck className="h-4 w-4" />
            Auto-Fulfillment
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1.5">
            <BarChart4 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {/* Status Cards */}
          <StatusCards stats={orderStats} />

          {/* Order List */}
          <OrderList />

          {/* Order Activity */}
          <OrderActivity />
        </TabsContent>
        
        <TabsContent value="fulfillment" className="mt-6">
          <AutoFulfillment />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <div className="bg-muted/30 border rounded-lg p-12 text-center">
            <BarChart4 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Order Analytics</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              Advanced order analytics with AI-powered insights and forecast predictions are coming soon.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Orders;
