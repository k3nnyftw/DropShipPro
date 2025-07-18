import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bot, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Truck, 
  BarChart3, 
  Zap,
  Play,
  Pause,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Sparkles,
  Eye,
  RefreshCw,
  Activity,
  Globe,
  Mail,
  Share2,
  Users,
  Package,
  CreditCard,
  Gauge
} from "lucide-react";

interface AutomationStatus {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status: 'active' | 'paused' | 'error' | 'disabled';
  lastRun: Date;
  nextRun?: Date;
  metrics: {
    totalRuns: number;
    successRate: number;
    avgProcessingTime: number;
    impactScore: number;
  };
  icon: any;
}

interface AutomationMetrics {
  totalAutomations: number;
  activeAutomations: number;
  totalTasksCompleted: number;
  timeSaved: number;
  costSaved: number;
  errorRate: number;
  averageEfficiency: number;
}

export function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch automation status
  const { data: automationStatus = [], isLoading: statusLoading } = useQuery({
    queryKey: ['/api/automation/status'],
    queryFn: async () => {
      // In a real implementation, this would fetch from API
      // For now, we'll return simulated data
      return [
        {
          id: 'product-discovery',
          name: 'AI Product Discovery',
          description: 'Automatically finds profitable products based on market trends',
          enabled: true,
          status: 'active',
          lastRun: new Date(),
          nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
          metrics: {
            totalRuns: 47,
            successRate: 96,
            avgProcessingTime: 45,
            impactScore: 94
          },
          icon: Bot
        },
        {
          id: 'price-optimization',
          name: 'Dynamic Price Optimization',
          description: 'Adjusts prices based on market conditions and competition',
          enabled: true,
          status: 'active',
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000),
          metrics: {
            totalRuns: 124,
            successRate: 98,
            avgProcessingTime: 12,
            impactScore: 91
          },
          icon: DollarSign
        },
        {
          id: 'supplier-sourcing',
          name: 'Automated Supplier Sourcing',
          description: 'Finds and evaluates suppliers automatically',
          enabled: true,
          status: 'active',
          lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
          metrics: {
            totalRuns: 32,
            successRate: 89,
            avgProcessingTime: 67,
            impactScore: 87
          },
          icon: Truck
        },
        {
          id: 'order-fulfillment',
          name: 'Order Fulfillment Automation',
          description: 'Processes orders from receipt to delivery',
          enabled: true,
          status: 'active',
          lastRun: new Date(Date.now() - 30 * 60 * 1000),
          nextRun: new Date(Date.now() + 1 * 60 * 60 * 1000),
          metrics: {
            totalRuns: 87,
            successRate: 94,
            avgProcessingTime: 23,
            impactScore: 92
          },
          icon: ShoppingCart
        },
        {
          id: 'inventory-management',
          name: 'Smart Inventory Management',
          description: 'Tracks inventory and predicts reorder points',
          enabled: true,
          status: 'active',
          lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000),
          metrics: {
            totalRuns: 156,
            successRate: 99,
            avgProcessingTime: 8,
            impactScore: 85
          },
          icon: Package
        },
        {
          id: 'competitor-tracking',
          name: 'Competitor Price Monitoring',
          description: 'Monitors competitor prices and market trends',
          enabled: true,
          status: 'active',
          lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000),
          metrics: {
            totalRuns: 73,
            successRate: 97,
            avgProcessingTime: 34,
            impactScore: 88
          },
          icon: BarChart3
        },
        {
          id: 'email-marketing',
          name: 'Email Marketing Automation',
          description: 'Sends personalized emails to customers',
          enabled: true,
          status: 'active',
          lastRun: new Date(Date.now() - 8 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000),
          metrics: {
            totalRuns: 203,
            successRate: 95,
            avgProcessingTime: 15,
            impactScore: 82
          },
          icon: Mail
        },
        {
          id: 'social-media',
          name: 'Social Media Automation',
          description: 'Posts content across social media platforms',
          enabled: false,
          status: 'paused',
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
          metrics: {
            totalRuns: 45,
            successRate: 91,
            avgProcessingTime: 28,
            impactScore: 76
          },
          icon: Share2
        }
      ];
    }
  });

  // Calculate overall metrics
  const overallMetrics: AutomationMetrics = {
    totalAutomations: automationStatus.length,
    activeAutomations: automationStatus.filter(a => a.enabled).length,
    totalTasksCompleted: automationStatus.reduce((sum, a) => sum + a.metrics.totalRuns, 0),
    timeSaved: 247, // hours saved
    costSaved: 1850, // dollars saved
    errorRate: 4.2, // percentage
    averageEfficiency: 89 // percentage
  };

  const toggleAutomation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      // In a real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id, enabled };
    },
    onSuccess: (data) => {
      // Update the automation status
      queryClient.setQueryData(['/api/automation/status'], (oldData: any) => 
        oldData.map((automation: any) => 
          automation.id === data.id 
            ? { ...automation, enabled: data.enabled, status: data.enabled ? 'active' : 'paused' }
            : automation
        )
      );
      toast({
        title: "Automation Updated",
        description: `Automation ${data.enabled ? 'enabled' : 'disabled'} successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update automation",
        variant: "destructive",
      });
    }
  });

  const refreshData = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['/api/automation/status'] });
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'disabled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'disabled': return <Clock className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Dashboard</h1>
          <p className="text-gray-600">Monitor and control your dropshipping automation systems</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Automations</p>
                <p className="text-2xl font-bold text-green-600">
                  {overallMetrics.activeAutomations}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {overallMetrics.totalTasksCompleted.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-purple-600">
                  {overallMetrics.timeSaved}h
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cost Saved</p>
                <p className="text-2xl font-bold text-green-600">
                  ${overallMetrics.costSaved.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">System Efficiency</span>
                    <span className="text-sm text-gray-600">{overallMetrics.averageEfficiency}%</span>
                  </div>
                  <Progress value={overallMetrics.averageEfficiency} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm text-gray-600">{overallMetrics.errorRate}%</span>
                  </div>
                  <Progress value={100 - overallMetrics.errorRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uptime</span>
                    <span className="text-sm text-gray-600">99.2%</span>
                  </div>
                  <Progress value={99.2} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {automationStatus.slice(0, 5).map((automation) => (
                  <div key={automation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <automation.icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{automation.name}</p>
                        <p className="text-sm text-gray-600">
                          Last run: {automation.lastRun.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(automation.status)}>
                      {automation.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          {/* Automation Controls */}
          <div className="grid gap-4">
            {automationStatus.map((automation) => (
              <Card key={automation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <automation.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{automation.name}</h3>
                          {getStatusIcon(automation.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{automation.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-blue-600">{automation.metrics.totalRuns}</p>
                            <p className="text-xs text-gray-600">Total Runs</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{automation.metrics.successRate}%</p>
                            <p className="text-xs text-gray-600">Success Rate</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-purple-600">{automation.metrics.avgProcessingTime}s</p>
                            <p className="text-xs text-gray-600">Avg Time</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-orange-600">{automation.metrics.impactScore}</p>
                            <p className="text-xs text-gray-600">Impact Score</p>
                          </div>
                        </div>

                        {automation.nextRun && (
                          <p className="text-sm text-gray-500">
                            Next run: {automation.nextRun.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.enabled}
                        onCheckedChange={(checked) => 
                          toggleAutomation.mutate({ id: automation.id, enabled: checked })
                        }
                        disabled={toggleAutomation.isPending}
                      />
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Performance Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasks Completed (This Month)</span>
                    <span className="text-sm font-bold text-green-600">+23%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Success Rate</span>
                    <span className="text-sm font-bold text-blue-600">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Time Saved per Day</span>
                    <span className="text-sm font-bold text-purple-600">8.2 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cost Reduction</span>
                    <span className="text-sm font-bold text-green-600">$247/day</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Top Performing Automations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {automationStatus
                    .sort((a, b) => b.metrics.impactScore - a.metrics.impactScore)
                    .slice(0, 5)
                    .map((automation) => (
                      <div key={automation.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <automation.icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">{automation.name}</span>
                        </div>
                        <Badge variant="outline">{automation.metrics.impactScore}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Automation Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Automation Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${overallMetrics.costSaved.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total Cost Savings</p>
                  <p className="text-xs text-gray-500">Compared to manual operations</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {overallMetrics.timeSaved}h
                  </div>
                  <p className="text-sm text-gray-600">Time Saved</p>
                  <p className="text-xs text-gray-500">Manual work eliminated</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {overallMetrics.averageEfficiency}%
                  </div>
                  <p className="text-sm text-gray-600">Efficiency Gain</p>
                  <p className="text-xs text-gray-500">Over manual processes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}