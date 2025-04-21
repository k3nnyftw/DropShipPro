import { db } from "../db";
import { 
  products, 
  inventoryHistory, 
  type InsertInventoryHistory,
  type Product
} from "@shared/schema";
import { eq, and, lt, not, isNull, desc } from "drizzle-orm";

/**
 * Service to manage automated inventory operations
 */
export class InventoryService {
  /**
   * Update product inventory and log the change
   */
  static async updateInventory(
    productId: number, 
    newStock: number, 
    changeReason: string,
    options: {
      orderId?: number,
      userId?: number,
      syncId?: string,
      metadata?: Record<string, any>
    } = {}
  ): Promise<boolean> {
    try {
      // Get the current product info
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));
      
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      const previousStock = product.inventory ?? 0;
      
      // Start a transaction to ensure both operations succeed or fail together
      await db.transaction(async (tx) => {
        // Update the product inventory
        await tx
          .update(products)
          .set({ 
            inventory: newStock,
            lastStockUpdate: new Date()
          })
          .where(eq(products.id, productId));
        
        // Log the inventory change in history
        const historyEntry: InsertInventoryHistory = {
          productId,
          previousStock,
          newStock,
          changeReason,
          orderId: options.orderId,
          userId: options.userId,
          syncId: options.syncId,
          metadata: options.metadata,
        };
        
        await tx.insert(inventoryHistory).values(historyEntry);
      });
      
      return true;
    } catch (error) {
      console.error("Failed to update inventory:", error);
      return false;
    }
  }

  /**
   * Get products that are below their inventory threshold
   */
  static async getLowStockProducts(): Promise<Product[]> {
    try {
      return await db
        .select()
        .from(products)
        .where(
          and(
            not(isNull(products.inventory)),
            not(isNull(products.inventoryThreshold)),
            lt(products.inventory, products.inventoryThreshold),
            eq(products.inventoryTracking, true)
          )
        );
    } catch (error) {
      console.error("Failed to get low stock products:", error);
      return [];
    }
  }

  /**
   * Get inventory history for a product
   */
  static async getInventoryHistory(productId: number, limit = 20): Promise<any[]> {
    try {
      return await db
        .select()
        .from(inventoryHistory)
        .where(eq(inventoryHistory.productId, productId))
        .orderBy(desc(inventoryHistory.timestamp))
        .limit(limit);
    } catch (error) {
      console.error("Failed to get inventory history:", error);
      return [];
    }
  }

  /**
   * Enable or disable automatic inventory tracking for a product
   */
  static async setInventoryTracking(productId: number, enabled: boolean): Promise<boolean> {
    try {
      await db
        .update(products)
        .set({ inventoryTracking: enabled })
        .where(eq(products.id, productId));
      
      return true;
    } catch (error) {
      console.error("Failed to update inventory tracking status:", error);
      return false;
    }
  }

  /**
   * Set inventory threshold for a product
   */
  static async setInventoryThreshold(productId: number, threshold: number): Promise<boolean> {
    try {
      await db
        .update(products)
        .set({ inventoryThreshold: threshold })
        .where(eq(products.id, productId));
      
      return true;
    } catch (error) {
      console.error("Failed to update inventory threshold:", error);
      return false;
    }
  }
}