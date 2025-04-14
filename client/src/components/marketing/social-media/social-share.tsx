import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Share, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Check, 
  Copy, 
  CalendarClock, 
  Zap, 
  BarChart, 
  PieChart,
  Users,
  Loader2,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Send,
  Clock12,
  Clock3,
  Clock1,
  Sparkles,
  EyeIcon,
  CreditCard,
  PencilIcon,
  Target
} from 'lucide-react';
import { SiTiktok, SiPinterest } from 'react-icons/si';

// Type definitions for social media components
interface SocialPlatform {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  shareTextLimit: number;
}

interface SocialPostFormat {
  tone: 'professional' | 'casual' | 'enthusiastic' | 'informative' | 'luxury';
  includeEmojis: boolean;
  includePrice: boolean;
  includeCta: boolean;
  includeHashtags: boolean;
  hashtagCount: number;
}

interface GeneratedSocialContent {
  platform: string;
  text: string;
  hashtags: string[];
  mediaUrls: string[];
  linkUrl?: string;
}

interface ScheduledPost {
  id: number;
  productId?: number;
  platform: string;
  content: GeneratedSocialContent;
  scheduledTime: Date;
  status: 'scheduled' | 'posted' | 'failed';
  performance?: {
    likes: number;
    shares: number;
    comments: number;
    clicks: number;
    reach: number;
  };
}

// Social platforms data
const socialPlatforms: SocialPlatform[] = [
  { 
    value: 'facebook', 
    label: 'Facebook', 
    icon: <Facebook className="h-6 w-6" />, 
    color: 'bg-blue-600',
    shareTextLimit: 500
  },
  { 
    value: 'twitter', 
    label: 'Twitter', 
    icon: <Twitter className="h-6 w-6" />, 
    color: 'bg-sky-500',
    shareTextLimit: 280
  },
  { 
    value: 'instagram', 
    label: 'Instagram', 
    icon: <Instagram className="h-6 w-6" />, 
    color: 'bg-pink-600',
    shareTextLimit: 2200
  },
  { 
    value: 'pinterest', 
    label: 'Pinterest', 
    icon: <SiPinterest className="h-5 w-5" />, 
    color: 'bg-red-600',
    shareTextLimit: 500
  },
  { 
    value: 'tiktok', 
    label: 'TikTok', 
    icon: <SiTiktok className="h-5 w-5" />, 
    color: 'bg-black',
    shareTextLimit: 150
  },
  { 
    value: 'linkedin', 
    label: 'LinkedIn', 
    icon: <Linkedin className="h-6 w-6" />, 
    color: 'bg-blue-800',
    shareTextLimit: 3000
  }
];

// Tone options
const toneOptions = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'casual', label: 'Casual', description: 'Friendly and conversational' },
  { value: 'enthusiastic', label: 'Enthusiastic', description: 'Excited and energetic' },
  { value: 'informative', label: 'Informative', description: 'Educational and detailed' },
  { value: 'luxury', label: 'Luxury', description: 'Elegant and high-end' }
];

// Time slot options for scheduling
const timeSlots = [
  { value: '9:00', label: '9:00 AM', icon: <Clock12 className="h-4 w-4 mr-2" /> },
  { value: '12:00', label: '12:00 PM', icon: <Clock12 className="h-4 w-4 mr-2" /> },
  { value: '15:00', label: '3:00 PM', icon: <Clock3 className="h-4 w-4 mr-2" /> },
  { value: '18:00', label: '6:00 PM', icon: <Clock12 className="h-4 w-4 mr-2" /> },
  { value: '20:00', label: '8:00 PM', icon: <Clock1 className="h-4 w-4 mr-2" /> }
];

