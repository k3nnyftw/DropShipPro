/**
 * Social Media Accounts Management Routes
 * 
 * Handles connecting, disconnecting, and managing social media platform integrations,
 * as well as retrieving account details.
 */

import express, { Request, Response, Router } from 'express';
import * as socialMediaService from '../services/social-media-sharing';

const router: Router = express.Router();

/**
 * GET /api/social-media/accounts
 * Get all connected social media accounts
 */
router.get('/accounts', async (req: Request, res: Response) => {
  try {
    const accounts = await socialMediaService.getConnectedAccounts();
    
    res.json({
      count: accounts.length,
      accounts
    });
  } catch (error) {
    console.error('Error getting connected accounts:', error);
    res.status(500).json({
      error: 'Failed to get connected accounts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/social-media/accounts/connect
 * Connect a new social media account
 */
router.post('/accounts/connect', async (req: Request, res: Response) => {
  try {
    const { platform, username, accessToken } = req.body;
    
    // Validate required fields
    if (!platform || !username) {
      return res.status(400).json({
        error: 'Invalid account data',
        message: 'Account requires platform and username'
      });
    }
    
    const newAccount = await socialMediaService.connectSocialAccount({
      platform,
      username,
      accessToken
    });
    
    res.status(201).json(newAccount);
  } catch (error) {
    console.error('Error connecting social account:', error);
    res.status(500).json({
      error: 'Failed to connect social account',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /api/social-media/accounts/:id
 * Update social media account status
 */
router.patch('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const accountId = parseInt(req.params.id);
    const { active } = req.body;
    
    if (isNaN(accountId)) {
      return res.status(400).json({
        error: 'Invalid account ID',
        message: 'Account ID must be a number'
      });
    }
    
    if (typeof active !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Active status must be a boolean'
      });
    }
    
    const updatedAccount = await socialMediaService.updateSocialAccountStatus(accountId, active);
    
    res.json(updatedAccount);
  } catch (error) {
    console.error('Error updating social account:', error);
    res.status(500).json({
      error: 'Failed to update social account',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/social-media/accounts/:id
 * Disconnect a social media account
 */
router.delete('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const accountId = parseInt(req.params.id);
    
    if (isNaN(accountId)) {
      return res.status(400).json({
        error: 'Invalid account ID',
        message: 'Account ID must be a number'
      });
    }
    
    await socialMediaService.disconnectSocialAccount(accountId);
    
    res.json({
      success: true,
      message: 'Social media account has been disconnected'
    });
  } catch (error) {
    console.error('Error disconnecting social account:', error);
    res.status(500).json({
      error: 'Failed to disconnect social account',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;