import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriceOptimization } from "@/components/store/price-optimization";
import { InventoryAutomation } from "@/components/store/inventory-automation";
import { AutoFulfillment } from "@/components/orders/auto-fulfillment";
import { DemandForecasting } from "@/components/automation/demand-forecasting";
import { FeatureGate } from "@/components/subscription/feature-gate";
import { DollarSign, Package, Truck, Sparkles, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanSelector } from "@/components/subscription/plan-selector";
import { useState } from "react";

const Automation: React.FC = () => {
  const [planSelectorOpen, setPlanSelectorOpen] = useState(false);
  
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">Automation Center</h1>
          <p className="text-gray-600">Powerful automation tools for your dropshipping business</p>
        </div>
        <Button variant="outline" onClick={() => setPlanSelectorOpen(true)}>
          <Zap className="mr-2 h-4 w-4" />
          Subscription Plans
        </Button>
        <PlanSelector open={planSelectorOpen} onOpenChange={setPlanSelectorOpen} />
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

      <Tabs defaultValue="demand-forecasting" className="space-y-8">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl mx-auto mb-4">
          <TabsTrigger value="demand-forecasting" className="flex items-center justify-center gap-2">
            <Brain className="h-4 w-4" />
            <span>Demand Forecasting</span>
          </TabsTrigger>
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

        <TabsContent value="demand-forecasting">
          <FeatureGate
            featureName="demandForecasting"
            featureTitle="AI-Powered Demand Forecasting"
            featureDescription="Predict future inventory needs with our AI algorithm to avoid stockouts and optimize cash flow."
          >
            <DemandForecasting />
          </FeatureGate>
        </TabsContent>

        <TabsContent value="price-optimization">
          <FeatureGate
            featureName="automatedPriceOptimization"
            featureTitle="Automated Price Optimization"
            featureDescription="Maximize profits with dynamic pricing that responds to market conditions, competitor prices, and demand patterns."
          >
            <PriceOptimization />
          </FeatureGate>
        </TabsContent>

        <TabsContent value="inventory-management">
          <FeatureGate
            featureName="automatedOrderFulfillment"
            featureTitle="Automated Inventory Management"
            featureDescription="Keep perfect inventory levels with automatic reordering based on sales velocity and supplier lead times."
          >
            <InventoryAutomation />
          </FeatureGate>
        </TabsContent>

        <TabsContent value="order-fulfillment">
          <FeatureGate
            featureName="automatedOrderFulfillment"
            featureTitle="Automated Order Fulfillment"
            featureDescription="Process orders automatically with no intervention needed - from purchase to delivery tracking."
          >
            <AutoFulfillment />
          </FeatureGate>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Automation;