export default function SocialShare() {
  const [activeTab, setActiveTab] = useState('share');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(1); // Default to first product
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showContentPreviewModal, setShowContentPreviewModal] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('9:00');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, GeneratedSocialContent>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state for social post format options
  const [postFormat, setPostFormat] = useState<SocialPostFormat>({
    tone: 'enthusiastic',
    includeEmojis: true,
    includePrice: true,
    includeCta: true,
    includeHashtags: true,
    hashtagCount: 3
  });
  
  // Fetch products
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

  // Fetch scheduled posts
  const scheduledPostsQuery = useQuery({
    queryKey: ['/api/social-media/scheduled'],
    queryFn: async () => {
      const response = await fetch('/api/social-media/scheduled');
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled posts');
      }
      return response.json();
    }
  });

  // Fetch optimal posting times
  const optimalTimesQuery = useQuery({
    queryKey: ['/api/social-media/optimal-times'],
    queryFn: async () => {
      const response = await fetch('/api/social-media/optimal-times');
      if (!response.ok) {
        throw new Error('Failed to fetch optimal posting times');
      }
      return response.json();
    }
  });

  // Fetch analytics
  const analyticsQuery = useQuery({
    queryKey: ['/api/social-media/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/social-media/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch social media analytics');
      }
      return response.json();
    }
  });

  // Generate social content mutation
  const generateContentMutation = useMutation({
    mutationFn: () => {
      setIsGeneratingContent(true);
      
      // Generate content for each selected platform
      const generatePromises = selectedPlatforms.map(platform => 
        apiRequest('POST', `/api/social-media/generate/${selectedProductId}`, {
          platform,
          options: postFormat
        })
      );
      
      return Promise.all(generatePromises);
    },
    onSuccess: (data) => {
      try {
        // Map the results to a record by platform
        const contentByPlatform: Record<string, GeneratedSocialContent> = {};
        
        // Ensure data is properly processed
        if (Array.isArray(data)) {
          data.forEach((content: any) => {
            if (content && content.platform) {
              contentByPlatform[content.platform] = {
                platform: content.platform,
                text: content.text || '',
                hashtags: Array.isArray(content.hashtags) ? content.hashtags : [],
                mediaUrls: Array.isArray(content.mediaUrls) ? content.mediaUrls : [],
                linkUrl: content.linkUrl
              };
            }
          });
        }
        
        setGeneratedContent(contentByPlatform);
        setIsGeneratingContent(false);
        
        toast({
          title: "Content Generated",
          description: `Social media content generated for ${Object.keys(contentByPlatform).length} platforms.`,
        });
        
        // Show the preview modal if we have content
        if (Object.keys(contentByPlatform).length > 0) {
          setShowContentPreviewModal(true);
        } else {
          toast({
            title: "Warning",
            description: "No content was generated. Please try again with different options.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error processing generated content:", error);
        setIsGeneratingContent(false);
        toast({
          title: "Error",
          description: "An error occurred while processing the generated content.",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      setIsGeneratingContent(false);
      toast({
        title: "Generation Failed",
        description: `Failed to generate social content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Share now mutation
  const shareNowMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest<{ results: Array<{success: boolean, platform: string, message: string}> }>('POST', `/api/social-media/share-now/${selectedProductId}`, {
        platforms: selectedPlatforms,
        options: postFormat
      });
    },
    onSuccess: (data: { results: Array<{success: boolean, platform: string, message: string}> }) => {
      const successCount = data?.results?.filter((r) => r.success).length || 0;
      
      toast({
        title: "Shared Successfully",
        description: `Product shared to ${successCount} out of ${selectedPlatforms.length} platforms.`,
      });
      
      // Reset selected platforms
      setSelectedPlatforms([]);
    },
    onError: (error) => {
      toast({
        title: "Sharing Failed",
        description: `Failed to share product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Schedule posts mutation
  const schedulePostsMutation = useMutation({
    mutationFn: async () => {
      // Combine date and time slot
      const scheduledDateTime = new Date(selectedScheduleDate);
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      
      return await apiRequest<{ count?: number, scheduledPosts?: any[] }>('POST', `/api/social-media/schedule/${selectedProductId}`, {
        platforms: selectedPlatforms,
        scheduledTime: scheduledDateTime.toISOString(),
        options: postFormat
      });
    },
    onSuccess: (data: { count?: number, scheduledPosts?: any[] }) => {
      const platformCount = data?.count || data?.scheduledPosts?.length || selectedPlatforms.length;
      toast({
        title: "Posts Scheduled",
        description: `Scheduled posts for ${platformCount} platforms.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/social-media/scheduled'] });
      setShowScheduleModal(false);
      setSelectedPlatforms([]);
    },
    onError: (error) => {
      toast({
        title: "Scheduling Failed",
        description: `Failed to schedule posts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Handle platform selection toggle
  const togglePlatformSelection = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  // Handle share now action
  const handleShareNow = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No Platforms Selected",
        description: "Please select at least one platform to share to.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedProductId) {
      toast({
        title: "No Product Selected",
        description: "Please select a product to share.",
        variant: "destructive",
      });
      return;
    }
    
    shareNowMutation.mutate();
  };

  // Handle schedule posts action
  const handleSchedulePosts = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No Platforms Selected",
        description: "Please select at least one platform to schedule for.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedProductId) {
      toast({
        title: "No Product Selected",
        description: "Please select a product to share.",
        variant: "destructive",
      });
      return;
    }
    
    // Open schedule modal
    setShowScheduleModal(true);
  };

  // Handle generate preview action 
  const handleGeneratePreview = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No Platforms Selected",
        description: "Please select at least one platform to generate content for.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedProductId) {
      toast({
        title: "No Product Selected",
        description: "Please select a product to share.",
        variant: "destructive",
      });
      return;
    }
    
    generateContentMutation.mutate();
  };

  // Handle schedule submit
  const handleScheduleSubmit = () => {
    schedulePostsMutation.mutate();
  };

  // Find platform data by value
  const getPlatformData = (platformValue: string): SocialPlatform | undefined => {
    return socialPlatforms.find(p => p.value === platformValue);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get current product
  const getCurrentProduct = () => {
    if (!productsQuery.data || !selectedProductId) return null;
    return productsQuery.data.find((p: any) => p.id === selectedProductId);
  };

  // Loading state
  if (productsQuery.isLoading || scheduledPostsQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading social media data...</p>
      </div>
    );
  }

  // Error state
  if (productsQuery.isError || scheduledPostsQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive mb-4">Error loading social media data</p>
        <Button 
          variant="outline" 
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/products'] });
            queryClient.invalidateQueries({ queryKey: ['/api/social-media/scheduled'] });
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const products = productsQuery.data || [];
  const scheduledPosts = scheduledPostsQuery.data?.scheduledPosts || [];
  const optimalTimes = optimalTimesQuery.data || [];
  const analytics = analyticsQuery.data || { 
    overallStats: {}, 
    platformStats: [], 
    topPerformingPosts: []
  };
  const currentProduct = getCurrentProduct();

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="share" className="flex items-center">
              <Share className="mr-2 h-4 w-4" />
              Share Products
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center">
              <CalendarClock className="mr-2 h-4 w-4" />
              Scheduled Posts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="optimal" className="flex items-center">
              <Target className="mr-2 h-4 w-4" />
              Optimal Times
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Share Products Tab */}
        <TabsContent value="share" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share className="mr-2 h-5 w-5" />
                One-Click Social Media Sharing
              </CardTitle>
              <CardDescription>
                Automatically share your products across multiple social platforms with optimized content
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  {/* Product Selection */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Product</Label>
                      <Select 
                        value={selectedProductId?.toString()} 
                        onValueChange={(value) => setSelectedProductId(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product: any) => (
                            <SelectItem 
                              key={product.id} 
                              value={product.id.toString()}
                            >
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {currentProduct && (
                      <Card className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {currentProduct.imageUrl && (
                              <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                                <img 
                                  src={currentProduct.imageUrl} 
                                  alt={currentProduct.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium text-sm">{currentProduct.name}</h3>
                              <p className="text-xs text-muted-foreground">{currentProduct.category}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-medium">
                                  ${currentProduct.salePrice || currentProduct.price}
                                </span>
                                {currentProduct.salePrice && (
                                  <span className="text-xs line-through text-muted-foreground">
                                    ${currentProduct.price}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Platform Selection */}
                    <div className="space-y-3 pt-2">
                      <Label>Select Platforms</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {socialPlatforms.map(platform => (
                          <Button
                            key={platform.value}
                            variant={selectedPlatforms.includes(platform.value) ? "default" : "outline"}
                            className={`flex flex-col h-auto py-3 gap-2 ${
                              selectedPlatforms.includes(platform.value) 
                                ? `${platform.color} text-white hover:${platform.color} hover:text-white` 
                                : ""
                            }`}
                            onClick={() => togglePlatformSelection(platform.value)}
                          >
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center
                              ${selectedPlatforms.includes(platform.value) 
                                ? 'bg-white/20' 
                                : `${platform.color} text-white`}
                            `}>
                              {platform.icon}
                            </div>
                            <span className="text-xs">{platform.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  {/* Content Options */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Content Customization</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tone">Tone</Label>
                        <Select 
                          value={postFormat.tone} 
                          onValueChange={(value: any) => setPostFormat({...postFormat, tone: value})}
                        >
                          <SelectTrigger id="tone">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                          <SelectContent>
                            {toneOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex flex-col">
                                  <span>{option.label}</span>
                                  <span className="text-xs text-muted-foreground">{option.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="hashtagCount">Number of Hashtags</Label>
                        <Select 
                          value={postFormat.hashtagCount.toString()} 
                          onValueChange={(value) => setPostFormat({...postFormat, hashtagCount: parseInt(value)})}
                          disabled={!postFormat.includeHashtags}
                        >
                          <SelectTrigger id="hashtagCount">
                            <SelectValue placeholder="Select count" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6].map(count => (
                              <SelectItem key={count} value={count.toString()}>
                                {count === 0 ? 'None' : count}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between border p-3 rounded-md">
                        <Label htmlFor="includeEmojis" className="cursor-pointer flex items-center gap-2">
                          <span>Include Emojis</span>
                        </Label>
                        <Switch
                          id="includeEmojis"
                          checked={postFormat.includeEmojis}
                          onCheckedChange={(checked) => setPostFormat({...postFormat, includeEmojis: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between border p-3 rounded-md">
                        <Label htmlFor="includePrice" className="cursor-pointer flex items-center gap-2">
                          <span>Show Price</span>
                        </Label>
                        <Switch
                          id="includePrice"
                          checked={postFormat.includePrice}
                          onCheckedChange={(checked) => setPostFormat({...postFormat, includePrice: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between border p-3 rounded-md">
                        <Label htmlFor="includeCta" className="cursor-pointer flex items-center gap-2">
                          <span>Include Call-to-Action</span>
                        </Label>
                        <Switch
                          id="includeCta"
                          checked={postFormat.includeCta}
                          onCheckedChange={(checked) => setPostFormat({...postFormat, includeCta: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between border p-3 rounded-md">
                        <Label htmlFor="includeHashtags" className="cursor-pointer flex items-center gap-2">
                          <span>Use Hashtags</span>
                        </Label>
                        <Switch
                          id="includeHashtags"
                          checked={postFormat.includeHashtags}
                          onCheckedChange={(checked) => setPostFormat({...postFormat, includeHashtags: checked})}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-3">
                      <Button 
                        variant="default" 
                        className="flex-1"
                        onClick={handleGeneratePreview}
                        disabled={isGeneratingContent || !selectedProductId || selectedPlatforms.length === 0}
                      >
                        {isGeneratingContent ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            Preview Content
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleSchedulePosts}
                        disabled={!selectedProductId || selectedPlatforms.length === 0}
                      >
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Schedule
                      </Button>
                      
                      <Button 
                        variant="default" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleShareNow}
                        disabled={shareNowMutation.isPending || !selectedProductId || selectedPlatforms.length === 0}
                      >
                        {shareNowMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sharing...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Share Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Posts Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarClock className="mr-2 h-5 w-5" />
                Scheduled Social Media Posts
              </CardTitle>
              <CardDescription>
                View and manage upcoming scheduled posts across all platforms
              </CardDescription>
            </CardHeader>

            <CardContent>
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Scheduled Posts</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    You don't have any scheduled social media posts. Select products to share and schedule posts to maximize your social media presence.
                  </p>
                  <Button onClick={() => setActiveTab('share')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Your First Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Group posts by date */}
                  {(() => {
                    // Group posts by date (YYYY-MM-DD)
                    const groupedPosts: Record<string, ScheduledPost[]> = {};
                    
                    scheduledPosts.forEach((post: ScheduledPost) => {
                      const date = new Date(post.scheduledTime);
                      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                      
                      if (!groupedPosts[dateKey]) {
                        groupedPosts[dateKey] = [];
                      }
                      
                      groupedPosts[dateKey].push(post);
                    });
                    
                    // Sort dates
                    const sortedDates = Object.keys(groupedPosts).sort((a, b) => {
                      const dateA = new Date(a);
                      const dateB = new Date(b);
                      return dateA.getTime() - dateB.getTime();
                    });
                    
                    return sortedDates.map(dateKey => {
                      const posts = groupedPosts[dateKey];
                      const date = new Date(posts[0].scheduledTime);
                      
                      return (
                        <div key={dateKey} className="space-y-3">
                          <h3 className="text-sm font-medium text-muted-foreground">
                            {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                          </h3>
                          
                          <div className="space-y-2">
                            {posts.map((post: ScheduledPost) => {
                              const platform = getPlatformData(post.platform);
                              
                              return (
                                <Card key={post.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: platform?.color.split('-')[1] || 'gray' }}>
                                  <div className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${platform?.color || 'bg-gray-500'} text-white`}>
                                          {platform?.icon}
                                        </div>
                                        <div>
                                          <h4 className="font-medium">{platform?.label || 'Unknown Platform'}</h4>
                                          <p className="text-xs text-muted-foreground">
                                            {formatDate(post.scheduledTime)}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <Badge variant={post.status === 'scheduled' ? 'outline' : post.status === 'posted' ? 'default' : 'destructive'}>
                                        {post.status === 'scheduled' ? 'Scheduled' : post.status === 'posted' ? 'Posted' : 'Failed'}
                                      </Badge>
                                    </div>
                                    
                                    <div className="mt-3">
                                      <p className="text-sm line-clamp-2">{post.content.text}</p>
                                      
                                      {post.content.hashtags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {post.content.hashtags.map((tag, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                              #{tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {post.productId && (
                                      <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">
                                          Product: {products.find((p: any) => p.id === post.productId)?.name || `ID: ${post.productId}`}
                                        </span>
                                        
                                        <div className="flex gap-2">
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.overallStats.totalEngagement?.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-green-600 mt-2">
                  <span className="inline-block p-1 rounded-full bg-green-100 mr-1">
                    <ChevronRight className="h-3 w-3" />
                  </span>
                  {analytics.overallStats.averageEngagementRate?.toFixed(1)}% engagement rate
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Link Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.overallStats.totalClicks?.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {analytics.overallStats.totalPosts} posts
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenue Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics.overallStats.totalRevenue?.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <CreditCard className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    From social referrals
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Best Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${getPlatformData(analytics.overallStats.bestPerformingPlatform)?.color || 'bg-gray-500'} text-white`}
                  >
                    {getPlatformData(analytics.overallStats.bestPerformingPlatform)?.icon}
                  </div>
                  <div className="text-xl font-bold">
                    {getPlatformData(analytics.overallStats.bestPerformingPlatform)?.label || 'Unknown'}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Highest engagement & conversion
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Platform Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>
                Compare performance across different social media platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.platformStats && analytics.platformStats.map((platform: any) => (
                  <Card key={platform.platform} className="overflow-hidden border-t-4" style={{ borderTopColor: getPlatformData(platform.platform)?.color.split('-')[1] || 'gray' }}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center 
                            ${getPlatformData(platform.platform)?.color || 'bg-gray-500'} text-white`}
                          >
                            {getPlatformData(platform.platform)?.icon}
                          </div>
                          <CardTitle className="text-base">
                            {getPlatformData(platform.platform)?.label || platform.platform}
                          </CardTitle>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {platform.postsCount} posts
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Likes</p>
                            <p className="text-sm font-medium">{platform.likes.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Shares</p>
                            <p className="text-sm font-medium">{platform.shares.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Comments</p>
                            <p className="text-sm font-medium">{platform.comments.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-muted-foreground">Engagement Rate</span>
                            <span className="font-medium">{platform.engagementRate.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            className="h-1.5" 
                            value={platform.engagementRate * 5} // multiply to make it more visible
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-muted-foreground">Conversion Rate</span>
                            <span className="font-medium">{platform.conversionRate.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            className="h-1.5" 
                            value={platform.conversionRate * 10} // multiply to make it more visible
                          />
                        </div>
                        
                        <div className="pt-2 border-t flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Revenue</span>
                          <span className="text-sm font-bold">${platform.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Top Performing Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>
                Your most successful social media posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPerformingPosts && analytics.topPerformingPosts.map((post: any, index: number) => {
                  const platform = getPlatformData(post.platform);
                  const productName = products.find((p: any) => p.id === post.productId)?.name || `Product #${post.productId}`;
                  
                  return (
                    <div key={post.id} className="flex gap-4 items-start border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex-shrink-0 text-lg font-bold text-muted-foreground w-6 text-center">
                        #{index + 1}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-grow">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${platform?.color || 'bg-gray-500'} text-white flex-shrink-0`}>
                          {platform?.icon}
                        </div>
                        
                        <div className="flex-grow">
                          <h4 className="font-medium text-sm">{productName}</h4>
                          <p className="text-xs text-muted-foreground">
                            Posted: {new Date(post.postDate).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-medium">{post.engagement.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Engagement</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="font-medium">{post.clicks.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Clicks</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="font-medium">${post.revenue.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Optimal Times Tab */}
        <TabsContent value="optimal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Optimal Posting Times
              </CardTitle>
              <CardDescription>
                AI-determined best times to post for maximum engagement on each platform
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {optimalTimesQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Analyzing optimal posting times...</p>
                </div>
              ) : optimalTimesQuery.isError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-destructive mb-4">Error loading optimal posting times</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ['/api/social-media/optimal-times'] });
                    }}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {optimalTimes.map((platformData: any) => {
                      const platform = getPlatformData(platformData.platform);
                      
                      return (
                        <Card key={platformData.platform} className="overflow-hidden border-t-4" style={{ borderTopColor: platform?.color.split('-')[1] || 'gray' }}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${platform?.color || 'bg-gray-500'} text-white`}>
                                {platform?.icon}
                              </div>
                              <CardTitle className="text-base">
                                {platform?.label || platformData.platform}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-4">
                            <div className="space-y-4">
                              {platformData.optimalTimes.map((timeData: any, index: number) => (
                                <div key={index} className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-medium">{timeData.dayOfWeek}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {timeData.engagementRate.toFixed(1)}% engagement
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {timeData.timeRanges.map((timeRange: string, idx: number) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {timeRange}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2"
                                onClick={() => {
                                  // Set active tab to 'share' and select this platform
                                  setActiveTab('share');
                                  setSelectedPlatforms([platformData.platform]);
                                }}
                              >
                                Schedule for {platform?.label || platformData.platform}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                        AI-Powered Posting Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 rounded-md bg-blue-50 border border-blue-100">
                          <h4 className="font-medium text-blue-800 mb-1">Did you know?</h4>
                          <p className="text-sm text-blue-700">
                            Posts scheduled during optimal times receive up to 3x more engagement than those posted at random times.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">General Best Practices</h4>
                            <ul className="space-y-1">
                              <li className="text-sm flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>Schedule posts 24-48 hours in advance</span>
                              </li>
                              <li className="text-sm flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>Post 3-5 times per week for consistent engagement</span>
                              </li>
                              <li className="text-sm flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>Use platform-specific content formats</span>
                              </li>
                              <li className="text-sm flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>Analyze performance weekly and adjust strategy</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium">Platform-Specific Tips</h4>
                            <ul className="space-y-1">
                              <li className="text-sm flex items-start gap-2">
                                <div className="h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Facebook className="h-2.5 w-2.5 text-white" />
                                </div>
                                <span>Facebook: Include questions to boost comments</span>
                              </li>
                              <li className="text-sm flex items-start gap-2">
                                <div className="h-4 w-4 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Twitter className="h-2.5 w-2.5 text-white" />
                                </div>
                                <span>Twitter: Use 1-2 hashtags maximum</span>
                              </li>
                              <li className="text-sm flex items-start gap-2">
                                <div className="h-4 w-4 rounded-full bg-pink-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Instagram className="h-2.5 w-2.5 text-white" />
                                </div>
                                <span>Instagram: Use high-quality visuals in 1:1 ratio</span>
                              </li>
                              <li className="text-sm flex items-start gap-2">
                                <div className="h-4 w-4 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <SiPinterest className="h-2 w-2 text-white" />
                                </div>
                                <span>Pinterest: Use vertical images (2:3 ratio)</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Content Preview Modal */}
      <Dialog open={showContentPreviewModal} onOpenChange={setShowContentPreviewModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Social Media Content Preview</DialogTitle>
            <DialogDescription>
              Review the AI-generated content for each platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            {Object.entries(generatedContent).map(([platform, content]) => {
              const platformData = getPlatformData(platform);
              
              return (
                <Card key={platform} className="overflow-hidden">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${platformData?.color || 'bg-gray-500'} text-white`}>
                        {platformData?.icon}
                      </div>
                      <CardTitle className="text-base">
                        {platformData?.label || platform}
                      </CardTitle>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {content.text.length} / {platformData?.shareTextLimit || 280} chars
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(content.text);
                          toast({
                            title: "Copied to clipboard",
                            description: `${platformData?.label || platform} content copied to clipboard.`,
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      value={content.text} 
                      className="min-h-[100px] resize-none"
                      readOnly
                    />
                    
                    {content.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {content.hashtags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {content.linkUrl && (
                      <div className="mt-2 text-xs text-muted-foreground break-all">
                        Link: {content.linkUrl}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowContentPreviewModal(false)}
              className="sm:order-1"
            >
              Close
            </Button>
            
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700 sm:order-3"
              onClick={() => {
                setShowContentPreviewModal(false);
                handleShareNow();
              }}
              disabled={shareNowMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              Share Now
            </Button>
            
            <Button 
              variant="outline" 
              className="sm:order-2"
              onClick={() => {
                setShowContentPreviewModal(false);
                handleSchedulePosts();
              }}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Posts</DialogTitle>
            <DialogDescription>
              Schedule your posts for the optimal time to maximize engagement
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <div className="border rounded-md p-4">
                <Calendar
                  mode="single"
                  selected={selectedScheduleDate}
                  onSelect={(date) => date && setSelectedScheduleDate(date)}
                  disabled={(date) => date < new Date()}
                  className="mx-auto"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Select Time</Label>
              <Select 
                value={selectedTimeSlot} 
                onValueChange={setSelectedTimeSlot}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(slot => (
                    <SelectItem key={slot.value} value={slot.value}>
                      <div className="flex items-center">
                        {slot.icon}
                        {slot.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
              <h4 className="text-sm font-medium text-blue-800 flex items-center mb-1">
                <Sparkles className="h-4 w-4 mr-1.5 text-blue-600" />
                Optimal Posting Time
              </h4>
              <p className="text-xs text-blue-700">
                Based on our AI analysis, the best time to post on {
                  selectedPlatforms.length === 1 
                    ? getPlatformData(selectedPlatforms[0])?.label 
                    : 'these platforms'
                } is between 9:00 AM - 11:00 AM or 7:00 PM - 9:00 PM for maximum engagement.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleScheduleSubmit}
              disabled={schedulePostsMutation.isPending}
            >
              {schedulePostsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Schedule Posts
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}