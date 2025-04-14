import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { 
  createPaymentIntent, 
  createCheckoutSession, 
  retrievePaymentIntent, 
  retrieveCheckoutSession 
} from '../services/stripe';

const router = Router();

// Schema for create payment intent request
const createPaymentIntentSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().length(3).default('usd'),
  metadata: z.record(z.string()).optional().default({}),
  orderId: z.number().int().optional(),
});

// Schema for create checkout session request
const createCheckoutSessionSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    amount: z.number().int().positive(),
    currency: z.string().length(3).default('usd'),
    quantity: z.number().int().positive().default(1),
  })),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  metadata: z.record(z.string()).optional().default({}),
});

// Create a payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const validatedData = createPaymentIntentSchema.parse(req.body);
    const { amount, currency, metadata, orderId } = validatedData;
    
    // Add order information to metadata if orderId is provided
    const paymentMetadata = { ...metadata };
    if (orderId) {
      const order = await storage.getOrder(orderId);
      if (order) {
        paymentMetadata.orderId = orderId.toString();
        paymentMetadata.orderNumber = order.orderNumber;
        paymentMetadata.customerName = order.customerName;
      }
    }
    
    const paymentIntent = await createPaymentIntent(amount, currency, paymentMetadata);
    
    // Return client secret and other necessary info
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Retrieve a payment intent
router.get('/payment-intent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const paymentIntent = await retrievePaymentIntent(id);
    res.json(paymentIntent);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    res.status(500).json({ error: 'Failed to retrieve payment intent' });
  }
});

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const validatedData = createCheckoutSessionSchema.parse(req.body);
    const { items, successUrl, cancelUrl, metadata } = validatedData;
    
    // Transform items to Stripe line items format
    const lineItems = items.map(item => ({
      price_data: {
        currency: item.currency,
        product_data: {
          name: item.name,
          description: item.description,
          images: item.images,
        },
        unit_amount: item.amount,
      },
      quantity: item.quantity,
    }));
    
    const session = await createCheckoutSession(lineItems, successUrl, cancelUrl, metadata);
    
    res.json({
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Retrieve a checkout session
router.get('/checkout-session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await retrieveCheckoutSession(id);
    res.json(session);
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    res.status(500).json({ error: 'Failed to retrieve checkout session' });
  }
});

// Webhook to handle Stripe events
router.post('/webhook', async (req, res) => {
  // For production, you would need to configure your webhook endpoint secret
  // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  // const signature = req.headers['stripe-signature'];

  try {
    // const event = await constructWebhookEvent(
    //   req.body,
    //   signature,
    //   webhookSecret
    // );
    
    // Use raw body for Stripe webhook to verify signature
    // For simplicity, we'll just process the event directly here
    const event = req.body;

    // Handle the event based on its type
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful:', paymentIntent.id);
        
        // If there's an orderId in the metadata, update the order's payment status
        if (paymentIntent.metadata?.orderId) {
          const orderId = parseInt(paymentIntent.metadata.orderId);
          const order = await storage.getOrder(orderId);
          
          if (order) {
            // In a real implementation, you'd update the order status in your database
            console.log(`Order ${order.orderNumber} paid successfully`);
            
            // Create a payment record
            const paymentData = {
              orderId,
              amount: (paymentIntent.amount / 100).toString(), // Convert cents to dollars
              currency: paymentIntent.currency,
              status: 'succeeded',
              paymentMethod: 'card',
              stripePaymentId: paymentIntent.id,
              stripeCustomerId: paymentIntent.customer,
              metadata: {},
            };
            
            // TODO: Implement createPayment in storage
            // await storage.createPayment(paymentData);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        console.log('PaymentIntent failed:', failedPaymentIntent.id);
        break;

      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router;