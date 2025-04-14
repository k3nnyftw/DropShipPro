import React, { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Define subscription plan types
type PlanFeature = {
  name: string;
  enabled: boolean;
};

type SubscriptionPlan = {
  name: string;
  price?: number;
  maxStores: number;
  maxProducts: number;
  maxOrdersPerDay: number;
  maxApi: number;
  features: PlanFeature[];
};

type CurrentSubscription = {
  id?: number;
  plan: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  features: Record<string, boolean>;
  limits: {
    maxStores: number;
    maxProducts: number;
    maxOrdersPerDay: number;
    maxApi: number;
  };
};

type PlanSelectorProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function PlanSelector({ open: externalOpen, onOpenChange }: PlanSelectorProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();
  
  // Use external open state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  // Fetch available plans
  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription/plans'],
  });

  // Fetch current subscription
  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery<CurrentSubscription>({
    queryKey: ['/api/subscription/current'],
  });

  const startCheckout = async () => {
    if (!selectedPlan) return;

    setIsUpgrading(true);
    try {
      const response = await apiRequest('/api/subscription/create-checkout-session', 'POST', {
        plan: selectedPlan,
        successUrl: `${window.location.origin}/dashboard?subscription=success`,
        cancelUrl: `${window.location.origin}/dashboard?subscription=cancelled`,
      });

      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      toast({
        title: 'Error starting checkout',
        description: 'There was an error starting the checkout process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await apiRequest('/api/subscription/cancel', 'POST');
      
      toast({
        title: 'Subscription cancelled',
        description: 'Your subscription will be cancelled at the end of the current billing period.',
      });
    } catch (error) {
      toast({
        title: 'Error cancelling subscription',
        description: 'There was an error cancelling your subscription. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = plansLoading || subscriptionLoading;
  const currentPlan = currentSubscription?.plan || 'free';

  function formatFeatureName(name: string): string {
    // Convert camelCase to Title Case with spaces
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Zap className="mr-2 h-4 w-4" />
          Subscription Plans
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Choose Your Subscription Plan</DialogTitle>
          <DialogDescription>
            Select the plan that best fits your business needs. Upgrade anytime as your business grows.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans?.map((plan) => (
              <Card
                key={plan.name}
                className={`flex flex-col ${
                  currentPlan === plan.name.toLowerCase() ? 'border-primary' : ''
                } ${selectedPlan === plan.name.toLowerCase() ? 'ring-2 ring-primary' : ''}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{plan.name}</CardTitle>
                    {currentPlan === plan.name.toLowerCase() && (
                      <Badge variant="outline" className="bg-primary-50 text-primary-700">
                        Current
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {plan.price ? (
                      <>
                        <span className="text-2xl font-bold">${plan.price}</span> / month
                      </>
                    ) : (
                      <span className="text-2xl font-bold">Free</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>{plan.maxStores}</strong> store{plan.maxStores !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm">
                      <strong>{plan.maxProducts}</strong> product{plan.maxProducts !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm">
                      <strong>{plan.maxOrdersPerDay}</strong> orders/day
                    </p>
                    <p className="text-sm">
                      <strong>{plan.maxApi}</strong> API calls/day
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Features:</p>
                    <ul className="space-y-1">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className={`text-sm flex items-start ${!feature.enabled ? 'text-slate-400' : ''}`}>
                          {feature.enabled ? (
                            <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <span className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 flex items-center justify-center">-</span>
                          )}
                          <span>{formatFeatureName(feature.name)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  {currentPlan !== plan.name.toLowerCase() ? (
                    <Button
                      className="w-full"
                      onClick={() => setSelectedPlan(plan.name.toLowerCase())}
                      variant={selectedPlan === plan.name.toLowerCase() ? 'default' : 'outline'}
                    >
                      {plan.price ? 'Select' : 'Continue with Free'}
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {currentSubscription?.cancelAtPeriodEnd && (
          <div className="bg-yellow-50 p-4 rounded-lg mt-4">
            <p className="text-yellow-800 text-sm">
              Your subscription will be cancelled on{' '}
              {currentSubscription.currentPeriodEnd
                ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()
                : 'the end of the current billing period'}
              . You can resubscribe anytime.
            </p>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between flex-col sm:flex-row gap-4">
          <div>
            {currentSubscription?.id && !currentSubscription?.cancelAtPeriodEnd && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel Subscription
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            {selectedPlan && selectedPlan !== currentPlan && (
              <Button onClick={startCheckout} disabled={isUpgrading}>
                {isUpgrading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Upgrade Now'
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}