import { Router, Request, Response } from 'express';
import * as socialMediaSharing from '../services/social-media-sharing';
import { SocialPlatform, PostType } from '../services/social-media-sharing';

const router = Router();

/**
 * POST /api/social-media/generate/:productId
 * Generate optimized social media content for a product
 */
router.post('/generate/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    const { platform, options } = req.body;
    
    if (isNaN(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }
    
    if (!platform || !Object.values(SocialPlatform).includes(platform)) {
      return res.status(400).json({
        error: 'Invalid platform',
        message: `Platform must be one of: ${Object.values(SocialPlatform).join(', ')}`
      });
    }
    
    const content = await socialMediaSharing.generateSocialContent(
      productId,
      platform,
      options
    );
    
    res.json(content);
  } catch (error) {
    console.error('Error generating social content:', error);
    res.status(500).json({
      error: 'Failed to generate social content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/social-media/share-now/:productId
 * Share a product to multiple social media platforms immediately
 */
router.post('/share-now/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    const { platforms, options } = req.body;
    
    if (isNaN(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }
    
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({
        error: 'Invalid platforms',
        message: 'Platforms must be a non-empty array'
      });
    }
    
    // Validate each platform
    for (const platform of platforms) {
      if (!Object.values(SocialPlatform).includes(platform)) {
        return res.status(400).json({
          error: 'Invalid platform',
          message: `Platform must be one of: ${Object.values(SocialPlatform).join(', ')}`
        });
      }
    }
    
    const results = await socialMediaSharing.shareProductNow(
      productId,
      platforms,
      options
    );
    
    res.json({
      success: results.some(r => r.success),
      results
    });
  } catch (error) {
    console.error('Error sharing product:', error);
    res.status(500).json({
      error: 'Failed to share product',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/social-media/schedule/:productId
 * Schedule social media posts for a product across multiple platforms
 */
router.post('/schedule/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    const { platforms, scheduledTime, options } = req.body;
    
    if (isNaN(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Product ID must be a number'
      });
    }
    
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({
        error: 'Invalid platforms',
        message: 'Platforms must be a non-empty array'
      });
    }
    
    if (!scheduledTime) {
      return res.status(400).json({
        error: 'Invalid scheduled time',
        message: 'Scheduled time is required'
      });
    }
    
    // Parse the scheduled time
    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid scheduled time',
        message: 'Scheduled time must be a valid date format'
      });
    }
    
    // Validate each platform
    for (const platform of platforms) {
      if (!Object.values(SocialPlatform).includes(platform)) {
        return res.status(400).json({
          error: 'Invalid platform',
          message: `Platform must be one of: ${Object.values(SocialPlatform).join(', ')}`
        });
      }
    }
    
    const scheduledPosts = await socialMediaSharing.scheduleProductPosts(
      productId,
      platforms,
      scheduledDate,
      options
    );
    
    res.json({
      success: scheduledPosts.length > 0,
      count: scheduledPosts.length,
      scheduledPosts
    });
  } catch (error) {
    console.error('Error scheduling posts:', error);
    res.status(500).json({
      error: 'Failed to schedule posts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/social-media/scheduled
 * Get scheduled social media posts with optional filters
 */
router.get('/scheduled', async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const platform = req.query.platform as SocialPlatform | undefined;
    
    // Validate dates if provided
    if (startDate && isNaN(startDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid start date',
        message: 'Start date must be a valid date format'
      });
    }
    
    if (endDate && isNaN(endDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid end date',
        message: 'End date must be a valid date format'
      });
    }
    
    // Validate platform if provided
    if (platform && !Object.values(SocialPlatform).includes(platform)) {
      return res.status(400).json({
        error: 'Invalid platform',
        message: `Platform must be one of: ${Object.values(SocialPlatform).join(', ')}`
      });
    }
    
    const scheduledPosts = await socialMediaSharing.getScheduledPosts(
      startDate,
      endDate,
      platform
    );
    
    res.json({
      count: scheduledPosts.length,
      scheduledPosts
    });
  } catch (error) {
    console.error('Error getting scheduled posts:', error);
    res.status(500).json({
      error: 'Failed to get scheduled posts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/social-media/analytics
 * Get social media performance analytics
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const analytics = await socialMediaSharing.getSocialMediaAnalytics();
    
    res.json(analytics);
  } catch (error) {
    console.error('Error getting social media analytics:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/social-media/optimal-times
 * Get optimal posting times by platform based on past performance
 */
router.get('/optimal-times', async (req: Request, res: Response) => {
  try {
    const optimalTimes = await socialMediaSharing.getOptimalPostingTimes();
    
    res.json(optimalTimes);
  } catch (error) {
    console.error('Error getting optimal posting times:', error);
    res.status(500).json({
      error: 'Failed to get optimal posting times',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;