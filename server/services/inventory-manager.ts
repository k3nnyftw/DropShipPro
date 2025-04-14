/**
 * Inventory Management Service
 * 
 * This service automates inventory management by:
 * 1. Auto-reordering products when inventory is low
 * 2. Optimizing inventory levels based on sales velocity
 * 3. Predicting future inventory needs
 */

import { storage } from "../storage";
import { Product } from "../../shared/schema";

interface InventoryStatus {
  productId: number;
  name: string;
  currentStock: number;
  reorderThreshold: number;
  optimalStock: number;
  needsReorder: boolean;
  daysUntilStockout: number;
  suggestedOrderQuantity: number;
}

interface InventoryPrediction {
  productId: number;
  name: string;
  projectedSales: {
    timeframe: '7days' | '30days' | '90days';
    quantity: number;
  }[];
  stockoutRisk: 'low' | 'medium' | 'high';
  recommendation: string;
}

interface ReorderRequest {
  productId: number;
  quantity: number;
  supplierId?: number;
  urgent?: boolean;
}

interface ReorderResponse {
  productId: number;
  success: boolean;
  orderId?: string;
  estimatedDelivery?: Date;
  message: string;
}

/**
 * Analyzes inventory status for all products
 * @returns Promise resolving to inventory status for all products
 */
export async function analyzeInventoryStatus(): Promise<InventoryStatus[]> {
  // Get all products
  const products = await storage.getAllProducts();
  const inventoryStatuses: InventoryStatus[] = [];
  
  // Get recent orders to calculate sales velocity
  const recentOrders = await storage.getRecentOrders();
  
  for (const product of products) {
    // Get current inventory
    const currentStock = product.inventory || 0;
    
    // Calculate sales velocity (sales per day)
    const salesVelocity = calculateSalesVelocity(product.id, recentOrders);
    
    // Calculate days until stockout
    const daysUntilStockout = salesVelocity > 0 ? Math.floor(currentStock / salesVelocity) : 999;
    
    // Calculate reorder threshold based on sales velocity and lead time
    // Assume average lead time of 14 days plus 7 days safety stock
    const leadTimeDays = 14;
    const safetyStockDays = 7;
    const reorderThreshold = Math.ceil(salesVelocity * (leadTimeDays + safetyStockDays));
    
    // Calculate optimal stock level (30 days of sales + safety stock)
    const optimalStock = Math.ceil(salesVelocity * 30 + (salesVelocity * safetyStockDays));
    
    // Determine if product needs reorder
    const needsReorder = currentStock <= reorderThreshold;
    
    // Calculate suggested order quantity
    const suggestedOrderQuantity = needsReorder ? (optimalStock - currentStock) : 0;
    
    inventoryStatuses.push({
      productId: product.id,
      name: product.name,
      currentStock,
      reorderThreshold,
      optimalStock,
      needsReorder,
      daysUntilStockout,
      suggestedOrderQuantity
    });
  }
  
  // Sort by urgency (days until stockout)
  return inventoryStatuses.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
}

/**
 * Predicts future inventory needs based on sales trends
 * @param productIds Optional array of product IDs to analyze; if not provided, all products are analyzed
 * @returns Promise resolving to inventory predictions
 */
