import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  LineChart, 
  CircleDollarSign, 
  AlertCircle, 
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Settings,
  RefreshCw,
  BarChart4,
  Clock,
  Eye
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CompetitorTracking() {
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [autoTrack, setAutoTrack] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all products for the dropdown
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

  // Fetch competitor prices for the selected product
  const competitorPricesQuery = useQuery({
    queryKey: ['/api/competitors/prices', selectedProductId],
    queryFn: async () => {
      const response = await fetch(`/api/competitors/prices/${selectedProductId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch competitor prices');
      }
      return response.json();
    },
    enabled: !!selectedProductId
  });

  // Fetch competitive analysis for the selected product
  const competitiveAnalysisQuery = useQuery({
    queryKey: ['/api/competitors/analysis', selectedProductId],
    queryFn: async () => {
      const response = await fetch(`/api/competitors/analysis/${selectedProductId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch competitive analysis');
      }
      return response.json();
    },
    enabled: !!selectedProductId
  });

  // Fetch price history for the selected product
  const priceHistoryQuery = useQuery({
    queryKey: ['/api/competitors/history', selectedProductId],
    queryFn: async () => {
      const response = await fetch(`/api/competitors/history/${selectedProductId}?days=30`);
      if (!response.ok) {
        throw new Error('Failed to fetch price history');
      }
      return response.json();
    },
    enabled: !!selectedProductId
  });

  // Mutation for auto-adjusting prices
  const adjustPricesMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/competitors/prices/auto-adjust', {
        productIds: [selectedProductId],
        maxAdjustmentPercent: 10
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/competitors/prices', selectedProductId] });
      queryClient.invalidateQueries({ queryKey: ['/api/competitors/analysis', selectedProductId] });
      toast({
        title: "Prices Auto-Adjusted",
        description: `Successfully adjusted prices for ${data.productsAdjusted} products based on competitor data.`,
      });
    },
    onError: (error) => {
      console.error('Error auto-adjusting prices:', error);
      toast({
        title: "Adjustment Failed",
        description: "There was an error auto-adjusting prices. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for configuring price alerts
  const configurePriceAlertsMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/competitors/alerts/configure', {
        alertThresholdPercentage: 5,
        checkIntervalMinutes: 60,
        productIds: [selectedProductId]
      });
    },
    onSuccess: () => {
      toast({
        title: "Price Alerts Configured",
        description: "You'll now receive alerts when competitor prices change significantly.",
      });
    },
    onError: (error) => {
      console.error('Error configuring price alerts:', error);
      toast({
        title: "Configuration Failed",
        description: "There was an error configuring price alerts. Please try again.",
        variant: "destructive",
      });
      setAutoTrack(false);
    }
  });

  // Handle toggling automatic price tracking
  const handleAutoTrackToggle = (checked: boolean) => {
    setAutoTrack(checked);
    if (checked) {
      configurePriceAlertsMutation.mutate();
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Get price gap badge color
  const getPriceGapBadgeColor = (priceGap: number) => {
    const absGap = Math.abs(priceGap);
    if (absGap < 5) return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    return priceGap > 0 
      ? 'bg-red-100 text-red-800 hover:bg-red-100' 
      : 'bg-green-100 text-green-800 hover:bg-green-100';
  };

  // Get price badge based on competitiveness
  const getCompetitivenessBadge = (competitiveness: string) => {
    switch (competitiveness) {
      case 'underpriced':
        return <Badge className="bg-green-100 text-green-800">Underpriced</Badge>;
      case 'competitive':
        return <Badge className="bg-blue-100 text-blue-800">Competitive</Badge>;
      case 'overpriced':
        return <Badge className="bg-red-100 text-red-800">Overpriced</Badge>;
      default:
        return null;
    }
  };

  // Get trend arrow icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  // Loading state
  if (productsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Real-Time Competitor Price Tracking
          </CardTitle>
          <CardDescription>
            Loading product data...
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
            <Eye className="h-5 w-5" />
            Real-Time Competitor Price Tracking
          </CardTitle>
          <CardDescription>
            Error loading product data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              There was an error loading the product data. Please try again.
            </p>
            <Button 
              className="mt-4"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/products'] });
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const products = productsQuery.data || [];
  const competitorPrices = competitorPricesQuery.data || [];
  const competitiveAnalysis = competitiveAnalysisQuery.data || null;
  const priceHistory = priceHistoryQuery.data || [];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Real-Time Competitor Price Tracking
          </CardTitle>
          <CardDescription>
            Monitor competitor prices and automatically adjust your pricing strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Product Selection */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <CircleDollarSign className="h-4 w-4" />
                  Product Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <Select
                    value={selectedProductId.toString()}
                    onValueChange={(value) => setSelectedProductId(parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product: any) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="text-sm text-muted-foreground">
                    Select a product to analyze competitor pricing data and market positioning.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Overview */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <BarChart4 className="h-4 w-4" />
                  Pricing Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {competitiveAnalysisQuery.isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : competitiveAnalysisQuery.isError ? (
                  <div className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Error loading analysis
                  </div>
                ) : competitiveAnalysis ? (
                  <dl className="space-y-2">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-muted-foreground">Your Price:</dt>
                      <dd className="font-medium">{formatPrice(competitiveAnalysis.ourPrice)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-muted-foreground">Avg. Market:</dt>
                      <dd className="font-medium">{formatPrice(competitiveAnalysis.averageCompetitorPrice)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-muted-foreground">Lowest Competitor:</dt>
                      <dd className="font-medium">{formatPrice(competitiveAnalysis.lowestCompetitorPrice)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-muted-foreground">Competitiveness:</dt>
                      <dd className="font-medium">
                        {competitiveAnalysis.priceCompetitiveness && 
                          getCompetitivenessBadge(competitiveAnalysis.priceCompetitiveness)}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    No price data available
                  </div>
                )}
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
                    id="auto-track" 
                    checked={autoTrack}
                    onCheckedChange={handleAutoTrackToggle}
                    disabled={configurePriceAlertsMutation.isPending}
                  />
                  <Label htmlFor="auto-track">Enable Auto-Tracking</Label>
                  {configurePriceAlertsMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  )}
                </div>
                
                <div className={`${!autoTrack ? 'opacity-50' : ''} space-y-1 text-sm`}>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Alert Threshold:</span>
                    <span className="font-medium">5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Check Frequency:</span>
                    <span className="font-medium">Hourly</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Auto-Adjust:</span>
                    <span className="font-medium">Off</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border flex items-start mt-2 mb-6">
            <Eye className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">Real-Time Competitor Price Tracking</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our system continuously monitors competitor prices across multiple marketplaces and automatically 
                alerts you to significant changes. You can configure the system to automatically adjust your 
                prices based on competitor movements to maintain optimal market positioning.
              </p>
            </div>
          </div>

          <Tabs defaultValue="current-prices">
            <TabsList className="mb-4">
              <TabsTrigger value="current-prices" className="flex items-center gap-1.5">
                <CircleDollarSign className="h-4 w-4" />
                Current Prices
              </TabsTrigger>
              <TabsTrigger value="price-history" className="flex items-center gap-1.5">
                <LineChart className="h-4 w-4" />
                Price History
              </TabsTrigger>
              <TabsTrigger value="market-analysis" className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                Market Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current-prices">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competitor</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Price Gap</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competitorPricesQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : competitorPricesQuery.isError ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-red-500">
                          Error loading competitor prices
                        </TableCell>
                      </TableRow>
                    ) : competitorPrices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No competitor data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      competitorPrices.map((competitor: any) => (
                        <TableRow key={competitor.competitorId}>
                          <TableCell className="font-medium">
                            <a 
                              href={competitor.competitorUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {competitor.competitorName}
                              <Eye className="h-3.5 w-3.5" />
                            </a>
                          </TableCell>
                          <TableCell>{formatPrice(competitor.competitorPrice)}</TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1">
                                    {competitor.priceGap > 0 ? (
                                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                                    ) : (
                                      <ArrowDownRight className="h-4 w-4 text-green-500" />
                                    )}
                                    <Badge className={getPriceGapBadgeColor(competitor.priceGapPercentage)}>
                                      {competitor.priceGap > 0 ? '+' : ''}{Math.round(competitor.priceGapPercentage)}%
                                    </Badge>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {competitor.priceGap > 0 
                                      ? `Your price is ${formatPrice(Math.abs(competitor.priceGap))} higher`
                                      : `Your price is ${formatPrice(Math.abs(competitor.priceGap))} lower`}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            {new Date(competitor.lastUpdated).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => {
                                window.open(competitor.competitorUrl, '_blank');
                              }}
                            >
                              View Listing
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="price-history">
              <div className="space-y-6">
                {priceHistoryQuery.isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : priceHistoryQuery.isError ? (
                  <div className="text-center py-12 text-red-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    Error loading price history
                  </div>
                ) : priceHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border rounded-md">
                    No price history available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {priceHistory.slice(0, 2).map((history: any) => (
                      <Card key={history.competitorId}>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>{products.find((p: any) => p.id === history.productId)?.name} - Competitor {history.competitorId}</span>
                            <div className="flex items-center gap-1 text-sm font-normal">
                              {getTrendIcon(history.priceChangeTrend)}
                              <span>{history.priceChangeTrend}</span>
                            </div>
                          </CardTitle>
                          <CardDescription>
                            30-day price change: {history.priceChange30Days > 0 ? '+' : ''}{Math.round(history.priceChange30Days)}%
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="h-48 bg-muted/30 rounded-md flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <LineChart className="h-8 w-8 mx-auto mb-2" />
                              <p>Price history chart would render here</p>
                              <p className="text-xs">Displaying {history.prices.length} data points</p>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-between text-sm">
                            <div>
                              <div className="text-muted-foreground">Start Price</div>
                              <div>{formatPrice(history.prices[0].price)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Current Price</div>
                              <div>{formatPrice(history.prices[history.prices.length - 1].price)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Lowest Price</div>
                              <div>{formatPrice(Math.min(...history.prices.map((p: any) => p.price)))}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="market-analysis">
              <div className="space-y-6">
                {competitiveAnalysisQuery.isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : competitiveAnalysisQuery.isError ? (
                  <div className="text-center py-12 text-red-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    Error loading market analysis
                  </div>
                ) : !competitiveAnalysis ? (
                  <div className="text-center py-12 text-muted-foreground border rounded-md">
                    No market analysis available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">Market Positioning</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="h-48 bg-muted/30 rounded-md flex items-center justify-center mb-4">
                          <div className="text-center text-muted-foreground">
                            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                            <p>Price distribution chart would render here</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Price Range:</span>
                            <span className="font-medium">
                              {formatPrice(competitiveAnalysis.lowestCompetitorPrice)} - {formatPrice(competitiveAnalysis.highestCompetitorPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Your Position:</span>
                            <span className="font-medium">
                              {competitiveAnalysis.priceCompetitiveness === 'underpriced'
                                ? 'Below market average'
                                : competitiveAnalysis.priceCompetitiveness === 'overpriced'
                                  ? 'Above market average'
                                  : 'At market average'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Competitor Count:</span>
                            <span className="font-medium">{competitiveAnalysis.competitorPrices.length}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">Price Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {competitiveAnalysis.recommendedPriceAdjustment ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                              <h3 className="font-medium text-blue-800 mb-1">Recommended Price</h3>
                              <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-blue-900">
                                  {formatPrice(competitiveAnalysis.recommendedPriceAdjustment)}
                                </span>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {Math.round((competitiveAnalysis.recommendedPriceAdjustment / competitiveAnalysis.ourPrice - 1) * 100)}% change
                                </Badge>
                              </div>
                              <p className="text-sm text-blue-700 mt-2">
                                This recommendation is based on your position relative to competitors
                                and is designed to optimize your market competitiveness.
                              </p>
                            </div>
                          ) : (
                            <div className="bg-green-50 border border-green-200 rounded-md p-4">
                              <h3 className="font-medium text-green-800">Price is Competitive</h3>
                              <p className="text-sm text-green-700 mt-1">
                                Your current price is competitive in the market. No adjustment is recommended at this time.
                              </p>
                            </div>
                          )}
                          
                          <Button 
                            className="w-full"
                            onClick={() => adjustPricesMutation.mutate()}
                            disabled={adjustPricesMutation.isPending}
                          >
                            {adjustPricesMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                Auto-Adjust Price
                              </>
                            )}
                          </Button>
                          
                          <div className="text-sm text-muted-foreground">
                            Clicking this button will automatically adjust your price to the recommended level
                            based on current competitive analysis.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <Button 
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/competitors/prices', selectedProductId] });
              queryClient.invalidateQueries({ queryKey: ['/api/competitors/analysis', selectedProductId] });
              queryClient.invalidateQueries({ queryKey: ['/api/competitors/history', selectedProductId] });
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