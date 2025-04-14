import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Linkedin, 
  Loader2,
  PlusCircle,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { SiPinterest, SiTiktok } from 'react-icons/si';
import { FaCheckCircle } from 'react-icons/fa';

interface SocialAccount {
  id: number;
  platform: string;
  username: string;
  connected: boolean;
  followers?: number;
  lastPostDate?: Date;
  status: 'active' | 'pending' | 'error';
  error?: string;
}

interface ConnectAccountFormData {
  platform: string;
  username: string;
  accessToken?: string;
}

export default function SocialConnect() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [newAccount, setNewAccount] = useState<ConnectAccountFormData>({
    platform: '',
    username: '',
    accessToken: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch connected social accounts
  const accountsQuery = useQuery({
    queryKey: ['/api/social-media/accounts'],
    queryFn: async () => {
      const response = await fetch('/api/social-media/accounts');
      if (!response.ok) {
        throw new Error('Failed to fetch social accounts');
      }
      return response.json();
    }
  });

  // Connect social account mutation
  const connectAccountMutation = useMutation({
    mutationFn: (accountData: ConnectAccountFormData) => {
      console.log("Connecting social account:", accountData);
      return apiRequest('POST', '/api/social-media/accounts/connect', accountData);
    },
    onSuccess: () => {
      toast({
        title: "Account Connected",
        description: "Your social media account has been connected successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media/accounts'] });
      setShowConnectModal(false);
      resetConnectForm();
    },
    onError: (error) => {
      console.error("Error connecting social account:", error);
      toast({
        title: "Connection Error",
        description: `Failed to connect account: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Disconnect social account mutation
  const disconnectAccountMutation = useMutation({
    mutationFn: (accountId: number) => {
      return apiRequest('DELETE', `/api/social-media/accounts/${accountId}`);
    },
    onSuccess: () => {
      toast({
        title: "Account Disconnected",
        description: "Your social media account has been disconnected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media/accounts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to disconnect account: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Toggle account status mutation
  const toggleAccountMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => {
      return apiRequest('PATCH', `/api/social-media/accounts/${id}`, { active });
    },
    onSuccess: () => {
      toast({
        title: "Account Updated",
        description: "Your social media account status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media/accounts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update account: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Reset connect form
  const resetConnectForm = () => {
    setNewAccount({
      platform: '',
      username: '',
      accessToken: ''
    });
  };

  // Handle connect account
  const handleConnectAccount = () => {
    // Validate form
    if (!newAccount.platform || !newAccount.username) {
      toast({
        title: "Validation Error",
        description: "Please select a platform and enter your username.",
        variant: "destructive",
      });
      return;
    }
    
    connectAccountMutation.mutate(newAccount);
  };

  // Handle disconnect account
  const handleDisconnectAccount = (id: number) => {
    disconnectAccountMutation.mutate(id);
  };

  // Handle toggle account status
  const handleToggleAccountStatus = (id: number, currentActive: boolean) => {
    toggleAccountMutation.mutate({ id, active: !currentActive });
  };

  // Get platform icon
  const getPlatformIcon = (platform: string, className: string = "h-5 w-5") => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className={className} />;
      case 'instagram':
        return <Instagram className={className} />;
      case 'twitter':
      case 'x':
        return <Twitter className={className} />;
      case 'youtube':
        return <Youtube className={className} />;
      case 'linkedin':
        return <Linkedin className={className} />;
      case 'pinterest':
        return <SiPinterest className={className} />;
      case 'tiktok':
        return <SiTiktok className={className} />;
      default:
        return <Facebook className={className} />;
    }
  };

  // Format date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  // Loading state
  if (accountsQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading connected accounts...</p>
      </div>
    );
  }

  // Error state
  if (accountsQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-destructive mb-4">Error loading social accounts</p>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/social-media/accounts'] })}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const accounts = accountsQuery.data?.accounts || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Connected Social Accounts</CardTitle>
            <CardDescription>
              Manage your connected social media platforms for content sharing
            </CardDescription>
          </div>
          <Button onClick={() => setShowConnectModal(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Connect Account
          </Button>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/10">
              <div className="flex justify-center mb-4 space-x-2">
                <Facebook className="h-6 w-6 text-muted-foreground" />
                <Instagram className="h-6 w-6 text-muted-foreground" />
                <Twitter className="h-6 w-6 text-muted-foreground" />
                <Youtube className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Social Accounts Connected</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Connect your social media accounts to enable one-click sharing and content automation
              </p>
              <Button onClick={() => setShowConnectModal(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Connect Your First Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account: SocialAccount) => (
                <div 
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getPlatformIcon(account.platform, "h-8 w-8")}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold">
                          {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                        </h3>
                        <div className="ml-2">
                          {account.status === 'active' && (
                            <Badge className="bg-green-100 text-green-800">Connected</Badge>
                          )}
                          {account.status === 'pending' && (
                            <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                          )}
                          {account.status === 'error' && (
                            <Badge className="bg-red-100 text-red-800">Connection Error</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">@{account.username}</p>
                      {account.error && (
                        <p className="text-xs text-destructive mt-1">{account.error}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {account.status === 'active' && (
                      <div className="flex flex-col items-end mr-4">
                        {account.followers && (
                          <span className="text-sm">{account.followers.toLocaleString()} followers</span>
                        )}
                        {account.lastPostDate && (
                          <span className="text-xs text-muted-foreground">
                            Last post: {formatDate(account.lastPostDate)}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center mr-2">
                      <Switch 
                        checked={account.status === 'active'} 
                        onCheckedChange={() => handleToggleAccountStatus(account.id, account.status === 'active')}
                        disabled={account.status === 'pending' || account.status === 'error'}
                      />
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnectAccount(account.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connect Account Modal */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent className="sm:max-w-[500px]" aria-describedby="connect-social-account-description">
          <DialogHeader>
            <DialogTitle>Connect Social Media Account</DialogTitle>
            <DialogDescription>
              Link your social media accounts to enable one-click sharing and content automation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Select Platform</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'Pinterest', 'YouTube', 'TikTok'].map((platform) => (
                    <Button
                      key={platform}
                      type="button"
                      variant={newAccount.platform.toLowerCase() === platform.toLowerCase() ? "default" : "outline"}
                      className="flex flex-col items-center justify-center h-20 p-2"
                      onClick={() => setNewAccount({...newAccount, platform: platform.toLowerCase()})}
                    >
                      {getPlatformIcon(platform)}
                      <span className="mt-1 text-xs">{platform}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username or Handle</Label>
                <Input 
                  id="username" 
                  placeholder="e.g., yourusername"
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accessToken">
                  Access Token <span className="text-xs text-muted-foreground">(For API access, optional)</span>
                </Label>
                <Input 
                  id="accessToken" 
                  placeholder="Access token for API integration"
                  value={newAccount.accessToken}
                  onChange={(e) => setNewAccount({...newAccount, accessToken: e.target.value})}
                  type="password"
                />
                <p className="text-xs text-muted-foreground">
                  For full automation features, you'll need to provide an access token from your social media developer account.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConnectAccount}
              disabled={connectAccountMutation.isPending}
            >
              {connectAccountMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}