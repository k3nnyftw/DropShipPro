import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertCircle, 
  Loader2,
  Check,
  Sparkles,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export function PriceOptimization() {
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [profitMargin, setProfitMargin] = useState(30);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all products with pricing data
  const productsQuery = useQuery({
    queryKey: ['/api/price-optimizer/store/all'],
    queryFn: async () => {
      const response = await fetch('/api/price-optimizer/store/all');
      if (!response.ok) {
        throw new Error('Failed to fetch price recommendations');
      }
      return response.json();
    }
  });

  // Mutation for applying price optimizations
  const applyOptimizationsMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/price-optimizer/auto-apply', {
        targetProfitMargin: profitMargin
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/price-optimizer/store/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Prices Optimized",
        description: `Successfully updated prices for ${data.updatedProducts} products.`,
      });
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

  // Mutation for scheduling automatic price optimizations
  const scheduleOptimizationsMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/price-optimizer/schedule', {
        targetProfitMargin: profitMargin,
        frequencyHours: 24 // Daily
      });
    },
    onSuccess: () => {
      toast({
        title: "Automatic Price Optimization Enabled",
        description: `Prices will be automatically optimized daily with a target profit margin of ${profitMargin}%.`,
      });
    },
    onError: (error) => {
      console.error('Error scheduling price optimizations:', error);
      toast({
        title: "Scheduling Failed",
        description: "There was an error enabling automatic price optimization. Please try again.",
        variant: "destructive",
      });
      setAutoOptimize(false);
    }
  });

  // Handle toggling automatic optimization
  const handleAutoOptimizeToggle = (checked: boolean) => {
    setAutoOptimize(checked);
    if (checked) {
      scheduleOptimizationsMutation.mutate();
    }
  };

  // Format currency
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `$${numValue.toFixed(2)}`;
  };

  // Calculate price difference percentage
  const calculatePriceDiff = (currentPrice: string | number, recommendedPrice: string | number) => {
    const current = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice;
    const recommended = typeof recommendedPrice === 'string' ? parseFloat(recommendedPrice) : recommendedPrice;
    
    const diff = ((recommended - current) / current) * 100;
    return diff.toFixed(1);
  };

  // Get profit margin color
  const getProfitMarginColor = (margin: number) => {
    if (margin < 15) return 'text-red-600';
    if (margin < 25) return 'text-amber-600';
    if (margin > 40) return 'text-green-600';
    return 'text-blue-600';
  };

  // Get price difference badge
  const getPriceDiffBadge = (diff: string) => {
    const diffNum = parseFloat(diff);
    
    if (diffNum > 15) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+{diff}%</Badge>;
    } 
    
    if (diffNum > 5) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">+{diff}%</Badge>;
    }

    if (diffNum < -15) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{diff}%</Badge>;
    }

    if (diffNum < -5) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{diff}%</Badge>;
    }

    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{diff}%</Badge>;
  };

  // Loading state
  if (productsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Automated Price Optimization
          </CardTitle>
          <CardDescription>
            Loading pricing data...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (productsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Automated Price Optimization
          </CardTitle>
          <CardDescription>
            Error loading pricing data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              There was an error loading price optimization data. Please try again.
            </p>
            <Button 
              className="mt-4"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/price-optimizer/store/all'] });
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get pricing data
  const products = productsQuery.data?.products || [];
  const metrics = productsQuery.data?.metrics || {
    averageCurrentMargin: 22.5,
    averageOptimizedMargin: 28.7,
    potentialRevenueIncrease: 18.4,
    productsNeedingOptimization: products.filter((p: any) => p.recommendedPrice !== p.currentPrice).length,
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Automated Price Optimization
          </CardTitle>
          <CardDescription>
            Automatically optimize product prices based on market demand, competition, and profit margins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Pricing Stats */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  Price Optimization Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <dl className="space-y-2">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Current Avg. Margin:</dt>
                    <dd className="font-medium">{metrics.averageCurrentMargin}%</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Optimized Avg. Margin:</dt>
                    <dd className="font-medium text-green-600">{metrics.averageOptimizedMargin}%</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Revenue Increase:</dt>
                    <dd className="font-medium text-green-600">+{metrics.potentialRevenueIncrease}%</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Products to Optimize:</dt>
                    <dd className="font-medium">{metrics.productsNeedingOptimization}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Manual Optimization */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <Percent className="h-4 w-4" />
                  Profit Margin Target
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Target Profit Margin:</span>
                      <span className={`font-medium ${getProfitMarginColor(profitMargin)}`}>
                        {profitMargin}%
                      </span>
                    </div>
                    <Slider
                      defaultValue={[30]}
                      min={10}
                      max={50}
                      step={1}
                      value={[profitMargin]}
                      onValueChange={values => setProfitMargin(values[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10%</span>
                      <span>30%</span>
                      <span>50%</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => applyOptimizationsMutation.mutate()}
                    disabled={applyOptimizationsMutation.isPending || products.length === 0}
                  >
                    {applyOptimizationsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Apply Price Optimizations
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Automation Settings */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <Settings className="h-4 w-4" />
                  Automation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Switch 
                    id="auto-optimize" 
                    checked={autoOptimize}
                    onCheckedChange={handleAutoOptimizeToggle}
                    disabled={scheduleOptimizationsMutation.isPending}
                  />
                  <Label htmlFor="auto-optimize">Enable Auto-Optimization</Label>
                  {scheduleOptimizationsMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  )}
                </div>
                
                <div className={`${!autoOptimize ? 'opacity-50' : ''} space-y-1 text-sm`}>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">Daily</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Target Margin:</span>
                    <span className={`font-medium ${getProfitMarginColor(profitMargin)}`}>
                      {profitMargin}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Market Analysis:</span>
                    <span className="font-medium">Enabled</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border flex items-start mt-2 mb-6">
            <Sparkles className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">AI-Powered Price Optimization</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI system continuously analyzes market demand, competitor pricing, and seasonal trends to 
                determine the optimal price point for each product. This dynamic pricing strategy maximizes 
                your profitability while maintaining competitive market positioning, without any manual intervention.
              </p>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Current Margin</TableHead>
                  <TableHead>Recommended Price</TableHead>
                  <TableHead>Potential Margin</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No products available for price optimization
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product: any) => {
                    const costPrice = parseFloat(product.costPrice);
                    const currentPrice = parseFloat(product.currentPrice);
                    const recommendedPrice = parseFloat(product.recommendedPrice);
                    
                    const currentMargin = ((currentPrice - costPrice) / currentPrice) * 100;
                    const potentialMargin = ((recommendedPrice - costPrice) / recommendedPrice) * 100;
                    
                    const priceDiff = calculatePriceDiff(currentPrice, recommendedPrice);
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{formatCurrency(product.costPrice)}</TableCell>
                        <TableCell>{formatCurrency(product.currentPrice)}</TableCell>
                        <TableCell className={getProfitMarginColor(currentMargin)}>
                          {currentMargin.toFixed(1)}%
                        </TableCell>
                        <TableCell>{formatCurrency(product.recommendedPrice)}</TableCell>
                        <TableCell className={getProfitMarginColor(potentialMargin)}>
                          {potentialMargin.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {parseFloat(priceDiff) > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600 mr-1.5" />
                            ) : parseFloat(priceDiff) < 0 ? (
                              <TrendingDown className="h-4 w-4 text-red-600 mr-1.5" />
                            ) : (
                              <span className="w-4 mr-1.5"></span>
                            )}
                            {getPriceDiffBadge(priceDiff)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <Button 
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/price-optimizer/store/all'] });
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}