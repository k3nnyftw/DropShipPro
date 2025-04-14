/**
 * Social Media Service
 * Handles social media account connections, content sharing, and analytics
 */

export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  PINTEREST = 'pinterest',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok'
}

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
  CAROUSEL = 'carousel'
}

export interface SocialAccount {
  id: number;
  platform: string;
  username: string;
  connected: boolean;
  accessToken?: string;
  followers?: number;
  lastPostDate?: Date;
  status: 'active' | 'pending' | 'error';
  error?: string;
}

export interface SocialConnectRequest {
  platform: string;
  username: string;
  accessToken?: string;
}

export interface PostContent {
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  link?: string;
  productId?: number;
  type?: PostType;
}

export interface ScheduleRequest {
  content: PostContent;
  platforms: string[];
  scheduledTime: Date;
}

// Demo accounts storage
let socialAccounts: SocialAccount[] = [
  {
    id: 1,
    platform: 'instagram',
    username: 'shopautomation',
    connected: true,
    followers: 4530,
    lastPostDate: new Date('2023-03-15'),
    status: 'active'
  },
  {
    id: 2,
    platform: 'facebook',
    username: 'shopdropautomation',
    connected: true,
    followers: 2150,
    lastPostDate: new Date('2023-03-20'),
    status: 'active'
  },
  {
    id: 3,
    platform: 'twitter',
    username: 'shopauto',
    connected: true,
    followers: 1200,
    lastPostDate: new Date('2023-03-22'),
    status: 'active'
  }
];

// Auto-increment ID tracker
let nextAccountId = 4;

/**
 * Get all connected social media accounts
 */
export async function getConnectedAccounts(): Promise<{ accounts: SocialAccount[] }> {
  return { accounts: socialAccounts };
}

/**
 * Connect a new social media account
 */
export async function connectSocialAccount(request: SocialConnectRequest): Promise<SocialAccount> {
  console.log('Connecting social account:', request);
  
  // Check if account already exists
  const existingAccount = socialAccounts.find(
    account => account.platform === request.platform && account.username === request.username
  );
  
  if (existingAccount) {
    throw new Error(`Account ${request.username} on ${request.platform} is already connected`);
  }
  
  // Simulate a real connection - would make API calls in production
  // In production, we'd use the OAuth flow for each platform
  
  // Create a new account (in pending state initially)
  const newAccount: SocialAccount = {
    id: nextAccountId++,
    platform: request.platform,
    username: request.username,
    connected: false,
    accessToken: request.accessToken,
    status: 'pending'
  };
  
  // In production, validation of credentials would happen here
  // Simulate a successful connection after a delay
  setTimeout(() => {
    const accountIndex = socialAccounts.findIndex(account => account.id === newAccount.id);
    if (accountIndex !== -1) {
      // Generate random follower count and last post date
      const randomFollowers = Math.floor(Math.random() * 5000) + 100;
      const lastPostDate = new Date();
      lastPostDate.setDate(lastPostDate.getDate() - Math.floor(Math.random() * 30));
      
      // Update account status
      socialAccounts[accountIndex] = {
        ...socialAccounts[accountIndex],
        connected: true,
        status: 'active',
        followers: randomFollowers,
        lastPostDate
      };
    }
  }, 2000);
  
  // Add to accounts list
  socialAccounts.push(newAccount);
  
  return newAccount;
}

/**
 * Disconnect a social media account
 */
export async function disconnectSocialAccount(accountId: number): Promise<void> {
  const accountIndex = socialAccounts.findIndex(account => account.id === accountId);
  
  if (accountIndex === -1) {
    throw new Error(`Account with ID ${accountId} not found`);
  }
  
  // Remove account
  socialAccounts.splice(accountIndex, 1);
  
  // In production, this would also revoke the OAuth token
}

/**
 * Update a social media account status
 */
