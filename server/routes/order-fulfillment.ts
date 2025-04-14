import { Router, Request, Response } from 'express';
import * as orderFulfillmentService from '../services/order-fulfillment';

const router = Router();

/**
 * POST /api/fulfillment/fulfill/:orderId
 * Fulfill a specific order
 */
router.post('/fulfill/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { supplierIds, fulfillmentMode } = req.body;
    
    if (isNaN(orderId)) {
      return res.status(400).json({ 
        error: 'Invalid order ID',
        message: 'Order ID must be a number'
      });
    }
    
    const fulfillmentResponse = await orderFulfillmentService.fulfillOrder({
      orderId,
      supplierIds,
      fulfillmentMode
    });
    
    res.json(fulfillmentResponse);
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
    
    const trackingResponse = await orderFulfillmentService.trackOrderFulfillment(orderId);
    
    res.json(trackingResponse);
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
    const fulfillmentResponses = await orderFulfillmentService.autoFulfillPendingOrders();
    
    res.json({
      processedCount: fulfillmentResponses.length,
      successCount: fulfillmentResponses.filter(resp => resp.status === 'success').length,
      partialCount: fulfillmentResponses.filter(resp => resp.status === 'partial').length,
      failedCount: fulfillmentResponses.filter(resp => resp.status === 'failed').length,
      results: fulfillmentResponses
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
    const { intervalMinutes = 15 } = req.body;
    
    // In a real application, you would store this in a database
    // and use a proper job scheduler
    
    // For this demo, we'll just start the interval
    orderFulfillmentService.scheduleAutoFulfillment(intervalMinutes);
    
    res.json({
      message: `Automatic order fulfillment scheduled every ${intervalMinutes} minutes`,
      status: 'active'
    });
  } catch (error) {
    console.error('Error scheduling auto-fulfillment:', error);
    res.status(500).json({ 
      error: 'Failed to schedule auto-fulfillment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;