import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

// Define subscription plans and their features
export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
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
    SubscriptionPlan.BASIC, 
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
export type Subscription = typeof subscriptions.$inferSelect;

// Define feature limits for each plan
export const planFeatureLimits = {
  [SubscriptionPlan.FREE]: {
    maxStores: 1,
    maxProducts: 10,
    maxOrdersPerDay: 10,
    maxApi: 50, // API requests per day
    features: {
      // Basic features
      basicAnalytics: true,
      basicSupplierSearch: true,
      manualOrderFulfillment: true,
      basicProductDiscovery: true,
      
      // IMPORTANT: In development mode, these features are still accessible 
      // even though they're marked as false here (see feature-access route)
      
      // Advanced features - available in premium plans
      aiPoweredAnalytics: true, // Making all features available in FREE plan
      automatedPriceOptimization: true,
      automatedOrderFulfillment: true,
      demandForecasting: true,
      competitorTracking: true,
      aiProductDescriptions: true,
      emailMarketing: true,
      socialMediaAutomation: true,
      prioritySupport: true,
    }
  },
  [SubscriptionPlan.BASIC]: {
    maxStores: 2,
    maxProducts: 50,
    maxOrdersPerDay: 100,
    maxApi: 500,
    price: 19.99,
    features: {
      // Free features
      basicAnalytics: true,
      basicSupplierSearch: true,
      manualOrderFulfillment: true,
      basicProductDiscovery: true,
      
      // Additional Basic features
      aiPoweredAnalytics: true,
      automatedPriceOptimization: true,
      automatedOrderFulfillment: false,
      demandForecasting: false,
      competitorTracking: true,
      aiProductDescriptions: true,
      emailMarketing: false,
      socialMediaAutomation: false,
      prioritySupport: false,
    }
  },
  [SubscriptionPlan.PRO]: {
    maxStores: 5,
    maxProducts: 250,
    maxOrdersPerDay: 500,
    maxApi: 2000,
    price: 49.99,
    features: {
      // Basic plan features
      basicAnalytics: true,
      basicSupplierSearch: true,
      manualOrderFulfillment: true,
      basicProductDiscovery: true,
      aiPoweredAnalytics: true,
      automatedPriceOptimization: true,
      competitorTracking: true,
      aiProductDescriptions: true,
      
      // Additional Pro features
      automatedOrderFulfillment: true,
      demandForecasting: true,
      emailMarketing: true,
      socialMediaAutomation: true,
      prioritySupport: false,
    }
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxStores: 10,
    maxProducts: 1000,
    maxOrdersPerDay: 2000,
    maxApi: 10000,
    price: 149.99,
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