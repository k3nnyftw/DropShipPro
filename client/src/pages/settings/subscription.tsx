import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Define subscription enums
enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  TRIAL = 'trial'
}
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface SubscriptionData {
  id?: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date | string | null;
  cancelAtPeriodEnd?: boolean;
  features: Record<string, boolean>;
  limits: {
    maxStores: number;
    maxProducts: number;
    maxOrdersPerDay: number;
    maxApi: number;
  };
}

const planInfo = {
  [SubscriptionPlan.FREE]: {
    title: "Free Plan",
    description: "Basic features for starting your dropshipping business",
    price: "$0/month",
    color: "bg-secondary text-secondary-foreground"
  },
  [SubscriptionPlan.PRO]: {
    title: "Pro Plan",
    description: "Advanced features for growing your business",
    price: "$29.99/month",
    color: "bg-primary text-primary-foreground"
  },
  [SubscriptionPlan.ENTERPRISE]: {
    title: "Enterprise Plan",
    description: "Complete automation suite for scaling your business",
    price: "$99.99/month",
    color: "bg-primary text-primary-foreground"
  }
};

const statusColors = {
  [SubscriptionStatus.ACTIVE]: "bg-green-100 text-green-800 border-green-200",
  [SubscriptionStatus.PAST_DUE]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [SubscriptionStatus.CANCELED]: "bg-red-100 text-red-800 border-red-200",
  [SubscriptionStatus.TRIAL]: "bg-blue-100 text-blue-800 border-blue-200"
};

export default function SubscriptionManagementPage() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current subscription
  const { data: subscription, isLoading, error } = useQuery<SubscriptionData>({
    queryKey: ['/api/subscription/current'],
    retry: 1
  });

  // Mutation for cancelling subscription
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscription/cancel');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will end at the end of the current billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/current'] });
      setCancelDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      });
      setCancelDialogOpen(false);
    }
  });

  const handleCancelSubscription = async () => {
    cancelMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading subscription details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex gap-2 items-center text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Error Loading Subscription</CardTitle>
            </div>
            <CardDescription>
              We couldn't load your subscription details. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/subscription/current'] })}
              variant="outline"
            >
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const plan = subscription?.plan || SubscriptionPlan.FREE;
  const planData = planInfo[plan];
  const isFree = plan === SubscriptionPlan.FREE;
  const isPaidPlan = !isFree;
  const isCancelled = subscription?.cancelAtPeriodEnd;
  
  // Format end date if available
  const endDate = subscription?.currentPeriodEnd 
    ? new Date(subscription.currentPeriodEnd)
    : null;
  const formattedEndDate = endDate 
    ? format(endDate, 'MMMM d, yyyy') 
    : 'N/A';

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Your current subscription details and usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{planData.title}</h3>
                  <p className="text-muted-foreground text-sm">{planData.description}</p>
                </div>
                <Badge className={`${planData.color}`}>
                  {planData.price}
                </Badge>
              </div>

              {isPaidPlan && (
                <div className="flex flex-col gap-4 border p-4 rounded-md bg-muted/50">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="outline" className={`${statusColors[subscription?.status || SubscriptionStatus.ACTIVE]}`}>
                      {isCancelled 
                        ? "Cancelling" 
                        : subscription?.status || SubscriptionStatus.ACTIVE}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Billing Period Ends</span>
                    <span className="text-sm">{formattedEndDate}</span>
                  </div>

                  {isCancelled && (
                    <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm">
                      Your subscription will end on {formattedEndDate}. After this date,
                      you'll be downgraded to the Free plan.
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-3">Plan Features</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {subscription && Object.entries(subscription.features).map(([feature, enabled]) => (
                    <li key={feature} className={`flex items-center gap-2 ${!enabled ? 'text-muted-foreground' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>{feature.split(/(?=[A-Z])/).join(' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Usage Limits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscription?.limits && (
                    <>
                      <div className="border p-3 rounded-md">
                        <div className="text-sm text-muted-foreground">Products</div>
                        <div className="text-lg font-medium">{subscription.limits.maxProducts}</div>
                      </div>
                      <div className="border p-3 rounded-md">
                        <div className="text-sm text-muted-foreground">Stores</div>
                        <div className="text-lg font-medium">{subscription.limits.maxStores}</div>
                      </div>
                      <div className="border p-3 rounded-md">
                        <div className="text-sm text-muted-foreground">Daily Orders</div>
                        <div className="text-lg font-medium">{subscription.limits.maxOrdersPerDay}</div>
                      </div>
                      <div className="border p-3 rounded-md">
                        <div className="text-sm text-muted-foreground">API Calls</div>
                        <div className="text-lg font-medium">{subscription.limits.maxApi}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              {isFree ? (
                <Link href="/subscription">
                  <Button>Upgrade Plan</Button>
                </Link>
              ) : (
                <>
                  <Link href="/subscription">
                    <Button variant="outline">Change Plan</Button>
                  </Link>
                  
                  {!isCancelled && (
                    <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Cancel Subscription</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Your subscription will continue until the end of the current billing period
                            on {formattedEndDate}, after which you'll be downgraded to the Free plan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleCancelSubscription}
                            disabled={cancelMutation.isPending}
                          >
                            {cancelMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              "Yes, Cancel Subscription"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              )}
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Recent payments and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {isFree ? (
                <div className="text-center py-6 text-muted-foreground">
                  No billing history available on the Free plan
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Your billing history will appear here once you've been charged
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled={isFree}>
                Download Invoices
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}