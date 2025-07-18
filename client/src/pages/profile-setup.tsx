import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, CheckCircle, Lightbulb, Target, TrendingUp, Users, Globe } from "lucide-react";
import { useLocation } from "wouter";

// Profile setup form schema
const profileSetupSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessType: z.string().min(1, "Please select a business type"),
  experience: z.string().min(1, "Please select your experience level"),
  monthlyBudget: z.string().min(1, "Please enter your monthly budget"),
  targetMarkets: z.array(z.string()).min(1, "Please select at least one target market"),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  goals: z.array(z.string()).min(1, "Please select at least one goal"),
  preferredSuppliers: z.array(z.string()).optional(),
  timezone: z.string().min(1, "Please select your timezone"),
  currency: z.string().min(1, "Please select your currency"),
});

type ProfileSetupData = z.infer<typeof profileSetupSchema>;

const businessTypes = [
  { value: "general", label: "General Store" },
  { value: "electronics", label: "Electronics & Tech" },
  { value: "fashion", label: "Fashion & Accessories" },
  { value: "home", label: "Home & Garden" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "toys", label: "Toys & Games" },
  { value: "automotive", label: "Automotive" },
];

const experienceLevels = [
  { value: "beginner", label: "Beginner", description: "New to dropshipping" },
  { value: "intermediate", label: "Intermediate", description: "Some experience with e-commerce" },
  { value: "advanced", label: "Advanced", description: "Experienced entrepreneur" },
];

const budgetRanges = [
  { value: "100", label: "Under $100/month" },
  { value: "500", label: "$100 - $500/month" },
  { value: "1000", label: "$500 - $1,000/month" },
  { value: "2000", label: "$1,000 - $2,000/month" },
  { value: "5000", label: "$2,000 - $5,000/month" },
  { value: "10000", label: "$5,000+/month" },
];

const targetMarkets = [
  { value: "US", label: "United States", flag: "🇺🇸" },
  { value: "UK", label: "United Kingdom", flag: "🇬🇧" },
  { value: "CA", label: "Canada", flag: "🇨🇦" },
  { value: "AU", label: "Australia", flag: "🇦🇺" },
  { value: "DE", label: "Germany", flag: "🇩🇪" },
  { value: "FR", label: "France", flag: "🇫🇷" },
  { value: "IT", label: "Italy", flag: "🇮🇹" },
  { value: "ES", label: "Spain", flag: "🇪🇸" },
];

const interestCategories = [
  { value: "electronics", label: "Electronics", icon: "⚡" },
  { value: "fashion", label: "Fashion", icon: "👗" },
  { value: "home", label: "Home & Garden", icon: "🏠" },
  { value: "beauty", label: "Beauty", icon: "💄" },
  { value: "sports", label: "Sports & Fitness", icon: "🏃‍♂️" },
  { value: "toys", label: "Toys & Games", icon: "🧸" },
  { value: "automotive", label: "Automotive", icon: "🚗" },
  { value: "books", label: "Books & Media", icon: "📚" },
];

const businessGoals = [
  { value: "side_income", label: "Generate side income", icon: "💰" },
  { value: "replace_job", label: "Replace full-time job", icon: "🎯" },
  { value: "build_empire", label: "Build business empire", icon: "🏢" },
  { value: "financial_freedom", label: "Achieve financial freedom", icon: "🚀" },
  { value: "learn_skills", label: "Learn new skills", icon: "🎓" },
  { value: "test_products", label: "Test product ideas", icon: "🔬" },
];

const supplierPreferences = [
  { value: "aliexpress", label: "AliExpress" },
  { value: "alibaba", label: "Alibaba" },
  { value: "dhgate", label: "DHGate" },
  { value: "local", label: "Local suppliers" },
  { value: "usa", label: "USA suppliers" },
  { value: "europe", label: "European suppliers" },
];

