/**
 * Demand Forecasting Service
 * 
 * This service uses AI to predict future product demand based on:
 * 1. Historical sales data
 * 2. Market trends 
 * 3. Seasonal factors
 * 4. Competitive landscape
 * 
 * The predictions are used to optimize inventory levels and pricing strategies.
 */

import { storage } from "../storage";
import { Product } from "../../shared/schema";

type TimeFrame = "7days" | "30days" | "90days";
type Trend = "increasing" | "decreasing" | "stable";
type MarketTrendDirection = "rising" | "falling" | "stable";
type MarketTrendTimeframe = "short" | "medium" | "long";
type ActionImpact = "high" | "medium" | "low";

interface DemandForecast {
  timeframe: TimeFrame;
  demand: number;
  confidence: number;
  trend: Trend;
}

interface SeasonalFactor {
  season: string;
  impact: number; // -1.0 to 1.0, where negative means decreased demand
  confidence: number; // 0.0 to 1.0
}

interface MarketTrend {
  trend: string;
  direction: MarketTrendDirection;
  impact: number; // 0.0 to 1.0
  timeframe: MarketTrendTimeframe;
}

interface CompetitiveFactor {
  competitorCount: number;
  marketSaturation: number; // 0.0 to 1.0
  uniqueSellingPoints: string[];
  impact: number; // -1.0 to 1.0, where negative means decreased demand
}

interface RecommendedAction {
  action: string;
  description: string;
  impact: ActionImpact;
}

interface ProductForecast {
  productId: number;
  productName: string;
  currentDemand: number; // Current units per month
  forecastDemand: DemandForecast[];
  seasonalFactors: SeasonalFactor[];
  marketTrends: MarketTrend[];
  competitiveFactors: CompetitiveFactor[];
  recommendedActions: RecommendedAction[];
}

/**
 * Generate demand forecasts for all products
 * @returns Promise resolving to forecasts for all products
 */
export async function generateForecasts(): Promise<ProductForecast[]> {
  const products = await storage.getAllProducts();
  const forecasts: ProductForecast[] = [];
  
  for (const product of products) {
    try {
      const forecast = await generateForecastForProduct(product.id);
      forecasts.push(forecast);
    } catch (error) {
      console.error(`Error generating forecast for product ${product.id}:`, error);
    }
  }
  
  return forecasts;
}

/**
 * Generate demand forecast for a specific product
 * @param productId ID of the product to forecast
 * @returns Promise resolving to the product forecast
 */
