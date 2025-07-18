/**
 * Supplier Automation Service
 * 
 * This service provides automated supplier discovery, evaluation, and management
 * based on product requirements and business preferences.
 */

import { storage } from "../storage";
import { Supplier, Product } from "../../shared/schema";

interface SupplierEvaluation {
  supplierId: number;
  score: number;
  strengths: string[];
  concerns: string[];
  recommendation: 'recommended' | 'conditional' | 'not_recommended';
  priceCompetitiveness: number; // 1-10 scale
  reliabilityScore: number; // 1-10 scale
  shippingScore: number; // 1-10 scale
  qualityScore: number; // 1-10 scale
  communicationScore: number; // 1-10 scale
}

interface AutomatedSupplierMatch {
  product: string;
  suppliers: {
    supplier: any;
    matchScore: number;
    estimatedCost: number;
    estimatedDelivery: string;
    minimumOrder: number;
    qualityRating: number;
    advantages: string[];
    disadvantages: string[];
  }[];
}

interface SupplierPerformanceMetrics {
  supplierId: number;
  orderFulfillmentRate: number;
  averageDeliveryTime: number;
  qualityScore: number;
  customerSatisfaction: number;
  disputeRate: number;
  communicationRating: number;
  lastUpdated: Date;
}

/**
 * Automatically discovers and evaluates suppliers for a given product
 * @param productName The name of the product to find suppliers for
 * @param category Product category
 * @param targetMarkets Target markets for shipping
 * @param maxBudget Maximum budget per unit
 * @returns Promise resolving to supplier matches
 */
export async function findSuppliersForProduct(
  productName: string,
  category: string,
  targetMarkets: string[] = ['US'],
  maxBudget: number = 100
): Promise<AutomatedSupplierMatch> {
  // In a real implementation, this would integrate with supplier APIs like:
  // - AliExpress API
  // - Alibaba API
  // - DHGate API
  // - Local supplier databases
  
  // For now, we'll simulate intelligent supplier matching
  const allSuppliers = await storage.getAllSuppliers();
  const matchedSuppliers = [];
  
  for (const supplier of allSuppliers) {
    const matchScore = calculateSupplierMatch(supplier, productName, category, targetMarkets);
    
    if (matchScore > 60) { // Only include suppliers with good match scores
      const estimatedCost = calculateEstimatedCost(supplier, productName, category);
      const estimatedDelivery = calculateEstimatedDelivery(supplier, targetMarkets);
      const advantages = getSupplierAdvantages(supplier, category);
      const disadvantages = getSupplierDisadvantages(supplier, category);
      
      matchedSuppliers.push({
        supplier,
        matchScore,
        estimatedCost,
        estimatedDelivery,
        minimumOrder: supplier.minOrder || 1,
        qualityRating: parseFloat(supplier.rating) || 4.0,
        advantages,
        disadvantages
      });
    }
  }
  
  // Sort by match score (highest first)
  matchedSuppliers.sort((a, b) => b.matchScore - a.matchScore);
  
  return {
    product: productName,
    suppliers: matchedSuppliers.slice(0, 5) // Return top 5 matches
  };
}

/**
 * Calculates how well a supplier matches the product requirements
 */
function calculateSupplierMatch(
  supplier: any,
  productName: string,
  category: string,
  targetMarkets: string[]
): number {
  let score = 0;
  
  // Base score from supplier rating
  const rating = parseFloat(supplier.rating) || 4.0;
  score += (rating / 5) * 30; // 30% weight for rating
  
  // Shipping capability (based on location)
  const shippingScore = calculateShippingScore(supplier.location, targetMarkets);
  score += shippingScore * 0.25; // 25% weight for shipping
  
  // Price competitiveness
  const priceScore = calculatePriceCompetitiveness(supplier.price);
  score += priceScore * 0.20; // 20% weight for price
  
  // Minimum order requirements
  const minOrderScore = calculateMinOrderScore(supplier.minOrder);
  score += minOrderScore * 0.15; // 15% weight for minimum order
  
  // Review count (reliability indicator)
  const reviewScore = Math.min(100, (supplier.reviewCount || 0) / 10); // Max 100 points
  score += reviewScore * 0.10; // 10% weight for review count
  
  return Math.min(100, score);
}

