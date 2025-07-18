import { Router, Request, Response } from 'express';
import * as aiAnalyticsService from '../services/ai-analytics';

const router = Router();

/**
 * GET /api/ai-analytics/trending-products
 * Returns trending products based on AI analytics
 */
router.get('/trending-products', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const category = req.query.category as string | undefined;
    
    const trendingProducts = await aiAnalyticsService.findTrendingProducts(limit, category);
    
    res.json(trendingProducts);
  } catch (error) {
    console.error('Error fetching trending products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trending products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai-analytics/market-insights/:category
 * Returns market insights for a specific category
 */
router.get('/market-insights/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    const insights = await aiAnalyticsService.getMarketInsights(category);
    
    res.json(insights);
  } catch (error) {
    console.error('Error fetching market insights:', error);
    res.status(500).json({ 
      error: 'Failed to fetch market insights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai-analytics/product-trend/:productName
 * Analyzes trend data for a specific product
 */
router.get('/product-trend', async (req: Request, res: Response) => {
  try {
    const productName = req.query.productName as string;
    const category = req.query.category as string;
    
    if (!productName || !category) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'Product name and category are required'
      });
    }
    
    const trendData = await aiAnalyticsService.analyzeProductTrend(productName, category);
    
    res.json(trendData);
  } catch (error) {
    console.error('Error analyzing product trend:', error);
    res.status(500).json({ 
      error: 'Failed to analyze product trend',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai-analytics/discover-products
 * Automatically discovers profitable products based on user preferences
 */
router.post('/discover-products', async (req: Request, res: Response) => {
  try {
    const userPreferences = req.body;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const discoveredProducts = await aiAnalyticsService.discoverProfitableProducts(userPreferences, limit);
    
    res.json({
      success: true,
      count: discoveredProducts.length,
      products: discoveredProducts
    });
  } catch (error) {
    console.error('Error discovering products:', error);
    res.status(500).json({ 
      error: 'Failed to discover products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai-analytics/sales-projections/:productId
 * Returns sales projections for a product
 */
router.get('/sales-projections/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }
    
    const projections = await aiAnalyticsService.generateSalesProjections(productId);
    
    res.json(projections);
  } catch (error) {
    console.error('Error generating sales projections:', error);
    res.status(500).json({ 
      error: 'Failed to generate sales projections',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai-analytics/product-opportunities
 * Returns product opportunities based on market gaps
 */
router.get('/product-opportunities', async (req: Request, res: Response) => {
  try {
    const categoriesParam = req.query.categories as string | undefined;
    const categories = categoriesParam ? categoriesParam.split(',') : [];
    
    const opportunities = await aiAnalyticsService.identifyProductOpportunities(categories);
    
    res.json(opportunities);
  } catch (error) {
    console.error('Error identifying product opportunities:', error);
    res.status(500).json({ 
      error: 'Failed to identify product opportunities',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai-analytics/automated-recommendations
 * Returns automated product recommendations for the store
 */
router.get('/automated-recommendations', async (req: Request, res: Response) => {
  try {
    const categoriesParam = req.query.categories as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    const categories = categoriesParam ? categoriesParam.split(',') : [];
    const recommendations = await aiAnalyticsService.getAutomatedProductRecommendations(categories, limit);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting automated recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get automated recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;