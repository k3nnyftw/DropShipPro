/**
 * Price Optimization Service
 * 
 * This service uses AI analytics to automatically optimize product pricing
 * based on market demand, competition pricing, and profit margin goals.
 */

import { storage } from "../storage";
import { Product } from "../../shared/schema";

interface PriceOptimizationRequest {
  productId: number;
  competitorPrices?: number[];
  targetProfitMargin?: number;
  minimumPrice?: number;
  maximumPrice?: number;
}

interface PriceRecommendation {
  productId: number;
  currentPrice: number;
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  estimatedConversionRate: number;
  potentialRevenue: number;
  potentialProfit: number;
  confidenceScore: number; // 1-100
}

interface PriceAnalysis {
  message: string;
  factors: {
    name: string;
    impact: "positive" | "negative" | "neutral";
    description: string;
  }[];
}

/**
 * Calculate an optimized price for a product based on various factors
 * @param request Price optimization request with parameters
 * @returns Promise resolving to price recommendation
 */
export async function getOptimizedPrice(
  request: PriceOptimizationRequest
): Promise<PriceRecommendation> {
  const { productId, competitorPrices = [], targetProfitMargin = 0.3, minimumPrice, maximumPrice } = request;
  
  // Get the product data
  const product = await storage.getProduct(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  
  const currentPrice = parseFloat(product.price);
  const costPrice = product.costPrice ? parseFloat(product.costPrice) : currentPrice * 0.6; // Estimate cost if not available
  
  // Default pricing boundaries if not provided
  const minPrice = minimumPrice || costPrice * 1.1; // At least 10% above cost
  const maxPrice = maximumPrice || costPrice * 3; // No more than 3x the cost
  
  // Calculate competitor average if available
  let competitorAverage = 0;
  if (competitorPrices.length > 0) {
    competitorAverage = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;
  }
  
  // In a real implementation, this would use machine learning models to optimize
  // For this demo, we'll use a simple algorithm
  
  // Calculate the base price that would achieve the target profit margin
  const targetPrice = costPrice / (1 - targetProfitMargin);
  
  // Adjust based on competitor pricing if available
  let adjustedPrice = targetPrice;
  if (competitorAverage > 0) {
    // Position our price slightly below competitor average if our target price is higher
    if (targetPrice > competitorAverage) {
      adjustedPrice = Math.max(competitorAverage * 0.95, minPrice);
    }
    // Otherwise, stay close to our target price
  }
  
  // Ensure the price is within boundaries
  const finalPrice = Math.min(Math.max(adjustedPrice, minPrice), maxPrice);
  
  // Round to sensible price points (e.g., $19.99 instead of $20)
  const roundedPrice = roundToPricePoint(finalPrice);
  
  // Calculate expected metrics based on the new price
  const estimatedConversionRate = estimateConversionRate(roundedPrice, competitorAverage, currentPrice);
  const potentialRevenue = estimateRevenue(roundedPrice, estimatedConversionRate);
  const potentialProfit = potentialRevenue - (costPrice * estimatedConversionRate * 100);
  
  // Calculate confidence score
  const confidenceScore = calculateConfidenceScore(competitorPrices.length, costPrice > 0);
  
  return {
    productId,
    currentPrice,
    recommendedPrice: roundedPrice,
    minPrice,
    maxPrice,
    estimatedConversionRate,
    potentialRevenue,
    potentialProfit,
    confidenceScore
  };
}

/**
 * Generates analysis for why a specific price point was chosen
 * @param recommendation The price recommendation object
 * @returns Price analysis with explanation and factors
 */
export function analyzePriceRecommendation(
  recommendation: PriceRecommendation
): PriceAnalysis {
  const { currentPrice, recommendedPrice, minPrice, maxPrice, confidenceScore } = recommendation;
  
  const factors = [];
  let message = "";
  
  // Determine if price increased or decreased
  if (recommendedPrice > currentPrice) {
    message = `Price increase recommended to optimize profit margins while maintaining competitiveness.`;
    factors.push({
      name: "Profit Optimization",
      impact: "positive",
      description: "Current price is below optimal profit margin"
    });
  } else if (recommendedPrice < currentPrice) {
    message = `Price decrease recommended to improve conversion rates and market competitiveness.`;
    factors.push({
      name: "Conversion Improvement",
      impact: "positive",
      description: "Lower price should increase sales volume"
    });
  } else {
    message = "Current price point is already optimal according to our analysis.";
  }
  
  // Add confidence factor
  if (confidenceScore > 80) {
    factors.push({
      name: "High Confidence",
      impact: "positive",
      description: "Recommendation based on solid market data"
    });
  } else if (confidenceScore > 50) {
    factors.push({
      name: "Moderate Confidence",
      impact: "neutral",
      description: "Limited competitive pricing data available"
    });
  } else {
    factors.push({
      name: "Low Confidence",
      impact: "negative",
      description: "Insufficient data for high-confidence recommendation"
    });
  }
  
  // Add price boundary factor if relevant
  if (recommendedPrice === minPrice) {
    factors.push({
      name: "Minimum Price Boundary",
      impact: "neutral",
      description: "Price constrained by minimum price threshold"
    });
  } else if (recommendedPrice === maxPrice) {
    factors.push({
      name: "Maximum Price Boundary",
      impact: "neutral",
      description: "Price constrained by maximum price threshold"
    });
  }
  
  return {
    message,
    factors
  };
}

/**
 * Analyze the entire store's pricing and suggest optimizations
 * @param targetProfitMargin Overall target profit margin for the store
 * @returns Promise resolving to price recommendations for multiple products
 */
export async function optimizeStoreWidepricing(
  targetProfitMargin: number = 0.3
): Promise<PriceRecommendation[]> {
  // Get all products
  const products = await storage.getAllProducts();
  
  // Process each product
  const recommendations: PriceRecommendation[] = [];
  
  for (const product of products) {
    try {
      // For each product, fetch competitor prices (in a real implementation)
      // Here we'll simulate competitor prices
      const competitorPrices = simulateCompetitorPrices(parseFloat(product.price));
      
      // Get optimized price
      const recommendation = await getOptimizedPrice({
        productId: product.id,
        competitorPrices,
        targetProfitMargin
      });
      
      recommendations.push(recommendation);
    } catch (error) {
      console.error(`Error optimizing price for product ${product.id}:`, error);
      // Continue with other products even if one fails
    }
  }
  
  // Sort by highest potential profit improvement
  return recommendations.sort((a, b) => {
    const aImprovement = a.potentialProfit - (a.currentPrice - (a.currentPrice * 0.6)) * 100; // Estimate
    const bImprovement = b.potentialProfit - (b.currentPrice - (b.currentPrice * 0.6)) * 100; // Estimate
    return bImprovement - aImprovement;
  });
}

/**
 * Apply price optimizations to multiple products automatically
 * @param productIds List of product IDs to optimize prices for
 * @param targetProfitMargin Target profit margin for optimization
 * @returns Promise resolving to number of successfully updated products
 */
export async function autoApplyPriceOptimizations(
  productIds: number[],
  targetProfitMargin: number = 0.3
): Promise<{success: number, failed: number, products: Product[]}> {
  let successCount = 0;
  let failedCount = 0;
  const updatedProducts: Product[] = [];
  
  for (const productId of productIds) {
    try {
      // Get optimized price
      const recommendation = await getOptimizedPrice({
        productId,
        targetProfitMargin
      });
      
      // Get existing product
      const product = await storage.getProduct(productId);
      if (!product) {
        failedCount++;
        continue;
      }
      
      // Update product price
      const updatedProduct: Product = {
        ...product,
        price: recommendation.recommendedPrice.toFixed(2)
      };
      
      // In a real implementation, you would persist this to the database
      // For this demo, we'll just log it
      console.log(`Updated price for product ${productId} from ${product.price} to ${updatedProduct.price}`);
      
      updatedProducts.push(updatedProduct);
      successCount++;
    } catch (error) {
      console.error(`Error updating price for product ${productId}:`, error);
      failedCount++;
    }
  }
  
  return {
    success: successCount,
    failed: failedCount,
    products: updatedProducts
  };
}

/**
 * Schedule periodic price optimizations for the entire store
 * @param intervalHours Frequency of price checks in hours
 * @param targetProfitMargin Target profit margin for optimizations
 * @returns Function to cancel the scheduled optimizations
 */
export function scheduleAutomaticPriceOptimizations(
  intervalHours: number = 24,
  targetProfitMargin: number = 0.3
): () => void {
  // Convert hours to milliseconds
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  // Set up the interval
  const intervalId = setInterval(async () => {
    try {
      console.log(`Running scheduled price optimization (interval: ${intervalHours} hours)`);
      
      // Get all products
      const products = await storage.getAllProducts();
      const productIds = products.map(p => p.id);
      
      // Apply optimizations
      const result = await autoApplyPriceOptimizations(productIds, targetProfitMargin);
      
      console.log(`Price optimization complete: ${result.success} products updated, ${result.failed} failed`);
    } catch (error) {
      console.error('Error in scheduled price optimization:', error);
    }
  }, intervalMs);
  
  // Return function to cancel the interval
  return () => clearInterval(intervalId);
}

// --- Helper functions ---

/**
 * Rounds a price to a marketing-friendly price point
 * (e.g., $19.99 instead of $20.00)
 */
function roundToPricePoint(price: number): number {
  // Round to nearest dollar
  const nearestDollar = Math.round(price);
  
  // If price is below $10, use $X.99 format
  if (nearestDollar < 10) {
    return Math.floor(price) + 0.99;
  }
  
  // If price is below $50, use $X9.99 format
  if (nearestDollar < 50) {
    return Math.floor(price / 10) * 10 + 9.99;
  }
  
  // If price is below $100, use $X9 format
  if (nearestDollar < 100) {
    return Math.floor(price / 10) * 10 + 9;
  }
  
  // For higher prices, use $X99 format
  return Math.floor(price / 100) * 100 + 99;
}

/**
 * Estimates conversion rate based on price factors
 */
function estimateConversionRate(price: number, competitorAvg: number, currentPrice: number): number {
  let baseRate = 0.05; // 5% base conversion rate
  
  // Adjust based on competitor pricing
  if (competitorAvg > 0) {
    if (price < competitorAvg) {
      // Below competitor average means better conversion
      baseRate += 0.02 * (1 - (price / competitorAvg));
    } else {
      // Above competitor average means worse conversion
      baseRate -= 0.01 * ((price / competitorAvg) - 1);
    }
  }
  
  // Adjust based on current price (if lowering price, conversion likely improves)
  if (price < currentPrice) {
    baseRate += 0.01 * (1 - (price / currentPrice));
  }
  
  // Ensure conversion rate is reasonable
  return Math.min(Math.max(baseRate, 0.01), 0.25);
}

/**
 * Estimates monthly revenue based on price and conversion rate
 */
function estimateRevenue(price: number, conversionRate: number): number {
  // Assume 1000 product views per month for simplicity
  const estimatedMonthlyViews = 1000;
  const estimatedSales = estimatedMonthlyViews * conversionRate;
  
  return price * estimatedSales;
}

/**
 * Calculates confidence score for price recommendation
 */
function calculateConfidenceScore(competitorCount: number, hasCostData: boolean): number {
  let score = 50; // Base score
  
  // More competitors means more market data
  if (competitorCount > 5) {
    score += 25;
  } else if (competitorCount > 0) {
    score += competitorCount * 5;
  }
  
  // Having cost data increases accuracy
  if (hasCostData) {
    score += 20;
  }
  
  return Math.min(score, 100);
}

/**
 * Simulates competitor prices for a product
 * In a real implementation, this would come from market data
 */
function simulateCompetitorPrices(basePrice: number): number[] {
  const competitorCount = Math.floor(Math.random() * 5) + 1;
  const prices: number[] = [];
  
  for (let i = 0; i < competitorCount; i++) {
    // Generate price with +/- 20% variation
    const variation = (Math.random() * 0.4) - 0.2; // -20% to +20%
    const price = basePrice * (1 + variation);
    prices.push(Math.round(price * 100) / 100); // Round to 2 decimal places
  }
  
  return prices;
}