import express from "express";
import { InventoryTrackingService } from "../../services/inventory-tracking";
import { z } from "zod";

const router = express.Router();

// Get all products with inventory data
router.get("/products", async (req, res) => {
  try {
    const products = await InventoryTrackingService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching inventory products:", error);
    res.status(500).json({ message: "Failed to fetch inventory products" });
  }
});

// Get products with low stock (below threshold)
router.get("/low-stock", async (req, res) => {
  try {
    const lowStockProducts = await InventoryTrackingService.getLowStockProducts();
    res.json(lowStockProducts);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500).json({ message: "Failed to fetch low stock products" });
  }
});

// Get inventory summary stats
router.get("/summary", async (req, res) => {
  try {
    const summary = await InventoryTrackingService.getInventorySummary();
    res.json(summary);
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    res.status(500).json({ message: "Failed to fetch inventory summary" });
  }
});

// Get inventory history for a product
router.get("/history/:productId?", async (req, res) => {
  try {
    if (!req.params.productId) {
      return res.json([]);
    }
    
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const history = await InventoryTrackingService.getInventoryHistory(productId, limit);
    res.json(history);
  } catch (error) {
    console.error("Error fetching inventory history:", error);
    res.status(500).json({ message: "Failed to fetch inventory history" });
  }
});

// Update inventory for a product
router.post("/update/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Validate the request body
    const updateSchema = z.object({
      newStock: z.number().int().min(0),
      changeReason: z.string().min(1),
      userId: z.number().optional(),
      orderId: z.number().optional(),
      metadata: z.any().optional()
    });

    const validatedData = updateSchema.parse(req.body);

    const result = await InventoryTrackingService.updateInventory(
      productId,
      validatedData.newStock,
      validatedData.changeReason,
      validatedData.userId,
      validatedData.orderId,
      validatedData.metadata
    );

    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error updating inventory:", error);
    res.status(500).json({ message: "Failed to update inventory" });
  }
});

// Set inventory tracking status for a product
router.post("/tracking/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const trackingSchema = z.object({
      enabled: z.boolean()
    });

    const { enabled } = trackingSchema.parse(req.body);

    const success = await InventoryTrackingService.setInventoryTracking(productId, enabled);
    if (!success) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success, enabled });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error updating inventory tracking:", error);
    res.status(500).json({ message: "Failed to update inventory tracking" });
  }
});

// Set inventory threshold for a product
router.post("/threshold/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const thresholdSchema = z.object({
      threshold: z.number().int().min(0)
    });

    const { threshold } = thresholdSchema.parse(req.body);

    const success = await InventoryTrackingService.setInventoryThreshold(productId, threshold);
    if (!success) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success, threshold });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error updating inventory threshold:", error);
    res.status(500).json({ message: "Failed to update inventory threshold" });
  }
});

export default router;