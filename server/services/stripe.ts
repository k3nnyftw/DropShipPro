import Stripe from 'stripe';
import { SubscriptionPlan } from '@shared/subscription';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any, // TypeScript issue with stripe version
});

// Functions for general payments
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

export async function retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(id);
}

export async function createPaymentCheckoutSession(
  lineItems: any[],
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
}

export async function retrieveCheckoutSession(id: string): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(id);
}

// Helper function to get the correct price ID based on plan
export function getPriceIdForPlan(plan: SubscriptionPlan): string | null {
  switch (plan) {
    case SubscriptionPlan.PRO:
      return process.env.STRIPE_PRICE_ID || null;
    case SubscriptionPlan.ENTERPRISE:
      return process.env.STRIPE_ENTERPRISE_PRICE_ID || null;
    default:
      return null; // Free plan has no price ID
  }
}

// Create a customer in Stripe
export async function createStripeCustomer(email: string, name?: string): Promise<Stripe.Customer> {
  return stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      source: 'dropship-platform'
    }
  });
}

// Create a checkout session for subscription
export async function createSubscriptionCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

// Create a subscription directly (without checkout session)
export async function createSubscription(
  customerId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        price: priceId,
      },
    ],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
}

// Retrieve a subscription
export async function retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['customer', 'default_payment_method']
  });
}

// Cancel a subscription at period end
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
}

// Upgrade or downgrade a subscription
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  // Get the subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Get the item ID of the subscription
  const itemId = subscription.items.data[0].id;
  
  // Update the subscription
  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: itemId,
        price: newPriceId,
      },
    ],
    // Make the changes take effect immediately
    proration_behavior: 'create_prorations',
  });
}

// Handle Stripe webhook events
export async function handleWebhookEvent(event: Stripe.Event): Promise<any> {
  switch (event.type) {
    case 'invoice.payment_succeeded':
      // Handle successful payment
      const invoice = event.data.object as Stripe.Invoice;
      return { success: true, invoice };
      
    case 'customer.subscription.updated':
      // Handle subscription update
      const subscription = event.data.object as Stripe.Subscription;
      return { success: true, subscription };
      
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      const canceledSubscription = event.data.object as Stripe.Subscription;
      return { success: true, subscription: canceledSubscription };
      
    default:
      // Unhandled event type
      return { success: true, message: `Unhandled event type: ${event.type}` };
  }
}

export default stripe;