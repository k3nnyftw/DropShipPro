import { Router, Request, Response } from 'express';
import * as competitorTracking from '../services/competitor-tracking';

const router = Router();

/**
 * GET /api/competitors/prices/:productId
 * Get current competitor prices for a specific product
 */
router.get('/prices/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }
    
    const prices = await competitorTracking.getCompetitorPrices(productId);
    
    res.json(prices);
  } catch (error) {
    console.error('Error fetching competitor prices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch competitor prices',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitors/history/:productId
 * Get competitor price history for a specific product
 */
router.get('/history/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    const competitorId = req.query.competitorId ? parseInt(req.query.competitorId as string) : undefined;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    
    if (isNaN(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }
    
    if (req.query.competitorId && isNaN(competitorId as number)) {
      return res.status(400).json({ 
        error: 'Invalid competitor ID',
        message: 'Competitor ID must be a number'
      });
    }
    
    if (req.query.days && isNaN(days)) {
      return res.status(400).json({ 
        error: 'Invalid days parameter',
        message: 'Days must be a number'
      });
    }
    
    const history = await competitorTracking.getCompetitorPriceHistory(productId, competitorId, days);
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching competitor price history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch competitor price history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitors/analysis/:productId
 * Get competitive analysis for a specific product
 */
router.get('/analysis/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }
    
    const analysis = await competitorTracking.performCompetitiveAnalysis(productId);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error performing competitive analysis:', error);
    res.status(500).json({ 
      error: 'Failed to perform competitive analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/competitors/alerts/configure
 * Configure real-time price alerts
 */
router.post('/alerts/configure', async (req: Request, res: Response) => {
  try {
    const { 
      alertThresholdPercentage = 5,
      checkIntervalMinutes = 60,
      productIds
    } = req.body;
    
    if (alertThresholdPercentage <= 0 || alertThresholdPercentage > 50) {
      return res.status(400).json({
        error: 'Invalid alert threshold',
        message: 'Alert threshold must be between 0 and 50 percent'
      });
    }
    
    if (checkIntervalMinutes < 1) {
      return res.status(400).json({
        error: 'Invalid check interval',
        message: 'Check interval must be at least 1 minute'
      });
    }
    
    if (productIds && !Array.isArray(productIds)) {
      return res.status(400).json({
        error: 'Invalid product IDs',
        message: 'Product IDs must be an array of numbers'
      });
    }
    
    // In a real implementation, we would store the configuration in a database
    // and cancel any existing alert monitoring
    
    // Configure the alerts
    competitorTracking.configurePriceAlerts({
      alertThresholdPercentage,
      checkIntervalMinutes,
      productIds
    });
    
    res.json({
      message: 'Price alerts configured successfully',
      configuration: {
        alertThresholdPercentage,
        checkIntervalMinutes,
        productIds: productIds ? productIds.length : 'all products'
      }
    });
  } catch (error) {
    console.error('Error configuring price alerts:', error);
    res.status(500).json({ 
      error: 'Failed to configure price alerts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/competitors/prices/auto-adjust
 * Automatically adjust prices based on competitor data
 */
router.post('/prices/auto-adjust', async (req: Request, res: Response) => {
  try {
    const { 
      productIds,
      maxAdjustmentPercent = 10
    } = req.body;
    
    if (productIds && !Array.isArray(productIds)) {
      return res.status(400).json({
        error: 'Invalid product IDs',
        message: 'Product IDs must be an array of numbers'
      });
    }
    
    if (maxAdjustmentPercent <= 0 || maxAdjustmentPercent > 50) {
      return res.status(400).json({
        error: 'Invalid maximum adjustment percentage',
        message: 'Maximum adjustment percentage must be between 0 and 50 percent'
      });
    }
    
    const result = await competitorTracking.autoAdjustPricesBasedOnCompetitors(
      productIds,
      maxAdjustmentPercent
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error auto-adjusting prices:', error);
    res.status(500).json({ 
      error: 'Failed to auto-adjust prices',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;