/**
 * Calculates shipping score based on supplier location and target markets
 */
function calculateShippingScore(location: string, targetMarkets: string[]): number {
  if (!location) return 50;
  
  const locationLower = location.toLowerCase();
  
  // Better scores for suppliers in or near target markets
  if (targetMarkets.includes('US')) {
    if (locationLower.includes('usa') || locationLower.includes('united states')) return 95;
    if (locationLower.includes('canada')) return 85;
    if (locationLower.includes('mexico')) return 80;
    if (locationLower.includes('china')) return 70;
  }
  
  if (targetMarkets.includes('UK') || targetMarkets.includes('EU')) {
    if (locationLower.includes('uk') || locationLower.includes('united kingdom')) return 95;
    if (locationLower.includes('germany') || locationLower.includes('france')) return 90;
    if (locationLower.includes('europe')) return 85;
  }
  
  // Default score for other locations
  return 60;
}

/**
 * Calculates price competitiveness score
 */
function calculatePriceCompetitiveness(price: any): number {
  if (!price) return 50;
  
  const priceNum = parseFloat(price.toString());
  
  // Better scores for lower prices (more competitive)
  if (priceNum < 10) return 95;
  if (priceNum < 25) return 85;
  if (priceNum < 50) return 75;
  if (priceNum < 100) return 65;
  return 50;
}

/**
 * Calculates minimum order score (lower minimum = better score)
 */
function calculateMinOrderScore(minOrder: any): number {
  if (!minOrder) return 90;
  
  const minOrderNum = parseInt(minOrder.toString());
  
  if (minOrderNum <= 1) return 100;
  if (minOrderNum <= 5) return 85;
  if (minOrderNum <= 10) return 70;
  if (minOrderNum <= 50) return 55;
  return 30;
}

/**
 * Estimates product cost from supplier
 */
function calculateEstimatedCost(supplier: any, productName: string, category: string): number {
  const basePrice = parseFloat(supplier.price) || 25;
  
  // Add some variation based on product complexity
  const productHash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variation = (productHash % 20) - 10; // -10 to +10 variation
  
  return Math.max(5, basePrice + variation);
}

/**
 * Estimates delivery time based on supplier location
 */
function calculateEstimatedDelivery(supplier: any, targetMarkets: string[]): string {
  if (!supplier.location) return '10-15 days';
  
  const locationLower = supplier.location.toLowerCase();
  
  if (targetMarkets.includes('US')) {
    if (locationLower.includes('usa') || locationLower.includes('united states')) return '2-5 days';
    if (locationLower.includes('canada')) return '3-7 days';
    if (locationLower.includes('mexico')) return '5-10 days';
    if (locationLower.includes('china')) return '10-20 days';
  }
  
  // Default shipping time
  return supplier.shippingTime || '7-14 days';
}

/**
 * Gets supplier advantages based on their profile
 */
function getSupplierAdvantages(supplier: any, category: string): string[] {
  const advantages = [];
  
  const rating = parseFloat(supplier.rating) || 4.0;
  if (rating >= 4.8) advantages.push('Excellent customer rating');
  if (rating >= 4.5) advantages.push('High quality products');
  
  if (supplier.reviewCount > 200) advantages.push('Experienced seller');
  if (supplier.reviewCount > 500) advantages.push('Established business');
  
  if (supplier.minOrder <= 5) advantages.push('Low minimum order');
  if (supplier.minOrder <= 1) advantages.push('No minimum order requirement');
  
  if (supplier.returnPolicy && supplier.returnPolicy.includes('60')) {
    advantages.push('Generous return policy');
  }
  
  const locationLower = supplier.location?.toLowerCase() || '';
  if (locationLower.includes('usa') || locationLower.includes('united states')) {
    advantages.push('Domestic shipping');
  }
  
  if (supplier.website) {
    advantages.push('Direct supplier website');
  }
  
  return advantages;
}

/**
 * Gets supplier disadvantages/concerns
 */
