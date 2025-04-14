import { Router, Request, Response } from 'express';
import * as demandForecasting from '../services/demand-forecasting';

const router = Router();

/**
 * GET /api/forecasting/products
 * Generate demand forecasts for all products
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const forecasts = await demandForecasting.generateForecasts();
    res.json({ forecasts });
  } catch (error) {
    console.error('Error generating forecasts:', error);
    res.status(500).json({ 
      error: 'Failed to generate forecasts',
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
    
    const forecast = await demandForecasting.generateForecastForProduct(productId);
    res.json(forecast);
  } catch (error) {
    console.error('Error generating forecast for product:', error);
    res.status(500).json({ 
      error: 'Failed to generate forecast for product',
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
    
    const result = await demandForecasting.applyForecastInsights(forecastId);
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
      autoApply = false
    } = req.body;
    
    if (intervalHours < 1) {
      return res.status(400).json({
        error: 'Invalid interval',
        message: 'Interval must be at least 1 hour'
      });
    }
    
    const result = await demandForecasting.scheduleForecasting(intervalHours, autoApply);
    res.json(result);
  } catch (error) {
    console.error('Error scheduling forecasting:', error);
    res.status(500).json({ 
      error: 'Failed to schedule forecasting',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;