import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Zap, 
  Clock, 
  Check, 
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

export function PriceOptimization() {
  const [targetProfit, setTargetProfit] = useState(30); // 30% profit margin by default
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [intervalHours, setIntervalHours] = useState(24); // daily by default
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch store-wide price optimization recommendations
  const optimizationsQuery = useQuery({
    queryKey: ['/api/price-optimizer/store/all', targetProfit],
    queryFn: async () => {
      const response = await fetch(`/api/price-optimizer/store/all?targetProfit=${targetProfit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch price optimizations');
      }
      return response.json();
    }
  });

  // Fetch products for selection
  const productsQuery = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });

  // Mutation for applying price optimizations
  const applyOptimizationsMutation = useMutation({
    mutationFn: (productIds: number[]) => {
      return apiRequest('POST', '/api/price-optimizer/auto-apply', {
        productIds,
        targetProfitMargin: targetProfit / 100
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/price-optimizer/store/all'] });
      toast({
        title: "Prices Optimized",
        description: `Successfully updated prices for ${selectedProducts.length} products`,
      });
      setSelectedProducts([]);
    },
    onError: (error) => {
      console.error('Error applying price optimizations:', error);
      toast({
        title: "Optimization Failed",
        description: "There was an error applying price optimizations. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for scheduling automatic optimizations
  const scheduleOptimizationsMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/price-optimizer/schedule', {
        intervalHours,
        targetProfitMargin: targetProfit / 100
      });
    },
    onSuccess: () => {
      toast({
        title: "Automatic Price Optimization Enabled",
        description: `Prices will be optimized every ${intervalHours} hours with a target profit of ${targetProfit}%`,
      });
    },
    onError: (error) => {
      console.error('Error scheduling price optimizations:', error);
      toast({
        title: "Scheduling Failed",
        description: "There was an error setting up automatic price optimizations. Please try again.",
        variant: "destructive",
      });
      setAutoOptimize(false);
    }
  });

  // Handle toggling auto-optimization
  const handleAutoOptimizeToggle = (checked: boolean) => {
    setAutoOptimize(checked);
    if (checked) {
      scheduleOptimizationsMutation.mutate();
    }
  };

  // Handle applying optimizations to selected products
  const handleApplyOptimizations = () => {
    if (selectedProducts.length === 0) {
      // If no products are specifically selected, select all products
      const allProductIds = productsQuery.data?.map((product: any) => product.id) || [];
      applyOptimizationsMutation.mutate(allProductIds);
    } else {
      applyOptimizationsMutation.mutate(selectedProducts);
    }
  };

  // Toggle product selection for optimization
  const toggleProductSelection = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Determine if a price change is an increase or decrease
  const getPriceChangeIcon = (currentPrice: number, recommendedPrice: number) => {
    if (recommendedPrice > currentPrice) {
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    }
    if (recommendedPrice < currentPrice) {
      return <ArrowDown className="h-4 w-4 text-amber-600" />;
    }
    return null;
  };

  // Render loading state
  if (optimizationsQuery.isLoading || productsQuery.isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Price Optimization
          </CardTitle>
          <CardDescription>
            Loading price optimization recommendations...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (optimizationsQuery.isError || productsQuery.isError) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Price Optimization
          </CardTitle>
          <CardDescription>
            Error loading price optimization data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">
            There was an error loading price optimization data. Please try again.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/price-optimizer/store/all'] });
              queryClient.invalidateQueries({ queryKey: ['/api/products'] });
            }}
            variant="outline"
            className="w-full"
          >
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const recommendations = optimizationsQuery.data?.recommendations || [];
  const products = productsQuery.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Automated Price Optimization
          </CardTitle>
          <CardDescription>
            AI-powered price optimization to maximize profits based on market trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Target Profit Margin Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="target-profit" className="text-base">Target Profit Margin</Label>
                <Badge variant="secondary">{targetProfit}%</Badge>
              </div>
              <Slider
                id="target-profit"
                min={5}
                max={75}
                step={1}
                value={[targetProfit]}
                onValueChange={(values) => setTargetProfit(values[0])}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Lower margin (more competitive)</span>
                <span>Higher margin (more profit)</span>
              </div>
            </div>

            {/* Stats and Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-muted/50">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base flex items-center gap-1.5">
                    <PieChart className="h-4 w-4" />
                    Optimization Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <dl className="space-y-2">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-muted-foreground">Products Analyzed:</dt>
                      <dd className="font-medium">{optimizationsQuery.data?.recommendationCount || 0}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-muted-foreground">Products Needing Updates:</dt>
                      <dd className="font-medium">{recommendations.length}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-muted-foreground">Potential Monthly Profit:</dt>
                      <dd className="font-medium text-green-600">{formatCurrency(optimizationsQuery.data?.totalPotentialProfit || 0)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base flex items-center gap-1.5">
                    <Zap className="h-4 w-4" />
                    Automatic Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="auto-optimize" 
                        checked={autoOptimize}
                        onCheckedChange={handleAutoOptimizeToggle}
                        disabled={scheduleOptimizationsMutation.isPending}
                      />
                      <Label htmlFor="auto-optimize">Enable Auto-Optimization</Label>
                    </div>
                    {scheduleOptimizationsMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>

                  <div className={`${!autoOptimize ? 'opacity-50' : ''} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="interval-hours" className="text-sm">Update Frequency:</Label>
                      <Badge variant="outline">{intervalHours} hours</Badge>
                    </div>
                    <Slider
                      id="interval-hours"
                      min={1}
                      max={168} // 7 days
                      step={1}
                      value={[intervalHours]}
                      onValueChange={(values) => setIntervalHours(values[0])}
                      disabled={!autoOptimize || scheduleOptimizationsMutation.isPending}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Hourly</span>
                      <span>Daily</span>
                      <span>Weekly</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Recommendations */}
            <div>
              <h3 className="text-base font-medium mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Top Price Recommendations
              </h3>
              
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted px-4 py-2 flex items-center">
                  <div className="w-6" />
                  <div className="flex-1 font-medium text-sm">Product</div>
                  <div className="w-24 text-right font-medium text-sm">Current</div>
                  <div className="w-24 text-right font-medium text-sm">Recommended</div>
                  <div className="w-24 text-right font-medium text-sm">Change</div>
                </div>
                
                <div className="divide-y max-h-[250px] overflow-y-auto">
                  {recommendations.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-center text-muted-foreground">
                      No price optimization recommendations available
                    </div>
                  ) : (
                    recommendations.map((rec: any) => {
                      const product = products.find((p: any) => p.id === rec.productId);
                      if (!product) return null;
                      
                      const priceDiff = ((rec.recommendedPrice - rec.currentPrice) / rec.currentPrice) * 100;
                      const isIncrease = rec.recommendedPrice > rec.currentPrice;
                      
                      return (
                        <div key={rec.productId} className="px-4 py-2 flex items-center hover:bg-muted/50">
                          <div className="w-6">
                            <input 
                              type="checkbox" 
                              checked={selectedProducts.includes(rec.productId)}
                              onChange={() => toggleProductSelection(rec.productId)}
                              className="rounded"
                            />
                          </div>
                          <div className="flex-1 truncate">
                            <div className="text-sm font-medium truncate">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.category}</div>
                          </div>
                          <div className="w-24 text-right font-medium">
                            {formatCurrency(rec.currentPrice)}
                          </div>
                          <div className="w-24 text-right font-medium flex items-center justify-end gap-1">
                            {getPriceChangeIcon(rec.currentPrice, rec.recommendedPrice)}
                            {formatCurrency(rec.recommendedPrice)}
                          </div>
                          <div className={`w-24 text-right font-medium ${isIncrease ? 'text-green-600' : 'text-amber-600'}`}>
                            {isIncrease ? '+' : ''}{priceDiff.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <Button 
            onClick={handleApplyOptimizations}
            disabled={
              applyOptimizationsMutation.isPending || 
              (recommendations.length === 0 && !autoOptimize)
            }
          >
            {applyOptimizationsMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {selectedProducts.length > 0 
              ? `Apply to ${selectedProducts.length} Products` 
              : 'Apply to All Products'
            }
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}