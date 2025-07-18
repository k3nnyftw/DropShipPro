import express from 'express';
import * as supplierAutomation from '../services/supplier-automation';

const router = express.Router();

/**
 * POST /api/supplier-automation/find-suppliers
 * Find suppliers for a specific product
 */
router.post('/find-suppliers', async (req, res) => {
  try {
    const { productName, category, targetMarkets, maxBudget } = req.body;
    
    if (!productName || !category) {
      return res.status(400).json({ 
        message: 'Product name and category are required' 
      });
    }
    
    const supplierMatches = await supplierAutomation.findSuppliersForProduct(
      productName,
      category,
      targetMarkets || ['US'],
      maxBudget || 100
    );
    
    res.json(supplierMatches);
  } catch (error) {
    console.error('Error finding suppliers:', error);
    res.status(500).json({ 
      message: 'Failed to find suppliers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/supplier-automation/evaluate/:supplierId
 * Evaluate a specific supplier
 */
router.get('/evaluate/:supplierId', async (req, res) => {
  try {
    const supplierId = parseInt(req.params.supplierId);
    
    if (isNaN(supplierId)) {
      return res.status(400).json({ 
        message: 'Invalid supplier ID' 
      });
    }
    
    const evaluation = await supplierAutomation.evaluateSupplier(supplierId);
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating supplier:', error);
    res.status(500).json({ 
      message: 'Failed to evaluate supplier',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/supplier-automation/metrics/:supplierId
 * Get performance metrics for a supplier
 */
router.get('/metrics/:supplierId', async (req, res) => {
  try {
    const supplierId = parseInt(req.params.supplierId);
    
    if (isNaN(supplierId)) {
      return res.status(400).json({ 
        message: 'Invalid supplier ID' 
      });
    }
    
    const metrics = await supplierAutomation.updateSupplierMetrics(supplierId);
    
    res.json(metrics);
  } catch (error) {
    console.error('Error getting supplier metrics:', error);
    res.status(500).json({ 
      message: 'Failed to get supplier metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/supplier-automation/recommendations
 * Get supplier recommendations based on user profile
 */
router.post('/recommendations', async (req, res) => {
  try {
    const userProfile = req.body;
    
    const recommendations = await supplierAutomation.recommendSuppliersForProfile(userProfile);
    
    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Error getting supplier recommendations:', error);
    res.status(500).json({ 
      message: 'Failed to get supplier recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;