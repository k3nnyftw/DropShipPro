import { Router, Request, Response } from 'express';
import * as orderFulfillment from '../services/order-fulfillment';

const router = Router();

/**
 * POST /api/fulfillment/fulfill/:orderId
 * Fulfill a specific order
 */
router.post('/fulfill/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ 
        error: 'Invalid order ID',
        message: 'Order ID must be a number'
      });
    }
    
    const result = await orderFulfillment.fulfillOrder(orderId);
    
    res.json(result);
  } catch (error) {
    console.error('Error fulfilling order:', error);
    res.status(500).json({ 
      error: 'Failed to fulfill order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/fulfillment/track/:orderId
 * Track fulfillment status of an order
 */
router.get('/track/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ 
        error: 'Invalid order ID',
        message: 'Order ID must be a number'
      });
    }
    
    const trackingInfo = await orderFulfillment.trackOrderFulfillment(orderId);
    
    res.json(trackingInfo);
  } catch (error) {
    console.error('Error tracking order fulfillment:', error);
    res.status(500).json({ 
      error: 'Failed to track order fulfillment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/fulfillment/auto-fulfill
 * Trigger automatic fulfillment of all pending orders
 */
router.post('/auto-fulfill', async (req: Request, res: Response) => {
  try {
    const results = await orderFulfillment.autoFulfillOrders();
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    res.json({
      totalOrders: results.length,
      successCount,
      failureCount,
      results: results
    });
  } catch (error) {
    console.error('Error auto-fulfilling orders:', error);
    res.status(500).json({ 
      error: 'Failed to auto-fulfill orders',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/fulfillment/schedule
 * Schedule automatic order fulfillment
 */
router.post('/schedule', async (req: Request, res: Response) => {
  try {
    const { 
      intervalHours = 1,
      notifyCustomer = true,
      autoSelectSupplier = true,
      prioritizationStrategy = 'balanced'
    } = req.body;
    
    // Validate input parameters
    if (typeof intervalHours !== 'number' || intervalHours < 0.1) {
      return res.status(400).json({
        error: 'Invalid interval',
        message: 'Interval must be a positive number in hours'
      });
    }
    
    if (!['price', 'speed', 'reliability', 'balanced'].includes(prioritizationStrategy)) {
      return res.status(400).json({
        error: 'Invalid prioritization strategy',
        message: "Strategy must be one of: 'price', 'speed', 'reliability', 'balanced'"
      });
    }
    
    // Convert hours to minutes for the service
    const checkIntervalMinutes = intervalHours * 60;
    
    // In a real application, you would store this configuration in a database
    // For this demo, we just call the service
    orderFulfillment.scheduleAutoFulfillment({
      checkIntervalMinutes,
      notifyCustomer,
      autoSelectSupplier,
      prioritizationStrategy
    });
    
    res.json({
      message: `Automatic order fulfillment scheduled every ${intervalHours} hours`,
      settings: {
        checkIntervalMinutes,
        notifyCustomer,
        autoSelectSupplier,
        prioritizationStrategy
      },
      status: 'active'
    });
  } catch (error) {
    console.error('Error scheduling order fulfillment:', error);
    res.status(500).json({ 
      error: 'Failed to schedule order fulfillment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;