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
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Clock, 
  AlertCircle, 
  Loader2,
  Brain,
  BarChart2,
  LineChart,
  Sparkles,
  Settings,
  RefreshCw,
  ShoppingBag,
  Activity,
  PieChart
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export function DemandForecasting() {
  const [autoForecast, setAutoForecast] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch product demand forecasts
  const forecastsQuery = useQuery({
    queryKey: ['/api/forecasting/products'],
    queryFn: async () => {
      const response = await fetch('/api/forecasting/products');
      if (!response.ok) {
        throw new Error('Failed to fetch demand forecasts');
      }
      return response.json();
    }
  });

  // Mutation for applying forecast insights
  const applyForecastMutation = useMutation({
    mutationFn: (forecastId: number) => {
      return apiRequest('POST', `/api/forecasting/apply/${forecastId}`, {});
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/forecasting/products'] });
      toast({
        title: "Forecast Insights Applied",
        description: `Successfully applied insights to inventory management and pricing strategies.`,
      });
    },
    onError: (error) => {
      console.error('Error applying forecast insights:', error);
      toast({
        title: "Application Failed",
        description: "There was an error applying forecast insights. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for scheduling automatic forecasting
  const scheduleForecastingMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/forecasting/schedule', {
        intervalHours: 24, // Daily
        autoApply: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Automatic Demand Forecasting Enabled",
        description: "AI will now continuously analyze and predict product demand, automatically adjusting inventory and pricing strategies.",
      });
    },
    onError: (error) => {
      console.error('Error scheduling demand forecasting:', error);
      toast({
        title: "Scheduling Failed",
        description: "There was an error enabling automatic demand forecasting. Please try again.",
        variant: "destructive",
      });
      setAutoForecast(false);
    }
  });

  // Handle toggling automatic forecasting
  const handleAutoForecastToggle = (checked: boolean) => {
    setAutoForecast(checked);
    if (checked) {
      scheduleForecastingMutation.mutate();
    }
  };

  // Format date for display
  const formatDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get demand trend icon
  const getDemandTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  // Get confidence badge color
  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 hover:bg-green-100';
    if (confidence >= 0.6) return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    if (confidence >= 0.4) return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    return 'bg-red-100 text-red-800 hover:bg-red-100';
  };

  // Get action impact badge
  const getActionImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High Impact</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Medium Impact</Badge>;
      case 'low':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Low Impact</Badge>;
      default:
        return null;
    }
  };

  // Get seasonal factor impact color
  const getSeasonalImpactColor = (impact: number) => {
    if (impact > 0.3) return 'text-green-600';
    if (impact > 0) return 'text-blue-600';
    if (impact > -0.3) return 'text-amber-600';
    return 'text-red-600';
  };

  // Loading state
  if (forecastsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Demand Forecasting
          </CardTitle>
          <CardDescription>
            Loading forecast data...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (forecastsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Demand Forecasting
          </CardTitle>
          <CardDescription>
            Error loading forecast data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              There was an error loading the demand forecasting data. Please try again.
            </p>
            <Button 
              className="mt-4"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/forecasting/products'] });
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get forecast data
  const forecasts = forecastsQuery.data?.forecasts || [];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Demand Forecasting
          </CardTitle>
          <CardDescription>
            Automatically predict future demand and optimize inventory and pricing strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Forecast Stats */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  Forecasting Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <dl className="space-y-2">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Products Analyzed:</dt>
                    <dd className="font-medium">{forecasts.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Average Confidence:</dt>
                    <dd className="font-medium">{(forecasts.reduce((sum, f) => 
                      sum + (f.forecastDemand.reduce((total, fd) => total + fd.confidence, 0) / f.forecastDemand.length), 
                      0) / (forecasts.length || 1)).toFixed(1) * 100}%</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Growth Trends:</dt>
                    <dd className="font-medium">{forecasts.filter(f => 
                      f.forecastDemand.some(fd => fd.trend === 'increasing')).length} products</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Next Update:</dt>
                    <dd className="font-medium">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Current Insights */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <LineChart className="h-4 w-4" />
                  Current Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  {forecasts[0]?.marketTrends?.slice(0, 3).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between gap-2">
                      <span className="text-sm truncate">{trend.trend}</span>
                      <Badge className={trend.direction === 'rising' 
                        ? 'bg-green-100 text-green-800' 
                        : trend.direction === 'falling'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }>
                        {trend.direction}
                      </Badge>
                    </div>
                  ))}
                  {!forecasts[0]?.marketTrends?.length && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      No market trends available
                    </div>
                  )}
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
                    id="auto-forecast" 
                    checked={autoForecast}
                    onCheckedChange={handleAutoForecastToggle}
                    disabled={scheduleForecastingMutation.isPending}
                  />
                  <Label htmlFor="auto-forecast">Enable Auto-Forecasting</Label>
                  {scheduleForecastingMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  )}
                </div>
                
                <div className={`${!autoForecast ? 'opacity-50' : ''} space-y-1 text-sm`}>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">Daily</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Auto-Apply:</span>
                    <span className="font-medium">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Analysis Features:</span>
                    <span className="font-medium">All</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border flex items-start mt-2 mb-6">
            <Sparkles className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">AI-Powered Demand Forecasting</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our advanced AI system predicts future product demand by analyzing historical sales data,
                market trends, seasonal factors, and competitive landscape. These predictions are automatically 
                applied to optimize inventory levels, pricing strategies, and supplier relationships without human intervention.
              </p>
            </div>
          </div>

          <Tabs defaultValue="forecasts">
            <TabsList className="mb-4">
              <TabsTrigger value="forecasts" className="flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4" />
                Demand Forecasts
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                AI Recommendations
              </TabsTrigger>
              <TabsTrigger value="factors" className="flex items-center gap-1.5">
                <PieChart className="h-4 w-4" />
                Market Factors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="forecasts">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Demand</TableHead>
                      <TableHead>7-Day Forecast</TableHead>
                      <TableHead>30-Day Forecast</TableHead>
                      <TableHead>90-Day Forecast</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forecasts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No forecasts available
                        </TableCell>
                      </TableRow>
                    ) : (
                      forecasts.map((forecast) => {
                        const sevenDayForecast = forecast.forecastDemand.find(fd => fd.timeframe === '7days');
                        const thirtyDayForecast = forecast.forecastDemand.find(fd => fd.timeframe === '30days');
                        const ninetyDayForecast = forecast.forecastDemand.find(fd => fd.timeframe === '90days');
                        
                        return (
                          <TableRow key={forecast.productId}>
                            <TableCell className="font-medium">{forecast.productName}</TableCell>
                            <TableCell>{forecast.currentDemand} units/month</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {getDemandTrendIcon(sevenDayForecast?.trend || 'stable')}
                                <span>{sevenDayForecast?.demand || '-'} units</span>
                                <Badge className={getConfidenceBadgeColor(sevenDayForecast?.confidence || 0)}>
                                  {Math.round((sevenDayForecast?.confidence || 0) * 100)}%
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {getDemandTrendIcon(thirtyDayForecast?.trend || 'stable')}
                                <span>{thirtyDayForecast?.demand || '-'} units</span>
                                <Badge className={getConfidenceBadgeColor(thirtyDayForecast?.confidence || 0)}>
                                  {Math.round((thirtyDayForecast?.confidence || 0) * 100)}%
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {getDemandTrendIcon(ninetyDayForecast?.trend || 'stable')}
                                <span>{ninetyDayForecast?.demand || '-'} units</span>
                                <Badge className={getConfidenceBadgeColor(ninetyDayForecast?.confidence || 0)}>
                                  {Math.round((ninetyDayForecast?.confidence || 0) * 100)}%
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => applyForecastMutation.mutate(forecast.productId)}
                                disabled={applyForecastMutation.isPending}
                              >
                                {applyForecastMutation.isPending && applyForecastMutation.variables === forecast.productId ? (
                                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                                )}
                                Apply Insights
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="recommendations">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {forecasts.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-muted-foreground border rounded-md">
                    No recommendations available
                  </div>
                ) : (
                  forecasts.slice(0, 4).map((forecast) => (
                    <Card key={forecast.productId} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2 bg-muted/50">
                        <CardTitle className="text-base flex justify-between">
                          <span className="truncate">{forecast.productName}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {forecast.recommendedActions.map((action, idx) => (
                            <div key={idx} className="flex justify-between items-start gap-3 pb-3 border-b last:border-0">
                              <div>
                                <div className="font-medium">{action.action}</div>
                                <div className="text-sm text-muted-foreground">{action.description}</div>
                              </div>
                              {getActionImpactBadge(action.impact)}
                            </div>
                          ))}
                          {forecast.recommendedActions.length === 0 && (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              No recommended actions available
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 bg-muted/30 border-t flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => applyForecastMutation.mutate(forecast.productId)}
                          disabled={applyForecastMutation.isPending}
                        >
                          Apply All Recommendations
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="factors">
              <div className="space-y-4">
                {forecasts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border rounded-md">
                    No market factors available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Seasonal Factors */}
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          Seasonal Factors
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {forecasts[0]?.seasonalFactors?.map((season, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span className="capitalize">{season.season}</span>
                              <div className="flex items-center gap-2">
                                <span className={getSeasonalImpactColor(season.impact)}>
                                  {season.impact > 0 ? '+' : ''}{Math.round(season.impact * 100)}%
                                </span>
                                <Badge className={getConfidenceBadgeColor(season.confidence)}>
                                  {Math.round(season.confidence * 100)}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {!forecasts[0]?.seasonalFactors?.length && (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              No seasonal factors available
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Market Trends */}
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4" />
                          Market Trends
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {forecasts[0]?.marketTrends?.map((trend, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{trend.trend}</span>
                                <Badge className={trend.direction === 'rising' 
                                  ? 'bg-green-100 text-green-800' 
                                  : trend.direction === 'falling'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }>
                                  {trend.direction}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Impact: {Math.round(trend.impact * 100)}%</span>
                                <span className="text-muted-foreground capitalize">{trend.timeframe} term</span>
                              </div>
                            </div>
                          ))}
                          {!forecasts[0]?.marketTrends?.length && (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              No market trends available
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Competitive Factors */}
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base flex items-center gap-1.5">
                          <ShoppingBag className="h-4 w-4" />
                          Competitive Landscape
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {forecasts[0]?.competitiveFactors?.[0] ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Competitor Count:</span>
                              <span className="font-medium">{forecasts[0].competitiveFactors[0].competitorCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Market Saturation:</span>
                              <span className="font-medium">{Math.round(forecasts[0].competitiveFactors[0].marketSaturation * 100)}%</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm text-muted-foreground">Unique Selling Points:</span>
                              <div className="flex flex-wrap gap-1">
                                {forecasts[0].competitiveFactors[0].uniqueSellingPoints.map((point, idx) => (
                                  <Badge key={idx} variant="outline">{point}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Market Impact:</span>
                              <span className={getSeasonalImpactColor(forecasts[0].competitiveFactors[0].impact)}>
                                {forecasts[0].competitiveFactors[0].impact > 0 ? '+' : ''}
                                {Math.round(forecasts[0].competitiveFactors[0].impact * 100)}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-2">
                            No competitive factors available
                          </div>
                        )}
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
              queryClient.invalidateQueries({ queryKey: ['/api/forecasting/products'] });
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Forecasts
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}