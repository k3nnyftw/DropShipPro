import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';

const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'Card number should be at least 16 digits'),
  cardHolder: z.string().min(2, 'Please enter the cardholder name'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Date should be in MM/YY format'),
  cvv: z.string().length(3, 'CVV should be 3 digits'),
});

interface CheckoutPaymentProps {
  amount: number;
  orderId?: number;
  onPaymentComplete: (success: boolean, paymentId?: string) => void;
}

export function CheckoutPayment({ amount, orderId, onPaymentComplete }: CheckoutPaymentProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
    },
  });

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsProcessing(true);
        
        // Convert dollar amount to cents for Stripe
        const amountInCents = Math.round(amount * 100);
        
        // Create a payment intent
        const response = await apiRequest('POST', '/api/payments/create-payment-intent', {
          amount: amountInCents, // Send to API in cents
          currency: 'usd',
          orderId: orderId,
        });
        
        // TypeScript fix: Cast response to the expected type
        const data = response as { clientSecret: string; paymentIntentId: string };
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No client secret returned');
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: 'Payment Setup Failed',
          description: 'Unable to set up the payment. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, orderId, toast]);

  const onSubmit = async (values: z.infer<typeof paymentSchema>) => {
    try {
      setIsProcessing(true);
      
      // In a real implementation, this is where you would use the Stripe.js
      // library to collect card details and confirm the payment intent
      // using the client secret.
      
      // For this demo, we'll simulate a payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a successful payment
      toast({
        title: 'Payment Successful',
        description: `Your payment of ${formatCurrency(amount)} has been processed successfully.`,
      });
      
      onPaymentComplete(true, 'pi_simulated_123456789');
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
      onPaymentComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Complete your purchase of {formatCurrency(amount)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1234 5678 9012 3456" 
                      {...field} 
                      maxLength={19}
                      onChange={(e) => {
                        // Format card number with spaces
                        const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                        const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
                        field.onChange(formattedValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cardHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="MM/YY" 
                        {...field} 
                        maxLength={5}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123" 
                        type="password" 
                        {...field} 
                        maxLength={3}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={isProcessing || !clientSecret}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatCurrency(amount)}`
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        <p>Your payment information is encrypted and secure.</p>
      </CardFooter>
    </Card>
  );
}