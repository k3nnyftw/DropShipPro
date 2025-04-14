/**
 * Order Fulfillment Service
 * 
 * This service automates the order fulfillment process by:
 * 1. Automatically sending orders to suppliers
 * 2. Tracking fulfillment status
 * 3. Notifying customers of shipment updates
 */

import { storage } from "../storage";
import { Order, Supplier } from "../../shared/schema";

interface FulfillmentRequest {
  orderId: number;
  supplierIds?: number[];  // If not provided, the system will auto-select suppliers
  fulfillmentMode?: 'automatic' | 'manual';
}

interface FulfillmentResponse {
  orderId: number;
  status: 'success' | 'partial' | 'failed';
  supplierIds: number[];
  trackingNumbers?: string[];
  estimatedDelivery?: Date;
  message: string;
}

interface OrderSupplierMatch {
  orderId: number;
  supplierId: number;
  productIds: number[];
  fulfillmentStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'failed';
  trackingNumber?: string;
  shippingMethod?: string;
  estimatedDelivery?: Date;
}

interface SupplierRequestPayload {
  orderId: number;
  products: {
    productId: number;
    name: string;
    quantity: number;
    price: string;
  }[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  customerOrderId: string;
}

/**
 * Automatically fulfill an order by sending it to the appropriate suppliers
 * @param request The fulfillment request containing order information
 * @returns Promise resolving to fulfillment response with status and details
 */
export async function fulfillOrder(
  request: FulfillmentRequest
): Promise<FulfillmentResponse> {
  const { orderId, supplierIds = [], fulfillmentMode = 'automatic' } = request;
  
  // Get the order
  const order = await storage.getOrder(orderId);
  if (!order) {
    throw new Error(`Order with ID ${orderId} not found`);
  }
  
  // Check if order is already being fulfilled or completed
  if (order.fulfillment === 'shipped' || order.fulfillment === 'delivered') {
    return {
      orderId,
      status: 'success',
      supplierIds: [],
      message: `Order is already in ${order.fulfillment} status`
    };
  }
  
  // In a real implementation, this would match products in the order to suppliers
  // For this demo, we'll simulate the process
  
  // If no suppliers specified, auto-select based on product availability and ratings
  let selectedSupplierIds = supplierIds;
  if (selectedSupplierIds.length === 0) {
    // Simulate auto-selecting suppliers
    const allSuppliers = await storage.getAllSuppliers();
    const rand = Math.floor(Math.random() * Math.min(3, allSuppliers.length));
    selectedSupplierIds = [allSuppliers[rand].id];
  }
  
  // Simulate sending order to suppliers
  const supplierMatches: OrderSupplierMatch[] = [];
  const trackingNumbers: string[] = [];
  
  for (const supplierId of selectedSupplierIds) {
    try {
      const supplier = await storage.getSupplier(supplierId);
      if (!supplier) {
        continue;
      }
      
      // In a real implementation, this would call the supplier's API
      const fulfillmentResult = await simulateSendToSupplier(order, supplier);
      
      supplierMatches.push({
        orderId,
        supplierId,
        productIds: [1, 2], // In a real implementation, this would be the actual product IDs
        fulfillmentStatus: 'processing',
        trackingNumber: fulfillmentResult.trackingNumber,
        shippingMethod: fulfillmentResult.shippingMethod,
        estimatedDelivery: fulfillmentResult.estimatedDelivery
      });
      
      if (fulfillmentResult.trackingNumber) {
        trackingNumbers.push(fulfillmentResult.trackingNumber);
      }
    } catch (error) {
      console.error(`Error fulfilling order with supplier ${supplierId}:`, error);
    }
  }
  
  // Update order status in database
  if (supplierMatches.length > 0) {
    // In a real implementation, you would update the order status in the database
    console.log(`Order ${orderId} status updated to 'processing'`);
    
    // Simulate sending notification to customer
    if (fulfillmentMode === 'automatic') {
      await simulateCustomerNotification(order, 'processing');
    }
    
    const estimatedDelivery = supplierMatches.reduce((latest, match) => {
      if (!match.estimatedDelivery) return latest;
      if (!latest) return match.estimatedDelivery;
      return match.estimatedDelivery > latest ? match.estimatedDelivery : latest;
    }, null as Date | null);
    
    return {
      orderId,
      status: selectedSupplierIds.length === supplierMatches.length ? 'success' : 'partial',
      supplierIds: supplierMatches.map(match => match.supplierId),
      trackingNumbers,
      estimatedDelivery: estimatedDelivery || undefined,
      message: 'Order sent to suppliers for fulfillment'
    };
  }
  
  return {
    orderId,
    status: 'failed',
    supplierIds: [],
    message: 'Failed to fulfill order with any supplier'
  };
}

/**
 * Track an order's fulfillment status across suppliers
 * @param orderId The ID of the order to track
 * @returns Promise resolving to the current fulfillment status
 */
export async function trackOrderFulfillment(
  orderId: number
): Promise<{
  orderId: number;
  status: string;
  supplierUpdates: {
    supplierId: number;
    supplierName: string;
    status: string;
    trackingNumber?: string;
    trackingUrl?: string;
    lastUpdate: Date;
    estimatedDelivery?: Date;
  }[];
}> {
  // Get the order
  const order = await storage.getOrder(orderId);
  if (!order) {
    throw new Error(`Order with ID ${orderId} not found`);
  }
  
  // In a real implementation, this would query the database for supplier matches
  // and call supplier APIs for status updates
  
  // For this demo, we'll simulate the tracking process
  const currentDate = new Date();
  // Randomly decide if the order is processing, shipped, or delivered based on its age
  const orderAge = (currentDate.getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  
  let overallStatus: string;
  const suppliers = await storage.getAllSuppliers();
  
  // Select 1-2 random suppliers for this demo
  const randSuppliers = [];
  const randSupplier1 = suppliers[Math.floor(Math.random() * suppliers.length)];
  randSuppliers.push(randSupplier1);
  
  // 50% chance of a second supplier
  if (Math.random() > 0.5) {
    const randSupplier2 = suppliers[Math.floor(Math.random() * suppliers.length)];
    if (randSupplier2.id !== randSupplier1.id) {
      randSuppliers.push(randSupplier2);
    }
  }
  
  // Determine status based on simulated order age
  if (orderAge < 1) {
    overallStatus = 'processing';
  } else if (orderAge < 3) {
    overallStatus = 'shipped';
  } else {
    overallStatus = 'delivered';
  }
  
  // Generate tracking number format: 2 letters + 9 digits
  const generateTrackingNumber = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const prefix = letters[Math.floor(Math.random() * 26)] + letters[Math.floor(Math.random() * 26)];
    const numbers = Array(9).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
    return `${prefix}${numbers}`;
  };
  
  // Generate supplier updates
  const supplierUpdates = randSuppliers.map(supplier => {
    // Simulate different statuses between suppliers
    let supplierStatus = overallStatus;
    if (overallStatus === 'shipped' && Math.random() > 0.7) {
      supplierStatus = 'processing';
    } else if (overallStatus === 'delivered' && Math.random() > 0.7) {
      supplierStatus = 'shipped';
    }
    
    const trackingNumber = generateTrackingNumber();
    
    // Calculate estimated delivery (2-7 days from now)
    const estDelivery = new Date();
    estDelivery.setDate(estDelivery.getDate() + 2 + Math.floor(Math.random() * 6));
    
    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      status: supplierStatus,
      trackingNumber,
      trackingUrl: `https://track.carrier.com/${trackingNumber}`,
      lastUpdate: new Date(currentDate.getTime() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)),
      estimatedDelivery: estDelivery
    };
  });
  
  return {
    orderId,
    status: overallStatus,
    supplierUpdates
  };
}