export default function ProfileSetupPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const form = useForm<ProfileSetupData>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      experience: "",
      monthlyBudget: "",
      targetMarkets: [],
      interests: [],
      goals: [],
      preferredSuppliers: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: "USD",
    },
  });

  const watchedValues = form.watch();

  // Get AI recommendations whenever form values change
  useEffect(() => {
    if (step >= 3 && watchedValues.businessType && watchedValues.experience) {
      fetchRecommendations();
    }
  }, [watchedValues.businessType, watchedValues.experience, watchedValues.interests, step]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/profile/recommendations", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    }
  };

  const onSubmit = async (data: ProfileSetupData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile/setup", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to set up profile");
      }

      toast({
        title: "Profile completed!",
        description: "Your dropshipping profile has been set up successfully.",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Setup failed",
        description: error instanceof Error ? error.message : "Unable to complete setup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    const values = form.getValues();
    switch (step) {
      case 1:
        return values.businessName && values.businessType;
      case 2:
        return values.experience && values.monthlyBudget;
      case 3:
        return values.targetMarkets.length > 0;
      case 4:
        return values.interests.length > 0;
      case 5:
        return values.goals.length > 0;
      case 6:
        return values.timezone && values.currency;
      default:
        return true;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome to DropshipAI</h1>
        <p className="text-center text-muted-foreground mb-6">
          Let's set up your profile to get personalized AI recommendations
        </p>
        <Progress value={progress} className="mb-4" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Tell us about your dropshipping business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., TechHub Store" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be your store name and brand identity
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your business focus" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {businessTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose your primary product category
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Experience & Budget
                </CardTitle>
                <CardDescription>
                  Help us understand your background and resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 gap-4"
                        >
                          {experienceLevels.map((level) => (
                            <div key={level.value} className="flex items-center space-x-2 border rounded-lg p-4">
                              <RadioGroupItem value={level.value} id={level.value} />
                              <Label htmlFor={level.value} className="flex-1 cursor-pointer">
                                <div className="font-medium">{level.label}</div>
                                <div className="text-sm text-muted-foreground">{level.description}</div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="monthlyBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Budget</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your monthly budget" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {budgetRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This includes advertising, tools, and inventory costs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Target Markets
                </CardTitle>
                <CardDescription>
                  Which countries do you want to sell to?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="targetMarkets"
                  render={() => (
                    <FormItem>
                      <FormLabel>Select Target Markets</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {targetMarkets.map((market) => (
                          <FormField
                            key={market.value}
                            control={form.control}
                            name="targetMarkets"
                            render={({ field }) => (
                              <FormItem key={market.value} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(market.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, market.value])
                                        : field.onChange(field.value?.filter((value) => value !== market.value))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{market.flag}</span>
                                    <span>{market.label}</span>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormDescription>
                        Choose markets based on your shipping capabilities and target audience
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {recommendations?.targetMarkets?.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      AI Recommendations
                    </h4>
                    <div className="space-y-2">
                      {recommendations.targetMarkets.map((rec: any, idx: number) => (
                        <div key={idx} className="text-sm text-blue-800">
                          <strong>{rec.title}:</strong> {rec.description}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Product Interests
                </CardTitle>
                <CardDescription>
                  What types of products interest you?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="interests"
                  render={() => (
                    <FormItem>
                      <FormLabel>Select Product Categories</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {interestCategories.map((category) => (
                          <FormField
                            key={category.value}
                            control={form.control}
                            name="interests"
                            render={({ field }) => (
                              <FormItem key={category.value} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(category.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, category.value])
                                        : field.onChange(field.value?.filter((value) => value !== category.value))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{category.icon}</span>
                                    <span>{category.label}</span>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormDescription>
                        We'll use this to recommend trending products in your areas of interest
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {recommendations?.productCategories?.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Trending Categories
                    </h4>
                    <div className="space-y-3">
                      {recommendations.productCategories.map((rec: any, idx: number) => (
                        <div key={idx} className="text-sm text-green-800">
                          <strong>{rec.title}:</strong> {rec.description}
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">Profit: {rec.profitMargin}</Badge>
                            <Badge variant="outline">Competition: {rec.competition}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Business Goals
                </CardTitle>
                <CardDescription>
                  What do you want to achieve with your dropshipping business?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="goals"
                  render={() => (
                    <FormItem>
                      <FormLabel>Select Your Goals</FormLabel>
                      <div className="grid grid-cols-1 gap-4">
                        {businessGoals.map((goal) => (
                          <FormField
                            key={goal.value}
                            control={form.control}
                            name="goals"
                            render={({ field }) => (
                              <FormItem key={goal.value} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(goal.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, goal.value])
                                        : field.onChange(field.value?.filter((value) => value !== goal.value))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{goal.icon}</span>
                                    <span>{goal.label}</span>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormDescription>
                        We'll customize your experience based on your goals
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator className="my-6" />
                
                <FormField
                  control={form.control}
                  name="preferredSuppliers"
                  render={() => (
                    <FormItem>
                      <FormLabel>Preferred Suppliers (Optional)</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {supplierPreferences.map((supplier) => (
                          <FormField
                            key={supplier.value}
                            control={form.control}
                            name="preferredSuppliers"
                            render={({ field }) => (
                              <FormItem key={supplier.value} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(supplier.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), supplier.value])
                                        : field.onChange(field.value?.filter((value) => value !== supplier.value))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {supplier.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormDescription>
                        Select suppliers you prefer to work with
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {step === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Final Settings
                </CardTitle>
                <CardDescription>
                  Complete your profile setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Your local timezone
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your preferred currency for pricing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {recommendations?.nextSteps?.length > 0 && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Your Next Steps
                    </h4>
                    <div className="space-y-3">
                      {recommendations.nextSteps.map((step: any, idx: number) => (
                        <div key={idx} className="text-sm text-purple-800">
                          <strong>{step.title}:</strong> {step.description}
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">Time: {step.timeEstimate}</Badge>
                            <Badge variant="outline">Difficulty: {step.difficulty}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {step < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!canProceed() || isLoading}
              >
                {isLoading ? "Setting up..." : "Complete Setup"}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}