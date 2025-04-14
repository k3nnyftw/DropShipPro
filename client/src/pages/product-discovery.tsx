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
import TrendingProducts from "@/components/product-discovery/trending-products";
import MarketTrend from "@/components/product-discovery/market-trend";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const ProductDiscovery: React.FC = () => {
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    initialData: [
      "All Categories",
      "Electronics",
      "Home & Garden",
      "Health & Beauty",
      "Fashion",
      "Sports & Outdoors"
    ]
  });

  const { data: priceRanges } = useQuery({
    queryKey: ['/api/price-ranges'],
    initialData: [
      "Any Price",
      "Under $25",
      "$25 - $50",
      "$50 - $100",
      "$100 - $200",
      "Over $200"
    ]
  });

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">Product Discovery</h1>
          <p className="text-gray-600">Find trending products to add to your store</p>
        </div>
        <div>
          <Button>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Trends
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="bg-white p-4 mb-6">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-grow mb-4 md:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Enter keywords, category or niche..." 
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category, index) => (
                  <SelectItem key={index} value={category.toLowerCase().replace(/\s+/g, '-')}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Any Price" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range, index) => (
                  <SelectItem key={index} value={range.toLowerCase().replace(/\s+/g, '-')}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Trending Products */}
      <TrendingProducts />

      {/* Sales Trends Chart */}
      <MarketTrend />
    </>
  );
};

export default ProductDiscovery;
