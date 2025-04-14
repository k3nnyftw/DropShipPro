import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

type FeatureAccessResponse = {
  feature: string;
  hasAccess: boolean;
  plan: string;
  upgradeTo: string | null;
};

/**
 * Hook to check if the current user has access to a specific feature
 * @param featureName The name of the feature to check access for
 * @returns An object with the feature's access status and helper functions
 */
export function useFeatureAccess(featureName: string) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { 
    data, 
    isLoading, 
    isError,
    error 
  } = useQuery<FeatureAccessResponse>({
    queryKey: ['/api/subscription/feature-access', featureName],
    queryFn: () => fetch(`/api/subscription/feature-access/${featureName}`).then(res => res.json()),
    // Don't refetch on window focus to minimize API calls
    refetchOnWindowFocus: false
  });

  // Check if the user has access to the feature
  const hasAccess = data?.hasAccess ?? false;
  
  // Which plan they need to upgrade to for access
  const requiredPlan = data?.upgradeTo;

  // Whether the check is still loading
  const checkingAccess = isLoading;

  // Error message if the access check failed
  const accessError = isError ? (error as Error).message : null;

  return {
    hasAccess,
    checkingAccess,
    requiredPlan,
    accessError,
    showUpgradeModal,
    openUpgradeModal: () => setShowUpgradeModal(true),
    closeUpgradeModal: () => setShowUpgradeModal(false)
  };
}