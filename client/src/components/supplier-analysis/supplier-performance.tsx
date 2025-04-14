import React from "react";
import { Card } from "@/components/ui/card";
import { Truck, BarChart } from "lucide-react";

const SupplierPerformance: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Shipping Times */}
      <Card className="bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Average Shipping Times</h2>
        <div className="h-64 w-full">
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center">
              <Truck className="text-4xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Shipping time comparison chart would appear here</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quality Ratings */}
      <Card className="bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Quality Assessment</h2>
        <div className="h-64 w-full">
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center">
              <BarChart className="text-4xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Quality rating comparison chart would appear here</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SupplierPerformance;