function getSupplierDisadvantages(supplier: any, category: string): string[] {
  const disadvantages = [];
  
  const rating = parseFloat(supplier.rating) || 4.0;
  if (rating < 4.0) disadvantages.push('Below average rating');
  if (rating < 3.5) disadvantages.push('Poor customer feedback');
  
  if (supplier.reviewCount < 50) disadvantages.push('Limited customer reviews');
  if (supplier.reviewCount < 10) disadvantages.push('New or unproven seller');
  
  if (supplier.minOrder > 50) disadvantages.push('High minimum order requirement');
  if (supplier.minOrder > 100) disadvantages.push('Very high minimum order');
  
  const locationLower = supplier.location?.toLowerCase() || '';
  if (locationLower.includes('china')) {
    disadvantages.push('Long international shipping');
  }
  
  if (!supplier.returnPolicy || supplier.returnPolicy.includes('7')) {
    disadvantages.push('Limited return policy');
  }
  
  if (!supplier.website) {
    disadvantages.push('No direct supplier contact');
  }
  
  return disadvantages;
}

/**
 * Performs comprehensive supplier evaluation
 */
export async function evaluateSupplier(supplierId: number): Promise<SupplierEvaluation> {
  const supplier = await storage.getSupplier(supplierId);
  if (!supplier) {
    throw new Error('Supplier not found');
  }
  
  const priceCompetitiveness = calculatePriceCompetitiveness(supplier.price);
  const reliabilityScore = calculateReliabilityScore(supplier);
  const shippingScore = calculateShippingScore(supplier.location, ['US']);
  const qualityScore = calculateQualityScore(supplier);
  const communicationScore = calculateCommunicationScore(supplier);
  
  const overallScore = (
    priceCompetitiveness * 0.25 +
    reliabilityScore * 0.25 +
    shippingScore * 0.20 +
    qualityScore * 0.20 +
    communicationScore * 0.10
  );
  
  const strengths = [];
  const concerns = [];
  
  // Analyze strengths and concerns
  if (priceCompetitiveness >= 80) strengths.push('Highly competitive pricing');
  if (reliabilityScore >= 80) strengths.push('Reliable order fulfillment');
  if (shippingScore >= 80) strengths.push('Fast shipping to target markets');
  if (qualityScore >= 80) strengths.push('High quality products');
  
  if (priceCompetitiveness < 60) concerns.push('Higher pricing than competitors');
  if (reliabilityScore < 60) concerns.push('Limited reliability track record');
  if (shippingScore < 60) concerns.push('Slower shipping times');
  if (qualityScore < 60) concerns.push('Quality concerns based on reviews');
  
  let recommendation: 'recommended' | 'conditional' | 'not_recommended';
  if (overallScore >= 80) recommendation = 'recommended';
  else if (overallScore >= 65) recommendation = 'conditional';
  else recommendation = 'not_recommended';
  
  return {
    supplierId,
    score: Math.round(overallScore),
    strengths,
    concerns,
    recommendation,
    priceCompetitiveness: Math.round(priceCompetitiveness / 10),
    reliabilityScore: Math.round(reliabilityScore / 10),
    shippingScore: Math.round(shippingScore / 10),
    qualityScore: Math.round(qualityScore / 10),
    communicationScore: Math.round(communicationScore / 10)
  };
}

/**
 * Calculates reliability score based on supplier metrics
 */
function calculateReliabilityScore(supplier: any): number {
  const rating = parseFloat(supplier.rating) || 4.0;
  const reviewCount = supplier.reviewCount || 0;
  
  let score = (rating / 5) * 60; // Base score from rating
  
  // Add points for review count (experience indicator)
  if (reviewCount > 500) score += 25;
  else if (reviewCount > 200) score += 20;
  else if (reviewCount > 100) score += 15;
  else if (reviewCount > 50) score += 10;
  else if (reviewCount > 10) score += 5;
  
  // Add points for business features
  if (supplier.website) score += 10;
  if (supplier.returnPolicy && !supplier.returnPolicy.includes('7')) score += 5;
  
  return Math.min(100, score);
}

/**
 * Calculates quality score based on rating and reviews
 */
