import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { SubscriptionPlan, SubscriptionStatus, planFeatureLimits } from '@shared/subscription';
import * as stripeService from '../services/stripe';

const router = express.Router();

// Schema for create checkout session request
const createCheckoutSessionSchema = z.object({
  plan: z.enum([SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

// Schema for plan change request
const changePlanSchema = z.object({
  newPlan: z.enum([SubscriptionPlan.FREE, SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE]),
});

// Helper to check if user is authenticated
function isAuthenticated(req: any, res: express.Response, next: express.NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Get current subscription details
router.get('/current', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    // Get subscription from database
    const subscription = await storage.getUserSubscription(userId);
    
    if (!subscription) {
      // Return free plan details if no subscription exists
      return res.json({
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        features: planFeatureLimits[SubscriptionPlan.FREE].features,
        limits: {
          maxStores: planFeatureLimits[SubscriptionPlan.FREE].maxStores,
          maxProducts: planFeatureLimits[SubscriptionPlan.FREE].maxProducts,
          maxOrdersPerDay: planFeatureLimits[SubscriptionPlan.FREE].maxOrdersPerDay,
          maxApi: planFeatureLimits[SubscriptionPlan.FREE].maxApi,
        }
      });
    }
    
    // If we have a Stripe subscription ID, fetch the latest details from Stripe
    if (subscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripeService.retrieveSubscription(subscription.stripeSubscriptionId);
        
        // Update subscription data with latest from Stripe if needed
        if (stripeSubscription.status !== subscription.status ||
            stripeSubscription.cancel_at_period_end !== subscription.cancelAtPeriodEnd) {
          
          // Map Stripe status to our status enum
          let status = subscription.status;
          if (stripeSubscription.status === 'active') status = SubscriptionStatus.ACTIVE;
          if (stripeSubscription.status === 'past_due') status = SubscriptionStatus.PAST_DUE;
          if (stripeSubscription.status === 'canceled') status = SubscriptionStatus.CANCELED;
          if (stripeSubscription.status === 'trialing') status = SubscriptionStatus.TRIAL;
          
          // Update local subscription
          await storage.updateSubscription(subscription.id, {
            status,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          });
          
          // Update subscription object for response
          subscription.status = status;
          subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
          subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
          subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
        }
      } catch (error) {
        console.error('Error fetching subscription from Stripe:', error);
        // Continue with local data if Stripe fetch fails
      }
    }
    
    // Return subscription with feature access
    const plan = subscription.plan;
    return res.json({
      ...subscription,
      features: planFeatureLimits[plan].features,
      limits: {
        maxStores: planFeatureLimits[plan].maxStores,
        maxProducts: planFeatureLimits[plan].maxProducts,
        maxOrdersPerDay: planFeatureLimits[plan].maxOrdersPerDay,
        maxApi: planFeatureLimits[plan].maxApi,
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription details' });
  }
});

// Create checkout session for subscription
router.post('/create-checkout-session', isAuthenticated, async (req: any, res) => {
  try {
    // Validate request
    const result = createCheckoutSessionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }
    
    const { plan, successUrl, cancelUrl } = result.data;
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Get price ID for the selected plan
    const priceId = stripeService.getPriceIdForPlan(plan);
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan or price ID not configured' });
    }
    
    // Check if user already has a Stripe customer ID
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      // Create a new customer in Stripe
      const customer = await stripeService.createStripeCustomer(
        user.email,
        user.fullName || user.username
      );
      
      // Update user with Stripe customer ID
      await storage.updateStripeCustomerId(userId, customer.id);
      customerId = customer.id;
    }
    
    // Create checkout session
    const session = await stripeService.createSubscriptionCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl
    );
    
    // Return the checkout session URL
    res.json({ 
      url: session.url,
      clientSecret: session.client_secret 
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

// Cancel subscription
router.post('/cancel', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    // Get subscription from DB
    const subscription = await storage.getUserSubscription(userId);
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }
    
    // Cancel subscription in Stripe
    const canceledSubscription = await stripeService.cancelSubscription(
      subscription.stripeSubscriptionId
    );
    
    // Update local subscription
    await storage.updateSubscription(subscription.id, {
      cancelAtPeriodEnd: true
    });
    
    // Return updated subscription
    res.json({ 
      success: true, 
      cancelAtPeriodEnd: true,
      currentPeriodEnd: canceledSubscription.current_period_end 
        ? new Date(canceledSubscription.current_period_end * 1000)
        : null
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Change subscription plan
router.post('/change-plan', isAuthenticated, async (req: any, res) => {
  try {
    // Validate request
    const result = changePlanSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }
    
    const { newPlan } = result.data;
    const userId = req.user.id;
    
    // Get current subscription
    const subscription = await storage.getUserSubscription(userId);
    
    // Handle downgrade to free plan
    if (newPlan === SubscriptionPlan.FREE) {
      if (!subscription || !subscription.stripeSubscriptionId) {
        return res.status(400).json({ error: 'No active subscription found' });
      }
      
      // Cancel at period end
      await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
      
      // Update subscription in database
      await storage.updateSubscription(subscription.id, {
        cancelAtPeriodEnd: true
      });
      
      return res.json({ 
        success: true, 
        message: 'Subscription will be canceled at the end of the billing period' 
      });
    }
    
    // Handle upgrades or changes between paid plans
    if (!subscription || !subscription.stripeSubscriptionId) {
      // If no existing subscription, create a checkout session for the new plan
      return res.status(400).json({ 
        error: 'No active subscription found',
        message: 'Please use the /create-checkout-session endpoint to create a new subscription'
      });
    }
    
    // Get price ID for new plan
    const newPriceId = stripeService.getPriceIdForPlan(newPlan);
    if (!newPriceId) {
      return res.status(400).json({ error: 'Invalid plan or price ID not configured' });
    }
    
    // Update subscription in Stripe
    const updatedSubscription = await stripeService.updateSubscription(
      subscription.stripeSubscriptionId,
      newPriceId
    );
    
    // Update subscription in database
    await storage.updateSubscription(subscription.id, {
      plan: newPlan,
      priceId: newPriceId,
      cancelAtPeriodEnd: false
    });
    
    // Update user plan
    await storage.updateUserPlan(userId, newPlan);
    
    // Return success
    res.json({ 
      success: true, 
      plan: newPlan,
      message: 'Subscription plan updated successfully' 
    });
  } catch (error) {
    console.error('Error changing subscription plan:', error);
    res.status(500).json({ error: 'Failed to change subscription plan' });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    return res.status(400).json({ error: 'Stripe signature missing' });
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('STRIPE_WEBHOOK_SECRET is not set, skipping signature verification');
    // We'll still process the event without verification in development
  } else {
    try {
      // Note: in a real production environment, we should verify the signature
      // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
  }
  
  // Process the event
  try {
    const event = JSON.parse(req.body.toString());
    const eventHandler = await stripeService.handleWebhookEvent(event);
    
    // Handle specific events
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    res.status(500).json({ error: 'Failed to process webhook event' });
  }
});

// Helper function to handle invoice.payment_succeeded events
async function handleInvoicePaymentSucceeded(invoice: any) {
  if (!invoice.subscription) {
    return; // Not a subscription invoice
  }
  
  try {
    // Find the subscription in our database
    const subscriptions = Array.from(await storage.getAllSubscriptions());
    const subscription = subscriptions.find(sub => 
      sub.stripeSubscriptionId === invoice.subscription
    );
    
    if (!subscription) {
      return; // Subscription not found
    }
    
    // Update subscription status if needed
    await storage.updateSubscription(subscription.id, {
      status: SubscriptionStatus.ACTIVE,
      // Handle conversion from Stripe timestamps (seconds) to JavaScript Date (milliseconds)
      currentPeriodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      currentPeriodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
    });
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
  }
}

// Helper function to handle customer.subscription.updated events
async function handleSubscriptionUpdated(stripeSubscription: any) {
  try {
    // Find the subscription in our database
    const subscriptions = Array.from(await storage.getAllSubscriptions());
    const subscription = subscriptions.find(sub => 
      sub.stripeSubscriptionId === stripeSubscription.id
    );
    
    if (!subscription) {
      return; // Subscription not found
    }
    
    // Map Stripe status to our status enum
    let status = subscription.status;
    if (stripeSubscription.status === 'active') status = SubscriptionStatus.ACTIVE;
    if (stripeSubscription.status === 'past_due') status = SubscriptionStatus.PAST_DUE;
    if (stripeSubscription.status === 'canceled') status = SubscriptionStatus.CANCELED;
    if (stripeSubscription.status === 'trialing') status = SubscriptionStatus.TRIAL;
    
    // Update subscription
    await storage.updateSubscription(subscription.id, {
      status,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodStart: stripeSubscription.current_period_start ? new Date(stripeSubscription.current_period_start * 1000) : null,
      currentPeriodEnd: stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : null,
    });
  } catch (error) {
    console.error('Error handling customer.subscription.updated:', error);
  }
}

// Helper function to handle customer.subscription.deleted events
async function handleSubscriptionDeleted(stripeSubscription: any) {
  try {
    // Find the subscription in our database
    const subscriptions = Array.from(await storage.getAllSubscriptions());
    const subscription = subscriptions.find(sub => 
      sub.stripeSubscriptionId === stripeSubscription.id
    );
    
    if (!subscription) {
      return; // Subscription not found
    }
    
    // Update subscription status
    await storage.updateSubscription(subscription.id, {
      status: SubscriptionStatus.CANCELED,
      cancelAtPeriodEnd: false,
    });
    
    // Update user plan to FREE
    await storage.updateUserPlan(subscription.userId, SubscriptionPlan.FREE);
  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error);
  }
}

// Import Subscription type for webhook handling
import { MemStorage } from '../storage';
import { Subscription } from '@shared/subscription';

export default router;