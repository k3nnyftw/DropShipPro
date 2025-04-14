/**
 * Competitor Tracking Service
 * 
 * This service automates the monitoring of competitor prices and product data:
 * 1. Tracks competitor prices in real-time
 * 2. Analyzes pricing strategy differences
 * 3. Alerts on significant price changes
 * 4. Recommends pricing adjustments based on competitor data
 */

import { storage } from "../storage";
import { Product } from "../../shared/schema";

interface CompetitorPrice {
  competitorId: number;
  competitorName: string;
  productId: number;
  productName: string;
  competitorPrice: number;
  competitorUrl: string;
  priceGap: number; // Positive if our price is higher, negative if lower
  priceGapPercentage: number;
  lastUpdated: Date;
}

interface CompetitorPriceHistory {
  competitorId: number;
  productId: number;
  prices: {
    date: Date;
    price: number;
  }[];
  priceChange30Days: number; // Percentage
  priceChangeTrend: 'increasing' | 'decreasing' | 'stable';
}

interface CompetitiveAnalysis {
  productId: number;
  productName: string;
  ourPrice: number;
  lowestCompetitorPrice: number;
  highestCompetitorPrice: number;
  averageCompetitorPrice: number;
  medianCompetitorPrice: number;
  priceCompetitiveness: 'underpriced' | 'competitive' | 'overpriced';
  recommendedPriceAdjustment: number | null;
  competitorPrices: CompetitorPrice[];
}

interface PriceAlertConfig {
  alertThresholdPercentage: number; // e.g., 5 for 5%
  checkIntervalMinutes: number;
  productIds?: number[]; // if undefined, check all products
}

/**
 * Get current competitor prices for a specific product
 * @param productId The ID of the product to get competitor prices for
 * @returns Promise resolving to competitor prices
 */
