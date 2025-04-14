import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Pause, Play, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const ActiveCampaigns: React.FC = () => {
  const { data: campaigns } = useQuery({
    queryKey: ['/api/campaigns/active'],
    initialData: [
      {
        id: 1,
        name: 'Summer Sale - Electronics',
        dateRange: 'Jun 1 - Jun 30',
        platform: 'Facebook',
        status: 'Active',
        budget: 200.00,
        clicks: 728,
        conversions: 52,
        roas: 3.2
      },
      {
        id: 2,
        name: 'New Product Launch - Earbuds',
        dateRange: 'Jun 10 - Jul 10',
        platform: 'Google Ads',
        status: 'Active',
        budget: 150.00,
        clicks: 412,
        conversions: 27,
        roas: 2.8
      },
      {
        id: 3,
        name: 'Retargeting - Cart Abandoners',
        dateRange: 'Ongoing',
        platform: 'Instagram',
        status: 'Paused',
        budget: 75.00,
        clicks: 103,
        conversions: 8,
        roas: 1.7
      }
    ]
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return (
          <svg className="h-4 w-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'google ads':
        return (
          <svg className="h-4 w-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"/>
            <path d="M9.55 14l1.4-5H6l-2 5h5.55z" fill="white"/>
            <path d="M20 14l-2-5h-4.95l1.4 5H20z" fill="white"/>
            <path d="M12.05 9L10.65 14h2.7l-1.4-5z" fill="white"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg className="h-4 w-4 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'paused':
        return <Badge variant="warning">Paused</Badge>;
      case 'ended':
        return <Badge variant="gray">Ended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="bg-white p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Active Campaigns</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Conversions</TableHead>
              <TableHead>ROAS</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                  <div className="text-xs text-gray-500">{campaign.dateRange}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getPlatformIcon(campaign.platform)}
                    <span className="text-sm text-gray-900">{campaign.platform}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(campaign.status)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatCurrency(campaign.budget)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {campaign.clicks.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {campaign.conversions}
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${campaign.roas >= 2 ? 'text-green-600' : campaign.roas >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {campaign.roas.toFixed(1)}x
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-3">
                    <Button variant="ghost" size="iconSm" title="Edit campaign">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="iconSm" title={campaign.status === 'Active' ? 'Pause campaign' : 'Activate campaign'}>
                      {campaign.status === 'Active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="iconSm" title="Delete campaign">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ActiveCampaigns;
