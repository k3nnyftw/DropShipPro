import { Router, Request, Response } from 'express';
import * as priceOptimizerService from '../services/price-optimizer';

const router = Router();

/**
 * GET /api/price-optimizer/:productId
 * Gets optimized price recommendation for a specific product
 */
router.get('/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    const targetProfitMargin = req.query.targetProfit ? parseFloat(req.query.targetProfit as string) / 100 : undefined;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    
    // Parse competitor prices if provided
    let competitorPrices: number[] | undefined;
    if (req.query.competitorPrices) {
      competitorPrices = (req.query.competitorPrices as string).split(',').map(p => parseFloat(p));
    }
    
    if (isNaN(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }
    
    const priceRecommendation = await priceOptimizerService.getOptimizedPrice({
      productId,
      targetProfitMargin,
      minimumPrice: minPrice,
      maximumPrice: maxPrice,
      competitorPrices
    });
    
    // Get analysis for the recommendation
    const analysis = priceOptimizerService.analyzePriceRecommendation(priceRecommendation);
    
    res.json({
      recommendation: priceRecommendation,
      analysis
    });
  } catch (error) {
    console.error('Error generating price optimization:', error);
    res.status(500).json({ 
      error: 'Failed to generate price optimization',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/price-optimizer/store/all
 * Analyzes and optimizes prices for all products in the store
 */
router.get('/store/all', async (req: Request, res: Response) => {
  try {
    const targetProfitMargin = req.query.targetProfit ? parseFloat(req.query.targetProfit as string) / 100 : undefined;
    
    const recommendations = await priceOptimizerService.optimizeStoreWidepricing(targetProfitMargin);
    
    res.json({
      recommendationCount: recommendations.length,
      recommendations: recommendations.slice(0, 10), // Return top 10 for performance
      totalPotentialProfit: recommendations.reduce((sum, rec) => sum + rec.potentialProfit, 0)
    });
  } catch (error) {
    console.error('Error generating store-wide price optimizations:', error);
    res.status(500).json({ 
      error: 'Failed to generate store-wide price optimizations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/price-optimizer/auto-apply
 * Automatically applies price optimizations to specified products
 */
router.post('/auto-apply', async (req: Request, res: Response) => {
  try {
    const { productIds, targetProfitMargin } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Product IDs array is required'
      });
    }
    
    const result = await priceOptimizerService.autoApplyPriceOptimizations(
      productIds,
      targetProfitMargin
    );
    
    res.json({
      success: result.success,
      failed: result.failed,
      products: result.products
    });
  } catch (error) {
    console.error('Error applying price optimizations:', error);
    res.status(500).json({ 
      error: 'Failed to apply price optimizations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/price-optimizer/schedule
 * Schedules automatic price optimizations
 */
router.post('/schedule', async (req: Request, res: Response) => {
  try {
    const { intervalHours = 24, targetProfitMargin = 0.3 } = req.body;
    
    // In a real application, you would store this in a database
    // and use a proper job scheduler
    
    // For this demo, we'll just start the interval
    priceOptimizerService.scheduleAutomaticPriceOptimizations(
      intervalHours,
      targetProfitMargin
    );
    
    res.json({
      message: `Price optimization scheduled every ${intervalHours} hours with target profit margin of ${(targetProfitMargin * 100).toFixed(1)}%`,
      status: 'active'
    });
  } catch (error) {
    console.error('Error scheduling price optimizations:', error);
    res.status(500).json({ 
      error: 'Failed to schedule price optimizations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;