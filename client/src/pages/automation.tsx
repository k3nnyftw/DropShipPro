import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutomationDashboard } from "@/components/automation/automation-dashboard";
import { AutoDiscovery } from "@/components/product-discovery/auto-discovery";
import { 
  Bot, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Truck, 
  BarChart3, 
  Mail, 
  Share2,
  Package,
  Users,
  Target,
  Settings,
  Play,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Clock,
  Activity
} from "lucide-react";

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const automationFeatures = [
    {
      id: "product-discovery",
      name: "AI Product Discovery",
      description: "Automatically find profitable products based on market trends and your preferences",
      icon: Bot,
      color: "bg-blue-500",
      status: "active",
      metrics: {
        productsFound: 1247,
        avgProfitability: 87,
        successRate: 94
      }
    },
    {
      id: "price-optimization",
      name: "Dynamic Pricing",
      description: "Optimize prices automatically based on competition and demand",
      icon: DollarSign,
      color: "bg-green-500",
      status: "active",
      metrics: {
        priceAdjustments: 342,
        revenueIncrease: 23,
        competitorsTracked: 156
      }
    },
    {
      id: "supplier-automation",
      name: "Smart Supplier Management",
      description: "Automatically find, evaluate, and manage suppliers",
      icon: Truck,
      color: "bg-purple-500",
      status: "active",
      metrics: {
        suppliersEvaluated: 89,
        avgRating: 4.6,
        costSavings: 18
      }
    },
    {
      id: "order-fulfillment",
      name: "Order Automation",
      description: "Process orders automatically from receipt to delivery",
      icon: ShoppingCart,
      color: "bg-orange-500",
      status: "active",
      metrics: {
        ordersProcessed: 567,
        avgFulfillmentTime: 2.3,
        customerSatisfaction: 96
      }
    },
    {
      id: "inventory-management",
      name: "Smart Inventory",
      description: "Track inventory and predict reorder points automatically",
      icon: Package,
      color: "bg-indigo-500",
      status: "active",
      metrics: {
        productsTracked: 234,
        stockoutsPrevented: 45,
        storageOptimization: 31
      }
    },
    {
      id: "competitor-tracking",
      name: "Competitor Analysis",
      description: "Monitor competitor prices and strategies automatically",
      icon: BarChart3,
      color: "bg-red-500",
      status: "active",
      metrics: {
        competitorsMonitored: 127,
        priceChangesDetected: 89,
        marketInsights: 156
      }
    },
    {
      id: "email-marketing",
      name: "Email Automation",
      description: "Send personalized emails and campaigns automatically",
      icon: Mail,
      color: "bg-cyan-500",
      status: "active",
      metrics: {
        emailsSent: 12450,
        openRate: 28,
        conversionRate: 4.7
      }
    },
    {
      id: "social-media",
      name: "Social Media Automation",
      description: "Post content and engage across social platforms",
      icon: Share2,
      color: "bg-pink-500",
      status: "paused",
      metrics: {
        postsScheduled: 89,
        engagement: 15,
        followerGrowth: 23
      }
    }
  ];

  const quickStats = [
    { label: "Total Automations", value: "8", icon: Bot, color: "text-blue-600" },
    { label: "Active Now", value: "7", icon: Activity, color: "text-green-600" },
    { label: "Tasks Completed", value: "15.2K", icon: CheckCircle, color: "text-purple-600" },
    { label: "Time Saved", value: "247h", icon: Clock, color: "text-orange-600" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Center</h1>
          <p className="text-gray-600">Manage and monitor all your dropshipping automations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Play className="w-4 h-4 mr-2" />
            Start All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="discovery">Product Discovery</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <AutomationDashboard />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          {/* Automation Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {automationFeatures.map((feature) => (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${feature.color} rounded-lg`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.name}</CardTitle>
                        <Badge className={getStatusColor(feature.status)}>
                          {feature.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(feature.metrics).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {typeof value === 'number' ? 
                            (value > 100 ? value.toLocaleString() : value) : value}
                          {key.includes('Rate') || key.includes('Increase') || key.includes('Savings') || key.includes('Optimization') || key.includes('Growth') ? '%' : ''}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Automation Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Automation Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">$1,847</div>
                  <p className="text-sm text-gray-600">Monthly Savings</p>
                  <p className="text-xs text-gray-500">From automation vs manual</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">94.2%</div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-xs text-gray-500">Across all automations</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">247h</div>
                  <p className="text-sm text-gray-600">Time Saved</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discovery" className="space-y-4">
          <AutoDiscovery />
        </TabsContent>
      </Tabs>
    </div>
  );
}