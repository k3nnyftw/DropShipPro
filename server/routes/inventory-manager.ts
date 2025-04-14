import { Router, Request, Response } from 'express';
import * as inventoryManager from '../services/inventory-manager';

const router = Router();

/**
 * GET /api/inventory/status
 * Get inventory status for all products
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const inventoryStatus = await inventoryManager.analyzeInventoryStatus();
    
    res.json(inventoryStatus);
  } catch (error) {
    console.error('Error analyzing inventory status:', error);
    res.status(500).json({ 
      error: 'Failed to analyze inventory status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/inventory/predictions
 * Get inventory predictions for future needs
 */
router.get('/predictions', async (req: Request, res: Response) => {
  try {
    // Parse product IDs if provided
    const productIdsParam = req.query.productIds as string | undefined;
    const productIds = productIdsParam ? productIdsParam.split(',').map(id => parseInt(id)) : undefined;
    
    const predictions = await inventoryManager.predictInventoryNeeds(productIds);
    
    res.json(predictions);
  } catch (error) {
    console.error('Error predicting inventory needs:', error);
    res.status(500).json({ 
      error: 'Failed to predict inventory needs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/inventory/auto-reorder
 * Automatically reorder products that are below reorder threshold
 */
router.post('/auto-reorder', async (req: Request, res: Response) => {
  try {
    const reorderResults = await inventoryManager.autoReorderProducts();
    
    res.json({
      totalProducts: reorderResults.length,
      successCount: reorderResults.filter(r => r.success).length,
      failureCount: reorderResults.filter(r => !r.success).length,
      results: reorderResults
    });
  } catch (error) {
    console.error('Error auto-reordering products:', error);
    res.status(500).json({ 
      error: 'Failed to auto-reorder products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/inventory/:productId
 * Update inventory level for a specific product
 */
router.put('/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    const { quantityChange, reason } = req.body;
    
    if (isNaN(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }
    
    if (typeof quantityChange !== 'number') {
      return res.status(400).json({ 
        error: 'Invalid quantity change',
        message: 'Quantity change must be a number'
      });
    }
    
    if (!['sale', 'return', 'restock', 'adjustment'].includes(reason)) {
      return res.status(400).json({ 
        error: 'Invalid reason',
        message: "Reason must be one of: 'sale', 'return', 'restock', 'adjustment'"
      });
    }
    
    const updatedProduct = await inventoryManager.updateInventory(
      productId,
      quantityChange,
      reason
    );
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ 
      error: 'Failed to update inventory',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/inventory/schedule
 * Schedule automatic inventory management
 */
router.post('/schedule', async (req: Request, res: Response) => {
  try {
    const { reorderIntervalHours = 24 } = req.body;
    
    // In a real application, you would store this in a database
    // and use a proper job scheduler
    
    // For this demo, we'll just start the interval
    inventoryManager.scheduleInventoryManagement(reorderIntervalHours);
    
    res.json({
      message: `Automatic inventory management scheduled every ${reorderIntervalHours} hours`,
      status: 'active'
    });
  } catch (error) {
    console.error('Error scheduling inventory management:', error);
    res.status(500).json({ 
      error: 'Failed to schedule inventory management',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;