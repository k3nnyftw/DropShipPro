import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-03-31.basil', // Use the latest API version available
});

/**
 * Creates a payment intent for a checkout
 * @param amount Amount in cents (e.g., 1000 for $10.00)
 * @param currency Currency code (default: 'usd')
 * @param metadata Optional metadata to associate with the payment
 * @returns Promise resolving to the created payment intent
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Retrieves a payment intent by ID
 * @param id Payment intent ID
 * @returns Promise resolving to the payment intent
 */
export async function retrievePaymentIntent(id: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}

/**
 * Creates a checkout session for a one-time payment
 * @param lineItems Products being purchased
 * @param successUrl URL to redirect to on successful payment
 * @param cancelUrl URL to redirect to if payment is canceled
 * @param metadata Optional metadata to associate with the session
 * @returns Promise resolving to the created checkout session
 */
export async function createCheckoutSession(
  lineItems: Array<{
    price_data: {
      currency: string;
      product_data: {
        name: string;
        images?: string[];
        description?: string;
      };
      unit_amount: number;
    };
    quantity: number;
  }>,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Retrieves a checkout session by ID
 * @param id Checkout session ID
 * @returns Promise resolving to the checkout session
 */
export async function retrieveCheckoutSession(id: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
}

/**
 * Validates and processes a webhook event from Stripe
 * @param body Raw request body (string)
 * @param signature Stripe signature header
 * @param endpointSecret Webhook endpoint secret
 * @returns Promise resolving to the verified event
 */
export async function constructWebhookEvent(
  body: string,
  signature: string,
  endpointSecret: string
) {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    return event;
  } catch (error) {
    console.error('Error constructing webhook event:', error);
    throw error;
  }
}

export default stripe;