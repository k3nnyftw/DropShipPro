import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, LineChart, BarChart3, Percent, ChevronRight, TrendingUp, Clock, Users, DollarSign } from 'lucide-react';

interface ProductDetailModalProps {
  product: any;
  open: boolean;
  onClose: () => void;
  onAddToStore: (product: any) => void;
}

export default function ProductDetailModal({ product, open, onClose, onAddToStore }: ProductDetailModalProps) {
  if (!product) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-gray-600';
  };

  const getCompetitionLevel = (level: number) => {
    if (level <= 3) return { text: 'Low', color: 'text-green-600' };
    if (level <= 7) return { text: 'Medium', color: 'text-amber-600' };
    return { text: 'High', color: 'text-red-600' };
  };

  const getProfitAssessment = (profit: number) => {
    if (profit >= 30) return { text: 'High Margin', color: 'text-green-600' };
    if (profit >= 15) return { text: 'Moderate Margin', color: 'text-amber-600' };
    return { text: 'Low Margin', color: 'text-gray-600' };
  };

  const competition = getCompetitionLevel(product.competitionLevel);
  const profit = getProfitAssessment(product.profitPotential);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-1">
            <span>{product.category}</span>
            <Badge variant="outline" className="ml-2">{`Growth: ${product.growthRate}%`}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center mb-4">
            <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
            <h3 className="font-semibold text-lg">AI Analysis Score</h3>
            <span className={`ml-auto font-bold text-xl ${getScoreColor(product.recommendationScore)}`}>
              {product.recommendationScore}/100
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                  Market Trend
                </h4>
                <div className="mt-1 flex items-center">
                  <span className="text-lg font-medium">{product.growthRate}% Growth</span>
                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                    Trending Up
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Users className="h-4 w-4 mr-1.5" />
                  Competition Level
                </h4>
                <div className="mt-1 flex items-center">
                  <span className="text-lg font-medium">{product.competitionLevel}/10</span>
                  <span className={`ml-2 ${competition.color}`}>{competition.text}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                  <DollarSign className="h-4 w-4 mr-1.5" />
                  Profit Potential
                </h4>
                <div className="mt-1 flex items-center">
                  <span className="text-lg font-medium">{product.profitPotential}% Margin</span>
                  <span className={`ml-2 ${profit.color}`}>{profit.text}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1.5" />
                  Search Volume
                </h4>
                <p className="mt-1 text-lg font-medium">{product.searchVolume.toLocaleString()} monthly</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                  <LineChart className="h-4 w-4 mr-1.5" />
                  Sales Velocity
                </h4>
                <p className="mt-1 text-lg font-medium">{product.salesVelocity}/10</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  Seasonality
                </h4>
                <div className="mt-1">
                  {product.seasonality.isHighlySeasonal ? (
                    <div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                        Seasonal Product
                      </Badge>
                      <p className="mt-1 text-sm">Peak months: {product.seasonality.peakMonths.join(', ')}</p>
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                      Year-round Demand
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-900 flex items-center mb-2">
            <Sparkles className="h-4 w-4 mr-1.5 text-blue-600" />
            AI Recommendation
          </h3>
          <p className="text-blue-800">
            {product.recommendationScore >= 80 
              ? `This product shows excellent potential with strong growth and profit margins. Adding this to your store is highly recommended.`
              : product.recommendationScore >= 60
              ? `This product shows good potential with decent market trends. Consider adding it to your product lineup.`
              : `This product has moderate potential. It may be worth testing in your store but monitor performance closely.`
            }
          </p>
          
          <ul className="mt-3 space-y-2">
            <li className="flex items-start">
              <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 mr-1.5 flex-shrink-0" />
              <span className="text-blue-800">
                {product.growthRate >= 15 
                  ? `Strong growth rate of ${product.growthRate}% indicates increasing market demand`
                  : `Moderate growth rate of ${product.growthRate}% shows steady market interest`
                }
              </span>
            </li>
            <li className="flex items-start">
              <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 mr-1.5 flex-shrink-0" />
              <span className="text-blue-800">
                {product.competitionLevel <= 5
                  ? `Low competition level (${product.competitionLevel}/10) suggests a good market opportunity`
                  : `Be aware of the competition level (${product.competitionLevel}/10) when marketing this product`
                }
              </span>
            </li>
            <li className="flex items-start">
              <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 mr-1.5 flex-shrink-0" />
              <span className="text-blue-800">
                {product.profitPotential >= 25
                  ? `High profit margin potential of ${product.profitPotential}% is very attractive`
                  : `Expected profit margin of ${product.profitPotential}% is within industry standards`
                }
              </span>
            </li>
          </ul>
        </div>

        <DialogFooter className="mt-6 flex items-center justify-between sm:justify-between gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onAddToStore(product)}>
            Add to Store
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}