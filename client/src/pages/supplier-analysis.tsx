import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SupplierComparison from "@/components/supplier-analysis/supplier-comparison";
import SupplierPerformance from "@/components/supplier-analysis/supplier-performance";
import { Search, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const SupplierAnalysis: React.FC = () => {
  const { data: regions } = useQuery({
    queryKey: ['/api/supplier/regions'],
    initialData: [
      "All Regions",
      "China",
      "United States",
      "Europe",
      "South Asia"
    ]
  });

  const { data: ratings } = useQuery({
    queryKey: ['/api/supplier/ratings'],
    initialData: [
      "Any Rating",
      "4+ Stars",
      "3+ Stars",
      "2+ Stars"
    ]
  });

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">Supplier Analysis</h1>
          <p className="text-gray-600">Find and compare reliable suppliers for your products</p>
        </div>
        <div>
          <Button>
            <Plus className="w-4 h-4 mr-1" /> 
            Add New Supplier
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="bg-white p-4 mb-6">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-grow mb-4 md:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Suppliers</label>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Enter supplier name or product..." 
                className="w-full pr-10"
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                variant="ghost"
                size="iconSm"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="w-full md:w-1/4 mb-4 md:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region, index) => (
                  <SelectItem key={index} value={region.toLowerCase().replace(/\s+/g, '-')}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent>
                {ratings.map((rating, index) => (
                  <SelectItem key={index} value={rating.toLowerCase().replace(/\s+/g, '-')}>
                    {rating}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Supplier Comparison */}
      <SupplierComparison />

      {/* Supplier Performance */}
      <SupplierPerformance />
    </>
  );
};

export default SupplierAnalysis;
