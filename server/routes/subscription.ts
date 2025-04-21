import { Request, Response, Router } from "express";
import { z } from "zod";
import Stripe from "stripe";
import { storage } from "../storage";
import { InsertSubscription, Subscription, SubscriptionPlan, SubscriptionStatus, hasFeatureAccess, planFeatureLimits } from "../../shared/subscription";

export const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

/**
 * GET /api/subscription/plans
 * Get all available subscription plans with their features and pricing
 */
router.get("/plans", async (req: Request, res: Response) => {
  const plans = Object.values(SubscriptionPlan).map(plan => ({
    name: plan,
    ...planFeatureLimits[plan],
    features: Object.entries(planFeatureLimits[plan].features).map(([feature, enabled]) => ({
      name: feature,
      enabled
    }))
  }));
  
  res.json(plans);
});

/**
 * GET /api/subscription/current
 * Get current user's subscription
 */
router.get("/current", async (req: Request, res: Response) => {
  // In a real application, we would get the user ID from the session
  // For demo purposes, we'll use a fixed user ID
  const userId = 1; // Demo user ID
  
  const subscription = await storage.getUserSubscription(userId);
  
  if (!subscription) {
    // If no subscription exists, return free plan details
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
  
  // Return subscription with feature access
  res.json({
    id: subscription.id,
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    features: planFeatureLimits[subscription.plan].features,
    limits: {
      maxStores: planFeatureLimits[subscription.plan].maxStores,
      maxProducts: planFeatureLimits[subscription.plan].maxProducts,
      maxOrdersPerDay: planFeatureLimits[subscription.plan].maxOrdersPerDay,
      maxApi: planFeatureLimits[subscription.plan].maxApi,
    }
  });
});

/**
 * POST /api/subscription/create-checkout-session
 * Creates a Stripe checkout session for subscription
 */
router.post("/create-checkout-session", async (req: Request, res: Response) => {
  const schema = z.object({
    plan: z.nativeEnum(SubscriptionPlan),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
  });
  
  try {
    const { plan, successUrl, cancelUrl } = schema.parse(req.body);
    
    // In a real application, we would get the user ID from the session
    // For demo purposes, we'll use a fixed user ID
    const userId = 1; // Demo user ID
    
    // Get plan price from our configuration
    const planConfig = planFeatureLimits[plan];
    const unitAmount = planConfig.price ? Math.round(planConfig.price * 100) : 0;
    
    if (!unitAmount) {
      return res.status(400).json({ message: `Plan ${plan} is not available for purchase` });
    }
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan === SubscriptionPlan.PRO 
            ? process.env.STRIPE_PRICE_ID  // Use the price ID for PRO plan
            : process.env.STRIPE_ENTERPRISE_PRICE_ID || process.env.STRIPE_PRICE_ID,  // Use enterprise price or fallback to PRO
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString(),
        plan,
      },
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request data", errors: error.errors });
    }
    console.error("Stripe checkout session error:", error);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
});

/**
 * POST /api/subscription/webhook
 * Stripe webhook for subscription events
 */
