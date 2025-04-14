import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  TruckIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  BarChart4,
  Settings,
  Sparkles,
  ExternalLink,
  CalendarClock
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';

export function AutoFulfillment() {
  const [autoFulfill, setAutoFulfill] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all orders
  const ordersQuery = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    }
  });

  // Mutation for auto-fulfilling pending orders
  const autoFulfillMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/fulfillment/auto-fulfill', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Orders Auto-Fulfilled",
        description: "Pending orders have been automatically sent to suppliers for fulfillment.",
      });
    },
    onError: (error) => {
      console.error('Error auto-fulfilling orders:', error);
      toast({
        title: "Auto-Fulfillment Failed",
        description: "There was an error processing the automatic order fulfillment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for scheduling automatic fulfillment
  const scheduleAutoFulfillMutation = useMutation({
    mutationFn: (intervalMinutes: number) => {
      return apiRequest('POST', '/api/fulfillment/schedule', {
        intervalMinutes
      });
    },
    onSuccess: () => {
      toast({
        title: "Automatic Fulfillment Enabled",
        description: "New orders will be automatically fulfilled as they come in.",
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

  // Manually trigger auto-fulfillment for pending orders
  const handleAutoFulfill = () => {
    autoFulfillMutation.mutate();
  };

  // Toggle automatic fulfillment
  const handleAutoFulfillToggle = (checked: boolean) => {
    setAutoFulfill(checked);
    if (checked) {
      scheduleAutoFulfillMutation.mutate(15); // Schedule every 15 minutes
    }
  };

  // Filter orders by fulfillment status
  const getFilteredOrders = (status: string) => {
    if (!ordersQuery.data) return [];
    
    return ordersQuery.data.filter((order: any) => {
      if (status === 'pending') {
        return order.status === 'confirmed' && 
               order.paymentStatus === 'paid' && 
               (!order.fulfillment || order.fulfillment === 'pending');
      } else if (status === 'processing') {
        return order.fulfillment === 'processing';
      } else if (status === 'shipped') {
        return order.fulfillment === 'shipped';
      } else if (status === 'delivered') {
        return order.fulfillment === 'delivered';
      }
      return false;
    });
  };

  // Generate tracking information cards
  const renderTrackingInfo = (order: any) => {
    // Track the order from the API
    const [trackingInfo, setTrackingInfo] = useState<any>(null);
    const [trackingError, setTrackingError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const fetchTracking = async () => {
      setLoading(true);
      setTrackingError(null);
      
      try {
        const response = await fetch(`/api/fulfillment/track/${order.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tracking information');
        }
        
        const data = await response.json();
        setTrackingInfo(data);
      } catch (error) {
        setTrackingError('Could not retrieve tracking information');
        console.error('Error fetching tracking:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!trackingInfo && !loading && !trackingError) {
      return (
        <div className="flex justify-center mt-2">
          <Button variant="outline" size="sm" onClick={fetchTracking}>
            <Package className="h-4 w-4 mr-2" />
            Track Order
          </Button>
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="flex justify-center mt-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      );
    }
    
    if (trackingError) {
      return (
        <div className="text-center mt-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 inline-block mr-1 text-yellow-500" />
          {trackingError}
        </div>
      );
    }
    
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge 
            variant={
              trackingInfo.status === 'delivered' 
                ? 'success' 
                : trackingInfo.status === 'shipped' 
                ? 'default' 
                : 'outline'
            }
          >
            {trackingInfo.status.charAt(0).toUpperCase() + trackingInfo.status.slice(1)}
          </Badge>
        </div>
        
        {trackingInfo.supplierUpdates && trackingInfo.supplierUpdates.length > 0 && (
          <div className="space-y-2">
            {trackingInfo.supplierUpdates.map((update: any, index: number) => (
              <div key={index} className="border rounded-md p-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{update.supplierName}</span>
                  <Badge variant="outline" className="text-xs">
                    {update.status}
                  </Badge>
                </div>
                {update.trackingNumber && (
                  <div className="mt-1 flex justify-between">
                    <span className="text-muted-foreground">Tracking:</span>
                    <span className="font-mono">{update.trackingNumber}</span>
                  </div>
                )}
                {update.estimatedDelivery && (
                  <div className="mt-1 flex justify-between">
                    <span className="text-muted-foreground">Est. Delivery:</span>
                    <span>{formatDate(update.estimatedDelivery)}</span>
                  </div>
                )}
                {update.trackingUrl && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-1 h-auto p-0 text-xs"
                    onClick={() => window.open(update.trackingUrl, '_blank')}
                  >
                    Track Package <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Generate status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Delivered</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  // Get list of orders by status
  const pendingOrders = getFilteredOrders('pending');
  const processingOrders = getFilteredOrders('processing');
  const shippedOrders = getFilteredOrders('shipped');
  const deliveredOrders = getFilteredOrders('delivered');

  // Loading state
  if (ordersQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Automated Order Fulfillment
          </CardTitle>
          <CardDescription>
            Loading order fulfillment data...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (ordersQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Automated Order Fulfillment
          </CardTitle>
          <CardDescription>
            Error loading order data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              There was an error loading order data. Please try again.
            </p>
            <Button 
              className="mt-4"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/orders'] })}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Automated Order Fulfillment
          </CardTitle>
          <CardDescription>
            Automate the fulfillment process by sending orders directly to suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Fulfillment Stats */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <BarChart4 className="h-4 w-4" />
                  Order Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <dl className="space-y-2">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Pending Fulfillment:</dt>
                    <dd className="font-medium">{pendingOrders.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Processing:</dt>
                    <dd className="font-medium">{processingOrders.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Shipped:</dt>
                    <dd className="font-medium">{shippedOrders.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Delivered:</dt>
                    <dd className="font-medium">{deliveredOrders.length}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Manual Fulfillment Controls */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <Package className="h-4 w-4" />
                  Manual Fulfillment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Trigger automated fulfillment for all pending orders manually
                </p>
                <Button 
                  className="w-full" 
                  onClick={handleAutoFulfill}
                  disabled={autoFulfillMutation.isPending || pendingOrders.length === 0}
                >
                  {autoFulfillMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  {pendingOrders.length === 0 
                    ? 'No Pending Orders' 
                    : `Fulfill ${pendingOrders.length} Orders`
                  }
                </Button>
              </CardContent>
            </Card>

            {/* Automatic Fulfillment Settings */}
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <Settings className="h-4 w-4" />
                  Auto-Fulfillment Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Switch 
                    id="auto-fulfill" 
                    checked={autoFulfill}
                    onCheckedChange={handleAutoFulfillToggle}
                    disabled={scheduleAutoFulfillMutation.isPending}
                  />
                  <Label htmlFor="auto-fulfill">Enable Auto-Fulfillment</Label>
                  {scheduleAutoFulfillMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  )}
                </div>
                <div className={`${!autoFulfill ? 'opacity-50' : ''} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Check Frequency:</span>
                    <span className="text-sm font-medium">Every 15 minutes</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span>
                      Orders will be automatically fulfilled once payment is confirmed
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border flex items-start mt-2">
            <Sparkles className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">Automated Fulfillment Process</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI-powered system automatically sends orders to the optimal suppliers, tracks fulfillment progress,
                and notifies customers at every step. All supplier communications, inventory checks, and tracking updates
                are handled without requiring any manual intervention.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Lists */}
      <Card>
        <CardHeader>
          <CardTitle>Order Fulfillment Status</CardTitle>
          <CardDescription>
            Monitor and manage all your orders in various fulfillment stages
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="pending" className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Pending</span>
                  <Badge variant="secondary" className="ml-auto">{pendingOrders.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="processing" className="flex items-center gap-1.5">
                  <Package className="h-4 w-4" />
                  <span>Processing</span>
                  <Badge variant="secondary" className="ml-auto">{processingOrders.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="shipped" className="flex items-center gap-1.5">
                  <TruckIcon className="h-4 w-4" />
                  <span>Shipped</span>
                  <Badge variant="secondary" className="ml-auto">{shippedOrders.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="delivered" className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Delivered</span>
                  <Badge variant="secondary" className="ml-auto">{deliveredOrders.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-4">
              <TabsContent value="pending">
                {renderOrderList(pendingOrders, 'pending')}
              </TabsContent>
              
              <TabsContent value="processing">
                {renderOrderList(processingOrders, 'processing')}
              </TabsContent>
              
              <TabsContent value="shipped">
                {renderOrderList(shippedOrders, 'shipped')}
              </TabsContent>
              
              <TabsContent value="delivered">
                {renderOrderList(deliveredOrders, 'delivered')}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  // Helper function to render order lists
  function renderOrderList(orders: any[], status: string) {
    if (orders.length === 0) {
      return (
        <div className="py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">No orders in {status} status</p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {orders.map((order) => (
          <div key={order.id} className="p-4">
            <div className="flex flex-col sm:flex-row justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Order #{order.orderNumber}</h3>
                  {getStatusBadge(order.fulfillment || 'pending')}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(order.createdAt)} • {order.customerName}
                </p>
              </div>
              <div className="mt-2 sm:mt-0 text-right">
                <p className="font-medium">{order.total}</p>
                <p className="text-sm text-muted-foreground">
                  Payment: <span className="capitalize">{order.paymentStatus}</span>
                </p>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            {(status === 'processing' || status === 'shipped' || status === 'delivered') && 
              renderTrackingInfo(order)
            }
            
            {status === 'pending' && (
              <div className="flex justify-end mt-2">
                <Button 
                  size="sm"
                  onClick={() => {
                    // Manually fulfill this specific order
                    fetch(`/api/fulfillment/fulfill/${order.id}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ fulfillmentMode: 'automatic' })
                    })
                    .then(response => {
                      if (!response.ok) throw new Error('Fulfillment failed');
                      return response.json();
                    })
                    .then(() => {
                      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
                      toast({
                        title: "Order Fulfilled",
                        description: `Order #${order.orderNumber} has been sent to suppliers.`,
                      });
                    })
                    .catch(error => {
                      console.error('Error fulfilling order:', error);
                      toast({
                        title: "Fulfillment Failed",
                        description: "There was an error processing the order. Please try again.",
                        variant: "destructive",
                      });
                    });
                  }}
                >
                  <TruckIcon className="h-4 w-4 mr-2" />
                  Fulfill Order
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
}