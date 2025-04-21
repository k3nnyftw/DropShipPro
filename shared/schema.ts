import { pgTable, text, serial, integer, boolean, timestamp, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import subscription types
import { SubscriptionPlan } from './subscription';

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  plan: text("plan", { 
    enum: [
      SubscriptionPlan.FREE, 
      SubscriptionPlan.PRO, 
      SubscriptionPlan.ENTERPRISE
    ] 
  }).default(SubscriptionPlan.FREE),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price").notNull(),
  costPrice: decimal("cost_price"),
  salePrice: decimal("sale_price"),
  category: text("category"),
  imageUrl: text("image_url"),
  inventory: integer("inventory"),
  trending: boolean("trending").default(false),
  rating: decimal("rating"),
  reviewCount: integer("review_count"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  imageUrl: text("image_url"),
  rating: decimal("rating"),
  reviewCount: integer("review_count"),
  price: decimal("price"),
  minOrder: integer("min_order"),
  shippingTime: text("shipping_time"),
  returnPolicy: text("return_policy"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  customerId: integer("customer_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  status: text("status").notNull(),
  paymentStatus: text("payment_status").notNull(),
  fulfillment: text("fulfillment"),
  total: decimal("total").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dateRange: text("date_range"),
  platform: text("platform").notNull(),
  status: text("status").notNull(),
  budget: decimal("budget").notNull(),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  roas: decimal("roas"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id"),
  amount: decimal("amount").notNull(),
  currency: text("currency").default("USD"),
  status: text("status").notNull(),
  paymentMethod: text("payment_method").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  stripeCustomerId: text("stripe_customer_id"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  plan: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  trialEndsAt: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  costPrice: true,
  salePrice: true,
  category: true,
  imageUrl: true,
  inventory: true,
  trending: true,
  rating: true,
  reviewCount: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  location: true,
  imageUrl: true,
  rating: true,
  reviewCount: true,
  price: true,
  minOrder: true,
  shippingTime: true,
  returnPolicy: true,
  website: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  orderNumber: true,
  customerId: true,
  customerName: true,
  customerEmail: true,
  status: true,
  paymentStatus: true,
  fulfillment: true,
  total: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  dateRange: true,
  platform: true,
  status: true,
  budget: true,
  clicks: true,
  conversions: true,
  roas: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  orderId: true,
  amount: true,
  currency: true,
  status: true,
  paymentMethod: true,
  stripePaymentId: true,
  stripeCustomerId: true,
  metadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
