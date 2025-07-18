import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { storage } from '../storage';
import { insertUserSchema } from '../../shared/schema';
import { SubscriptionPlan, SubscriptionStatus } from '../../shared/subscription';

// Add session types to Express.Request
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  try {
    // Validate the request data
    const userData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create new user with hashed password
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword
    });
    
    // Create default subscription for new user
    await storage.createSubscription({
      userId: user.id,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    // Create session
    req.session.userId = user.id;
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ message: 'Failed to create session' });
      }
      res.status(201).json(userWithoutPassword);
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid user data', 
        errors: error.errors 
      });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create session
    req.session.userId = user.id;
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ message: 'Failed to create session' });
      }
      res.json(userWithoutPassword);
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to log in' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      // Clear invalid session
      req.session.destroy((err: Error) => {
        if (err) console.error('Session destruction error:', err);
      });
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ message: 'Failed to check authentication' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err: Error) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Failed to log out' });
    }
    
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;