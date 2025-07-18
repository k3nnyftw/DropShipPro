import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrendingProducts from "@/components/product-discovery/trending-products";
import MarketTrend from "@/components/product-discovery/market-trend";
import { AIRecommendations } from "@/components/product-discovery/ai-recommendations";
import { AutoDiscovery } from "@/components/product-discovery/auto-discovery";
import { Search, Sparkles, TrendingUp, BarChart3, Bot } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const ProductDiscovery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("auto");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const addToStoreMutation = useMutation({
    mutationFn: (product: any) => {
      // Map AI product format to the format expected by the API
      const newProduct = {
        name: product.name,
        description: `${product.name} - ${product.category}`,
        price: (25 + Math.random() * 75).toFixed(2), // Generate a reasonable price
        salePrice: null,
        imageUrl: `https://source.unsplash.com/400x400/?${product.name.toLowerCase().replace(/\s+/g, '-')}`,
        category: product.category,
        rating: "4.5",
        reviewCount: Math.floor(10 + Math.random() * 90),
        inventory: 100,
        trending: true
      };
      
      return apiRequest('POST', '/api/products', newProduct);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product Added",
        description: `${variables.name} has been added to your store.`,
      });
    },
    onError: (error) => {
      console.error('Error adding product to store:', error);
      toast({
        title: "Error",
        description: "Failed to add product to your store. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAddToStore = (product: any) => {
    addToStoreMutation.mutate(product);
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">Product Discovery</h1>
          <p className="text-gray-600">Find trending products to add to your store</p>
        </div>
        <div>
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Auto-Add Products
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="auto" className="gap-2">
            <Bot className="h-4 w-4" />
            Auto Discovery
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending Products
          </TabsTrigger>
          <TabsTrigger value="market" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Market Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auto" className="mt-0">
          <AutoDiscovery />
        </TabsContent>

        <TabsContent value="ai" className="mt-0">
          <AIRecommendations onAddToStore={handleAddToStore} />
        </TabsContent>

        <TabsContent value="trending" className="mt-0">
          <TrendingProducts />
        </TabsContent>

        <TabsContent value="market" className="mt-0">
          <MarketTrend />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ProductDiscovery;
