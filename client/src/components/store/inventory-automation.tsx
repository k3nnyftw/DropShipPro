import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  ArrowUp, 
  ArrowDown, 
  Box, 
  BarChart3, 
  Clock, 
  AlertCircle, 
  Loader2,
  TrendingUp,
  Sparkles,
  Settings,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export function InventoryAutomation() {
  const [autoReorder, setAutoReorder] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch inventory status
  const inventoryStatusQuery = useQuery({
    queryKey: ['/api/inventory/status'],
    queryFn: async () => {
      const response = await fetch('/api/inventory/status');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory status');
      }
      return response.json();
    }
  });

  // Fetch inventory predictions
  const predictionsQuery = useQuery({
    queryKey: ['/api/inventory/predictions'],
    queryFn: async () => {
      const response = await fetch('/api/inventory/predictions');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory predictions');
      }
      return response.json();
    }
  });

  // Mutation for auto-reordering
  const autoReorderMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/inventory/auto-reorder', {});
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/status'] });
      toast({
        title: "Products Auto-Reordered",
        description: `Successfully reordered ${data.successCount} products.`,
      });
    },
    onError: (error) => {
      console.error('Error auto-reordering products:', error);
      toast({
        title: "Auto-Reorder Failed",
        description: "There was an error reordering products. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for scheduling automatic reordering
  const scheduleReorderMutation = useMutation({
    mutationFn: (reorderIntervalHours: number) => {
      return apiRequest('POST', '/api/inventory/schedule', {
        reorderIntervalHours
      });
    },
    onSuccess: () => {
      toast({
        title: "Automatic Reordering Enabled",
        description: "Inventory will be automatically monitored and reordered as needed.",
      });
    },
    onError: (error) => {
      console.error('Error scheduling auto-reordering:', error);
      toast({
        title: "Scheduling Failed",
        description: "There was an error enabling automatic reordering. Please try again.",
        variant: "destructive",
      });
      setAutoReorder(false);
    }
  });

  // Handle toggling automatic reordering
  const handleAutoReorderToggle = (checked: boolean) => {
    setAutoReorder(checked);
    if (checked) {
      scheduleReorderMutation.mutate(24); // Schedule daily reordering
    }
  };

  // Get stock level color
  const getStockLevelColor = (current: number, threshold: number) => {
    if (current <= 0) return 'text-red-600';
    if (current <= threshold) return 'text-amber-600';
    if (current <= threshold * 2) return 'text-blue-600';
    return 'text-green-600';
  };

  // Get stock level progress color
  const getProgressColor = (current: number, threshold: number, optimal: number) => {
    if (current <= 0) return 'bg-red-600';
    if (current <= threshold) return 'bg-amber-600';
    if (current <= threshold * 2) return 'bg-blue-600';
    return 'bg-green-600';
  };

  // Get risk badge
  const getRiskBadge = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High Risk</Badge>;
      default:
        return null;
    }
  };

  // Loading state
  if (inventoryStatusQuery.isLoading || predictionsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Automated Inventory Management
          </CardTitle>
          <CardDescription>
            Loading inventory data...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (inventoryStatusQuery.isError || predictionsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Automated Inventory Management
          </CardTitle>
          <CardDescription>
            Error loading inventory data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              There was an error loading inventory data. Please try again.
            </p>
            <Button 
              className="mt-4"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/inventory/status'] });
                queryClient.invalidateQueries({ queryKey: ['/api/inventory/predictions'] });
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get inventory data
  const inventoryStatus = inventoryStatusQuery.data || [];
  const predictions = predictionsQuery.data || [];
  
  // Filter for products that need reordering
  const needsReorder = inventoryStatus.filter(product => product.needsReorder);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Automated Inventory Management
          </CardTitle>
          <CardDescription>
            Automatically monitor and reorder inventory based on sales velocity and forecasts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Inventory Stats */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  Inventory Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <dl className="space-y-2">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Total Products:</dt>
                    <dd className="font-medium">{inventoryStatus.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Need Reordering:</dt>
                    <dd className="font-medium text-amber-600">{needsReorder.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Forecasted Demand:</dt>
                    <dd className="font-medium">
                      {predictions.reduce((total, p) => total + (p.projectedSales[1]?.quantity || 0), 0)} units
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Stockout Risk:</dt>
                    <dd className="font-medium">
                      {predictions.filter(p => p.stockoutRisk === 'high').length} products
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Manual Reordering */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <RefreshCw className="h-4 w-4" />
                  Manual Reordering
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Trigger automated reordering for all products below threshold
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => autoReorderMutation.mutate()}
                  disabled={autoReorderMutation.isPending || needsReorder.length === 0}
                >
                  {autoReorderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4 mr-2" />
                  )}
                  {needsReorder.length === 0 
                    ? 'No Products to Reorder' 
                    : `Reorder ${needsReorder.length} Products`
                  }
                </Button>
              </CardContent>
            </Card>

            {/* Automatic Reordering Settings */}
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
                    id="auto-reorder" 
                    checked={autoReorder}
                    onCheckedChange={handleAutoReorderToggle}
                    disabled={scheduleReorderMutation.isPending}
                  />
                  <Label htmlFor="auto-reorder">Enable Auto-Reordering</Label>
                  {scheduleReorderMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  )}
                </div>
                
                <div className={`${!autoReorder ? 'opacity-50' : ''} space-y-1 text-sm`}>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Check Frequency:</span>
                    <span className="font-medium">Daily</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reorder Threshold:</span>
                    <span className="font-medium">When below 20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Based On:</span>
                    <span className="font-medium">Sales velocity + AI</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border flex items-start mt-2 mb-6">
            <Sparkles className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">Automated Inventory Management</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI-powered system automatically analyzes sales patterns, predicts future demand, and manages 
                reordering based on optimized inventory levels. The system continuously learns from sales data 
                to refine reorder timing and quantities, eliminating manual inventory management.
              </p>
            </div>
          </div>

          <Tabs defaultValue="low-stock">
            <TabsList className="mb-4">
              <TabsTrigger value="low-stock" className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Low Stock Items
              </TabsTrigger>
              <TabsTrigger value="predictions" className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Demand Forecasts
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                All Products
              </TabsTrigger>
            </TabsList>

            <TabsContent value="low-stock">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Suggested Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {needsReorder.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          All products have sufficient inventory
                        </TableCell>
                      </TableRow>
                    ) : (
                      needsReorder.map((product) => (
                        <TableRow key={product.productId}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className={getStockLevelColor(product.currentStock, product.reorderThreshold)}>
                            {product.currentStock}
                          </TableCell>
                          <TableCell>{product.reorderThreshold}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(product.currentStock / product.optimalStock) * 100} 
                                max={100}
                                className={`h-2 w-16 ${getProgressColor(product.currentStock, product.reorderThreshold, product.optimalStock)}`}
                              />
                              <span className="text-xs text-muted-foreground">
                                {product.daysUntilStockout === 999 ? 
                                  'No sales' : 
                                  `${product.daysUntilStockout} days left`
                                }
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">
                              Order {product.suggestedOrderQuantity} units
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="predictions">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>7-Day Forecast</TableHead>
                      <TableHead>30-Day Forecast</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No forecast data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      predictions.map((prediction) => (
                        <TableRow key={prediction.productId}>
                          <TableCell className="font-medium">{prediction.name}</TableCell>
                          <TableCell>
                            {prediction.projectedSales.find(s => s.timeframe === '7days')?.quantity || 0} units
                          </TableCell>
                          <TableCell>
                            {prediction.projectedSales.find(s => s.timeframe === '30days')?.quantity || 0} units
                          </TableCell>
                          <TableCell>
                            {getRiskBadge(prediction.stockoutRisk)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {prediction.recommendation}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="all">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Optimal Level</TableHead>
                      <TableHead>Days Until Reorder</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryStatus.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className={getStockLevelColor(product.currentStock, product.reorderThreshold)}>
                          {product.currentStock}
                        </TableCell>
                        <TableCell>{product.optimalStock}</TableCell>
                        <TableCell>
                          {product.daysUntilStockout === 999 ? 
                            'No sales' : 
                            `${Math.max(0, product.daysUntilStockout - 14)} days`
                          }
                        </TableCell>
                        <TableCell>
                          {product.needsReorder ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-800">
                              Reorder Needed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-800">
                              Sufficient
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              queryClient.invalidateQueries({ queryKey: ['/api/inventory/status'] });
              queryClient.invalidateQueries({ queryKey: ['/api/inventory/predictions'] });
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