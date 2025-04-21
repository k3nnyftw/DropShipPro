import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SubscriptionCheckoutProps {
  planName: string;
  planPrice: string;
}

export default function SubscriptionCheckout({ planName, planPrice }: SubscriptionCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Checkout Error",
        description: "Stripe hasn't loaded yet. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription/success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "Something went wrong with your payment.",
          variant: "destructive",
        });
      }
      // On successful payment, the user will be redirected to the return_url
    } catch (err: any) {
      toast({
        title: "Checkout Error",
        description: err?.message || "An unexpected error occurred during checkout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Subscribe to {planName} Plan</CardTitle>
          <CardDescription>Complete your subscription to unlock premium features</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="mb-4">
              <div className="text-sm font-medium text-muted-foreground mb-1">Subscription Details</div>
              <div className="flex justify-between items-center py-2 border-b">
                <div className="font-medium">{planName} Plan</div>
                <div>{planPrice}/month</div>
              </div>
            </div>
            <div className="space-y-4">
              <PaymentElement />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!stripe || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                </>
              ) : (
                "Subscribe Now"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}