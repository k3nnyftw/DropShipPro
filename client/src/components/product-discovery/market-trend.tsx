import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartLine } from "lucide-react";

const MarketTrend: React.FC = () => {
  const [activeTimeframe, setActiveTimeframe] = useState("3M");
  
  const timeframes = ["1M", "3M", "6M", "1Y"];

  return (
    <Card className="bg-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Market Trend Analysis</h2>
        <div className="flex space-x-2">
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe}
              variant={activeTimeframe === timeframe ? "lightBlue" : "outline"}
              size="xs"
              onClick={() => setActiveTimeframe(timeframe)}
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>
      <div className="h-64 w-full">
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <ChartLine className="text-4xl text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Sales trend chart would appear here</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarketTrend;
