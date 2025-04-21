import { useState } from "react";
import { useElements, useStripe, PaymentElement } from "@stripe/react-stripe-js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionCheckoutProps {
  planName: string;
  planPrice: string;
}

export default function SubscriptionCheckout({ planName, planPrice }: SubscriptionCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription/success`,
        },
        redirect: "if_required"
      });

      if (error) {
        // Show error to your customer
        toast({
          title: "Payment Failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded
        setPaymentSuccess(true);
        toast({
          title: "Payment Successful!",
          description: "Your subscription is now active.",
        });
        
        // Redirect after a short delay to show success state
        setTimeout(() => {
          window.location.href = `${window.location.origin}/subscription/success`;
        }, 2000);
      } else {
        // For other status types like requires_action, we'll let Stripe handle the redirect
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast({
        title: "Payment Error",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Success state after payment is confirmed
  if (paymentSuccess) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle>Payment Successful!</CardTitle>
          <CardDescription>
            You have successfully subscribed to the {planName} plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You will be redirected to the confirmation page shortly...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Subscribe to {planName}</CardTitle>
        <CardDescription>
          {planPrice}/month - Unlock advanced features and automation tools
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <PaymentElement />
          
          <div className="text-sm text-muted-foreground">
            <p>Your subscription will start immediately. You can cancel anytime.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || !elements || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Subscribe for ${planPrice}/month`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}