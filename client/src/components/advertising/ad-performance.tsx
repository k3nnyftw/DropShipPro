import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart } from "lucide-react";

const AdPerformance: React.FC = () => {
  const [timeRange, setTimeRange] = useState("last-7-days");

  const timeRanges = [
    { value: "last-7-days", label: "Last 7 days" },
    { value: "last-30-days", label: "Last 30 days" },
    { value: "last-90-days", label: "Last 90 days" }
  ];

  return (
    <Card className="bg-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Ad Performance</h2>
        <div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="h-64 w-full">
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <BarChart className="text-4xl text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Ad performance chart would appear here</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdPerformance;
