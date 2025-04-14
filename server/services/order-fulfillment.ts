/**
 * Order Fulfillment Service
 * 
 * This service automates the order fulfillment process:
 * 1. Automatically processes orders with suppliers when payment is received
 * 2. Tracks shipment status and provides updates
 * 3. Selects optimal supplier for each product based on price, shipping time, and reliability
 */

import { storage } from "../storage";
import { Order } from "../../shared/schema";

interface FulfillmentResult {
  orderId: number;
  orderNumber: string;
  success: boolean;
  supplierIds: number[];
  trackingNumbers: string[];
  estimatedDelivery: Date | null;
  message: string;
  fulfillmentDate: Date;
}

interface FulfillmentTracking {
  orderId: number;
  orderNumber: string;
  status: 'processing' | 'fulfilled' | 'shipped' | 'in_transit' | 'delivered' | 'failed';
  events: {
    date: Date;
    status: string;
    location: string;
    description: string;
  }[];
  estimatedDelivery: Date | null;
  trackingNumbers: string[];
  supplierIds: number[];
}

interface ScheduleConfig {
  checkIntervalMinutes: number;
  notifyCustomer: boolean;
  autoSelectSupplier: boolean;
  prioritizationStrategy: 'price' | 'speed' | 'reliability' | 'balanced';
}

/**
 * Fulfill a specific order by sending it to the appropriate supplier(s)
 * @param orderId The ID of the order to fulfill
 * @returns Promise resolving to fulfillment result
 */
export async function fulfillOrder(orderId: number): Promise<FulfillmentResult> {
  // Get the order
  const order = await storage.getOrder(orderId);
  if (!order) {
    throw new Error(`Order with ID ${orderId} not found`);
  }

  // Check if order is ready for fulfillment
  if (order.paymentStatus !== 'paid') {
    throw new Error(`Order ${order.orderNumber} cannot be fulfilled: payment status is ${order.paymentStatus}`);
  }

  // In a real application, this would:
  // 1. Determine the products in the order
  // 2. Select the optimal supplier for each product
  // 3. Send fulfillment requests to each supplier's API
  // 4. Record tracking information
  // 5. Update order status
  
  console.log(`Fulfilling order ${order.orderNumber} (ID: ${orderId})`);
  
  // For this demo, simulate the process
  const result = await simulateFulfillment(order);
  
  // In a real app, we would update the order status in the database
  console.log(`Order ${order.orderNumber} fulfillment result: ${result.success ? 'Success' : 'Failed'}`);
  
  return result;
}

/**
 * Track the fulfillment status of an order
 * @param orderId The ID of the order to track
 * @returns Promise resolving to tracking information
 */
export async function trackOrderFulfillment(orderId: number): Promise<FulfillmentTracking> {
  // Get the order
  const order = await storage.getOrder(orderId);
  if (!order) {
    throw new Error(`Order with ID ${orderId} not found`);
  }
  
  // In a real application, this would:
  // 1. Get tracking information from supplier APIs
  // 2. Consolidate information if multiple suppliers
  // 3. Return current status
  
  // For this demo, we'll return simulated tracking data
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: determineTrackingStatus(order),
    events: generateTrackingEvents(order),
    estimatedDelivery: order.fulfillment === 'shipped' ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null,
    trackingNumbers: ['TN' + order.id + '123456', 'TN' + order.id + '789012'],
    supplierIds: [1, 2] // Simulated supplier IDs
  };
}

/**
 * Automatically fulfill all orders that are paid but not yet fulfilled
 * @returns Promise resolving to array of fulfillment results
 */
export async function autoFulfillOrders(): Promise<FulfillmentResult[]> {
  // Get all orders
  const orders = await storage.getAllOrders();
  
  // Filter for orders that are paid but not yet fulfilled
  const ordersToFulfill = orders.filter(order => 
    order.paymentStatus === 'paid' && 
    (order.fulfillment !== 'shipped' && order.fulfillment !== 'delivered')
  );
  
  console.log(`Auto-fulfilling ${ordersToFulfill.length} orders`);
  
  // Process each order
  const results: FulfillmentResult[] = [];
  
  for (const order of ordersToFulfill) {
    try {
      const result = await fulfillOrder(order.id);
      results.push(result);
    } catch (error) {
      console.error(`Error auto-fulfilling order ${order.id}:`, error);
      results.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        success: false,
        supplierIds: [],
        trackingNumbers: [],
        estimatedDelivery: null,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fulfillmentDate: new Date()
      });
    }
  }
  
  return results;
}

/**
 * Schedule automatic order fulfillment
 * @param config Configuration for automatic fulfillment
 * @returns Function to cancel the scheduled fulfillment
 */
