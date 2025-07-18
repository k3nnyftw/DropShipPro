import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bot, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Sparkles, 
  Plus, 
  RefreshCw,
  BarChart3,
  ShoppingCart,
  Star,
  Eye,
  Zap,
  Clock,
  Calendar
} from "lucide-react";

interface DiscoveredProduct {
  name: string;
  category: string;
  estimatedPrice: number;
  costPrice: number;
  profitMargin: number;
  demandScore: number;
  competitionLevel: number;
  profitabilityScore: number;
  keywords: string[];
  targetMarkets: string[];
  estimatedMonthlySales: number;
  trendingScore: number;
  seasonality: string;
  suggestedMarkup: number;
}

interface AutoDiscoveryProps {
  userPreferences?: any;
}

export function AutoDiscovery({ userPreferences }: AutoDiscoveryProps) {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredProducts, setDiscoveredProducts] = useState<DiscoveredProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const discoverProductsMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const response = await apiRequest('POST', '/api/ai-analytics/discover-products', preferences);
      return response.json();
    },
    onSuccess: (data) => {
      setDiscoveredProducts(data.products);
      toast({
        title: "Product Discovery Complete",
        description: `Found ${data.products.length} profitable products based on your preferences.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Discovery Failed",
        description: error instanceof Error ? error.message : "Failed to discover products",
        variant: "destructive",
      });
    }
  });

  const addToStoreMutation = useMutation({
    mutationFn: async (products: DiscoveredProduct[]) => {
      const addPromises = products.map(product => 
        apiRequest('POST', '/api/products', {
          name: product.name,
          description: `${product.name} - High-profit ${product.category} product with ${product.profitMargin}% margin`,
          price: product.estimatedPrice.toFixed(2),
          costPrice: product.costPrice.toFixed(2),
          category: product.category,
          imageUrl: `https://source.unsplash.com/400x400/?${product.keywords.join(',').replace(/\s+/g, '-')}`,
          inventory: 100,
          trending: product.trendingScore > 80,
          rating: "4.5",
          reviewCount: Math.floor(Math.random() * 200) + 50
        })
      );
      
      return Promise.all(addPromises);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setSelectedProducts(new Set());
      toast({
        title: "Products Added",
        description: `Successfully added ${variables.length} products to your store.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Products",
        description: error instanceof Error ? error.message : "Failed to add products to store",
        variant: "destructive",
      });
    }
  });

  const startDiscovery = async () => {
    setIsDiscovering(true);
    await discoverProductsMutation.mutateAsync(userPreferences || {});
    setIsDiscovering(false);
  };

  const toggleProductSelection = (productName: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productName)) {
      newSelected.delete(productName);
    } else {
      newSelected.add(productName);
    }
    setSelectedProducts(newSelected);
  };

  const addSelectedProducts = () => {
    const selectedProductObjects = discoveredProducts.filter(p => 
      selectedProducts.has(p.name)
    );
    addToStoreMutation.mutate(selectedProductObjects);
  };

  const getProfitabilityColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 80) return "text-blue-600 bg-blue-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getCompetitionColor = (level: number) => {
    if (level <= 2) return "text-green-600 bg-green-50";
    if (level <= 4) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Product Discovery
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Let our AI automatically discover profitable products based on your business preferences, 
            market trends, and competitor analysis.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={startDiscovery}
              disabled={isDiscovering || discoverProductsMutation.isPending}
              className="flex-1 sm:flex-none"
            >
              {isDiscovering ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Discovering Products...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Discovery
                </>
              )}
            </Button>
            
            {selectedProducts.size > 0 && (
              <Button
                onClick={addSelectedProducts}
                disabled={addToStoreMutation.isPending}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Selected ({selectedProducts.size})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Discovery Progress */}
      {isDiscovering && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Analyzing Market Trends</span>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <Progress value={33} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Evaluating Competition</span>
                <Target className="w-4 h-4 text-blue-500" />
              </div>
              <Progress value={66} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Calculating Profitability</span>
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discovered Products */}
      {discoveredProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Discovered Products</h3>
            <Badge variant="secondary" className="text-sm">
              {discoveredProducts.length} products found
            </Badge>
          </div>

          <div className="grid gap-4">
            {discoveredProducts.map((product, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{product.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                        {product.seasonality === 'seasonal' && (
                          <Badge variant="secondary" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Seasonal
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.keywords.map((keyword, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.name)}
                        onChange={() => toggleProductSelection(product.name)}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${product.estimatedPrice}
                      </div>
                      <div className="text-xs text-muted-foreground">Selling Price</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {product.profitMargin}%
                      </div>
                      <div className="text-xs text-muted-foreground">Profit Margin</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {product.estimatedMonthlySales}
                      </div>
                      <div className="text-xs text-muted-foreground">Monthly Sales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {product.trendingScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Trend Score</div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Profitability</span>
                      </div>
                      <Badge className={`${getProfitabilityColor(product.profitabilityScore)}`}>
                        {product.profitabilityScore}/100
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Demand</span>
                      </div>
                      <Badge variant="outline">
                        {product.demandScore}/100
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">Competition</span>
                      </div>
                      <Badge className={`${getCompetitionColor(product.competitionLevel)}`}>
                        {product.competitionLevel}/6
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Profit Projection</span>
                    </div>
                    <div className="text-xs text-green-700">
                      Cost: ${product.costPrice.toFixed(2)} → 
                      Selling: ${product.estimatedPrice.toFixed(2)} → 
                      Profit: ${(product.estimatedPrice - product.costPrice).toFixed(2)} per unit
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      Monthly potential: ${((product.estimatedPrice - product.costPrice) * product.estimatedMonthlySales).toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {discoveredProducts.length === 0 && !isDiscovering && (
        <Card>
          <CardContent className="text-center py-12">
            <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Ready to Discover Profitable Products</h3>
            <p className="text-muted-foreground mb-4">
              Our AI will analyze market trends, competition, and your preferences to find the most profitable products for your store.
            </p>
            <Button onClick={startDiscovery} disabled={isDiscovering}>
              <Sparkles className="w-4 h-4 mr-2" />
              Start Product Discovery
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}