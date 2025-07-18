import express from 'express';
import { storage } from '../storage';
import { profileSetupSchema } from '../../shared/schema';
import { z } from 'zod';

const router = express.Router();

// Get AI recommendations based on user profile
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate AI recommendations based on user profile
    const recommendations = await generateAIRecommendations(user);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Profile recommendations error:', error);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

// Update user profile
router.put('/setup', async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate profile data
    const profileData = profileSetupSchema.parse(req.body);
    
    // Update user profile
    const updatedUser = await storage.updateUserProfile(userId, profileData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid profile data', 
        errors: error.errors 
      });
    }
    console.error('Profile setup error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get profile completion status
router.get('/status', async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      profileCompleted: user.profileCompleted || false,
      hasBusinessName: !!user.businessName,
      hasBusinessType: !!user.businessType,
      hasExperience: !!user.experience,
      hasTargetMarkets: !!user.targetMarkets?.length,
      hasInterests: !!user.interests?.length
    });
  } catch (error) {
    console.error('Profile status error:', error);
    res.status(500).json({ message: 'Failed to get profile status' });
  }
});

// Generate AI recommendations based on user profile
async function generateAIRecommendations(user: any) {
  const recommendations = {
    businessSetup: [],
    productCategories: [],
    suppliers: [],
    targetMarkets: [],
    budgetOptimization: [],
    nextSteps: []
  };
  
  // Business setup recommendations
  if (user.experience === 'beginner') {
    recommendations.businessSetup.push({
      title: "Start with a niche market",
      description: "Focus on 1-2 product categories to build expertise and customer base",
      priority: "high",
      category: "strategy"
    });
    recommendations.businessSetup.push({
      title: "Set up basic analytics",
      description: "Track your key metrics from day one to make data-driven decisions",
      priority: "medium",
      category: "tools"
    });
  }
  
  // Product category recommendations based on interests
  if (user.interests?.includes('electronics')) {
    recommendations.productCategories.push({
      title: "Trending Electronics",
      description: "Wireless earbuds, smart home devices, and phone accessories are trending",
      categories: ["Audio", "Smart Home", "Mobile Accessories"],
      profitMargin: "25-40%",
      competition: "High"
    });
  }
  
  if (user.interests?.includes('fashion')) {
    recommendations.productCategories.push({
      title: "Fashion Accessories",
      description: "Watches, jewelry, and bags offer good profit margins with lower competition",
      categories: ["Watches", "Jewelry", "Bags"],
      profitMargin: "40-60%",
      competition: "Medium"
    });
  }
  
  // Supplier recommendations based on business type and target markets
  if (user.targetMarkets?.includes('US')) {
    recommendations.suppliers.push({
      name: "AliExpress Premium",
      description: "Fast shipping to US with 7-15 day delivery",
      shippingTime: "7-15 days",
      reliability: "High",
      benefits: ["ePacket shipping", "Buyer protection", "Wide selection"]
    });
  }
  
  // Budget optimization recommendations
  if (user.monthlyBudget) {
    const budget = parseFloat(user.monthlyBudget);
    if (budget < 500) {
      recommendations.budgetOptimization.push({
        title: "Focus on organic marketing",
        description: "Leverage social media and content marketing to minimize ad spend",
        estimatedCost: "$0-50/month",
        expectedROI: "3-5x"
      });
    } else if (budget >= 500 && budget < 2000) {
      recommendations.budgetOptimization.push({
        title: "Balanced paid advertising",
        description: "Allocate 60% to ads, 40% to inventory and tools",
        estimatedCost: "$300-1200/month",
        expectedROI: "4-6x"
      });
    }
  }
  
  // Next steps based on profile completion
  if (user.businessType && user.experience) {
    recommendations.nextSteps.push({
      title: "Set up your store",
      description: "Create your online store with automated product imports",
      timeEstimate: "2-3 hours",
      difficulty: "Easy"
    });
    
    recommendations.nextSteps.push({
      title: "Import your first products",
      description: "Use our AI to find trending products in your niche",
      timeEstimate: "1-2 hours",
      difficulty: "Easy"
    });
  }
  
  return recommendations;
}

export default router;