export async function updateSocialAccountStatus(accountId: number, active: boolean): Promise<SocialAccount> {
  const accountIndex = socialAccounts.findIndex(account => account.id === accountId);
  
  if (accountIndex === -1) {
    throw new Error(`Account with ID ${accountId} not found`);
  }
  
  // Update account status
  socialAccounts[accountIndex] = {
    ...socialAccounts[accountIndex],
    connected: active,
    status: active ? 'active' : 'pending'
  };
  
  return socialAccounts[accountIndex];
}

/**
 * Share content on social media platforms immediately
 */
export async function shareContent(content: PostContent, platforms: string[]): Promise<{ success: boolean, results: any[] }> {
  if (!content.text && !content.imageUrl && !content.videoUrl) {
    throw new Error('Content must include text, image, or video');
  }
  
  if (!platforms || platforms.length === 0) {
    throw new Error('At least one platform must be specified');
  }
  
  // In production, this would make API calls to each platform
  
  // Filter accounts to only include specified platforms and active accounts
  const accountsToPost = socialAccounts.filter(
    account => platforms.includes(account.platform) && account.status === 'active'
  );
  
  if (accountsToPost.length === 0) {
    throw new Error('No active accounts available for selected platforms');
  }
  
  // Simulate posting to each platform
  const results = accountsToPost.map(account => ({
    platform: account.platform,
    username: account.username,
    success: true,
    postId: `post_${Math.random().toString(36).substring(2, 15)}`,
    timestamp: new Date()
  }));
  
  return {
    success: true,
    results
  };
}

/**
 * Generate social media content for a product
 */
export async function generateSocialContent(
  productId: number,
  platform: string,
  options?: any
): Promise<any> {
  // In production, this would fetch product details from database
  // and generate optimized content for the specific platform
  
  const platformContentTemplates: Record<string, string[]> = {
    'instagram': [
      '✨ New arrival alert! Check out our {product_name}. Perfect for {use_case}. #NewArrivals #MustHave',
      '🔥 Trending now: {product_name} - {short_description}. Shop now! #TrendAlert',
      'Our best-selling {product_name} is back in stock! {key_feature} makes it perfect for {use_case}. #ShopNow'
    ],
    'facebook': [
      'Just added to our store! {product_name} - {short_description}. Limited quantities available!',
      'FLASH SALE: Get our amazing {product_name} at a special price today only! {key_feature} makes it stand out.',
      'Customer favorite alert! {product_name} is getting 5-star reviews for its {key_feature}. See why everyone loves it!'
    ],
    'twitter': [
      'Just dropped: {product_name}! {short_description} - Shop now before it sells out! #NewProduct',
      '🔥 Our {product_name} is trending! {short_description} in just {character_limit} characters! Shop the link in bio.',
      '{product_name} is back! RT if you have been waiting for this restock. {short_description} #ShopNow'
    ],
    'pinterest': [
      '{product_name}: {key_feature} that will transform your {use_case}. Save this pin for later!',
      'How to use our {product_name} for the perfect {use_case}. #ProductTips #MustHave',
      '{product_name} styling ideas: {short_description} - Perfect for {use_case}! #StyleGuide'
    ]
  };
  
  // Default template if platform not found
  const defaultTemplates = [
    'Check out our new {product_name}! {short_description}',
    'Just arrived: {product_name} - {short_description}. Shop now!',
    'Featured product: {product_name}. {key_feature} makes it perfect for {use_case}.'
  ];
  
  // Get templates for the platform or use default
  const templates = platformContentTemplates[platform] || defaultTemplates;
  
  // Select a random template
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // Mock product details - in production would fetch from database
  const productDetails = {
    id: productId,
    name: 'Wireless Earbuds',
    short_description: 'Premium sound quality with noise cancellation',
    key_feature: '24-hour battery life',
    use_case: 'workouts and commuting',
    price: '$49.99',
    imageUrl: 'https://example.com/products/earbuds.jpg',
    character_limit: '280'
  };
  
  // Replace template placeholders with product details
  let contentText = randomTemplate;
  Object.entries(productDetails).forEach(([key, value]) => {
    contentText = contentText.replace(new RegExp(`{${key}}`, 'g'), String(value));
  });
  
  // Generate hashtags based on platform
  const hashtagsByPlatform: Record<string, string[]> = {
    'instagram': ['#NewArrivals', '#MustHave', '#ShopNow', '#TrendingProduct'],
    'twitter': ['#NewProduct', '#ShopNow', '#MustHave', '#Deal'],
    'facebook': [],
    'pinterest': ['#ProductTips', '#MustHave', '#StyleGuide', '#ShoppingTips']
  };
  
  // Add hashtags if applicable for the platform
  const hashtags = hashtagsByPlatform[platform] || [];
  const selectedHashtags = hashtags.slice(0, 3); // Use up to 3 hashtags
  
  return {
    productId,
    platform,
    content: {
      text: contentText,
      hashtags: selectedHashtags,
      imageUrl: productDetails.imageUrl,
      link: `https://example.com/products/${productId}`
    },
    preview: {
      text: contentText + (selectedHashtags.length > 0 ? ' ' + selectedHashtags.join(' ') : ''),
      imageUrl: productDetails.imageUrl
    }
  };
}

