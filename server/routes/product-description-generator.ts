import { Router, Request, Response } from 'express';
import * as descriptionGenerator from '../services/product-description-generator';

const router = Router();

/**
 * POST /api/descriptions/generate/:productId
 * Generate AI description for a specific product
 */
router.post('/generate/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }
    
    const options = req.body;
    const description = await descriptionGenerator.generateProductDescription(productId, options);
    
    res.json(description);
  } catch (error) {
    console.error('Error generating product description:', error);
    res.status(500).json({ 
      error: 'Failed to generate product description',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/descriptions/batch
 * Generate descriptions for multiple products in batch
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { productIds, options } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid product IDs',
        message: 'Product IDs must be a non-empty array of numbers'
      });
    }
    
    if (productIds.some(id => isNaN(parseInt(id)))) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'All product IDs must be numbers'
      });
    }
    
    const descriptions = await descriptionGenerator.batchGenerateDescriptions(
      productIds.map(id => parseInt(id)),
      options
    );
    
    res.json({ descriptions });
  } catch (error) {
    console.error('Error generating batch descriptions:', error);
    res.status(500).json({ 
      error: 'Failed to generate batch descriptions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/descriptions/category/:category
 * Generate descriptions for all products in a category
 */
router.post('/category/:category', async (req: Request, res: Response) => {
  try {
    const category = req.params.category;
    const options = req.body;
    
    if (!category) {
      return res.status(400).json({ 
        error: 'Invalid category',
        message: 'Category must be specified'
      });
    }
    
    const descriptions = await descriptionGenerator.generateCategoryDescriptions(category, options);
    
    res.json({ 
      category,
      count: descriptions.length,
      descriptions 
    });
  } catch (error) {
    console.error('Error generating category descriptions:', error);
    res.status(500).json({ 
      error: 'Failed to generate category descriptions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/descriptions/analyze/:productId
 * Analyze existing product description and suggest improvements
 */
router.get('/analyze/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }
    
    const analysis = await descriptionGenerator.analyzeProductDescription(productId);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing product description:', error);
    res.status(500).json({ 
      error: 'Failed to analyze product description',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;