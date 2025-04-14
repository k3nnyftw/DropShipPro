import React from "react";
import { Button } from "@/components/ui/button";
import CampaignStats from "@/components/advertising/campaign-stats";
import ActiveCampaigns from "@/components/advertising/active-campaigns";
import AdPerformance from "@/components/advertising/ad-performance";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const Advertising: React.FC = () => {
  const { data: adStats } = useQuery({
    queryKey: ['/api/advertising/stats'],
    initialData: {
      adSpend: { value: 342.88, change: 12.5, budget: 500 },
      clicks: { value: 1243, change: 8.2, cpc: 0.28, ctr: 3.2 },
      conversions: { value: 87, change: 15.3, rate: 7.0, cost: 3.94 }
    }
  });

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">Advertising Center</h1>
          <p className="text-gray-600">Create and manage your ad campaigns</p>
        </div>
        <div>
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Campaign Stats */}
      <CampaignStats stats={adStats} />

      {/* Active Campaigns */}
      <ActiveCampaigns />

      {/* Ad Performance */}
      <AdPerformance />
    </>
  );
};

export default Advertising;
