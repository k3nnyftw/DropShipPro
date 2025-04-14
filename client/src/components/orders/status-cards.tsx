import React from "react";
import { Card } from "@/components/ui/card";
import { ShoppingBag, RotateCw, Truck, CheckCircle } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatusCardsProps {
  stats: {
    new: { count: number; change: number };
    processing: { count: number; change: number };
    shipped: { count: number; change: number };
    delivered: { count: number; change: number };
  };
}

const StatusCards: React.FC<StatusCardsProps> = ({ stats }) => {
  const statuses = [
    {
      title: "New Orders",
      count: stats.new.count,
      change: stats.new.change, 
      icon: <ShoppingBag />,
      backgroundColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Processing",
      count: stats.processing.count,
      change: stats.processing.change, 
      icon: <RotateCw />,
      backgroundColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      title: "Shipped",
      count: stats.shipped.count,
      change: stats.shipped.change, 
      icon: <Truck />,
      backgroundColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Delivered",
      count: stats.delivered.count,
      change: stats.delivered.change, 
      icon: <CheckCircle />,
      backgroundColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {statuses.map((status, index) => (
        <Card key={index} className="bg-white p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{status.title}</h3>
              <p className="text-2xl font-semibold mt-1">{status.count}</p>
            </div>
            <div className={`rounded-full p-3 ${status.backgroundColor} ${status.iconColor}`}>
              {status.icon}
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-xs flex items-center ${status.change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {status.change >= 0 ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(status.change)}% from yesterday
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatusCards;