/**
 * Share a product on social media immediately
 */
export async function shareProductNow(
  productId: number,
  platforms: string[],
  options?: any
): Promise<any[]> {
  // Generate content for each platform
  const results = [];
  
  for (const platform of platforms) {
    try {
      // Generate content for this platform
      const generatedContent = await generateSocialContent(productId, platform, options);
      
      // Share to this platform
      const shareResult = await shareContent(
        {
          text: generatedContent.preview.text,
          imageUrl: generatedContent.preview.imageUrl,
          productId: productId
        },
        [platform]
      );
      
      results.push({
        platform,
        success: true,
        postId: shareResult.results[0]?.postId,
        timestamp: new Date()
      });
    } catch (error) {
      results.push({
        platform,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

/**
 * Schedule social media posts for a product
 */
export async function scheduleProductPosts(
  productId: number,
  platforms: string[],
  scheduledDate: Date,
  options?: any
): Promise<any[]> {
  const scheduledPosts = [];
  
  for (const platform of platforms) {
    try {
      // Generate content for this platform
      const generatedContent = await generateSocialContent(productId, platform, options);
      
      // Schedule for this platform
      const scheduleResult = await scheduleContent({
        content: {
          text: generatedContent.preview.text,
          imageUrl: generatedContent.preview.imageUrl,
          productId: productId
        },
        platforms: [platform],
        scheduledTime: scheduledDate
      });
      
      scheduledPosts.push({
        platform,
        success: true,
        scheduleId: scheduleResult.scheduleId,
        scheduledTime: scheduledDate,
        content: generatedContent.preview
      });
    } catch (error) {
      scheduledPosts.push({
        platform,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return scheduledPosts;
}

/**
 * Schedule content to be posted later
 */
export async function scheduleContent(request: ScheduleRequest): Promise<{ success: boolean, scheduleId: string }> {
  if (!request.content.text && !request.content.imageUrl && !request.content.videoUrl) {
    throw new Error('Content must include text, image, or video');
  }
  
  if (!request.platforms || request.platforms.length === 0) {
    throw new Error('At least one platform must be specified');
  }
  
  if (!request.scheduledTime || new Date(request.scheduledTime) < new Date()) {
    throw new Error('Scheduled time must be in the future');
  }
  
  // In production, this would store the schedule in a database
  // and use a scheduler (like cron jobs) to post at the scheduled time
  
  // Generate a unique ID for the schedule
  const scheduleId = `schedule_${Math.random().toString(36).substring(2, 15)}`;
  
  return {
    success: true,
    scheduleId
  };
}

/**
 * Get analytics for social media posts
 */
export async function getSocialMediaAnalytics(): Promise<any> {
  // In production, this would fetch analytics from each platform's API
  
  return {
    overallStats: {
      totalPosts: 201,
      totalEngagement: 12850,
      totalReach: 54300,
      conversionRate: 2.8
    },
    platformStats: [
      {
        platform: 'instagram',
        posts: 85,
        engagement: 5420,
        reach: 22500,
        conversionRate: 3.2
      },
      {
        platform: 'facebook',
        posts: 65,
        engagement: 3850,
        reach: 18200,
        conversionRate: 2.4
      },
      {
        platform: 'twitter',
        posts: 51,
        engagement: 3580,
        reach: 13600,
        conversionRate: 1.9
      }
    ],
    topPosts: [
      {
        platform: 'instagram',
        postId: 'post_1',
        content: 'New wireless earbuds just arrived! #tech #music',
        engagement: 845,
        reach: 3200,
        conversions: 32
      },
      {
        platform: 'facebook',
        postId: 'post_2',
        content: 'Summer sale! 30% off all products. Limited time only!',
        engagement: 720,
        reach: 2800,
        conversions: 48
      }
    ]
  };
}

/**
 * Get optimal posting times for social media
 */
export async function getOptimalPostingTimes(): Promise<any[]> {
  // In production, this would analyze past performance data
  // and recommend optimal posting times
  
  return [
    {
      platform: 'instagram',
      optimalTimes: [
        { day: 'Monday', time: '12:00', score: 85 },
        { day: 'Wednesday', time: '18:00', score: 92 },
        { day: 'Friday', time: '17:30', score: 88 }
      ]
    },
    {
      platform: 'facebook',
      optimalTimes: [
        { day: 'Tuesday', time: '13:00', score: 80 },
        { day: 'Thursday', time: '19:00', score: 87 },
        { day: 'Saturday', time: '11:00', score: 81 }
      ]
    },
    {
      platform: 'twitter',
      optimalTimes: [
        { day: 'Monday', time: '9:00', score: 78 },
        { day: 'Wednesday', time: '12:00', score: 84 },
        { day: 'Friday', time: '15:00', score: 82 }
      ]
    }
  ];
}

/**
 * Get scheduled posts with optional filtering
 */
export async function getScheduledPosts(
  startDate?: Date,
  endDate?: Date,
  platform?: SocialPlatform
): Promise<any[]> {
  // In production, this would fetch from a database with filtering
  
  const allScheduledPosts = [
    {
      id: 'schedule_1',
      content: {
        text: 'Check out our new fall collection! #fashion #style',
        imageUrl: 'https://example.com/fall-collection.jpg'
      },
      platforms: ['instagram', 'facebook'],
      scheduledTime: new Date(Date.now() + 86400000) // Tomorrow
    },
    {
      id: 'schedule_2',
      content: {
        text: 'Flash sale! 24 hours only. Use code FLASH24',
        imageUrl: 'https://example.com/flash-sale.jpg'
      },
      platforms: ['instagram', 'facebook', 'twitter'],
      scheduledTime: new Date(Date.now() + 172800000) // Day after tomorrow
    }
  ];
  
  // Filter by date range if specified
  let filteredPosts = allScheduledPosts;
  
  if (startDate) {
    filteredPosts = filteredPosts.filter(post => new Date(post.scheduledTime) >= startDate);
  }
  
  if (endDate) {
    filteredPosts = filteredPosts.filter(post => new Date(post.scheduledTime) <= endDate);
  }
  
  // Filter by platform if specified
  if (platform) {
    filteredPosts = filteredPosts.filter(post => post.platforms.includes(platform));
  }
  
  return filteredPosts;
}

/**
 * Validate that specific platforms can be posted to
 */
export function validatePlatforms(platforms: string[]): { valid: boolean, invalidPlatforms: string[] } {
  const validPlatforms = new Set(['instagram', 'facebook', 'twitter', 'pinterest', 'linkedin', 'tiktok']);
  const availablePlatforms = new Set(socialAccounts.filter(a => a.status === 'active').map(a => a.platform));
  
  const invalidPlatforms = platforms.filter(platform => !validPlatforms.has(platform));
  const unavailablePlatforms = platforms.filter(platform => !availablePlatforms.has(platform) && validPlatforms.has(platform));
  
  return {
    valid: invalidPlatforms.length === 0 && unavailablePlatforms.length === 0,
    invalidPlatforms: [...invalidPlatforms, ...unavailablePlatforms]
  };
}