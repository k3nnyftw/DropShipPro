import { Router, Request, Response } from 'express';
import * as demandForecasting from '../services/demand-forecasting';

const router = Router();

/**
 * GET /api/forecasting/products
 * Generate demand forecasts for all products
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const options = {
      confidenceThreshold: req.query.confidence ? parseFloat(req.query.confidence as string) : undefined,
      timeHorizon: req.query.timeHorizon ? parseInt(req.query.timeHorizon as string) : undefined,
      includeMarketAnalysis: req.query.includeMarket !== 'false',
      includeCompetitorAnalysis: req.query.includeCompetitors !== 'false',
      includeSeasonality: req.query.includeSeasonality !== 'false'
    };
    
    const forecasts = await demandForecasting.generateProductDemandForecasts(options);
    
    res.json({
      count: forecasts.length,
      forecasts
    });
  } catch (error) {
    console.error('Error generating demand forecasts:', error);
    res.status(500).json({ 
      error: 'Failed to generate demand forecasts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/forecasting/products/:productId
 * Generate demand forecast for a specific product
 */
router.get('/products/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }
    
    const options = {
      confidenceThreshold: req.query.confidence ? parseFloat(req.query.confidence as string) : undefined,
      timeHorizon: req.query.timeHorizon ? parseInt(req.query.timeHorizon as string) : undefined,
      includeMarketAnalysis: req.query.includeMarket !== 'false',
      includeCompetitorAnalysis: req.query.includeCompetitors !== 'false',
      includeSeasonality: req.query.includeSeasonality !== 'false'
    };
    
    const forecast = await demandForecasting.generateProductDemandForecast(productId, options);
    
    res.json(forecast);
  } catch (error) {
    console.error('Error generating demand forecast:', error);
    res.status(500).json({ 
      error: 'Failed to generate demand forecast',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/forecasting/apply/:forecastId
 * Apply insights from a specific forecast
 */
router.post('/apply/:forecastId', async (req: Request, res: Response) => {
  try {
    const forecastId = parseInt(req.params.forecastId);
    
    if (isNaN(forecastId)) {
      return res.status(400).json({ 
        error: 'Invalid forecast ID',
        message: 'Forecast ID must be a number'
      });
    }
    
    const result = await demandForecasting.applyDemandForecastInsights(forecastId);
    
    res.json(result);
  } catch (error) {
    console.error('Error applying forecast insights:', error);
    res.status(500).json({ 
      error: 'Failed to apply forecast insights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/forecasting/schedule
 * Schedule automatic demand forecasting
 */
router.post('/schedule', async (req: Request, res: Response) => {
  try {
    const { 
      intervalHours = 24,
      autoApply = true
    } = req.body;
    
    // Validate input parameters
    if (typeof intervalHours !== 'number' || intervalHours < 1) {
      return res.status(400).json({
        error: 'Invalid interval',
        message: 'Interval must be a positive number in hours (minimum 1)'
      });
    }
    
    if (typeof autoApply !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid autoApply parameter',
        message: 'autoApply must be a boolean value'
      });
    }
    
    // In a real application, you would store this configuration in a database
    // and potentially cancel any existing scheduled forecasting
    
    // Call the service to schedule automatic forecasting
    demandForecasting.scheduleAutomaticForecasting(intervalHours, autoApply);
    
    res.json({
      message: `Automatic demand forecasting scheduled every ${intervalHours} hours`,
      settings: {
        intervalHours,
        autoApply
      },
      status: 'active'
    });
  } catch (error) {
    console.error('Error scheduling demand forecasting:', error);
    res.status(500).json({ 
      error: 'Failed to schedule demand forecasting',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;