function calculateQualityScore(supplier: any): number {
  const rating = parseFloat(supplier.rating) || 4.0;
  const reviewCount = supplier.reviewCount || 0;
  
  let score = (rating / 5) * 70; // Base score from rating
  
  // Higher review count increases confidence in quality rating
  if (reviewCount > 100) score += 20;
  else if (reviewCount > 50) score += 15;
  else if (reviewCount > 20) score += 10;
  else if (reviewCount > 10) score += 5;
  
  // Bonus for very high ratings
  if (rating >= 4.8) score += 10;
  
  return Math.min(100, score);
}

/**
 * Calculates communication score based on supplier responsiveness
 */
function calculateCommunicationScore(supplier: any): number {
  let score = 50; // Base score
  
  // Add points for business presence
  if (supplier.website) score += 30;
  if (supplier.location) score += 20;
  
  // Review count can indicate good communication
  const reviewCount = supplier.reviewCount || 0;
  if (reviewCount > 200) score += 30;
  else if (reviewCount > 100) score += 20;
  else if (reviewCount > 50) score += 10;
  
  return Math.min(100, score);
}

/**
 * Automatically monitors supplier performance and updates metrics
 */
export async function updateSupplierMetrics(supplierId: number): Promise<SupplierPerformanceMetrics> {
  // In a real implementation, this would:
  // - Track order fulfillment rates
  // - Monitor delivery times
  // - Analyze customer feedback
  // - Track dispute rates
  // - Monitor communication responsiveness
  
  // For now, we'll simulate performance metrics
  const supplier = await storage.getSupplier(supplierId);
  if (!supplier) {
    throw new Error('Supplier not found');
  }
  
  const rating = parseFloat(supplier.rating) || 4.0;
  const reviewCount = supplier.reviewCount || 0;
  
  return {
    supplierId,
    orderFulfillmentRate: Math.min(100, 70 + (rating * 6) + Math.random() * 10),
    averageDeliveryTime: 7 + Math.random() * 10,
    qualityScore: Math.min(100, (rating / 5) * 100),
    customerSatisfaction: Math.min(100, 60 + (rating * 8) + Math.random() * 10),
    disputeRate: Math.max(0, 5 - (rating * 1.2) + Math.random() * 3),
    communicationRating: Math.min(100, 50 + (reviewCount / 10) + Math.random() * 20),
    lastUpdated: new Date()
  };
}

/**
 * Recommends the best suppliers for a user's business profile
 */
export async function recommendSuppliersForProfile(userProfile: any): Promise<any[]> {
  const allSuppliers = await storage.getAllSuppliers();
  const recommendations = [];
  
  for (const supplier of allSuppliers) {
    const evaluation = await evaluateSupplier(supplier.id);
    
    // Only recommend suppliers with good scores
    if (evaluation.recommendation === 'recommended') {
      recommendations.push({
        supplier,
        evaluation,
        whyRecommended: generateRecommendationReason(supplier, userProfile, evaluation)
      });
    }
  }
  
  // Sort by overall score
  recommendations.sort((a, b) => b.evaluation.score - a.evaluation.score);
  
  return recommendations.slice(0, 10); // Return top 10 recommendations
}

/**
 * Generates a reason why a supplier is recommended
 */
function generateRecommendationReason(supplier: any, userProfile: any, evaluation: SupplierEvaluation): string {
  const reasons = [];
  
  if (evaluation.score >= 90) {
    reasons.push('Exceptional overall performance');
  } else if (evaluation.score >= 80) {
    reasons.push('Strong performance across all metrics');
  }
  
  if (evaluation.strengths.length > 0) {
    reasons.push(`Key strengths: ${evaluation.strengths.slice(0, 2).join(', ')}`);
  }
  
  if (userProfile.targetMarkets?.includes('US') && supplier.location?.includes('US')) {
    reasons.push('Domestic supplier for faster shipping');
  }
  
  if (userProfile.monthlyBudget && parseFloat(userProfile.monthlyBudget) < 500) {
    if (supplier.minOrder <= 5) {
      reasons.push('Low minimum order suitable for your budget');
    }
  }
  
  return reasons.join('. ') || 'Good overall match for your business needs';
}