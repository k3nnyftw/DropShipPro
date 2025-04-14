import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, TrendingUp, LineChart, Lightbulb, Percent, BarChart3, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import ProductDetailModal from './product-detail-modal';

interface AIRecommendationsProps {
  onAddToStore: (product: any) => void;
}

export function AIRecommendations({ onAddToStore }: AIRecommendationsProps) {
  const [activeTab, setActiveTab] = useState('trending');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const trendsQuery = useQuery({
    queryKey: ['/api/ai-analytics/trending-products'],
    queryFn: async () => {
      const response = await fetch('/api/ai-analytics/trending-products?limit=6');
      if (!response.ok) {
        throw new Error('Failed to fetch trending products');
      }
      return response.json();
    }
  });

  const opportunitiesQuery = useQuery({
    queryKey: ['/api/ai-analytics/product-opportunities'],
    queryFn: async () => {
      const response = await fetch('/api/ai-analytics/product-opportunities');
      if (!response.ok) {
        throw new Error('Failed to fetch product opportunities');
      }
      return response.json();
    }
  });

  const automatedRecsQuery = useQuery({
    queryKey: ['/api/ai-analytics/automated-recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/ai-analytics/automated-recommendations');
      if (!response.ok) {
        throw new Error('Failed to fetch automated recommendations');
      }
      return response.json();
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-gray-600';
  };

  const getGrowthBadge = (growthRate: number) => {
    if (growthRate >= 20) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High Growth</Badge>;
    } else if (growthRate >= 10) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Moderate Growth</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Stable</Badge>;
    }
  };

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  };

  const renderProductCards = (products: any[], isLoading: boolean, isError: boolean) => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </CardContent>
          <CardFooter className="p-4 flex justify-between">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </CardFooter>
        </Card>
      ));
    }

    if (isError) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">Failed to load product recommendations.</p>
          <Button variant="outline" className="mt-4" onClick={() => location.reload()}>
            Try Again
          </Button>
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">No product recommendations available at this time.</p>
        </div>
      );
    }

    return products.map((product) => (
      <Card key={product.productId} className="overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-medium leading-tight">{product.name}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span className="text-xs">{product.category}</span>
            {getGrowthBadge(product.growthRate)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs">Search Volume</span>
              <span className="font-medium">{product.searchVolume.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs">Growth Rate</span>
              <span className="font-medium">{product.growthRate}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs">Competition</span>
              <span className="font-medium">{product.competitionLevel}/10</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs">Profit Margin</span>
              <span className="font-medium">{product.profitPotential}%</span>
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <Sparkles className="h-4 w-4 text-amber-500 mr-1.5" />
            <span className="text-sm font-medium">
              AI Score: <span className={getScoreColor(product.recommendationScore)}>
                {product.recommendationScore}/100
              </span>
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-2 flex justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleViewDetails(product)}
          >
            View Details
          </Button>
          <Button 
            size="sm"
            onClick={() => onAddToStore(product)}
          >
            Add to Store
          </Button>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-tight">AI-Powered Recommendations</h2>
          <p className="text-gray-500 mt-1">
            Data-driven product suggestions based on market trends and sales potential
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <LineChart className="h-4 w-4" />
          Refresh Analysis
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="trending" className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span>Trending Products</span>
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4" />
            <span>Market Opportunities</span>
          </TabsTrigger>
          <TabsTrigger value="automated" className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Automated Selection</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium">Currently Trending Products</h3>
            </div>
            <Badge variant="outline" className="gap-1">
              <BarChart3 className="h-3 w-3" />
              Based on real-time market data
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderProductCards(
              trendsQuery.data || [], 
              trendsQuery.isLoading, 
              trendsQuery.isError
            )}
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium">Market Gap Opportunities</h3>
            </div>
            <Badge variant="outline" className="gap-1">
              <Percent className="h-3 w-3" />
              Higher profit potential
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderProductCards(
              opportunitiesQuery.data || [],
              opportunitiesQuery.isLoading,
              opportunitiesQuery.isError
            )}
          </div>
        </TabsContent>

        <TabsContent value="automated" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium">AI-Selected Products</h3>
            </div>
            <Badge variant="outline" className="gap-1">
              <ArrowRight className="h-3 w-3" />
              Ready for your store
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderProductCards(
              automatedRecsQuery.data || [],
              automatedRecsQuery.isLoading,
              automatedRecsQuery.isError
            )}
          </div>
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
            <ShoppingBag className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Automated Product Selection</h4>
              <p className="text-sm text-blue-700 mt-1">
                Our AI automatically identifies the best products to add to your store based on 
                market trends, profit potential, and customer demand. These products are optimized 
                for the current market conditions.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ProductDetailModal
        product={selectedProduct}
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onAddToStore={onAddToStore}
      />
    </div>
  );
}