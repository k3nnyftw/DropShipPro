import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Lightbulb, 
  Sparkles, 
  AlertCircle, 
  Loader2,
  Wand2,
  Check,
  X,
  Copy,
  Send,
  BarChart,
  Brain,
  FileSpreadsheet,
  ListFilter,
  Tag
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export function ProductDescriptionGenerator() {
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [generatedDescription, setGeneratedDescription] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [options, setOptions] = useState({
    tone: 'professional',
    includeBulletPoints: true,
    targetAudience: '',
    abTestVariants: 0,
    keyPoints: [],
    seoKeywords: []
  });
  const [tempKeyPoint, setTempKeyPoint] = useState('');
  const [tempKeyword, setTempKeyword] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all products
  const productsQuery = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });

  // Fetch current product
  const productQuery = useQuery({
    queryKey: ['/api/products', selectedProductId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${selectedProductId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return response.json();
    },
    enabled: !!selectedProductId
  });

  // Generate description mutation
  const generateDescriptionMutation = useMutation({
    mutationFn: () => {
      setGenerating(true);
      return apiRequest('POST', `/api/descriptions/generate/${selectedProductId}`, options);
    },
    onSuccess: (data) => {
      setGeneratedDescription(data);
      toast({
        title: "Description Generated",
        description: "AI has successfully created a product description.",
      });
      setGenerating(false);
    },
    onError: (error) => {
      console.error('Error generating description:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the description. Please try again.",
        variant: "destructive",
      });
      setGenerating(false);
    }
  });

  // Analyze description mutation
  const analyzeDescriptionMutation = useMutation({
    mutationFn: () => {
      setAnalyzing(true);
      return apiRequest('GET', `/api/descriptions/analyze/${selectedProductId}`, {});
    },
    onSuccess: (data) => {
      setAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your product description and provided improvement suggestions.",
      });
    },
    onError: (error) => {
      console.error('Error analyzing description:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the description. Please try again.",
        variant: "destructive",
      });
      setAnalyzing(false);
    }
  });

  // Handle adding key points
  const handleAddKeyPoint = () => {
    if (tempKeyPoint.trim()) {
      setOptions({
        ...options,
        keyPoints: [...options.keyPoints, tempKeyPoint.trim()]
      });
      setTempKeyPoint('');
    }
  };

  // Handle removing key points
  const handleRemoveKeyPoint = (index: number) => {
    setOptions({
      ...options,
      keyPoints: options.keyPoints.filter((_, i) => i !== index)
    });
  };

  // Handle adding SEO keywords
  const handleAddKeyword = () => {
    if (tempKeyword.trim()) {
      setOptions({
        ...options,
        seoKeywords: [...options.seoKeywords, tempKeyword.trim()]
      });
      setTempKeyword('');
    }
  };

  // Handle removing SEO keywords
  const handleRemoveKeyword = (index: number) => {
    setOptions({
      ...options,
      seoKeywords: options.seoKeywords.filter((_, i) => i !== index)
    });
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "The text has been copied to your clipboard.",
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Copy failed",
          description: "Failed to copy text to clipboard.",
          variant: "destructive",
        });
      }
    );
  };

  // Loading state
  if (productsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Product Description Generator
          </CardTitle>
          <CardDescription>
            Loading products...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (productsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Product Description Generator
          </CardTitle>
          <CardDescription>
            Error loading products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              There was an error loading the product data. Please try again.
            </p>
            <Button 
              className="mt-4"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/products'] });
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const products = productsQuery.data || [];
  const currentProduct = productQuery.data;
  const descriptionAnalysis = analyzeDescriptionMutation.data;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Product Description Generator
          </CardTitle>
          <CardDescription>
            Automatically create compelling product descriptions optimized for conversion and SEO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Product Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Product</h3>
                <Select
                  value={selectedProductId.toString()}
                  onValueChange={(value) => setSelectedProductId(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: any) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {currentProduct && (
                  <div className="p-4 bg-muted/50 rounded-md">
                    <div className="font-medium">{currentProduct.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {currentProduct.category && <span>Category: {currentProduct.category}</span>}
                      {currentProduct.price && <span> • Price: ${currentProduct.price}</span>}
                    </div>
                    {currentProduct.description ? (
                      <div className="mt-2 text-sm">
                        <div className="font-medium">Current description:</div>
                        <div className="italic text-muted-foreground mt-1 line-clamp-3">{currentProduct.description}</div>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-muted-foreground italic">No existing description</div>
                    )}
                  </div>
                )}
              </div>

              {/* Generation Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Description Options</h3>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="tone">Writing Tone</Label>
                    <Select
                      value={options.tone}
                      onValueChange={(value) => setOptions({...options, tone: value})}
                    >
                      <SelectTrigger id="tone">
                        <SelectValue placeholder="Select a tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="targetAudience">Target Audience (optional)</Label>
                    <Input 
                      id="targetAudience" 
                      placeholder="e.g., busy professionals, parents, tech enthusiasts"
                      value={options.targetAudience}
                      onChange={(e) => setOptions({...options, targetAudience: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="includeBulletPoints" 
                      checked={options.includeBulletPoints}
                      onCheckedChange={(checked) => setOptions({...options, includeBulletPoints: !!checked})}
                    />
                    <Label htmlFor="includeBulletPoints">Include Bullet Points</Label>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="abTestVariants">A/B Test Variants</Label>
                    <Select
                      value={options.abTestVariants.toString()}
                      onValueChange={(value) => setOptions({...options, abTestVariants: parseInt(value)})}
                    >
                      <SelectTrigger id="abTestVariants">
                        <SelectValue placeholder="Number of variants" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        <SelectItem value="1">1 Variant</SelectItem>
                        <SelectItem value="2">2 Variants</SelectItem>
                        <SelectItem value="3">3 Variants</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Key Points */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-1.5">
                  <ListFilter className="h-4 w-4" />
                  Key Points
                </h3>
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add product highlights..."
                    value={tempKeyPoint}
                    onChange={(e) => setTempKeyPoint(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyPoint()}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddKeyPoint}
                    disabled={!tempKeyPoint.trim()}
                  >
                    Add
                  </Button>
                </div>
                
                {options.keyPoints.length > 0 ? (
                  <div className="space-y-2">
                    {options.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted/60 px-3 py-2 rounded-md">
                        <span className="text-sm">{point}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveKeyPoint(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    Add key points to highlight in the description
                  </div>
                )}
              </div>

              {/* SEO Keywords */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  SEO Keywords
                </h3>
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add SEO keywords..."
                    value={tempKeyword}
                    onChange={(e) => setTempKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddKeyword}
                    disabled={!tempKeyword.trim()}
                  >
                    Add
                  </Button>
                </div>
                
                {options.seoKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {options.seoKeywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1.5 pl-3 h-7">
                        {keyword}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveKeyword(index)}
                          className="h-5 w-5 p-0 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    Add keywords to optimize for search engines
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full gap-2" 
                  onClick={() => generateDescriptionMutation.mutate()}
                  disabled={!selectedProductId || generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Description
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-3">
              {/* Generated Content View */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  AI-Generated Content
                </h3>

                {generatedDescription ? (
                  <Tabs defaultValue="full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="full">
                        Full Description
                      </TabsTrigger>
                      <TabsTrigger value="short">
                        Short Description
                      </TabsTrigger>
                      <TabsTrigger value="bullets">
                        Bullet Points
                      </TabsTrigger>
                      <TabsTrigger value="seo">
                        SEO Content
                      </TabsTrigger>
                      <TabsTrigger value="social">
                        Social Media
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="full">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Full Product Description</CardTitle>
                          <CardDescription>
                            Comprehensive description for product page
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="relative bg-muted/30 p-4 rounded-md">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="absolute top-2 right-2 h-8 w-8 p-0" 
                              onClick={() => copyToClipboard(generatedDescription.fullDescription)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <p className="whitespace-pre-line">
                              {generatedDescription.fullDescription}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="short">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Short Description</CardTitle>
                          <CardDescription>
                            Concise description for product listings and cards
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="relative bg-muted/30 p-4 rounded-md">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="absolute top-2 right-2 h-8 w-8 p-0" 
                              onClick={() => copyToClipboard(generatedDescription.shortDescription)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <p>
                              {generatedDescription.shortDescription}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="bullets">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Bullet Points</CardTitle>
                          <CardDescription>
                            Key features and benefits in bullet point format
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="relative bg-muted/30 p-4 rounded-md">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="absolute top-2 right-2 h-8 w-8 p-0" 
                              onClick={() => copyToClipboard(generatedDescription.bulletPoints.join('\n• '))}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <ul className="list-disc pl-5 space-y-1">
                              {generatedDescription.bulletPoints.map((point: string, idx: number) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="seo">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">SEO Content</CardTitle>
                          <CardDescription>
                            Optimized metadata for search engines
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">SEO TITLE</Label>
                              <div className="relative bg-muted/30 p-3 rounded-md mt-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="absolute top-1 right-1 h-7 w-7 p-0" 
                                  onClick={() => copyToClipboard(generatedDescription.seoTitle)}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <p className="font-medium">{generatedDescription.seoTitle}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-xs text-muted-foreground">META DESCRIPTION</Label>
                              <div className="relative bg-muted/30 p-3 rounded-md mt-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="absolute top-1 right-1 h-7 w-7 p-0" 
                                  onClick={() => copyToClipboard(generatedDescription.seoMetaDescription)}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <p>{generatedDescription.seoMetaDescription}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-xs text-muted-foreground">SUGGESTED KEYWORDS</Label>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {generatedDescription.suggestedKeywords.map((keyword: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="bg-muted/30">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="social">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Social Media Copy</CardTitle>
                          <CardDescription>
                            Ready-to-use copy for social media posts
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="relative bg-muted/30 p-4 rounded-md">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="absolute top-2 right-2 h-8 w-8 p-0" 
                              onClick={() => copyToClipboard(generatedDescription.socialMediaCopy)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <p>
                              {generatedDescription.socialMediaCopy}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="bg-muted/30 border border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground/70 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Description Generated Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Select a product and customize your options, then click "Generate Description" to create AI-powered content for your product.
                    </p>
                  </div>
                )}

                {generatedDescription && generatedDescription.variantDescriptions && generatedDescription.variantDescriptions.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                      A/B Testing Variants
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {generatedDescription.variantDescriptions.map((variant: string, idx: number) => (
                        <Card key={idx}>
                          <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm">Variant {idx + 1}</CardTitle>
                          </CardHeader>
                          <CardContent className="py-3 px-4">
                            <div className="relative bg-muted/30 p-3 rounded-md">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="absolute top-2 right-2 h-7 w-7 p-0" 
                                onClick={() => copyToClipboard(variant)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <p className="text-sm">
                                {variant}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {currentProduct && currentProduct.description && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-purple-500" />
                        Description Analysis
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => analyzeDescriptionMutation.mutate()}
                        disabled={analyzing}
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="h-3.5 w-3.5 mr-2" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>

                    {descriptionAnalysis ? (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <Label className="text-xs text-muted-foreground">SEO SCORE</Label>
                                <span className="text-xs font-medium">{Math.round(descriptionAnalysis.seoScore)}%</span>
                              </div>
                              <Progress value={descriptionAnalysis.seoScore} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <Label className="text-xs text-muted-foreground">READABILITY</Label>
                                <span className="text-xs font-medium">{Math.round(descriptionAnalysis.readabilityScore)}%</span>
                              </div>
                              <Progress value={descriptionAnalysis.readabilityScore} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <Label className="text-xs text-muted-foreground">PERSUASIVENESS</Label>
                                <span className="text-xs font-medium">{descriptionAnalysis.persuasivenesScore}/10</span>
                              </div>
                              <Progress value={descriptionAnalysis.persuasivenesScore * 10} />
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div className="space-y-4">
                            <h4 className="text-sm font-medium">Improvement Suggestions</h4>
                            <div className="space-y-2">
                              {descriptionAnalysis.improvementSuggestions.map((suggestion: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className="rounded-full bg-purple-100 p-1 mt-0.5">
                                    <Sparkles className="h-3 w-3 text-purple-600" />
                                  </div>
                                  <span className="text-sm">{suggestion}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div>
                            <h4 className="text-sm font-medium mb-2">Keyword Density</h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(descriptionAnalysis.keywordDensity).map(([keyword, count]: [string, any], idx) => (
                                <div key={idx} className="text-xs px-2.5 py-1 rounded-full bg-muted flex items-center gap-1.5">
                                  <span>{keyword}</span>
                                  <Badge variant="secondary" className="rounded-full h-5 px-1.5">
                                    {count}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <Brain className="h-10 w-10 text-muted-foreground/70 mx-auto mb-3" />
                          <p className="text-muted-foreground">
                            Click "Analyze" to get AI-powered insights on your current description
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}