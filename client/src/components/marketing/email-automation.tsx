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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  CalendarClock, 
  ChevronRight, 
  BarChartBig, 
  PieChart,
  Users,
  Send,
  Mail,
  PenTool,
  Clock,
  BarChart,
  BarChart2,
  Target,
  Copy,
  Trash2,
  Edit,
  Plus,
  Calendar as CalendarIcon,
  Check,
  MailQuestion,
  Rocket,
  BadgePercent,
  ShoppingCart,
  UserPlus,
  Clock3,
  Sparkles,
  Loader2,
  Zap
} from 'lucide-react';

// Type definitions for email marketing components
interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  preheader?: string;
  bodyTemplate: string;
  bodyHtml?: string;
  campaignType: string;
  defaultPersonalization: {
    useFirstName?: boolean;
    includeRecentlyViewedProducts?: boolean;
    includePurchaseHistory?: boolean;
    dynamicProductRecommendations?: boolean;
    personalizationLevel: 'basic' | 'moderate' | 'advanced';
  };
  createdAt: Date;
  lastModified: Date;
}

interface EmailCampaign {
  id: number;
  name: string;
  subject: string;
  templateId: number;
  segment: string;
  status: 'draft' | 'scheduled' | 'sending' | 'complete';
  scheduledDate?: Date;
  personalization: {
    useFirstName?: boolean;
    includeRecentlyViewedProducts?: boolean;
    includePurchaseHistory?: boolean;
    dynamicProductRecommendations?: boolean;
    personalizationLevel: 'basic' | 'moderate' | 'advanced';
  };
  statistics?: {
    sent: number;
    opens: number;
    clicks: number;
    conversions: number;
    revenue: number;
    unsubscribes: number;
  };
  abTest?: {
    enabled: boolean;
    variant?: {
      subject: string;
      content: string;
    };
    splitRatio?: number;
    winningVersion?: 'a' | 'b';
  };
  createdAt: Date;
}

const customerSegments = [
  { value: 'new_customers', label: 'New Customers', icon: <UserPlus className="w-4 h-4 mr-2" /> },
  { value: 'repeat_customers', label: 'Repeat Customers', icon: <Users className="w-4 h-4 mr-2" /> },
  { value: 'high_value_customers', label: 'High-Value Customers', icon: <BadgePercent className="w-4 h-4 mr-2" /> },
  { value: 'at_risk_customers', label: 'At-Risk Customers', icon: <MailQuestion className="w-4 h-4 mr-2" /> },
  { value: 'abandoned_cart', label: 'Abandoned Cart', icon: <ShoppingCart className="w-4 h-4 mr-2" /> },
  { value: 'product_specific_interest', label: 'Product Interest', icon: <Target className="w-4 h-4 mr-2" /> }
];

const campaignTypes = [
  { value: 'welcome_series', label: 'Welcome Series', icon: <Mail className="w-4 h-4 mr-2" /> },
  { value: 'promotional', label: 'Promotional', icon: <BadgePercent className="w-4 h-4 mr-2" /> },
  { value: 'educational', label: 'Educational', icon: <PenTool className="w-4 h-4 mr-2" /> },
  { value: 'abandoned_cart_recovery', label: 'Abandoned Cart Recovery', icon: <ShoppingCart className="w-4 h-4 mr-2" /> },
  { value: 'post_purchase_follow_up', label: 'Post-Purchase Follow-Up', icon: <Check className="w-4 h-4 mr-2" /> },
  { value: 'new_product_announcement', label: 'New Product Announcement', icon: <Rocket className="w-4 h-4 mr-2" /> },
  { value: 'reengagement', label: 'Reengagement', icon: <Zap className="w-4 h-4 mr-2" /> }
];

const triggerEvents = [
  { value: 'purchase', label: 'Purchase Confirmation', icon: <Check className="w-4 h-4 mr-2" /> },
  { value: 'cart_abandonment', label: 'Cart Abandonment', icon: <ShoppingCart className="w-4 h-4 mr-2" /> },
  { value: 'product_view', label: 'Product View', icon: <Target className="w-4 h-4 mr-2" /> },
  { value: 'signup', label: 'New Sign-Up', icon: <UserPlus className="w-4 h-4 mr-2" /> },
  { value: 'inactivity', label: 'Customer Inactivity', icon: <Clock3 className="w-4 h-4 mr-2" /> }
];

