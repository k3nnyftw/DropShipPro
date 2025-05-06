import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

// Define subscription plans and their features
export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  TRIAL = 'trial'
}

// Define the database schema for subscriptions
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  plan: text('plan', { enum: [
    SubscriptionPlan.FREE, 
    SubscriptionPlan.PRO, 
    SubscriptionPlan.ENTERPRISE
  ] }).notNull().default(SubscriptionPlan.FREE),
  status: text('status', { enum: [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.PAST_DUE,
    SubscriptionStatus.CANCELED,
    SubscriptionStatus.TRIAL
  ] }).notNull().default(SubscriptionStatus.ACTIVE),
  priceId: text('price_id'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the subscription insert schema
export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  plan: true,
  status: true,
  priceId: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
  cancelAtPeriodEnd: true
});

// Define the types
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect & {
  // Extra fields that might come from Stripe
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end?: boolean;
};

// Define feature limits for each plan
export const planFeatureLimits = {
  [SubscriptionPlan.FREE]: {
    title: "Free",
    maxStores: 10, // TEMPORARY: Increased for testing
    maxProducts: 1000, // TEMPORARY: Increased for testing
    maxOrdersPerDay: 2000, // TEMPORARY: Increased for testing
    maxApi: 10000, // TEMPORARY: Increased API requests for testing
    price: 0,
    description: "Basic access to the platform with limited features. Includes manual product listing, basic store integration, and up to 10 active products.",
    features: {
      // Basic features available in free plan
      basicAnalytics: true,
      basicSupplierSearch: true,
      manualOrderFulfillment: true,
      basicProductDiscovery: true,
      
      // IMPORTANT: In development mode, these features are still accessible 
      // even though they're marked as false here (see feature-access route)
      
      // TEMPORARY: All features enabled for testing
      aiPoweredAnalytics: true,
      automatedPriceOptimization: true,
      automatedOrderFulfillment: true,
      demandForecasting: true,
      competitorTracking: true,
      aiProductDescriptions: true,
      emailMarketing: true,
      socialMediaAutomation: true,
      prioritySupport: true, // Also enabling priority support for testing
    }
  },
  [SubscriptionPlan.PRO]: {
    title: "Pro",
    maxStores: 5,
    maxProducts: 100,
    maxOrdersPerDay: 500,
    maxApi: 2000,
    price: 29.99,
    description: "Advanced dropshipping features including automated inventory management, competitor tracking, and AI-powered product descriptions. Includes up to 100 active products and priority customer support.",
    features: {
      // Free features
      basicAnalytics: true,
      basicSupplierSearch: true,
      manualOrderFulfillment: true,
      basicProductDiscovery: true,
      
      // Pro features
      aiPoweredAnalytics: true,
      automatedPriceOptimization: true,
      automatedOrderFulfillment: true,
      demandForecasting: false,
      competitorTracking: true,
      aiProductDescriptions: true,
      emailMarketing: true,
      socialMediaAutomation: true,
      prioritySupport: false,
    }
  },
  [SubscriptionPlan.ENTERPRISE]: {
    title: "Enterprise",
    maxStores: 10,
    maxProducts: 1000,
    maxOrdersPerDay: 2000,
    maxApi: 10000,
    price: 99.99,
    description: "Complete automation suite with unlimited products, real-time price optimization, advanced analytics, demand forecasting, and dedicated account manager. Perfect for high-volume sellers.",
    features: {
      // All features enabled
      basicAnalytics: true,
      basicSupplierSearch: true,
      manualOrderFulfillment: true,
      basicProductDiscovery: true,
      aiPoweredAnalytics: true,
      automatedPriceOptimization: true,
      automatedOrderFulfillment: true,
      demandForecasting: true,
      competitorTracking: true,
      aiProductDescriptions: true,
      emailMarketing: true,
      socialMediaAutomation: true,
      prioritySupport: true,
    }
  }
};

// Helper to check if a feature is available for a plan
export function hasFeatureAccess(plan: SubscriptionPlan, feature: keyof typeof planFeatureLimits[SubscriptionPlan.FREE]['features']): boolean {
  return planFeatureLimits[plan].features[feature] === true;
}

// Helper to get resource limits for a plan
export function getPlanLimits(plan: SubscriptionPlan) {
  return planFeatureLimits[plan];
}