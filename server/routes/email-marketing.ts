import { Router, Request, Response } from 'express';
import * as emailMarketing from '../services/email-marketing';
import { CustomerSegment, CampaignType } from '../services/email-marketing';

const router = Router();

/**
 * GET /api/email-marketing/segments/:segmentType
 * Get customers in a specific segment
 */
router.get('/segments/:segmentType', async (req: Request, res: Response) => {
  try {
    const segmentType = req.params.segmentType as CustomerSegment;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    
    if (!Object.values(CustomerSegment).includes(segmentType)) {
      return res.status(400).json({
        error: 'Invalid segment type',
        message: `Segment type must be one of: ${Object.values(CustomerSegment).join(', ')}`
      });
    }
    
    const customers = await emailMarketing.getCustomerSegment(segmentType, limit);
    
    res.json({
      segment: segmentType,
      count: customers.length,
      customers
    });
  } catch (error) {
    console.error('Error getting customer segment:', error);
    res.status(500).json({
      error: 'Failed to get customer segment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/email-marketing/templates
 * Get all available email templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await emailMarketing.getEmailTemplates();
    
    res.json({
      count: templates.length,
      templates
    });
  } catch (error) {
    console.error('Error getting email templates:', error);
    res.status(500).json({
      error: 'Failed to get email templates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/email-marketing/campaigns
 * Create a new email campaign
 */
router.post('/campaigns', async (req: Request, res: Response) => {
  try {
    const campaignData = req.body;
    
    // Validate required fields
    if (!campaignData.name || !campaignData.subject || !campaignData.templateId || !campaignData.segment) {
      return res.status(400).json({
        error: 'Invalid campaign data',
        message: 'Campaign requires name, subject, templateId, and segment'
      });
    }
    
    // Ensure segment is valid
    if (!Object.values(CustomerSegment).includes(campaignData.segment)) {
      return res.status(400).json({
        error: 'Invalid segment',
        message: `Segment must be one of: ${Object.values(CustomerSegment).join(', ')}`
      });
    }
    
    const newCampaign = await emailMarketing.createEmailCampaign(campaignData);
    
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error('Error creating email campaign:', error);
    res.status(500).json({
      error: 'Failed to create email campaign',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/email-marketing/campaigns/active
 * Get all active email campaigns
 */
router.get('/campaigns/active', async (req: Request, res: Response) => {
  try {
    const campaigns = await emailMarketing.getActiveEmailCampaigns();
    
    res.json({
      count: campaigns.length,
      campaigns
    });
  } catch (error) {
    console.error('Error getting active campaigns:', error);
    res.status(500).json({
      error: 'Failed to get active campaigns',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/email-marketing/analytics
 * Get email marketing performance analytics
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const analytics = await emailMarketing.getEmailPerformanceAnalytics();
    
    res.json(analytics);
  } catch (error) {
    console.error('Error getting email analytics:', error);
    res.status(500).json({
      error: 'Failed to get email analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/email-marketing/automated/:triggerEvent
 * Schedule an automated email campaign based on customer behavior
 */
router.post('/automated/:triggerEvent', async (req: Request, res: Response) => {
  try {
    const triggerEvent = req.params.triggerEvent as 'purchase' | 'cart_abandonment' | 'product_view' | 'signup' | 'inactivity';
    const { delay, templateId } = req.body;
    
    if (
      !['purchase', 'cart_abandonment', 'product_view', 'signup', 'inactivity'].includes(triggerEvent) ||
      typeof delay !== 'number' ||
      typeof templateId !== 'number'
    ) {
      return res.status(400).json({
        error: 'Invalid request data',
        message: 'Request requires valid triggerEvent, delay (number), and templateId (number)'
      });
    }
    
    const result = await emailMarketing.scheduleAutomatedEmail(triggerEvent, delay, templateId);
    
    res.json(result);
  } catch (error) {
    console.error('Error scheduling automated email:', error);
    res.status(500).json({
      error: 'Failed to schedule automated email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/email-marketing/campaigns/:campaignId/ab-test
 * Create an A/B test for an email campaign
 */
router.post('/campaigns/:campaignId/ab-test', async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.campaignId);
    const { variant, splitRatio } = req.body;
    
    if (
      isNaN(campaignId) ||
      !variant ||
      !variant.subject ||
      !variant.content ||
      (splitRatio !== undefined && (typeof splitRatio !== 'number' || splitRatio < 0 || splitRatio > 1))
    ) {
      return res.status(400).json({
        error: 'Invalid request data',
        message: 'Request requires valid campaignId, variant (with subject and content), and optional splitRatio (0-1)'
      });
    }
    
    const result = await emailMarketing.createEmailABTest(campaignId, variant, splitRatio);
    
    res.json(result);
  } catch (error) {
    console.error('Error creating A/B test:', error);
    res.status(500).json({
      error: 'Failed to create A/B test',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/email-marketing/personalize
 * Create a personalized email for a customer
 */
router.post('/personalize', async (req: Request, res: Response) => {
  try {
    const { templateId, customerId, personalization } = req.body;
    
    if (
      typeof templateId !== 'number' ||
      typeof customerId !== 'number' ||
      !personalization ||
      !personalization.personalizationLevel
    ) {
      return res.status(400).json({
        error: 'Invalid request data',
        message: 'Request requires templateId (number), customerId (number), and personalization (with personalizationLevel)'
      });
    }
    
    const personalizedEmail = await emailMarketing.createPersonalizedEmail(templateId, customerId, personalization);
    
    res.json(personalizedEmail);
  } catch (error) {
    console.error('Error creating personalized email:', error);
    res.status(500).json({
      error: 'Failed to create personalized email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/email-marketing/campaigns/:campaignId/analyze
 * Analyze email campaign performance and get optimization suggestions
 */
router.get('/campaigns/:campaignId/analyze', async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.campaignId);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({
        error: 'Invalid campaign ID',
        message: 'Campaign ID must be a number'
      });
    }
    
    const analysis = await emailMarketing.analyzeEmailCampaignPerformance(campaignId);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing campaign:', error);
    res.status(500).json({
      error: 'Failed to analyze campaign',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;