router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  // Verify webhook signature
  if (!endpointSecret) {
    return res.status(400).json({ message: "Webhook secret not configured" });
  }
  
  let event;
  
  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
    
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get user ID and plan from metadata
        const userId = parseInt(session.metadata?.userId || "0");
        const plan = session.metadata?.plan as SubscriptionPlan;
        
        if (!userId || !plan) {
          return res.status(400).json({ message: "Missing user ID or plan in metadata" });
        }
        
        // Get Stripe subscription details
        const stripeSubscriptionId = session.subscription as string;
        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        
        // Create subscription in our database
        const newSubscription: InsertSubscription = {
          userId,
          plan,
          status: SubscriptionStatus.ACTIVE,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId,
          priceId: stripeSubscription.items.data[0].price.id,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        };
        
        // Check if user already has a subscription
        const existingSubscription = await storage.getUserSubscription(userId);
        
        if (existingSubscription) {
          // Update existing subscription
          await storage.updateSubscription(existingSubscription.id, newSubscription);
        } else {
          // Create new subscription
          await storage.createSubscription(newSubscription);
        }
        
        // Update user's plan
        await storage.updateUserPlan(userId, plan);
        
        break;
      }
        
      case "invoice.payment_succeeded": {
        // Handle successful invoice payment (subscription renewal)
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Find subscription in our database by Stripe subscription ID
          const subscription = Array.from((storage as any).subscriptions.values())
            .find((sub: Subscription) => sub.stripeSubscriptionId === subscriptionId);
          
          if (subscription) {
            await storage.updateSubscription(subscription.id, {
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            });
          }
        }
        
        break;
      }
        
      case "invoice.payment_failed": {
        // Handle failed invoice payment
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          // Find subscription in our database by Stripe subscription ID
          const subscription = Array.from((storage as any).subscriptions.values())
            .find((sub: Subscription) => sub.stripeSubscriptionId === subscriptionId);
          
          if (subscription) {
            await storage.updateSubscription(subscription.id, {
              status: SubscriptionStatus.PAST_DUE,
            });
          }
        }
        
        break;
      }
        
      case "customer.subscription.deleted": {
        // Handle subscription cancellation
        const stripeSubscription = event.data.object as Stripe.Subscription;
        
        // Find subscription in our database by Stripe subscription ID
        const subscription = Array.from((storage as any).subscriptions.values())
          .find((sub: Subscription) => sub.stripeSubscriptionId === stripeSubscription.id);
        
        if (subscription) {
          await storage.updateSubscription(subscription.id, {
            status: SubscriptionStatus.CANCELED,
          });
          
          // Downgrade user to free plan
          await storage.updateUserPlan(subscription.userId, SubscriptionPlan.FREE);
        }
        
        break;
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ message: "Webhook error" });
  }
});

/**
 * POST /api/subscription/cancel
 * Cancel current subscription
 */
router.post("/cancel", async (req: Request, res: Response) => {
  // In a real application, we would get the user ID from the session
  // For demo purposes, we'll use a fixed user ID
  const userId = 1; // Demo user ID
  
  try {
    const subscription = await storage.getUserSubscription(userId);
    
    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }
    
    if (!subscription.stripeSubscriptionId) {
      return res.status(400).json({ message: "Subscription cannot be canceled" });
    }
    
    // Cancel at period end in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    
    // Update our database
    await storage.updateSubscription(subscription.id, {
      cancelAtPeriodEnd: true,
    });
    
    res.json({ message: "Subscription will be canceled at the end of the billing period" });
  } catch (error) {
    console.error("Subscription cancellation error:", error);
    res.status(500).json({ message: "Failed to cancel subscription" });
  }
});

/**
 * GET /api/subscription/feature-access/:feature
 * Check if a user has access to a specific feature
 */
router.get("/feature-access/:feature", async (req: Request, res: Response) => {
  // In a real application, we would get the user ID from the session
  // For demo purposes, we'll use a fixed user ID
  const userId = 1; // Demo user ID
  
  const { feature } = req.params;
  
  try {
    // DEVELOPMENT MODE: All features are accessible
    // In production, you would remove this and use the actual subscription check
    if (process.env.NODE_ENV !== "production") {
      const isDeveloperMode = true; // Set this to false to test subscription restrictions locally
      
      if (isDeveloperMode) {
        console.log(`[DEV MODE] Granting access to premium feature: ${feature}`);
        return res.json({
          feature,
          hasAccess: true, // Always grant access in development
          plan: "developer",
          upgradeTo: null
        });
      }
    }
    
    // Get user's plan
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const plan = user.plan as SubscriptionPlan || SubscriptionPlan.FREE;
    
    // Check if feature is valid
    if (!(feature in planFeatureLimits[SubscriptionPlan.FREE].features)) {
      return res.status(400).json({ message: "Invalid feature" });
    }
    
    // Check if user has access to this feature
    const hasAccess = hasFeatureAccess(plan, feature as keyof typeof planFeatureLimits[SubscriptionPlan.FREE]['features']);
    
    res.json({ 
      feature, 
      hasAccess, 
      plan,
      upgradeTo: !hasAccess 
        ? Object.values(SubscriptionPlan).find(p => 
            hasFeatureAccess(p, feature as keyof typeof planFeatureLimits[SubscriptionPlan.FREE]['features'])
          )
        : null
    });
  } catch (error) {
    console.error("Feature access check error:", error);
    res.status(500).json({ message: "Failed to check feature access" });
  }
});

export default router;