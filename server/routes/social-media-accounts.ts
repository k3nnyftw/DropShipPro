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
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching social media accounts:', error);
    res.status(500).json({ 
      message: 'Failed to fetch social media accounts', 
      error: error instanceof Error ? error.message : String(error) 
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
    
    if (!platform || !username) {
      return res.status(400).json({ 
        message: 'Platform and username are required'
      });
    }
    
    const account = await socialMediaService.connectSocialAccount({
      platform,
      username,
      accessToken
    });
    
    res.status(201).json(account);
  } catch (error) {
    console.error('Error connecting social media account:', error);
    res.status(500).json({ 
      message: 'Failed to connect social media account', 
      error: error instanceof Error ? error.message : String(error) 
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
    
    if (active === undefined) {
      return res.status(400).json({ 
        message: 'Active status is required'
      });
    }
    
    const updatedAccount = await socialMediaService.updateSocialAccountStatus(
      accountId, 
      active
    );
    
    res.json(updatedAccount);
  } catch (error) {
    console.error('Error updating social media account:', error);
    res.status(500).json({ 
      message: 'Failed to update social media account', 
      error: error instanceof Error ? error.message : String(error) 
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
    
    await socialMediaService.disconnectSocialAccount(accountId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error disconnecting social media account:', error);
    res.status(500).json({ 
      message: 'Failed to disconnect social media account', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;