export async function generateForecastForProduct(productId: number): Promise<ProductForecast> {
  const product = await storage.getProduct(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  
  // In a real implementation, we would:
  // 1. Retrieve historical sales data
  // 2. Apply machine learning models to predict future demand
  // 3. Incorporate market trend analysis
  // 4. Analyze seasonal patterns
  // 5. Consider competitive factors
  
  // For this demo, we'll simulate a forecast based on the product
  
  // Simulate current demand (units per month)
  const baseCurrentDemand = 50 + Math.floor(Math.random() * 150);
  
  // Determine if the product is trending based on its properties
  const isTrending = product.trending || Math.random() > 0.7;
  
  // Adjust current demand based on product characteristics
  let currentDemand = baseCurrentDemand;
  
  // Adjust based on price (higher price = lower demand)
  const productPrice = parseFloat(product.price);
  if (productPrice > 100) {
    currentDemand = Math.round(currentDemand * 0.8);
  } else if (productPrice < 30) {
    currentDemand = Math.round(currentDemand * 1.3);
  }
  
  // Adjust based on trending status
  if (isTrending) {
    currentDemand = Math.round(currentDemand * 1.5);
  }
  
  // Generate forecasts for different timeframes
  const forecastDemand: DemandForecast[] = [
    generateTimeframeForecast("7days", currentDemand, isTrending),
    generateTimeframeForecast("30days", currentDemand, isTrending),
    generateTimeframeForecast("90days", currentDemand, isTrending)
  ];
  
  // Generate seasonal factors
  const seasonalFactors: SeasonalFactor[] = [
    {
      season: "summer",
      impact: -0.2 + (Math.random() * 0.6), // -0.2 to 0.4
      confidence: 0.7 + (Math.random() * 0.3)
    },
    {
      season: "holiday season",
      impact: 0.1 + (Math.random() * 0.5), // 0.1 to 0.6
      confidence: 0.8 + (Math.random() * 0.2)
    },
    {
      season: "back to school",
      impact: -0.1 + (Math.random() * 0.5), // -0.1 to 0.4
      confidence: 0.6 + (Math.random() * 0.3)
    }
  ];
  
  // Generate market trends
  const marketTrends: MarketTrend[] = [
    {
      trend: "Online shopping",
      direction: Math.random() > 0.2 ? "rising" : "stable",
      impact: 0.3 + (Math.random() * 0.4), // 0.3 to 0.7
      timeframe: "long"
    },
    {
      trend: product.category || "Product category",
      direction: Math.random() > 0.5 ? "rising" : "falling",
      impact: 0.2 + (Math.random() * 0.5), // 0.2 to 0.7
      timeframe: "medium"
    },
    {
      trend: `${product.name} searches`,
      direction: isTrending ? "rising" : (Math.random() > 0.5 ? "stable" : "falling"),
      impact: 0.1 + (Math.random() * 0.4), // 0.1 to 0.5
      timeframe: "short"
    }
  ];
  
  // Generate competitive factors
  const competitiveFactors: CompetitiveFactor[] = [
    {
      competitorCount: 3 + Math.floor(Math.random() * 5),
      marketSaturation: 0.3 + (Math.random() * 0.5), // 0.3 to 0.8
      uniqueSellingPoints: [
        "Quality",
        "Price",
        "Fast shipping",
        "Customer service"
      ].slice(0, 2 + Math.floor(Math.random() * 3)),
      impact: -0.3 + (Math.random() * 0.6) // -0.3 to 0.3
    }
  ];
  
  // Generate recommended actions based on forecasts
  const recommendedActions: RecommendedAction[] = generateRecommendedActions(
    product,
    forecastDemand,
    seasonalFactors,
    marketTrends,
    competitiveFactors
  );
  
  return {
    productId: product.id,
    productName: product.name,
    currentDemand,
    forecastDemand,
    seasonalFactors,
    marketTrends,
    competitiveFactors,
    recommendedActions
  };
}

/**
 * Apply insights from a forecast
 * @param productId ID of the product to apply forecast insights to
 * @returns Promise resolving to the results of applying insights
 */
export async function applyForecastInsights(productId: number): Promise<{
  success: boolean;
  productId: number;
  productName: string;
  appliedActions: {
    action: string;
    result: string;
    impact: string;
  }[];
}> {
  const product = await storage.getProduct(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  
  const forecast = await generateForecastForProduct(productId);
  
  // In a real implementation, we would:
  // 1. Update inventory levels based on forecast
  // 2. Adjust pricing strategy
  // 3. Update marketing tactics
  // 4. Modify supplier orders
  
  // For this demo, we'll simulate applying the insights
  
  const appliedActions = forecast.recommendedActions.map(action => {
    return {
      action: action.action,
      result: `Successfully applied: ${action.description}`,
      impact: action.impact
    };
  });
  
  return {
    success: true,
    productId: product.id,
    productName: product.name,
    appliedActions
  };
}

/**
 * Schedule automatic forecasting
 * @param intervalHours How often to generate forecasts (in hours)
 * @param autoApply Whether to automatically apply insights
 * @returns Promise resolving to the schedule configuration
 */
export async function scheduleForecasting(
  intervalHours: number,
  autoApply: boolean
): Promise<{
  success: boolean;
  scheduledAt: Date;
  intervalHours: number;
  autoApply: boolean;
  nextRun: Date;
}> {
  // In a real implementation, we would:
  // 1. Store the schedule configuration in a database
  // 2. Set up a job scheduler to run forecasts at the specified interval
  // 3. Configure automatic application of insights if enabled
  
  // For this demo, we'll just return the configuration
  
  const scheduledAt = new Date();
  const nextRun = new Date();
  nextRun.setHours(nextRun.getHours() + intervalHours);
  
  return {
    success: true,
    scheduledAt,
    intervalHours,
    autoApply,
    nextRun
  };
}

// --- Helper functions ---

/**
 * Generate a forecast for a specific timeframe
 * @param timeframe The timeframe to forecast
 * @param currentDemand Current monthly demand
 * @param isTrending Whether the product is trending
 * @returns Forecast for the timeframe
 */
function generateTimeframeForecast(
  timeframe: TimeFrame,
  currentDemand: number,
  isTrending: boolean
): DemandForecast {
  let trend: Trend;
  let demandMultiplier: number;
  let confidence: number;
  
  // Randomize the trend with a bias based on trending status
  const trendRandom = Math.random();
  if (isTrending) {
    // Trending products are more likely to increase
    if (trendRandom < 0.7) {
      trend = "increasing";
      demandMultiplier = 1.1 + (Math.random() * 0.3); // 1.1 to 1.4
    } else if (trendRandom < 0.9) {
      trend = "stable";
      demandMultiplier = 0.95 + (Math.random() * 0.1); // 0.95 to 1.05
    } else {
      trend = "decreasing";
      demandMultiplier = 0.8 + (Math.random() * 0.15); // 0.8 to 0.95
    }
    confidence = 0.7 + (Math.random() * 0.3); // 0.7 to 1.0
  } else {
    // Non-trending products have more varied outcomes
    if (trendRandom < 0.3) {
      trend = "increasing";
      demandMultiplier = 1.05 + (Math.random() * 0.15); // 1.05 to 1.2
    } else if (trendRandom < 0.7) {
      trend = "stable";
      demandMultiplier = 0.95 + (Math.random() * 0.1); // 0.95 to 1.05
    } else {
      trend = "decreasing";
      demandMultiplier = 0.7 + (Math.random() * 0.25); // 0.7 to 0.95
    }
    confidence = 0.5 + (Math.random() * 0.4); // 0.5 to 0.9
  }
  
  // Adjust multiplier based on timeframe
  // Longer timeframes have higher multipliers for increasing trends
  // and lower multipliers for decreasing trends
  if (timeframe === "30days") {
    if (trend === "increasing") {
      demandMultiplier += 0.1;
    } else if (trend === "decreasing") {
      demandMultiplier -= 0.05;
    }
    confidence -= 0.05; // Less confident about medium-term forecasts
  } else if (timeframe === "90days") {
    if (trend === "increasing") {
      demandMultiplier += 0.2;
    } else if (trend === "decreasing") {
      demandMultiplier -= 0.1;
    }
    confidence -= 0.1; // Even less confident about long-term forecasts
  }
  
  // Calculate demand based on timeframe
  let demand: number;
  if (timeframe === "7days") {
    demand = Math.round((currentDemand / 30) * 7 * demandMultiplier);
  } else if (timeframe === "30days") {
    demand = Math.round(currentDemand * demandMultiplier);
  } else {
    demand = Math.round(currentDemand * 3 * demandMultiplier);
  }
  
  return {
    timeframe,
    demand,
    confidence,
    trend
  };
}

/**
 * Generate recommended actions based on forecasts and factors
 * @param product The product
 * @param forecasts Demand forecasts
 * @param seasonalFactors Seasonal factors
 * @param marketTrends Market trends
 * @param competitiveFactors Competitive factors
 * @returns Array of recommended actions
 */
function generateRecommendedActions(
  product: Product,
  forecasts: DemandForecast[],
  seasonalFactors: SeasonalFactor[],
  marketTrends: MarketTrend[],
  competitiveFactors: CompetitiveFactor[]
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  
  // Check short-term forecast
  const shortTerm = forecasts.find(f => f.timeframe === "7days");
  if (shortTerm && shortTerm.trend === "increasing") {
    actions.push({
      action: "Increase inventory levels",
      description: `Prepare for increased demand in the next 7 days (+${Math.round((shortTerm.demand / (product.inventory || 10) - 1) * 100)}%).`,
      impact: "high"
    });
  } else if (shortTerm && shortTerm.trend === "decreasing") {
    actions.push({
      action: "Run a limited-time promotion",
      description: "Combat decreasing demand with a 7-day promotion to boost sales.",
      impact: "medium"
    });
  }
  
  // Check medium-term forecast
  const mediumTerm = forecasts.find(f => f.timeframe === "30days");
  if (mediumTerm && mediumTerm.trend === "increasing" && mediumTerm.confidence > 0.7) {
    actions.push({
      action: "Order additional stock",
      description: "Long-term demand is increasing with high confidence. Place larger orders with suppliers.",
      impact: "high"
    });
  }
  
  // Check seasonal factors
  const upcomingSeason = seasonalFactors.find(s => s.impact > 0.2);
  if (upcomingSeason) {
    actions.push({
      action: `Prepare for ${upcomingSeason.season}`,
      description: `${upcomingSeason.season.charAt(0).toUpperCase() + upcomingSeason.season.slice(1)} is coming with projected +${Math.round(upcomingSeason.impact * 100)}% demand impact. Adjust inventory and marketing.`,
      impact: upcomingSeason.impact > 0.4 ? "high" : "medium"
    });
  }
  
  // Check market trends
  const significantTrend = marketTrends.find(t => t.impact > 0.4 && t.direction === "rising");
  if (significantTrend) {
    actions.push({
      action: `Leverage "${significantTrend.trend}" trend`,
      description: `Update marketing to emphasize connection to the rising "${significantTrend.trend}" trend.`,
      impact: "medium"
    });
  }
  
  // Check competitive factors
  const competitiveFactor = competitiveFactors[0];
  if (competitiveFactor && competitiveFactor.marketSaturation > 0.7) {
    actions.push({
      action: "Differentiate from competitors",
      description: `Market is ${Math.round(competitiveFactor.marketSaturation * 100)}% saturated with ${competitiveFactor.competitorCount} competitors. Emphasize unique selling points.`,
      impact: "high"
    });
  } else if (competitiveFactor && competitiveFactor.impact < -0.2) {
    actions.push({
      action: "Adjust pricing strategy",
      description: "Competitors are negatively impacting demand. Consider price adjustment or bundle offers.",
      impact: "medium"
    });
  }
  
  // Ensure we have at least one recommendation
  if (actions.length === 0) {
    actions.push({
      action: "Monitor market conditions",
      description: "No significant changes predicted. Continue monitoring product performance.",
      impact: "low"
    });
  }
  
  return actions;
}