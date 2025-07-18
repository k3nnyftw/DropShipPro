import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertSupplierSchema, insertOrderSchema, insertCampaignSchema } from "../shared/schema";
import { z } from "zod";
import paymentRoutes from "./routes/payment";
import aiAnalyticsRoutes from "./routes/ai-analytics";
import priceOptimizerRoutes from "./routes/price-optimizer";
import orderFulfillmentRoutes from "./routes/order-fulfillment";
import inventoryManagerRoutes from "./routes/inventory-manager";
import inventoryTrackingRoutes from "./routes/inventory-tracking/index";
import demandForecastingRoutes from "./routes/demand-forecasting";
import competitorTrackingRoutes from "./routes/competitor-tracking";
import productDescriptionRoutes from "./routes/product-description-generator";
import emailMarketingRoutes from "./routes/email-marketing";
import socialMediaSharingRoutes from "./routes/social-media-sharing";
import socialMediaAccountsRoutes from "./routes/social-media-accounts";
import subscriptionRoutes from "./routes/subscription";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register route modules
  app.use('/api/payments', paymentRoutes);
  app.use('/api/ai-analytics', aiAnalyticsRoutes);
  app.use('/api/price-optimizer', priceOptimizerRoutes);
  app.use('/api/fulfillment', orderFulfillmentRoutes);
  app.use('/api/inventory', inventoryManagerRoutes);
  app.use('/api/inventory-tracking', inventoryTrackingRoutes);
  app.use('/api/forecasting', demandForecastingRoutes);
  app.use('/api/competitors', competitorTrackingRoutes);
  app.use('/api/descriptions', productDescriptionRoutes);
  app.use('/api/email-marketing', emailMarketingRoutes);
  app.use('/api/social-media', socialMediaSharingRoutes);
  app.use('/api/social-media', socialMediaAccountsRoutes);
  app.use('/api/subscription', subscriptionRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  
  // prefix all routes with /api
  
  // Dashboard endpoints
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = {
        orders: { value: 12, change: 8.2 },
        revenue: { value: 438.75, change: 12.5 },
        visitors: { value: 892, change: 4.7 },
        products: { value: await storage.getProductCount() }
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/quick-actions", async (req, res) => {
    try {
      const actions = [
        {
          id: 1,
          title: 'Add New Product',
          description: 'List a new item in your store',
          icon: 'plus',
          backgroundColor: 'bg-primary-100',
          iconColor: 'text-primary-600',
          link: '/product-discovery'
        },
        {
          id: 2,
          title: 'Find Products',
          description: 'Discover trending products',
          icon: 'search',
          backgroundColor: 'bg-green-100',
          iconColor: 'text-green-600',
          link: '/product-discovery'
        },
        {
          id: 3,
          title: 'Create Campaign',
          description: 'Promote your products',
          icon: 'chart',
          backgroundColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          link: '/advertising'
        },
        {
          id: 4,
          title: 'Store Settings',
          description: 'Customize your shop',
          icon: 'settings',
          backgroundColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          link: '/store'
        }
      ];
      res.json(actions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quick actions" });
    }
  });

  // Product endpoints
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/top", async (req, res) => {
    try {
      const topProducts = await storage.getTopProducts();
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      res.json(featuredProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/trending", async (req, res) => {
    try {
      const trendingProducts = await storage.getTrendingProducts();
      res.json(trendingProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Supplier endpoints
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/wireless-earbuds", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliersByProduct("Wireless Earbuds");
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers for wireless earbuds" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.getSupplier(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  // Order endpoints
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/recent", async (req, res) => {
    try {
      const recentOrders = await storage.getRecentOrders();
      res.json(recentOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent orders" });
    }
  });

  app.get("/api/orders/stats", async (req, res) => {
    try {
      const orderStats = {
        new: { count: 12, change: 8 },
        processing: { count: 8, change: -12 },
        shipped: { count: 24, change: 18 },
        delivered: { count: 18, change: 6 }
      };
      res.json(orderStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order stats" });
    }
  });

  app.get("/api/orders/activities", async (req, res) => {
    try {
      const activities = await storage.getOrderActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order activities" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Campaign endpoints
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/active", async (req, res) => {
    try {
      const activeCampaigns = await storage.getActiveCampaigns();
      res.json(activeCampaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active campaigns" });
    }
  });

  app.get("/api/advertising/stats", async (req, res) => {
    try {
      const adStats = {
        adSpend: { value: 342.88, change: 12.5, budget: 500 },
        clicks: { value: 1243, change: 8.2, cpc: 0.28, ctr: 3.2 },
        conversions: { value: 87, change: 15.3, rate: 7.0, cost: 3.94 }
      };
      res.json(adStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch advertising stats" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Utility endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = [
        "All Categories",
        "Electronics",
        "Home & Garden",
        "Health & Beauty",
        "Fashion",
        "Sports & Outdoors"
      ];
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/price-ranges", async (req, res) => {
    try {
      const priceRanges = [
        "Any Price",
        "Under $25",
        "$25 - $50",
        "$50 - $100",
        "$100 - $200",
        "Over $200"
      ];
      res.json(priceRanges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price ranges" });
    }
  });

  app.get("/api/supplier/regions", async (req, res) => {
    try {
      const regions = [
        "All Regions",
        "China",
        "United States",
        "Europe",
        "South Asia"
      ];
      res.json(regions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier regions" });
    }
  });

  app.get("/api/supplier/ratings", async (req, res) => {
    try {
      const ratings = [
        "Any Rating",
        "4+ Stars",
        "3+ Stars",
        "2+ Stars"
      ];
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier ratings" });
    }
  });

  // Create HTTP server for the Express app
  const httpServer = createServer(app);

  return httpServer;
}
