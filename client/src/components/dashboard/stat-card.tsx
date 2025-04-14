import React from "react";
import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  isCurrency?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  subtitle,
  icon,
  iconBgColor,
  iconColor,
  isCurrency = false
}) => {
  return (
    <Card className="bg-white p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-md ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold">
              {isCurrency ? formatCurrency(value) : value}
            </p>
            {change && (
              <p className={`ml-2 text-sm flex items-center ${change >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                {change >= 0 ? (
                  <ArrowUp className="text-xs mr-1" />
                ) : (
                  <ArrowDown className="text-xs mr-1" />
                )}
                <span>{Math.abs(change)}%</span>
              </p>
            )}
            {subtitle && (
              <p className="ml-2 text-sm text-gray-400">
                <span>{subtitle}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
