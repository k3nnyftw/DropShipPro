import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { SubscriptionPlan } from "../../shared/subscription";
import SubscriptionCheckout from "@/components/subscription/subscription-checkout";

// Load Stripe outside of component to avoid recreating Stripe object on renders
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PricingHeader = () => (
  <div className="mx-auto max-w-3xl text-center mb-10">
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
      Choose the right plan for your business
    </h1>
    <p className="mt-6 text-lg text-muted-foreground">
      Select a plan that suits your needs. Upgrade or downgrade anytime.
    </p>
  </div>
);

// Features list for each plan
const planFeatures = {
  [SubscriptionPlan.FREE]: {
    title: "Free",
    price: "$0",
    description: "Essential tools for starting your dropshipping business",
    features: [
      { name: "5 product listings", included: true },
      { name: "Basic product analytics", included: true },
      { name: "Manual order management", included: true },
      { name: "Standard shipping rates", included: true },
      { name: "Email support", included: true },
      { name: "Automated price optimization", included: false },
      { name: "Competitor price tracking", included: false },
      { name: "AI product descriptions", included: false },
      { name: "Unlimited products", included: false },
      { name: "Priority support", included: false },
    ],
    color: "bg-primary/5",
    buttonText: "Current Plan",
    buttonVariant: "outline",
    disabled: true
  },
  [SubscriptionPlan.PRO]: {
    title: "Pro",
    price: "$29.99",
    description: "Advanced features for growing your business",
    features: [
      { name: "50 product listings", included: true },
      { name: "Advanced product analytics", included: true },
      { name: "Automated order management", included: true },
      { name: "Optimized shipping rates", included: true },
      { name: "Priority email support", included: true },
      { name: "Automated price optimization", included: true },
      { name: "Competitor price tracking", included: true },
      { name: "AI product descriptions", included: true },
      { name: "Unlimited products", included: false },
      { name: "24/7 phone support", included: false },
    ],
    color: "bg-primary/10",
    buttonText: "Subscribe to Pro",
    buttonVariant: "default",
    disabled: false
  },
  [SubscriptionPlan.ENTERPRISE]: {
    title: "Enterprise",
    price: "$99.99",
    description: "Complete automation suite for scaling your business",
    features: [
      { name: "Unlimited product listings", included: true },
      { name: "AI-powered product analytics", included: true },
      { name: "Fully automated order fulfillment", included: true },
      { name: "Real-time shipping optimization", included: true },
      { name: "24/7 priority support", included: true },
      { name: "Real-time price optimization", included: true },
      { name: "Advanced competitor tracking", included: true },
      { name: "AI product & marketing content", included: true },
      { name: "Unlimited supplier connections", included: true },
      { name: "Dedicated account manager", included: true },
    ],
    color: "bg-primary/20",
    buttonText: "Subscribe to Enterprise",
    buttonVariant: "default",
    disabled: false
  }
};

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan === SubscriptionPlan.FREE) {
      return;
    }

    try {
      setSelectedPlan(plan);

      const response = await apiRequest("POST", "/api/subscription/create-checkout-session", {
        plan,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription`,
      });

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else if (data.url) {
        // If Stripe returns a URL for checkout, redirect to it
        window.location.href = data.url;
      } else {
        toast({
          title: "Subscription Error",
          description: "Could not initialize subscription. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Error",
        description: "Failed to start subscription process. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setSelectedPlan(null);
    setClientSecret(null);
  };

  // If checkout is ready, show the Elements component
  if (clientSecret) {
    return (
      <div className="container py-10">
        <Button variant="outline" onClick={handleCancel} className="mb-6">
          Back to Plans
        </Button>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <SubscriptionCheckout 
            planName={selectedPlan ? planFeatures[selectedPlan].title : ''} 
            planPrice={selectedPlan ? planFeatures[selectedPlan].price : ''}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <PricingHeader />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Object.entries(planFeatures).map(([planKey, plan]) => (
          <Card key={planKey} className={`flex flex-col ${plan.color} border-2`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{plan.title}</CardTitle>
                  <CardDescription className="mt-1.5">{plan.description}</CardDescription>
                </div>
                {planKey === SubscriptionPlan.PRO && (
                  <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                )}
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    {feature.included ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0" />
                    )}
                    <span className={!feature.included ? "text-muted-foreground" : ""}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSubscribe(planKey as SubscriptionPlan)}
                className="w-full"
                variant={plan.buttonVariant as any}
                disabled={plan.disabled}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}