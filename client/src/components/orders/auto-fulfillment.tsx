import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Truck, 
  ShoppingBag, 
  PackageCheck, 
  Clock, 
  AlertCircle, 
  Loader2,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export function AutoFulfillment() {
  const [autoFulfill, setAutoFulfill] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending orders
  const pendingOrdersQuery = useQuery({
    queryKey: ['/api/fulfillment/pending'],
    queryFn: async () => {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch pending orders');
      }
      const orders = await response.json();
      // Filter orders that are pending fulfillment
      return orders.filter((order: any) => 
        order.status === 'processing' || 
        order.status === 'paid' || 
        (order.paymentStatus === 'paid' && order.fulfillment !== 'shipped')
      );
    }
  });

  // Fetch fulfillment stats
  const fulfillmentStatsQuery = useQuery({
    queryKey: ['/api/fulfillment/stats'],
    queryFn: async () => {
      // In a real app, this would come from the API
      return {
        pendingOrders: pendingOrdersQuery.data?.length || 0,
        autoFulfilled: 18,
        totalOrders: 42,
        averageFulfillmentTime: '1.3 days',
        successRate: 97.5,
      };
    },
    enabled: !!pendingOrdersQuery.data
  });

  // Mutation for manual fulfillment
  const fulfillOrderMutation = useMutation({
    mutationFn: (orderId: number) => {
      return apiRequest('POST', `/api/fulfillment/fulfill/${orderId}`, {});
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/fulfillment/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order Fulfilled",
        description: `Order #${orderId} has been sent to the supplier for fulfillment.`,
      });
    },
    onError: (error, orderId) => {
      console.error(`Error fulfilling order ${orderId}:`, error);
      toast({
        title: "Fulfillment Failed",
        description: "There was an error fulfilling the order. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for auto-fulfillment
  const autoFulfillMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/fulfillment/auto-fulfill', {});
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/fulfillment/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      const successCount = data?.successCount || 0;
      toast({
        title: "Auto-Fulfillment Complete",
        description: `Successfully fulfilled ${successCount} orders automatically.`,
      });
    },
    onError: (error) => {
      console.error('Error auto-fulfilling orders:', error);
      toast({
        title: "Auto-Fulfillment Failed",
        description: "There was an error fulfilling orders automatically. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for scheduling automatic fulfillment
  const scheduleFulfillmentMutation = useMutation({
    mutationFn: (intervalHours: number) => {
      return apiRequest('POST', '/api/fulfillment/schedule', {
        intervalHours
      });
    },
    onSuccess: () => {
      toast({
        title: "Automatic Fulfillment Enabled",
        description: "Orders will be automatically fulfilled when payment is received.",
      });
    },
    onError: (error) => {
      console.error('Error scheduling auto-fulfillment:', error);
      toast({
        title: "Scheduling Failed",
        description: "There was an error enabling automatic fulfillment. Please try again.",
        variant: "destructive",
      });
      setAutoFulfill(false);
    }
  });

  // Handle toggling automatic fulfillment
  const handleAutoFulfillToggle = (checked: boolean) => {
    setAutoFulfill(checked);
    if (checked) {
      scheduleFulfillmentMutation.mutate(1); // Check every hour
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Processing</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Paid</Badge>;
      case 'shipped':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  // Loading state
  if (pendingOrdersQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Automated Order Fulfillment
          </CardTitle>
          <CardDescription>
            Loading order data...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (pendingOrdersQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Automated Order Fulfillment
          </CardTitle>
          <CardDescription>
            Error loading order data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              There was an error loading the orders data. Please try again.
            </p>
            <Button 
              className="mt-4"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/fulfillment/pending'] });
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingOrders = pendingOrdersQuery.data || [];
  const stats = fulfillmentStatsQuery.data || {
    pendingOrders: pendingOrders.length,
    autoFulfilled: 0,
    totalOrders: 0,
    averageFulfillmentTime: 'N/A',
    successRate: 0,
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Automated Order Fulfillment
          </CardTitle>
          <CardDescription>
            Automatically fulfill orders with suppliers as soon as payments are received
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Fulfillment Stats */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  Fulfillment Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <dl className="space-y-2">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Pending Orders:</dt>
                    <dd className="font-medium">{stats.pendingOrders}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Auto-Fulfilled:</dt>
                    <dd className="font-medium">{stats.autoFulfilled}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Average Time:</dt>
                    <dd className="font-medium">{stats.averageFulfillmentTime}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Success Rate:</dt>
                    <dd className="font-medium">{stats.successRate}%</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Manual Fulfillment */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <PackageCheck className="h-4 w-4" />
                  Manual Fulfillment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Process all pending orders at once with our suppliers
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => autoFulfillMutation.mutate()}
                  disabled={autoFulfillMutation.isPending || pendingOrders.length === 0}
                >
                  {autoFulfillMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Truck className="h-4 w-4 mr-2" />
                  )}
                  {pendingOrders.length === 0 
                    ? 'No Orders to Fulfill' 
                    : `Fulfill ${pendingOrders.length} Orders`
                  }
                </Button>
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
                    id="auto-fulfill" 
                    checked={autoFulfill}
                    onCheckedChange={handleAutoFulfillToggle}
                    disabled={scheduleFulfillmentMutation.isPending}
                  />
                  <Label htmlFor="auto-fulfill">Enable Auto-Fulfillment</Label>
                  {scheduleFulfillmentMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  )}
                </div>
                
                <div className={`${!autoFulfill ? 'opacity-50' : ''} space-y-1 text-sm`}>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Check Frequency:</span>
                    <span className="font-medium">Hourly</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fulfillment Trigger:</span>
                    <span className="font-medium">Payment received</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Supplier Selection:</span>
                    <span className="font-medium">Auto-optimized</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border flex items-start mt-2 mb-6">
            <Sparkles className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">Automated Order Fulfillment</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our system automatically sends order details to suppliers for fulfillment as soon as payment 
                is received. The system selects the optimal supplier based on price, shipping time, and 
                reliability metrics, completely eliminating manual order processing.
              </p>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Automation Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No pending orders to fulfill
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${order.total}</TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={
                              order.paymentStatus === 'paid' ? 100 : 
                              order.paymentStatus === 'pending' ? 50 : 0
                            } 
                            max={100}
                            className="h-2 w-16"
                          />
                          <span className="text-xs text-muted-foreground">
                            {order.paymentStatus === 'paid' ? 'Ready for fulfillment' : 'Awaiting payment'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          disabled={fulfillOrderMutation.isPending || order.paymentStatus !== 'paid'}
                          onClick={() => fulfillOrderMutation.mutate(order.id)}
                        >
                          {fulfillOrderMutation.isPending && fulfillOrderMutation.variables === order.id ? (
                            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 mr-2" />
                          )}
                          Fulfill Now
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
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
              queryClient.invalidateQueries({ queryKey: ['/api/fulfillment/pending'] });
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Orders
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}