export async function predictInventoryNeeds(
  productIds?: number[]
): Promise<InventoryPrediction[]> {
  // Get products to analyze
  let products: Product[];
  if (productIds && productIds.length > 0) {
    products = [];
    for (const id of productIds) {
      const product = await storage.getProduct(id);
      if (product) products.push(product);
    }
  } else {
    products = await storage.getAllProducts();
  }
  
  // Get recent orders to analyze sales trends
  const recentOrders = await storage.getRecentOrders();
  
  const predictions: InventoryPrediction[] = [];
  
  for (const product of products) {
    // Calculate current sales velocity
    const currentSalesVelocity = calculateSalesVelocity(product.id, recentOrders);
    
    // For a real implementation, we would use time series forecasting
    // For this demo, we'll use simple projections with some randomness
    
    // Project sales for different timeframes
    const projectedSales = [
      {
        timeframe: '7days' as const,
        quantity: Math.round(currentSalesVelocity * 7 * (0.8 + Math.random() * 0.4)) // +/- 20%
      },
      {
        timeframe: '30days' as const,
        quantity: Math.round(currentSalesVelocity * 30 * (0.7 + Math.random() * 0.6)) // +/- 30%
      },
      {
        timeframe: '90days' as const,
        quantity: Math.round(currentSalesVelocity * 90 * (0.6 + Math.random() * 0.8)) // +/- 40%
      }
    ];
    
    // Calculate stockout risk
    const currentStock = product.inventory || 0;
    const daysUntilStockout = currentSalesVelocity > 0 ? Math.floor(currentStock / currentSalesVelocity) : 999;
    
    let stockoutRisk: 'low' | 'medium' | 'high';
    if (daysUntilStockout > 30) {
      stockoutRisk = 'low';
    } else if (daysUntilStockout > 14) {
      stockoutRisk = 'medium';
    } else {
      stockoutRisk = 'high';
    }
    
    // Generate recommendation
    let recommendation: string;
    if (stockoutRisk === 'high') {
      recommendation = `Urgent: Reorder ${Math.ceil(currentSalesVelocity * 45)} units immediately to prevent stockout.`;
    } else if (stockoutRisk === 'medium') {
      recommendation = `Reorder ${Math.ceil(currentSalesVelocity * 30)} units in the next 7 days.`;
    } else {
      recommendation = `Inventory levels are sufficient. Next reorder in approximately ${daysUntilStockout - 30} days.`;
    }
    
    predictions.push({
      productId: product.id,
      name: product.name,
      projectedSales,
      stockoutRisk,
      recommendation
    });
  }
  
  return predictions;
}

/**
 * Automatically reorders products that are below their reorder threshold
 * @returns Promise resolving to an array of reorder responses
 */
