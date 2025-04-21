import { pgTable, text, serial, integer, boolean, timestamp, json, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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
  inventoryThreshold: integer("inventory_threshold").default(5),  // Alert when inventory falls below this
  inventoryTracking: boolean("inventory_tracking").default(true), // Enable/disable automatic tracking
  supplierProductId: text("supplier_product_id"),                 // External ID from supplier
  supplierId: integer("supplier_id"),                             // Reference to supplier
  trending: boolean("trending").default(false),
  rating: decimal("rating"),
  reviewCount: integer("review_count"),
  lastStockUpdate: timestamp("last_stock_update"),                // Last time stock was updated
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

export const inventoryHistory = pgTable("inventory_history", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  previousStock: integer("previous_stock"),
  newStock: integer("new_stock").notNull(),
  changeReason: text("change_reason"),  // e.g., "order", "manual adjustment", "supplier sync"
  orderId: integer("order_id"),         // If change was due to an order
  syncId: text("sync_id"),              // Batch ID for supplier sync operations
  userId: integer("user_id"),           // User who made the change (if manual)
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: json("metadata"),           // Any additional data
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
  inventoryThreshold: true,
  inventoryTracking: true,
  supplierProductId: true,
  supplierId: true,
  trending: true,
  rating: true,
  reviewCount: true,
  lastStockUpdate: true,
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

export const insertInventoryHistorySchema = createInsertSchema(inventoryHistory).pick({
  productId: true,
  previousStock: true,
  newStock: true,
  changeReason: true,
  orderId: true,
  syncId: true,
  userId: true,
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

export type InsertInventoryHistory = z.infer<typeof insertInventoryHistorySchema>;
export type InventoryHistory = typeof inventoryHistory.$inferSelect;

// Define relations between tables
export const productRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  inventoryHistory: many(inventoryHistory),
}));

export const supplierRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
}));

export const inventoryHistoryRelations = relations(inventoryHistory, ({ one }) => ({
  product: one(products, {
    fields: [inventoryHistory.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [inventoryHistory.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [inventoryHistory.userId],
    references: [users.id],
  }),
}));