export default function EmailAutomation() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state for new campaign
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    templateId: 0,
    segment: '',
    scheduledDate: new Date(),
    personalization: {
      useFirstName: true,
      includeRecentlyViewedProducts: false,
      includePurchaseHistory: false,
      dynamicProductRecommendations: true,
      personalizationLevel: 'moderate' as const
    }
  });
  
  // Form state for new automation
  const [newAutomation, setNewAutomation] = useState({
    triggerEvent: '',
    delay: 24,
    templateId: 0
  });
  
  // Fetch email templates
  const templatesQuery = useQuery({
    queryKey: ['/api/email-marketing/templates'],
    queryFn: async () => {
      const response = await fetch('/api/email-marketing/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch email templates');
      }
      return response.json();
    }
  });

  // Fetch active campaigns
  const campaignsQuery = useQuery({
    queryKey: ['/api/email-marketing/campaigns/active'],
    queryFn: async () => {
      const response = await fetch('/api/email-marketing/campaigns/active');
      if (!response.ok) {
        throw new Error('Failed to fetch email campaigns');
      }
      return response.json();
    }
  });

  // Fetch email analytics
  const analyticsQuery = useQuery({
    queryKey: ['/api/email-marketing/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/email-marketing/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch email analytics');
      }
      return response.json();
    }
  });

  // Fetch campaign analysis if a campaign is selected
  const campaignAnalysisQuery = useQuery({
    queryKey: ['/api/email-marketing/campaigns/analyze', selectedCampaignId],
    queryFn: async () => {
      if (!selectedCampaignId) return null;
      const response = await fetch(`/api/email-marketing/campaigns/${selectedCampaignId}/analyze`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaign analysis');
      }
      return response.json();
    },
    enabled: !!selectedCampaignId
  });

  // Create new campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (campaignData: any) => {
      console.log("Submitting campaign data:", campaignData);
      // Format the data to match the server-side expectations
      const formattedData = {
        ...campaignData,
        // Ensure status is set
        status: 'draft',
        // Add any missing fields with defaults if needed
        statistics: {
          sent: 0,
          opens: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          unsubscribes: 0
        }
      };
      return apiRequest('POST', '/api/email-marketing/campaigns', formattedData);
    },
    onSuccess: () => {
      toast({
        title: "Campaign Created",
        description: "Your email campaign has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-marketing/campaigns/active'] });
      setShowCampaignModal(false);
      resetCampaignForm();
    },
    onError: (error) => {
      console.error("Campaign creation error:", error);
      toast({
        title: "Error",
        description: `Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Create new automation mutation
  const createAutomationMutation = useMutation({
    mutationFn: (automationData: any) => {
      return apiRequest('POST', `/api/email-marketing/automated/${automationData.triggerEvent}`, {
        delay: automationData.delay,
        templateId: automationData.templateId
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Automation Created",
        description: `Your email automation has been set up successfully. ${data.message}`,
      });
      setShowAutomationModal(false);
      resetAutomationForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create automation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Reset form functions
  const resetCampaignForm = () => {
    setNewCampaign({
      name: '',
      subject: '',
      templateId: 0,
      segment: '',
      scheduledDate: new Date(),
      personalization: {
        useFirstName: true,
        includeRecentlyViewedProducts: false,
        includePurchaseHistory: false,
        dynamicProductRecommendations: true,
        personalizationLevel: 'moderate'
      }
    });
  };

  const resetAutomationForm = () => {
    setNewAutomation({
      triggerEvent: '',
      delay: 24,
      templateId: 0
    });
  };

  // Form submission handlers
  const handleCreateCampaign = () => {
    // Validate form
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.templateId || !newCampaign.segment) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    createCampaignMutation.mutate(newCampaign);
  };

  const handleCreateAutomation = () => {
    // Validate form
    if (!newAutomation.triggerEvent || !newAutomation.templateId || newAutomation.delay <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive",
      });
      return;
    }
    
    createAutomationMutation.mutate(newAutomation);
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const id = parseInt(templateId);
    setSelectedTemplateId(id);
    
    // Update the form with the selected template
    if (showCampaignModal) {
      setNewCampaign({
        ...newCampaign,
        templateId: id
      });
    } else if (showAutomationModal) {
      setNewAutomation({
        ...newAutomation,
        templateId: id
      });
    }
  };

  // Get template name by ID
  const getTemplateName = (id: number) => {
    if (templatesQuery.data && templatesQuery.data.templates) {
      const template = templatesQuery.data.templates.find((t: EmailTemplate) => t.id === id);
      return template ? template.name : 'Unknown Template';
    }
    return 'Loading...';
  };

  // Get segment label by value
  const getSegmentLabel = (value: string) => {
    const segment = customerSegments.find(s => s.value === value);
    return segment ? segment.label : value;
  };

  // Get campaign type label by value
  const getCampaignTypeLabel = (value: string) => {
    const type = campaignTypes.find(t => t.value === value);
    return type ? type.label : value;
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Loading state
  if (templatesQuery.isLoading || campaignsQuery.isLoading || analyticsQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading email marketing data...</p>
      </div>
    );
  }

  // Error state
  if (templatesQuery.isError || campaignsQuery.isError || analyticsQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive mb-4">Error loading email marketing data</p>
        <Button 
          variant="outline" 
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/email-marketing/templates'] });
            queryClient.invalidateQueries({ queryKey: ['/api/email-marketing/campaigns/active'] });
            queryClient.invalidateQueries({ queryKey: ['/api/email-marketing/analytics'] });
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const templates = templatesQuery.data?.templates || [];
  const campaigns = campaignsQuery.data?.campaigns || [];
  const analytics = analyticsQuery.data || { overallStats: {}, campaignComparison: [], segmentPerformance: [] };
  const campaignAnalysis = campaignAnalysisQuery.data;

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="campaigns" className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Email Campaigns
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center">
              <Zap className="mr-2 h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'campaigns' && (
            <Button onClick={() => setShowCampaignModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          )}
          
          {activeTab === 'automation' && (
            <Button onClick={() => setShowAutomationModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Automation
            </Button>
          )}
        </div>

        {/* Email Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Email Campaigns</CardTitle>
              <CardDescription>
                Manage your scheduled and ongoing email marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Campaigns</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    You don't have any active email campaigns yet. Create your first campaign to start engaging with your customers.
                  </p>
                  <Button onClick={() => setShowCampaignModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Campaign
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign: EmailCampaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{campaign.name}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-xs">{campaign.subject}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getSegmentLabel(campaign.segment)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              campaign.status === 'sending' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'complete' ? 'bg-gray-100 text-gray-800' :
                              'bg-amber-100 text-amber-800'
                            }
                          >
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.scheduledDate ? (
                            <div className="flex items-center text-sm">
                              <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                              {formatDate(campaign.scheduledDate)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not scheduled</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => {
                              setSelectedCampaignId(campaign.id);
                              setShowAnalysisModal(true);
                            }}
                          >
                            <BarChartBig className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          {/* Email Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Pre-built email templates for different campaign types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template: EmailTemplate) => (
                  <Card key={template.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {getCampaignTypeLabel(template.campaignType)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="text-xs text-muted-foreground mb-2 truncate">
                        <span className="font-medium">Subject:</span> {template.subject}
                      </div>
                      <div className="text-xs line-clamp-3 text-muted-foreground">
                        {template.bodyTemplate.slice(0, 100)}...
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="ghost" size="sm">
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Automation</CardTitle>
              <CardDescription>
                Set up automated email sequences triggered by customer behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Trigger Cards */}
                {triggerEvents.map(trigger => (
                  <Card key={trigger.value} className="overflow-hidden border border-muted">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center mb-2">
                        {trigger.icon}
                        <CardTitle className="text-base">{trigger.label}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        Automatically send emails when customers {trigger.label.toLowerCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm mt-2">
                        {trigger.value === 'purchase' && (
                          <p>Thank customers for their purchase and recommend related products.</p>
                        )}
                        {trigger.value === 'cart_abandonment' && (
                          <p>Remind customers about items left in their cart and offer incentives to complete purchase.</p>
                        )}
                        {trigger.value === 'product_view' && (
                          <p>Follow up with customers who viewed but didn't purchase specific products.</p>
                        )}
                        {trigger.value === 'signup' && (
                          <p>Welcome new customers with a series of onboarding emails and special offers.</p>
                        )}
                        {trigger.value === 'inactivity' && (
                          <p>Re-engage customers who haven't made a purchase or visited your store recently.</p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        className="w-full"
                        onClick={() => {
                          setNewAutomation({
                            ...newAutomation,
                            triggerEvent: trigger.value
                          });
                          setShowAutomationModal(true);
                        }}
                      >
                        Set Up {trigger.label}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Active Automations</h3>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Welcome Series */}
                      <div className="flex items-start justify-between border-b pb-5">
                        <div className="flex gap-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserPlus className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Welcome Series</h4>
                            <p className="text-sm text-muted-foreground mt-1">3-part email series sent to new sign-ups</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>
                              <span className="text-xs text-muted-foreground">Sends: Daily</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Abandoned Cart Recovery */}
                      <div className="flex items-start justify-between border-b pb-5">
                        <div className="flex gap-4">
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Abandoned Cart Recovery</h4>
                            <p className="text-sm text-muted-foreground mt-1">4-hour and 24-hour reminder emails</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>
                              <span className="text-xs text-muted-foreground">Sends: Real-time</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Post-Purchase Follow-Up */}
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Post-Purchase Follow-Up</h4>
                            <p className="text-sm text-muted-foreground mt-1">Thank you emails, reviews request, and cross-sell recommendations</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>
                              <span className="text-xs text-muted-foreground">Sends: After purchase</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Open Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.overallStats.averageOpenRate?.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Industry average: 22.8%
                </p>
                <Progress 
                  className="h-2 mt-2" 
                  value={analytics.overallStats.averageOpenRate} 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Click Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.overallStats.averageClickRate?.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Industry average: 2.6%
                </p>
                <Progress 
                  className="h-2 mt-2" 
                  value={analytics.overallStats.averageClickRate} 
                />
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
                <p className="text-xs text-muted-foreground mt-1">
                  From {analytics.overallStats.totalConversions} conversions
                </p>
                <div className="flex items-center text-xs text-green-600 mt-2">
                  <span className="inline-block p-1 rounded-full bg-green-100 mr-1">
                    <ChevronRight className="h-3 w-3" />
                  </span>
                  {analytics.overallStats.averageConversionRate?.toFixed(1)}% conversion rate
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Campaign Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Compare performance across different campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Opens</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.campaignComparison && analytics.campaignComparison.map((campaign: any) => (
                    <TableRow key={campaign.campaignId}>
                      <TableCell className="font-medium">
                        {campaign.campaignName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCampaignTypeLabel(campaign.campaignType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{campaign.openRate.toFixed(1)}%</span>
                          <Progress 
                            className="h-2 w-16" 
                            value={campaign.openRate} 
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{campaign.clickRate.toFixed(1)}%</span>
                          <Progress 
                            className="h-2 w-16" 
                            value={campaign.clickRate} 
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{campaign.conversionRate.toFixed(1)}%</span>
                          <Progress 
                            className="h-2 w-16" 
                            value={campaign.conversionRate} 
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ${campaign.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Segment Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Audience Segment Performance</CardTitle>
              <CardDescription>
                Which customer segments respond best to your emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.segmentPerformance && analytics.segmentPerformance.map((segment: any) => (
                  <Card key={segment.segment} className="border border-muted">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{getSegmentLabel(segment.segment)}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-3 mt-2">
                        <div>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-muted-foreground">Open Rate</span>
                            <span className="font-medium">{segment.openRate.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            className="h-1.5" 
                            value={segment.openRate} 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-muted-foreground">Click Rate</span>
                            <span className="font-medium">{segment.clickRate.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            className="h-1.5" 
                            value={segment.clickRate} 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-muted-foreground">Conversion Rate</span>
                            <span className="font-medium">{segment.conversionRate.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            className="h-1.5" 
                            value={segment.conversionRate} 
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Avg. Revenue</span>
                          <span className="text-sm font-bold">${segment.averageRevenue.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Modal */}
      <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Email Campaign</DialogTitle>
            <DialogDescription>
              Set up a new campaign to target specific customer segments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input 
                  id="name" 
                  placeholder="E.g., April Newsletter, Summer Sale Announcement"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject Line</Label>
                <Input 
                  id="subject" 
                  placeholder="E.g., Special Offer Inside, Your April Newsletter"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Select 
                    value={newCampaign.templateId.toString()} 
                    onValueChange={handleTemplateSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template: EmailTemplate) => (
                        <SelectItem 
                          key={template.id} 
                          value={template.id.toString()}
                        >
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="segment">Target Audience</Label>
                  <Select 
                    value={newCampaign.segment} 
                    onValueChange={(value) => setNewCampaign({...newCampaign, segment: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerSegments.map((segment) => (
                        <SelectItem 
                          key={segment.value} 
                          value={segment.value}
                        >
                          <div className="flex items-center">
                            {segment.icon}
                            {segment.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <div className="border rounded-md p-4">
                  <Calendar
                    mode="single"
                    selected={newCampaign.scheduledDate}
                    onSelect={(date) => date && setNewCampaign({...newCampaign, scheduledDate: date})}
                    className="mx-auto"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Personalization Options</Label>
                <div className="border rounded-md p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="useFirstName"
                      checked={newCampaign.personalization.useFirstName}
                      onCheckedChange={(checked) => setNewCampaign({
                        ...newCampaign,
                        personalization: {
                          ...newCampaign.personalization,
                          useFirstName: !!checked
                        }
                      })}
                    />
                    <Label htmlFor="useFirstName">Use customer's first name</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeRecentlyViewed"
                      checked={newCampaign.personalization.includeRecentlyViewedProducts}
                      onCheckedChange={(checked) => setNewCampaign({
                        ...newCampaign,
                        personalization: {
                          ...newCampaign.personalization,
                          includeRecentlyViewedProducts: !!checked
                        }
                      })}
                    />
                    <Label htmlFor="includeRecentlyViewed">Include recently viewed products</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dynamicRecommendations"
                      checked={newCampaign.personalization.dynamicProductRecommendations}
                      onCheckedChange={(checked) => setNewCampaign({
                        ...newCampaign,
                        personalization: {
                          ...newCampaign.personalization,
                          dynamicProductRecommendations: !!checked
                        }
                      })}
                    />
                    <Label htmlFor="dynamicRecommendations">Include AI product recommendations</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCampaign}
              disabled={createCampaignMutation.isPending}
            >
              {createCampaignMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Automation Modal */}
      <Dialog open={showAutomationModal} onOpenChange={setShowAutomationModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Set Up Email Automation</DialogTitle>
            <DialogDescription>
              Create automated email sequences triggered by customer behavior
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="triggerEvent">Trigger Event</Label>
                <Select 
                  value={newAutomation.triggerEvent} 
                  onValueChange={(value) => setNewAutomation({...newAutomation, triggerEvent: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger event" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerEvents.map((trigger) => (
                      <SelectItem 
                        key={trigger.value} 
                        value={trigger.value}
                      >
                        <div className="flex items-center">
                          {trigger.icon}
                          {trigger.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delay">Delay After Trigger (hours)</Label>
                <Input 
                  id="delay" 
                  type="number"
                  min="0"
                  placeholder="E.g., 24 hours"
                  value={newAutomation.delay}
                  onChange={(e) => setNewAutomation({
                    ...newAutomation, 
                    delay: parseInt(e.target.value) || 0
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  How long to wait after the trigger event before sending the email
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template">Email Template</Label>
                <Select 
                  value={newAutomation.templateId.toString()} 
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template: EmailTemplate) => (
                      <SelectItem 
                        key={template.id} 
                        value={template.id.toString()}
                      >
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {newAutomation.triggerEvent === 'cart_abandonment' && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Abandoned Cart Best Practices</h4>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                    <li>Send the first email 1-4 hours after cart abandonment</li>
                    <li>Include images of abandoned products</li>
                    <li>Consider offering a small discount or free shipping</li>
                    <li>Create urgency with limited-time offers</li>
                  </ul>
                </div>
              )}
              
              {newAutomation.triggerEvent === 'purchase' && (
                <div className="p-4 bg-green-50 rounded-md">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Post-Purchase Best Practices</h4>
                  <ul className="text-xs text-green-700 space-y-1 list-disc pl-4">
                    <li>Send an immediate thank you email</li>
                    <li>Follow up with order status updates</li>
                    <li>Ask for a review 5-7 days after delivery</li>
                    <li>Recommend related products for cross-selling</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutomationModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAutomation}
              disabled={createAutomationMutation.isPending}
            >
              {createAutomationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Set Up Automation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Analysis Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Campaign Analysis</DialogTitle>
            <DialogDescription>
              Performance metrics and optimization suggestions
            </DialogDescription>
          </DialogHeader>
          
          {campaignAnalysisQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Analyzing campaign data...</p>
            </div>
          ) : campaignAnalysisQuery.isError ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-destructive mb-4">Error loading campaign analysis</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/email-marketing/campaigns/analyze', selectedCampaignId] });
                }}
              >
                Retry
              </Button>
            </div>
          ) : campaignAnalysis ? (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{campaignAnalysis.campaignName}</h3>
                <Badge variant="outline" className="text-green-700 bg-green-50">
                  {campaignAnalysis.performance.openRate > campaignAnalysis.benchmarks.industryOpenRate ? 'Outperforming Industry' : 'Average Performance'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">Open Rate</div>
                    <div className="text-2xl font-bold">{campaignAnalysis.performance.openRate.toFixed(1)}%</div>
                    <div className="text-xs mt-1 flex items-center">
                      <span className={campaignAnalysis.performance.openRate > campaignAnalysis.benchmarks.industryOpenRate ? 'text-green-600' : 'text-amber-600'}>
                        {campaignAnalysis.performance.openRate > campaignAnalysis.benchmarks.industryOpenRate ? '↑' : '↓'} vs. industry: {campaignAnalysis.benchmarks.industryOpenRate.toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">Click Rate</div>
                    <div className="text-2xl font-bold">{campaignAnalysis.performance.clickRate.toFixed(1)}%</div>
                    <div className="text-xs mt-1 flex items-center">
                      <span className={campaignAnalysis.performance.clickRate > campaignAnalysis.benchmarks.industryClickRate ? 'text-green-600' : 'text-amber-600'}>
                        {campaignAnalysis.performance.clickRate > campaignAnalysis.benchmarks.industryClickRate ? '↑' : '↓'} vs. industry: {campaignAnalysis.benchmarks.industryClickRate.toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">Conversion Rate</div>
                    <div className="text-2xl font-bold">{campaignAnalysis.performance.conversionRate.toFixed(1)}%</div>
                    <div className="text-xs mt-1 flex items-center">
                      <span className={campaignAnalysis.performance.conversionRate > campaignAnalysis.benchmarks.industryConversionRate ? 'text-green-600' : 'text-amber-600'}>
                        {campaignAnalysis.performance.conversionRate > campaignAnalysis.benchmarks.industryConversionRate ? '↑' : '↓'} vs. industry: {campaignAnalysis.benchmarks.industryConversionRate.toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* A/B Test Results if available */}
              {campaignAnalysis.abTestResults && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">A/B Test Results</CardTitle>
                    <CardDescription>
                      Performance comparison between original and variant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Version A (Original)</span>
                          {campaignAnalysis.abTestResults.winningVersion === 'a' && (
                            <Badge className="bg-green-100 text-green-800">Winner</Badge>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-muted-foreground">Open Rate</span>
                            <span>{campaignAnalysis.performance.openRate.toFixed(1)}%</span>
                          </div>
                          <Progress className="h-1.5" value={campaignAnalysis.performance.openRate} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-muted-foreground">Click Rate</span>
                            <span>{campaignAnalysis.performance.clickRate.toFixed(1)}%</span>
                          </div>
                          <Progress className="h-1.5" value={campaignAnalysis.performance.clickRate} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-muted-foreground">Conversion Rate</span>
                            <span>{campaignAnalysis.performance.conversionRate.toFixed(1)}%</span>
                          </div>
                          <Progress className="h-1.5" value={campaignAnalysis.performance.conversionRate} />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Version B (Variant)</span>
                          {campaignAnalysis.abTestResults.winningVersion === 'b' && (
                            <Badge className="bg-green-100 text-green-800">Winner</Badge>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-muted-foreground">Open Rate</span>
                            <span>{(campaignAnalysis.performance.openRate + campaignAnalysis.abTestResults.openRateDifference).toFixed(1)}%</span>
                          </div>
                          <Progress className="h-1.5" value={campaignAnalysis.performance.openRate + campaignAnalysis.abTestResults.openRateDifference} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-muted-foreground">Click Rate</span>
                            <span>{(campaignAnalysis.performance.clickRate + campaignAnalysis.abTestResults.clickRateDifference).toFixed(1)}%</span>
                          </div>
                          <Progress className="h-1.5" value={campaignAnalysis.performance.clickRate + campaignAnalysis.abTestResults.clickRateDifference} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-muted-foreground">Conversion Rate</span>
                            <span>{(campaignAnalysis.performance.conversionRate + campaignAnalysis.abTestResults.conversionRateDifference).toFixed(1)}%</span>
                          </div>
                          <Progress className="h-1.5" value={campaignAnalysis.performance.conversionRate + campaignAnalysis.abTestResults.conversionRateDifference} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Optimization Suggestions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                    AI-Powered Optimization Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(campaignAnalysis.suggestions).map(([category, suggestions]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium mb-2 capitalize">{category} Optimization</h4>
                        <ul className="space-y-2">
                          {(suggestions as string[]).map((suggestion, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 text-xs">{idx + 1}</span>
                              </div>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No analysis data available</p>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowAnalysisModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}