export function scheduleAutoFulfillment(config: ScheduleConfig): () => void {
  const { checkIntervalMinutes } = config;
  
  // Convert minutes to milliseconds
  const intervalMs = checkIntervalMinutes * 60 * 1000;
  
  console.log(`Scheduling automatic order fulfillment to run every ${checkIntervalMinutes} minutes`);
  console.log(`Configuration: ${JSON.stringify(config)}`);
  
  // Set up the interval
  const intervalId = setInterval(async () => {
    try {
      console.log('Running scheduled order fulfillment...');
      const results = await autoFulfillOrders();
      const successCount = results.filter(r => r.success).length;
      console.log(`Auto-fulfillment complete: ${successCount}/${results.length} orders fulfilled successfully`);
    } catch (error) {
      console.error('Error in scheduled order fulfillment:', error);
    }
  }, intervalMs);
  
  // Return function to cancel the interval
  return () => clearInterval(intervalId);
}

// --- Helper functions ---

/**
 * Determine tracking status based on order information
 * @param order The order
 * @returns Tracking status
 */
function determineTrackingStatus(order: Order): 'processing' | 'fulfilled' | 'shipped' | 'in_transit' | 'delivered' | 'failed' {
  if (order.status === 'delivered' || order.fulfillment === 'delivered') {
    return 'delivered';
  }
  
  if (order.status === 'shipped' || order.fulfillment === 'shipped') {
    // Randomly choose between shipped and in_transit for demo purposes
    return Math.random() > 0.5 ? 'shipped' : 'in_transit';
  }
  
  if (order.status === 'processing') {
    return 'processing';
  }
  
  if (order.status === 'cancelled') {
    return 'failed';
  }
  
  // Default
  return 'fulfilled';
}

/**
 * Generate simulated tracking events for an order
 * @param order The order
 * @returns Array of tracking events
 */
function generateTrackingEvents(order: Order): { date: Date; status: string; location: string; description: string; }[] {
  const events = [];
  const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt || Date.now());
  
  // Order received
  events.push({
    date: orderDate,
    status: 'order_placed',
    location: 'Online',
    description: 'Order placed by customer'
  });
  
  // Payment processed
  events.push({
    date: new Date(orderDate.getTime() + 1 * 60 * 60 * 1000), // 1 hour after order
    status: 'payment_processed',
    location: 'Payment Processor',
    description: 'Payment successfully processed'
  });
  
  // Order sent to supplier
  events.push({
    date: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours after order
    status: 'fulfillment_initiated',
    location: 'Fulfillment Center',
    description: 'Order details sent to supplier for processing'
  });
  
  // If order is shipped or delivered, add shipping events
  if (order.status === 'shipped' || order.status === 'delivered' || 
      order.fulfillment === 'shipped' || order.fulfillment === 'delivered') {
    
    // Shipped by supplier
    events.push({
      date: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000), // 1 day after order
      status: 'shipped',
      location: 'Supplier Warehouse',
      description: 'Package shipped by supplier'
    });
    
    // In transit
    events.push({
      date: new Date(orderDate.getTime() + 48 * 60 * 60 * 1000), // 2 days after order
      status: 'in_transit',
      location: 'Transit Hub',
      description: 'Package in transit to destination'
    });
    
    // If delivered, add delivery event
    if (order.status === 'delivered' || order.fulfillment === 'delivered') {
      events.push({
        date: new Date(orderDate.getTime() + 72 * 60 * 60 * 1000), // 3 days after order
        status: 'delivered',
        location: 'Customer Address',
        description: 'Package delivered to customer'
      });
    }
  }
  
  return events;
}

/**
 * Simulate order fulfillment process
 * @param order The order to fulfill
 * @returns Promise resolving to fulfillment result
 */
async function simulateFulfillment(order: Order): Promise<FulfillmentResult> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 95% success rate for simulation
  const success = Math.random() < 0.95;
  
  if (!success) {
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      success: false,
      supplierIds: [],
      trackingNumbers: [],
      estimatedDelivery: null,
      message: 'Supplier API is currently unavailable. Please try again later.',
      fulfillmentDate: new Date()
    };
  }
  
  // Generate tracking numbers
  const trackingNumbers = [
    'TN' + order.id + '123456',
    'TN' + order.id + '789012'
  ];
  
  // Simulate supplier selection
  const supplierIds = [1, 2]; // In a real app, we would select based on products
  
  // Calculate estimated delivery (3-5 days from now)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3 + Math.floor(Math.random() * 3));
  
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    success: true,
    supplierIds,
    trackingNumbers,
    estimatedDelivery,
    message: `Order successfully sent to ${supplierIds.length} suppliers for fulfillment. Estimated delivery: ${estimatedDelivery.toLocaleDateString()}`,
    fulfillmentDate: new Date()
  };
}