export async function getCompetitorPrices(productId: number): Promise<CompetitorPrice[]> {
  const product = await storage.getProduct(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  
  // In a real implementation, we would crawl competitor websites or use APIs
  // For this demo, we'll generate simulated competitor data
  return simulateCompetitorPrices(product);
}

/**
 * Get competitor price history for a specific product
 * @param productId The ID of the product
 * @param competitorId Optional ID of a specific competitor
 * @param days Number of days of history to retrieve
 * @returns Promise resolving to price history
 */
export async function getCompetitorPriceHistory(
  productId: number, 
  competitorId?: number,
  days: number = 30
): Promise<CompetitorPriceHistory[]> {
  const product = await storage.getProduct(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  
  // In a real implementation, we would retrieve this from a database
  // For this demo, we'll generate simulated history data
  const currentPrices = await getCompetitorPrices(productId);
  
  const histories: CompetitorPriceHistory[] = [];
  
  // Filter by competitor if specified
  const relevantPrices = competitorId 
    ? currentPrices.filter(p => p.competitorId === competitorId)
    : currentPrices;
  
  for (const priceInfo of relevantPrices) {
    histories.push(simulatePriceHistory(priceInfo, days));
  }
  
  return histories;
}

/**
 * Perform comprehensive competitive analysis for a product
 * @param productId The ID of the product to analyze
 * @returns Promise resolving to competitive analysis
 */
export async function performCompetitiveAnalysis(productId: number): Promise<CompetitiveAnalysis> {
  const product = await storage.getProduct(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  
  const competitorPrices = await getCompetitorPrices(productId);
  
  if (competitorPrices.length === 0) {
    throw new Error(`No competitor data available for product ${productId}`);
  }
  
  // Extract just the prices for calculations
  const prices = competitorPrices.map(cp => cp.competitorPrice);
  
  // Calculate statistics
  const ourPrice = parseFloat(product.price);
  const lowestCompetitorPrice = Math.min(...prices);
  const highestCompetitorPrice = Math.max(...prices);
  
  // Calculate average
  const averageCompetitorPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
  // Calculate median
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const middle = Math.floor(sortedPrices.length / 2);
  const medianCompetitorPrice = sortedPrices.length % 2 === 0
    ? (sortedPrices[middle - 1] + sortedPrices[middle]) / 2
    : sortedPrices[middle];
  
  // Determine price competitiveness
  const priceDifference = ((ourPrice - averageCompetitorPrice) / averageCompetitorPrice) * 100;
  let priceCompetitiveness: 'underpriced' | 'competitive' | 'overpriced';
  
  if (priceDifference < -10) {
    priceCompetitiveness = 'underpriced';
  } else if (priceDifference > 10) {
    priceCompetitiveness = 'overpriced';
  } else {
    priceCompetitiveness = 'competitive';
  }
  
  // Recommend price adjustment
  let recommendedPriceAdjustment: number | null = null;
  
  if (priceCompetitiveness === 'underpriced' && priceDifference < -15) {
    // If significantly underpriced, suggest increasing price to -10% of average
    recommendedPriceAdjustment = averageCompetitorPrice * 0.9;
  } else if (priceCompetitiveness === 'overpriced' && priceDifference > 15) {
    // If significantly overpriced, suggest decreasing price to +10% of average
    recommendedPriceAdjustment = averageCompetitorPrice * 1.1;
  }
  
  return {
    productId,
    productName: product.name,
    ourPrice,
    lowestCompetitorPrice,
    highestCompetitorPrice,
    averageCompetitorPrice,
    medianCompetitorPrice,
    priceCompetitiveness,
    recommendedPriceAdjustment,
    competitorPrices
  };
}

/**
 * Configure real-time price alerts
 * @param config Alert configuration
 * @returns Function to cancel the alert monitoring
 */
export function configurePriceAlerts(config: PriceAlertConfig): () => void {
  console.log(`Configuring price alerts: ${JSON.stringify(config)}`);
  
  // Convert minutes to milliseconds
  const intervalMs = config.checkIntervalMinutes * 60 * 1000;
  
  // Set up interval to check for price changes
  const intervalId = setInterval(async () => {
    try {
      // In a real implementation, we would:
      // 1. Check current competitor prices
      // 2. Compare with previous prices
      // 3. Trigger alerts if changes exceed threshold
      // 4. Store new prices for future comparison
      
      console.log('Checking for significant competitor price changes...');
      
      // Get products to monitor
      const productIds = config.productIds;
      const products = productIds 
        ? await Promise.all(productIds.map(id => storage.getProduct(id)))
        : await storage.getAllProducts();
      
      // Filter out any undefined products (in case an ID wasn't found)
      const validProducts = products.filter(p => p) as Product[];
      
      for (const product of validProducts) {
        try {
          // Get current competitor prices
          const competitorPrices = await getCompetitorPrices(product.id);
          
          // In a real implementation, we would compare with previous prices
          // and trigger alerts if changes exceed threshold
          
          // For this demo, we'll just log that we're checking
          console.log(`Checked prices for ${product.name} (ID: ${product.id}): ${competitorPrices.length} competitors`);
        } catch (error) {
          console.error(`Error checking competitor prices for product ${product.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in price alert monitoring:', error);
    }
  }, intervalMs);
  
  // Return function to cancel the interval
  return () => clearInterval(intervalId);
}

/**
 * Adjust prices based on competitor data
 * @param productIds Optional array of product IDs to adjust; if not provided, all products are considered
 * @param maxAdjustmentPercent Maximum price adjustment percentage
 * @returns Promise resolving to the results of price adjustments
 */
export async function autoAdjustPricesBasedOnCompetitors(
  productIds?: number[],
  maxAdjustmentPercent: number = 10
): Promise<{
  productsAdjusted: number;
  adjustments: {
    productId: number;
    productName: string;
    oldPrice: number;
    newPrice: number;
    adjustmentPercent: number;
    reason: string;
  }[];
}> {
  // Get products to adjust
  const products = productIds 
    ? await Promise.all(productIds.map(id => storage.getProduct(id)))
    : await storage.getAllProducts();
  
  // Filter out any undefined products (in case an ID wasn't found)
  const validProducts = products.filter(p => p) as Product[];
  
  const adjustments = [];
  
  for (const product of validProducts) {
    try {
      // Perform competitive analysis
      const analysis = await performCompetitiveAnalysis(product.id);
      
      // Determine if price adjustment is needed
      if (analysis.recommendedPriceAdjustment !== null) {
        const oldPrice = parseFloat(product.price);
        const targetPrice = analysis.recommendedPriceAdjustment;
        
        // Calculate adjustment percentage
        const adjustmentPercent = ((targetPrice - oldPrice) / oldPrice) * 100;
        
        // Limit adjustment to maxAdjustmentPercent
        const cappedAdjustmentPercent = Math.max(
          -maxAdjustmentPercent,
          Math.min(maxAdjustmentPercent, adjustmentPercent)
        );
        
        // Calculate new price with capped adjustment
        const newPrice = oldPrice * (1 + (cappedAdjustmentPercent / 100));
        
        // Determine reason for adjustment
        let reason = '';
        if (analysis.priceCompetitiveness === 'underpriced') {
          reason = 'Price was significantly below market average';
        } else if (analysis.priceCompetitiveness === 'overpriced') {
          reason = 'Price was significantly above market average';
        }
        
        // In a real implementation, we would update the product price in the database
        // For this demo, we'll just add it to the list of adjustments
        
        adjustments.push({
          productId: product.id,
          productName: product.name,
          oldPrice,
          newPrice,
          adjustmentPercent: cappedAdjustmentPercent,
          reason
        });
      }
    } catch (error) {
      console.error(`Error adjusting price for product ${product.id}:`, error);
    }
  }
  
  return {
    productsAdjusted: adjustments.length,
    adjustments
  };
}

// --- Helper functions ---

/**
 * Simulate competitor prices for a product
 * @param product The product to generate competitor prices for
 * @returns Array of simulated competitor prices
 */
function simulateCompetitorPrices(product: Product): CompetitorPrice[] {
  const competitorCount = Math.floor(Math.random() * 5) + 3; // 3-7 competitors
  const ourPrice = parseFloat(product.price);
  
  const competitors = [
    { id: 1, name: "ShopFirst" },
    { id: 2, name: "QuickCommerce" },
    { id: 3, name: "FastCart" },
    { id: 4, name: "MegaMarket" },
    { id: 5, name: "TopDeal" },
    { id: 6, name: "ValueShop" },
    { id: 7, name: "PrimeStore" }
  ];
  
  // Select a random subset of competitors
  const selectedCompetitors = [...competitors]
    .sort(() => 0.5 - Math.random())
    .slice(0, competitorCount);
  
  return selectedCompetitors.map(competitor => {
    // Generate a price that's within +/- 20% of our price
    const priceFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    const competitorPrice = ourPrice * priceFactor;
    
    // Calculate price gap
    const priceGap = ourPrice - competitorPrice;
    const priceGapPercentage = (priceGap / competitorPrice) * 100;
    
    return {
      competitorId: competitor.id,
      competitorName: competitor.name,
      productId: product.id,
      productName: product.name,
      competitorPrice,
      competitorUrl: `https://example.com/${competitor.name.toLowerCase()}/product/${product.id}`,
      priceGap,
      priceGapPercentage,
      lastUpdated: new Date()
    };
  });
}

/**
 * Simulate price history for a competitor
 * @param priceInfo Current price information
 * @param days Number of days of history to generate
 * @returns Simulated price history
 */
function simulatePriceHistory(priceInfo: CompetitorPrice, days: number): CompetitorPriceHistory {
  const prices = [];
  const currentPrice = priceInfo.competitorPrice;
  
  // Generate a random trend factor (-0.2 to 0.2, meaning price could go down or up by 20% over the period)
  const trendFactor = -0.2 + (Math.random() * 0.4);
  
  // Generate daily prices with slight variations following the trend
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Calculate the price for this day
    // The further back in time, the more different from current price (following the trend)
    const dayFactor = 1 + (trendFactor * (i / days));
    const price = currentPrice * dayFactor * (0.98 + (Math.random() * 0.04)); // Add small daily noise (+/- 2%)
    
    prices.push({
      date,
      price
    });
  }
  
  // Calculate 30-day price change
  const oldestPrice = prices[0].price;
  const priceChange30Days = ((currentPrice - oldestPrice) / oldestPrice) * 100;
  
  // Determine trend
  let priceChangeTrend: 'increasing' | 'decreasing' | 'stable';
  if (priceChange30Days > 3) {
    priceChangeTrend = 'increasing';
  } else if (priceChange30Days < -3) {
    priceChangeTrend = 'decreasing';
  } else {
    priceChangeTrend = 'stable';
  }
  
  return {
    competitorId: priceInfo.competitorId,
    productId: priceInfo.productId,
    prices,
    priceChange30Days,
    priceChangeTrend
  };
}