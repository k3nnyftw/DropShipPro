import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CampaignStatsProps {
  stats: {
    adSpend: { value: number; change: number; budget: number };
    clicks: { value: number; change: number; cpc: number; ctr: number };
    conversions: { value: number; change: number; rate: number; cost: number };
  };
}

const CampaignStats: React.FC<CampaignStatsProps> = ({ stats }) => {
  const budgetPercentage = (stats.adSpend.value / stats.adSpend.budget) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      <Card className="bg-white p-6">
        <h3 className="text-sm font-medium text-gray-500">Total Ad Spend</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold">{formatCurrency(stats.adSpend.value)}</p>
          <p className={`ml-2 text-sm flex items-center ${stats.adSpend.change >= 0 ? 'text-danger-500' : 'text-success-500'}`}>
            {stats.adSpend.change >= 0 ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1" />
            )}
            <span>{Math.abs(stats.adSpend.change)}%</span>
          </p>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Monthly Budget: {formatCurrency(stats.adSpend.budget)}</span>
            <span className="font-medium">{budgetPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={budgetPercentage} className="h-2 mt-1" />
        </div>
      </Card>

      <Card className="bg-white p-6">
        <h3 className="text-sm font-medium text-gray-500">Total Clicks</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold">{stats.clicks.value.toLocaleString()}</p>
          <p className={`ml-2 text-sm flex items-center ${stats.clicks.change >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
            {stats.clicks.change >= 0 ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1" />
            )}
            <span>{Math.abs(stats.clicks.change)}%</span>
          </p>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Avg. CPC</span>
            <span className="font-medium">{formatCurrency(stats.clicks.cpc)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-500">CTR</span>
            <span className="font-medium">{stats.clicks.ctr}%</span>
          </div>
        </div>
      </Card>

      <Card className="bg-white p-6">
        <h3 className="text-sm font-medium text-gray-500">Conversions</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold">{stats.conversions.value}</p>
          <p className={`ml-2 text-sm flex items-center ${stats.conversions.change >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
            {stats.conversions.change >= 0 ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1" />
            )}
            <span>{Math.abs(stats.conversions.change)}%</span>
          </p>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Conversion Rate</span>
            <span className="font-medium">{stats.conversions.rate}%</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-500">Cost per Conversion</span>
            <span className="font-medium">{formatCurrency(stats.conversions.cost)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CampaignStats;
