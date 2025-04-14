import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriceOptimization } from "@/components/store/price-optimization";
import { InventoryAutomation } from "@/components/store/inventory-automation";
import { AutoFulfillment } from "@/components/orders/auto-fulfillment";
import { DollarSign, Package, Truck, Sparkles } from "lucide-react";

const Automation: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-display">Automation Center</h1>
        <p className="text-gray-600">Powerful automation tools for your dropshipping business</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border rounded-lg p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="bg-white p-3 rounded-full shadow-sm">
            <Sparkles className="h-8 w-8 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Automated Dropshipping Platform</h2>
            <p className="text-gray-600">
              Our platform automates your entire dropshipping process from product selection to order fulfillment. 
              AI-powered tools continually optimize your prices, inventory, and supplier connections to maximize
              profitability with minimal human intervention.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="price-optimization" className="space-y-8">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto mb-4">
          <TabsTrigger value="price-optimization" className="flex items-center justify-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>Price Optimization</span>
          </TabsTrigger>
          <TabsTrigger value="inventory-management" className="flex items-center justify-center gap-2">
            <Package className="h-4 w-4" />
            <span>Inventory Management</span>
          </TabsTrigger>
          <TabsTrigger value="order-fulfillment" className="flex items-center justify-center gap-2">
            <Truck className="h-4 w-4" />
            <span>Order Fulfillment</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="price-optimization">
          <PriceOptimization />
        </TabsContent>

        <TabsContent value="inventory-management">
          <InventoryAutomation />
        </TabsContent>

        <TabsContent value="order-fulfillment">
          <AutoFulfillment />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Automation;