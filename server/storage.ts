import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  suppliers, type Supplier, type InsertSupplier,
  orders, type Order, type InsertOrder,
  campaigns, type Campaign, type InsertCampaign,
  payments, type Payment, type InsertPayment,
  inventoryHistory, type InventoryHistory, type InsertInventoryHistory
} from "@shared/schema";
import { generateOrderNumber } from "@/lib/utils";

// modify the interface with any CRUD methods
// you might need
import { Subscription, InsertSubscription, SubscriptionPlan, SubscriptionStatus } from '../shared/subscription';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPlan(userId: number, plan: SubscriptionPlan): Promise<User | undefined>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: number, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User | undefined>;
  
  // Subscription methods
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription | undefined>;
  getAllSubscriptions(): Promise<Subscription[]>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getTopProducts(): Promise<any[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getTrendingProducts(): Promise<any[]>;
  getProductCount(): Promise<number>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Supplier methods
  getSupplier(id: number): Promise<Supplier | undefined>;
  getAllSuppliers(): Promise<Supplier[]>;
  getSuppliersByProduct(productName: string): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getRecentOrders(): Promise<Order[]>;
  getOrderActivities(): Promise<any[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  // Campaign methods
  getCampaign(id: number): Promise<Campaign | undefined>;
  getAllCampaigns(): Promise<Campaign[]>;
  getActiveCampaigns(): Promise<any[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  
  // Payment methods
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByOrderId(orderId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Inventory tracking methods
  getInventoryHistoryByProductId(productId: number, limit?: number): Promise<InventoryHistory[]>;
  createInventoryHistory(history: InsertInventoryHistory): Promise<InventoryHistory>;
  updateProductInventory(productId: number, newStock: number, updateTimestamp: Date): Promise<Product | undefined>;
  updateProductInventoryTracking(productId: number, enabled: boolean): Promise<Product | undefined>;
  updateProductInventoryThreshold(productId: number, threshold: number): Promise<Product | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private suppliers: Map<number, Supplier>;
  private orders: Map<number, Order>;
  private campaigns: Map<number, Campaign>;
  private payments: Map<number, Payment>;
  private subscriptions: Map<number, Subscription>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.suppliers = new Map();
    this.orders = new Map();
    this.campaigns = new Map();
    this.payments = new Map();
    this.subscriptions = new Map();
    this.currentId = 1;
    this.initDemoData();
  }
  
  // Get all subscriptions
  async getAllSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
  }

  private initDemoData() {
    // Add sample products
    const sampleProducts: InsertProduct[] = [
      {
        name: "Wireless Earbuds",
        description: "Bluetooth 5.0 with Noise Cancellation",
        price: "49.99",
        costPrice: "18.50",
        salePrice: "69.99",
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
        inventory: 42,
        trending: true,
        rating: "4.5",
        reviewCount: 42
      },
      {
        name: "Adjustable Laptop Stand",
        description: "Ergonomic Design, Aluminum",
        price: "35.50",
        costPrice: "12.25",
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45",
        inventory: 28,
        trending: false,
        rating: "4.0",
        reviewCount: 28
      },
      {
        name: "Fitness Smart Watch",
        description: "Heart Rate & Sleep Monitor",
        price: "59.99",
        costPrice: "22.00",
        salePrice: "74.99",
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf",
        inventory: 56,
        trending: true,
        rating: "5.0",
        reviewCount: 56
      },
      {
        name: "Portable Power Bank",
        description: "10000mAh, Fast Charging",
        price: "29.99",
        costPrice: "10.50",
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
        inventory: 37,
        trending: false,
        rating: "3.5",
        reviewCount: 37
      }
    ];

    sampleProducts.forEach(product => this.createProduct(product));
    
    // Add sample suppliers
    const sampleSuppliers: InsertSupplier[] = [
      {
        name: "ShenTech Electronics",
        location: "Guangzhou, China",
        imageUrl: "/placeholder-supplier-1.png",
        rating: "4.7",
        reviewCount: 243,
        price: "18.50",
        minOrder: 10,
        shippingTime: "10-15 days",
        returnPolicy: "30-day",
        website: "https://www.shentech-electronics.com"
      },
      {
        name: "TechPro Solutions",
        location: "Shenzhen, China",
        imageUrl: "/placeholder-supplier-2.png",
        rating: "4.1",
        reviewCount: 186,
        price: "17.25",
        minOrder: 5,
        shippingTime: "12-18 days",
        returnPolicy: "15-day",
        website: "https://www.techpro-solutions.cn"
      },
      {
        name: "GlobalAudio Inc.",
        location: "Hong Kong",
        imageUrl: "/placeholder-supplier-3.png",
        rating: "4.9",
        reviewCount: 312,
        price: "22.00",
        minOrder: 20,
        shippingTime: "7-10 days",
        returnPolicy: "60-day",
        website: "https://www.globalaudio-inc.com"
      }
    ];

    sampleSuppliers.forEach(supplier => this.createSupplier(supplier));

    // Add sample orders
    const sampleOrders: InsertOrder[] = [
      {
        orderNumber: "#ORD-7652",
        customerName: "Jane Cooper",
        customerEmail: "jane@example.com",
        status: "Shipped",
        paymentStatus: "Paid",
        fulfillment: "Yanwen Express",
        total: "125.99"
      },
      {
        orderNumber: "#ORD-7651",
        customerName: "Cody Fisher",
        customerEmail: "cody@example.com",
        status: "Processing",
        paymentStatus: "Paid",
        fulfillment: "Not fulfilled",
        total: "78.50"
      },
      {
        orderNumber: "#ORD-7650",
        customerName: "Esther Howard",
        customerEmail: "esther@example.com",
        status: "Delivered",
        paymentStatus: "Paid",
        fulfillment: "ePacket",
        total: "96.35"
      },
      {
        orderNumber: "#ORD-7649",
        customerName: "Cameron Williamson",
        customerEmail: "cameron@example.com",
        status: "Refunded",
        paymentStatus: "Refunded",
        fulfillment: "Cancelled",
        total: "137.91"
      }
    ];

    sampleOrders.forEach(order => this.createOrder(order));

    // Add sample campaigns
    const sampleCampaigns: InsertCampaign[] = [
      {
        name: "Summer Sale - Electronics",
        dateRange: "Jun 1 - Jun 30",
        platform: "Facebook",
        status: "Active",
        budget: "200.00",
        clicks: 728,
        conversions: 52,
        roas: "3.2"
      },
      {
        name: "New Product Launch - Earbuds",
        dateRange: "Jun 10 - Jul 10",
        platform: "Google Ads",
        status: "Active",
        budget: "150.00",
        clicks: 412,
        conversions: 27,
        roas: "2.8"
      },
      {
        name: "Retargeting - Cart Abandoners",
        dateRange: "Ongoing",
        platform: "Instagram",
        status: "Paused",
        budget: "75.00",
        clicks: 103,
        conversions: 8,
        roas: "1.7"
      }
    ];

    sampleCampaigns.forEach(campaign => this.createCampaign(campaign));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      plan: insertUser.plan || SubscriptionPlan.FREE,
      fullName: insertUser.fullName || null,
      stripeCustomerId: insertUser.stripeCustomerId || null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
      trialEndsAt: insertUser.trialEndsAt || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPlan(userId: number, plan: SubscriptionPlan): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, plan };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, stripeCustomerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeInfo(userId: number, data: { 
    stripeCustomerId: string, 
    stripeSubscriptionId: string 
  }): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Subscription methods
  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (subscription) => subscription.userId === userId,
    );
  }
  
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      createdAt,
      updatedAt,
      // Set defaults for optional fields
      status: insertSubscription.status || SubscriptionStatus.ACTIVE,
      plan: insertSubscription.plan || SubscriptionPlan.FREE,
      priceId: insertSubscription.priceId || null,
      stripeCustomerId: insertSubscription.stripeCustomerId || null,
      stripeSubscriptionId: insertSubscription.stripeSubscriptionId || null,
      currentPeriodStart: insertSubscription.currentPeriodStart || new Date(),
      currentPeriodEnd: insertSubscription.currentPeriodEnd || null,
      cancelAtPeriodEnd: insertSubscription.cancelAtPeriodEnd || false,
    };
    
    this.subscriptions.set(id, subscription);
    
    // Also update the user's plan
    this.updateUserPlan(subscription.userId, subscription.plan);
    
    return subscription;
  }
  
  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) {
      return undefined;
    }
    
    const updatedSubscription = {
      ...subscription,
      ...updates,
      updatedAt: new Date()
    };
    
    this.subscriptions.set(id, updatedSubscription);
    
    // If plan is updated, also update the user's plan
    if (updates.plan) {
      this.updateUserPlan(subscription.userId, updates.plan);
    }
    
    return updatedSubscription;
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getTopProducts(): Promise<any[]> {
    return [
      {
        id: 1,
        name: 'Wireless Earbuds',
        orders: 14,
        revenue: 560.00,
        change: 24,
        imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12'
      },
      {
        id: 2,
        name: 'Laptop Stand',
        orders: 11,
        revenue: 385.00,
        change: 18,
        imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45'
      },
      {
        id: 3,
        name: 'Smart Watch',
        orders: 9,
        revenue: 297.00,
        change: -4,
        imageUrl: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf'
      },
      {
        id: 4,
        name: 'Portable Charger',
        orders: 8,
        revenue: 152.00,
        change: 12,
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083'
      }
    ];
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).slice(0, 4);
  }

  async getTrendingProducts(): Promise<any[]> {
    return [
      {
        id: 1,
        name: 'Solar-Powered Phone Charger',
        searchVolume: '10,000+ monthly searches',
        category: 'Electronics',
        trendScore: 9.3,
        profitMargin: '65-80%',
        competition: 'Medium',
        imageUrl: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb'
      },
      {
        id: 2,
        name: 'Foldable Laptop Stand',
        searchVolume: '8,500+ monthly searches',
        category: 'Office',
        trendScore: 8.7,
        profitMargin: '50-65%',
        competition: 'High',
        imageUrl: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137'
      },
      {
        id: 3,
        name: 'Minimalist Desk Lamp',
        searchVolume: '12,000+ monthly searches',
        category: 'Home Decor',
        trendScore: 9.8,
        profitMargin: '70-85%',
        competition: 'Low',
        imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1'
      },
      {
        id: 4,
        name: 'Leather Watch Band',
        searchVolume: '7,200+ monthly searches',
        category: 'Fashion',
        trendScore: 7.6,
        profitMargin: '40-55%',
        competition: 'Medium',
        imageUrl: 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80'
      }
    ];
  }

  async getProductCount(): Promise<number> {
    return this.products.size;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const createdAt = new Date();
    const product: Product = { ...insertProduct, id, createdAt };
    this.products.set(id, product);
    return product;
  }

  // Supplier methods
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSuppliersByProduct(productName: string): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = this.currentId++;
    const createdAt = new Date();
    const supplier: Supplier = { ...insertSupplier, id, createdAt };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getRecentOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, 4);
  }

  async getOrderActivities(): Promise<any[]> {
    return [
      {
        id: 1,
        type: 'new-order',
        title: 'New order',
        customer: 'Jane Cooper',
        orderNumber: '#ORD-7652',
        details: 'Order #ORD-7652 for Wireless Earbuds',
        additionalInfo: '$125.99',
        timestamp: '2023-06-15T10:32:00',
        iconBgColor: 'bg-primary-50',
        iconColor: 'text-primary-500',
        icon: 'shopping-cart'
      },
      {
        id: 2,
        type: 'status-update',
        title: 'Order status updated',
        status: 'Processing',
        statusColor: 'text-yellow-700',
        orderNumber: '#ORD-7651',
        customer: 'Cody Fisher',
        details: 'Order #ORD-7651 for Cody Fisher',
        timestamp: '2023-06-15T09:47:00',
        iconBgColor: 'bg-yellow-50',
        iconColor: 'text-yellow-500',
        icon: 'clock'
      },
      {
        id: 3,
        type: 'shipped',
        title: 'Order shipped',
        orderNumber: '#ORD-7650',
        status: 'Shipped',
        statusColor: 'text-green-700',
        details: 'Tracking number: YW88773652CN',
        timestamp: '2023-06-15T08:22:00',
        iconBgColor: 'bg-green-50',
        iconColor: 'text-green-500',
        icon: 'truck'
      },
      {
        id: 4,
        type: 'refund',
        title: 'Refund processed',
        orderNumber: '#ORD-7649',
        details: '$137.91 refunded to customer',
        timestamp: '2023-06-14T16:55:00',
        iconBgColor: 'bg-red-50',
        iconColor: 'text-red-500',
        icon: 'undo'
      }
    ];
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentId++;
    const createdAt = new Date();
    const orderNumber = insertOrder.orderNumber || generateOrderNumber();
    const order: Order = { ...insertOrder, id, orderNumber, createdAt };
    this.orders.set(id, order);
    return order;
  }

  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getActiveCampaigns(): Promise<any[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.status === "Active" || campaign.status === "Paused")
      .map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        dateRange: campaign.dateRange,
        platform: campaign.platform,
        status: campaign.status,
        budget: parseFloat(campaign.budget as string),
        clicks: campaign.clicks,
        conversions: campaign.conversions,
        roas: parseFloat(campaign.roas as string)
      }));
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentId++;
    const createdAt = new Date();
    const campaign: Campaign = { ...insertCampaign, id, createdAt };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.orderId === orderId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentId++;
    const createdAt = new Date();
    const payment: Payment = { 
      ...insertPayment, 
      id, 
      createdAt,
      amount: insertPayment.amount || "0",
      currency: insertPayment.currency || "usd",
      status: insertPayment.status || "pending",
      paymentMethod: insertPayment.paymentMethod || "card",
      stripePaymentId: insertPayment.stripePaymentId || null,
      stripeCustomerId: insertPayment.stripeCustomerId || null,
      metadata: insertPayment.metadata || {} 
    };
    this.payments.set(id, payment);
    return payment;
  }
}

export const storage = new MemStorage();