/**
 * Automatically fulfill all pending orders that are ready for fulfillment
 * @returns Promise resolving to an array of fulfillment responses
 */
export async function autoFulfillPendingOrders(): Promise<FulfillmentResponse[]> {
  // Get all orders
  const orders = await storage.getAllOrders();
  
  // Filter for orders that are pending and paid
  const pendingOrders = orders.filter(order => 
    order.status === 'confirmed' && 
    order.paymentStatus === 'paid' &&
    (!order.fulfillment || order.fulfillment === 'pending')
  );
  
  console.log(`Found ${pendingOrders.length} pending orders for auto-fulfillment`);
  
  // Process each order
  const fulfillmentResponses: FulfillmentResponse[] = [];
  
  for (const order of pendingOrders) {
    try {
      const response = await fulfillOrder({
        orderId: order.id,
        fulfillmentMode: 'automatic'
      });
      
      fulfillmentResponses.push(response);
    } catch (error) {
      console.error(`Error auto-fulfilling order ${order.id}:`, error);
      fulfillmentResponses.push({
        orderId: order.id,
        status: 'failed',
        supplierIds: [],
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
  
  return fulfillmentResponses;
}

/**
 * Schedule automatic order fulfillment to run periodically
 * @param intervalMinutes How often to check for new orders (in minutes)
 * @returns Function to cancel the scheduled fulfillment
 */
export function scheduleAutoFulfillment(intervalMinutes: number = 15): () => void {
  // Convert minutes to milliseconds
  const intervalMs = intervalMinutes * 60 * 1000;
  
  console.log(`Scheduling auto-fulfillment to run every ${intervalMinutes} minutes`);
  
  // Set up the interval
  const intervalId = setInterval(async () => {
    try {
      console.log('Running scheduled auto-fulfillment...');
      const results = await autoFulfillPendingOrders();
      console.log(`Auto-fulfillment complete: ${results.length} orders processed`);
    } catch (error) {
      console.error('Error in scheduled auto-fulfillment:', error);
    }
  }, intervalMs);
  
  // Return function to cancel the interval
  return () => clearInterval(intervalId);
}

// --- Helper functions ---

/**
 * Simulate sending an order to a supplier
 * In a real implementation, this would call the supplier's API
 */
async function simulateSendToSupplier(
  order: Order,
  supplier: Supplier
): Promise<{
  success: boolean;
  trackingNumber?: string;
  shippingMethod?: string;
  estimatedDelivery?: Date;
}> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 90% success rate for simulation
  const success = Math.random() < 0.9;
  
  if (!success) {
    return { success: false };
  }
  
  // Generate random tracking number
  const trackingNumber = `TRACK${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
  
  // Random shipping method
  const shippingMethods = ['Standard', 'Expedited', 'Express'];
  const shippingMethod = shippingMethods[Math.floor(Math.random() * shippingMethods.length)];
  
  // Calculate estimated delivery (3-10 days from now)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3 + Math.floor(Math.random() * 8));
  
  return {
    success: true,
    trackingNumber,
    shippingMethod,
    estimatedDelivery
  };
}

/**
 * Simulate sending notification to customer
 * In a real implementation, this would send an email or SMS
 */
async function simulateCustomerNotification(
  order: Order,
  status: 'processing' | 'shipped' | 'delivered'
): Promise<boolean> {
  // Simulate notification delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log(`[NOTIFICATION] Order #${order.orderNumber} is now ${status}. Email sent to ${order.customerEmail || 'customer'}.`);
  
  return true;
}