export async function autoReorderProducts(): Promise<ReorderResponse[]> {
  // Analyze inventory status
  const inventoryStatuses = await analyzeInventoryStatus();
  
  // Filter for products that need reordering
  const productsToReorder = inventoryStatuses.filter(status => status.needsReorder);
  
  console.log(`Auto-reordering ${productsToReorder.length} products`);
  
  // Process each reorder
  const responses: ReorderResponse[] = [];
  
  for (const product of productsToReorder) {
    try {
      // Find best supplier for this product
      const supplier = await findBestSupplier(product.productId);
      
      // In a real implementation, this would call the supplier's API
      // For this demo, we'll simulate the reorder process
      const reorderResponse = await simulateReorder({
        productId: product.productId,
        quantity: product.suggestedOrderQuantity,
        supplierId: supplier?.id,
        urgent: product.daysUntilStockout < 7
      });
      
      responses.push(reorderResponse);
    } catch (error) {
      console.error(`Error reordering product ${product.productId}:`, error);
      responses.push({
        productId: product.productId,
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
  
  return responses;
}

/**
 * Updates inventory levels based on sales and reorders
 * @param productId The ID of the product to update
 * @param quantityChange The change in quantity (negative for sales, positive for received inventory)
 * @param reason The reason for the inventory change
 * @returns Promise resolving to the updated product
 */
export async function updateInventory(
  productId: number,
  quantityChange: number,
  reason: 'sale' | 'return' | 'restock' | 'adjustment'
): Promise<Product> {
  // Get the product
  const product = await storage.getProduct(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  
  // Calculate new inventory level
  const currentInventory = product.inventory || 0;
  const newInventory = Math.max(0, currentInventory + quantityChange);
  
  // In a real implementation, you would update the product in the database
  // For this demo, we'll just log the change
  console.log(`Inventory change for product ${productId} (${product.name}): ${currentInventory} → ${newInventory} (${quantityChange > 0 ? '+' : ''}${quantityChange})`);
  console.log(`Reason: ${reason}`);
  
  // Check if this update triggers a reorder
  if (newInventory <= calculateReorderThreshold(product)) {
    console.log(`Product ${productId} is now below reorder threshold. Flagging for reorder.`);
    // In a real implementation, this would trigger a reorder or flag the product
  }
  
  // Return the updated product
  return {
    ...product,
    inventory: newInventory
  };
}

/**
 * Schedule automatic inventory management tasks
 * @param reorderIntervalHours How often to check for products that need reordering (in hours)
 * @returns Function to cancel the scheduled tasks
 */
export function scheduleInventoryManagement(reorderIntervalHours: number = 24): () => void {
  // Convert hours to milliseconds
  const intervalMs = reorderIntervalHours * 60 * 60 * 1000;
  
  console.log(`Scheduling automatic inventory management to run every ${reorderIntervalHours} hours`);
  
  // Set up the interval
  const intervalId = setInterval(async () => {
    try {
      console.log('Running scheduled inventory management...');
      const reorderResults = await autoReorderProducts();
      console.log(`Auto-reorder complete: ${reorderResults.filter(r => r.success).length} products reordered successfully`);
    } catch (error) {
      console.error('Error in scheduled inventory management:', error);
    }
  }, intervalMs);
  
  // Return function to cancel the interval
  return () => clearInterval(intervalId);
}

// --- Helper functions ---

/**
 * Calculate sales velocity (sales per day) for a product
 * @param productId The ID of the product
 * @param recentOrders Array of recent orders
 * @returns Sales velocity (units per day)
 */
function calculateSalesVelocity(productId: number, recentOrders: any[]): number {
  // In a real implementation, this would analyze order line items
  // For this demo, we'll use a simplified approach
  
  // Count occurrences of this product in recent orders
  // Assuming 1-5 units per order
  let totalUnitsSold = 0;
  let orderCount = 0;
  
  for (const order of recentOrders) {
    // Simulate product being in some orders
    if (Math.random() < 0.3) {
      const unitsSold = Math.floor(Math.random() * 5) + 1;
      totalUnitsSold += unitsSold;
      orderCount++;
    }
  }
  
  // Calculate daily sales rate based on 30 days of data
  const dailySalesRate = totalUnitsSold / 30;
  
  // Ensure a minimum value to avoid division by zero issues
  return Math.max(0.1, dailySalesRate);
}

/**
 * Calculate reorder threshold for a product
 * @param product The product to calculate threshold for
 * @returns Reorder threshold quantity
 */
function calculateReorderThreshold(product: Product): number {
  // In a real implementation, this would use sales velocity and lead time
  // For this demo, we'll use a simple percentage of inventory
  
  // Get current inventory
  const currentInventory = product.inventory || 0;
  
  // Default threshold is 20% of max inventory or 5 units, whichever is higher
  return Math.max(5, Math.ceil(currentInventory * 0.2));
}

/**
 * Find the best supplier for a product
 * @param productId The ID of the product
 * @returns Promise resolving to the best supplier, or undefined if none found
 */
async function findBestSupplier(productId: number): Promise<any | undefined> {
  // Get all suppliers
  const suppliers = await storage.getAllSuppliers();
  
  // In a real implementation, this would analyze supplier performance, pricing, etc.
  // For this demo, we'll pick a random supplier
  if (suppliers.length === 0) {
    return undefined;
  }
  
  return suppliers[Math.floor(Math.random() * suppliers.length)];
}

/**
 * Simulate reordering products from a supplier
 * @param request The reorder request
 * @returns Promise resolving to the reorder response
 */
async function simulateReorder(request: ReorderRequest): Promise<ReorderResponse> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 95% success rate for simulation
  const success = Math.random() < 0.95;
  
  if (!success) {
    return {
      productId: request.productId,
      success: false,
      message: 'Supplier API is currently unavailable. Please try again later.'
    };
  }
  
  // Generate order ID
  const orderId = `PO-${Date.now().toString().substring(7)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  
  // Calculate estimated delivery (5-14 days from now, sooner if urgent)
  const estimatedDelivery = new Date();
  const deliveryDays = request.urgent ? 3 + Math.floor(Math.random() * 4) : 5 + Math.floor(Math.random() * 10);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);
  
  return {
    productId: request.productId,
    success: true,
    orderId,
    estimatedDelivery,
    message: `Successfully placed order ${orderId} for ${request.quantity} units. Estimated delivery: ${estimatedDelivery.toLocaleDateString()}`
  };
}