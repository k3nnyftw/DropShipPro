import { Router } from "express";
import { InventoryService } from "../services/inventory";
import { z } from "zod";
import { db } from "../db";
import { products, suppliers } from "@shared/schema";
import { eq } from "drizzle-orm";

// This module handles inventory tracking and history, which complements
// but doesn't replace the existing inventory-manager functionality

const router = Router();

// Validation schemas
const updateInventorySchema = z.object({
  newStock: z.number().int().min(0),
  changeReason: z.string().min(1),
  orderId: z.number().int().optional(),
  userId: z.number().int().optional(),
  syncId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const inventoryTrackingSchema = z.object({
  enabled: z.boolean(),
});

const inventoryThresholdSchema = z.object({
  threshold: z.number().int().min(0),
});

// GET /api/inventory/products
// Get all products with inventory information
router.get("/products", async (req, res) => {
  try {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        inventory: products.inventory,
        inventoryThreshold: products.inventoryThreshold,
        inventoryTracking: products.inventoryTracking,
        supplierProductId: products.supplierProductId,
        supplierId: products.supplierId,
        lastStockUpdate: products.lastStockUpdate,
      })
      .from(products)
      .where(eq(products.inventoryTracking, true));

    res.json(result);
  } catch (error) {
    console.error("Failed to fetch inventory products:", error);
    res.status(500).json({ error: "Failed to fetch inventory products" });
  }
});

// GET /api/inventory/low-stock
// Get products that are below inventory threshold
router.get("/low-stock", async (req, res) => {
  try {
    const lowStockProducts = await InventoryService.getLowStockProducts();
    res.json(lowStockProducts);
  } catch (error) {
    console.error("Failed to fetch low stock products:", error);
    res.status(500).json({ error: "Failed to fetch low stock products" });
  }
});

// GET /api/inventory/history/:productId
// Get inventory history for a specific product
router.get("/history/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const history = await InventoryService.getInventoryHistory(productId, limit);
    res.json(history);
  } catch (error) {
    console.error("Failed to fetch inventory history:", error);
    res.status(500).json({ error: "Failed to fetch inventory history" });
  }
});

// POST /api/inventory/update/:productId
// Update inventory for a product
router.post("/update/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const validationResult = updateInventorySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid request data", 
        details: validationResult.error.format() 
      });
    }

    const { newStock, changeReason, ...options } = validationResult.data;
    const success = await InventoryService.updateInventory(
      productId,
      newStock,
      changeReason,
      options
    );

    if (success) {
      res.json({ success: true, message: "Inventory updated successfully" });
    } else {
      res.status(500).json({ error: "Failed to update inventory" });
    }
  } catch (error) {
    console.error("Failed to update inventory:", error);
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

// POST /api/inventory/tracking/:productId
// Enable or disable inventory tracking for a product
router.post("/tracking/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const validationResult = inventoryTrackingSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid request data", 
        details: validationResult.error.format() 
      });
    }

    const { enabled } = validationResult.data;
    const success = await InventoryService.setInventoryTracking(productId, enabled);

    if (success) {
      res.json({ 
        success: true, 
        message: `Inventory tracking ${enabled ? 'enabled' : 'disabled'} successfully` 
      });
    } else {
      res.status(500).json({ error: "Failed to update inventory tracking" });
    }
  } catch (error) {
    console.error("Failed to update inventory tracking:", error);
    res.status(500).json({ error: "Failed to update inventory tracking" });
  }
});

// POST /api/inventory/threshold/:productId
// Set inventory threshold for a product
router.post("/threshold/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const validationResult = inventoryThresholdSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid request data", 
        details: validationResult.error.format() 
      });
    }

    const { threshold } = validationResult.data;
    const success = await InventoryService.setInventoryThreshold(productId, threshold);

    if (success) {
      res.json({ 
        success: true, 
        message: `Inventory threshold set to ${threshold} successfully` 
      });
    } else {
      res.status(500).json({ error: "Failed to update inventory threshold" });
    }
  } catch (error) {
    console.error("Failed to update inventory threshold:", error);
    res.status(500).json({ error: "Failed to update inventory threshold" });
  }
});

// GET /api/inventory/suppliers
// Get all suppliers for inventory sourcing
router.get("/suppliers", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(suppliers);

    res.json(result);
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

export default router;