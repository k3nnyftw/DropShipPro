import { 
  type Product, 
  type InventoryHistory, 
  InsertInventoryHistory, 
  products,
  inventoryHistory
} from "@shared/schema";
import { storage } from "../../storage";
import { eq, lt } from "drizzle-orm";

/**
 * Service to manage automated inventory operations
 */
export class InventoryTrackingService {
  /**
   * Get all products with inventory information
   */
  static async getAllProducts(): Promise<Product[]> {
    return storage.getAllProducts();
  }

  /**
   * Get products that are below their inventory threshold
   */
  static async getLowStockProducts(): Promise<Product[]> {
    const allProducts = await storage.getAllProducts();
    return allProducts.filter(product => 
      product.inventory !== null && 
      product.inventoryThreshold !== null && 
      product.inventory < product.inventoryThreshold
    );
  }

  /**
   * Update product inventory and log the change
   */
  static async updateInventory(
    productId: number, 
    newStock: number, 
    changeReason: string, 
    userId?: number,
    orderId?: number,
    metadata?: any
  ): Promise<{ product: Product, historyEntry: InventoryHistory } | null> {
    const product = await storage.getProduct(productId);
    
    if (!product) {
      return null;
    }

    // Create history entry first
    const historyEntry: InsertInventoryHistory = {
      productId,
      previousStock: product.inventory,
      newStock,
      changeReason,
      userId: userId || null,
      orderId: orderId || null,
      metadata: metadata || null
    };

    // Record the history entry
    const history = await storage.createInventoryHistory(historyEntry);

    // Now update the product
    const updatedProduct = await storage.updateProductInventory(
      productId, 
      newStock,
      new Date() // Update lastStockUpdate timestamp
    );

    if (!updatedProduct) {
      return null;
    }

    return {
      product: updatedProduct,
      historyEntry: history
    };
  }

  /**
   * Get inventory history for a product
   */
  static async getInventoryHistory(productId: number, limit = 20): Promise<InventoryHistory[]> {
    return storage.getInventoryHistoryByProductId(productId, limit);
  }

  /**
   * Enable or disable automatic inventory tracking for a product
   */
  static async setInventoryTracking(productId: number, enabled: boolean): Promise<boolean> {
    const product = await storage.updateProductInventoryTracking(productId, enabled);
    return !!product;
  }

  /**
   * Set inventory threshold for a product
   */
  static async setInventoryThreshold(productId: number, threshold: number): Promise<boolean> {
    const product = await storage.updateProductInventoryThreshold(productId, threshold);
    return !!product;
  }

  /**
   * Get inventory summary stats
   */
  static async getInventorySummary(): Promise<{
    totalProducts: number;
    lowStockProducts: number;
    inventoryValue: number;
  }> {
    const allProducts = await storage.getAllProducts();
    const lowStockProducts = allProducts.filter(product => 
      product.inventory !== null && 
      product.inventoryThreshold !== null && 
      product.inventory < product.inventoryThreshold
    );

    // Calculate total inventory value
    const inventoryValue = allProducts.reduce((total, product) => {
      const inventory = product.inventory || 0;
      const price = parseFloat(product.price?.toString() || '0');
      return total + (inventory * price);
    }, 0);

    return {
      totalProducts: allProducts.length,
      lowStockProducts: lowStockProducts.length,
      inventoryValue
    };
  }
}