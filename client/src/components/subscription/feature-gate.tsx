import React from 'react';
import { useFeatureAccess } from '@/hooks/use-feature-access';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Zap, Lock } from 'lucide-react';
import { PlanSelector } from './plan-selector';

type FeatureGateProps = {
  /**
   * The name of the feature to check access for. Should match the names in planFeatureLimits.
   * For example: 'aiPoweredAnalytics', 'automatedOrderFulfillment', etc.
   */
  featureName: string;
  
  /**
   * The component to render if the user has access to the feature
   */
  children: React.ReactNode;
  
  /** 
   * An optional custom fallback component to render if the user doesn't have access.
   * If not provided, a default upgrade prompt will be shown.
   */
  fallback?: React.ReactNode;
  
  /**
   * The title to display in the upgrade dialog
   */
  featureTitle?: string;
  
  /**
   * The description to display in the upgrade dialog
   */
  featureDescription?: string;
};

/**
 * A component that gates access to premium features based on the user's subscription.
 * It will show the children if the user has access to the feature, otherwise it will
 * show a prompt to upgrade.
 */
export function FeatureGate({
  featureName,
  children,
  fallback,
  featureTitle,
  featureDescription
}: FeatureGateProps) {
  const {
    hasAccess,
    checkingAccess,
    requiredPlan,
    showUpgradeModal,
    openUpgradeModal,
    closeUpgradeModal
  } = useFeatureAccess(featureName);

  // If still checking access, show a loading indicator
  if (checkingAccess) {
    return (
      <div className="flex justify-center items-center p-6 bg-slate-50 rounded-lg border border-slate-200">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If the user has access, render the children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If a custom fallback was provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise, render the default upgrade prompt
  const title = featureTitle || 'Premium Feature';
  const description = featureDescription || 
    `This feature requires a${requiredPlan?.startsWith('e') ? 'n' : ''} ${requiredPlan || 'premium'} subscription. Upgrade your plan to access it.`;

  return (
    <>
      <Card className="border-dashed border-slate-300 bg-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5 text-slate-400" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[120px]">
          <div className="text-center">
            <Zap className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Unlock this feature by upgrading your plan</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="default" 
            className="w-full" 
            onClick={openUpgradeModal}
          >
            <Zap className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showUpgradeModal} onOpenChange={closeUpgradeModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-500">
              To access {title.toLowerCase()}, you need to upgrade to a{requiredPlan?.startsWith('e') ? 'n' : ''} {requiredPlan || 'premium'} plan.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeUpgradeModal}>
              Cancel
            </Button>
            <PlanSelector />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}