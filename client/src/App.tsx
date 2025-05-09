import { Route, Switch, useLocation, Redirect } from "wouter";
import { Suspense, lazy, useEffect, useCallback, createContext, useState, useContext } from "react";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layout/main-layout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import { lazyImportDefault } from "@/lib/lazyImport";
import { Loader2 } from "lucide-react";
import { 
  SkipToContent, 
  AnnouncementProvider, 
  KeyboardShortcuts,
  useAnnouncement
} from "@/lib/accessibility";
import { globalErrorHandler } from "@/lib/defensive";
// Import auth page directly to fix import issues
import AuthPage from "./pages/auth";

// Define User type
export type User = {
  id: number;
  username: string;
  email: string;
  name?: string;
};

// Create auth context
export const AuthContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}>({
  user: null,
  setUser: () => {},
  isLoading: true,
});

// Lazy load all page components
const Dashboard = lazyImportDefault(() => import("@/pages/dashboard"));
const NotFound = lazyImportDefault(() => import("@/pages/not-found"));
const StoreView = lazyImportDefault(() => import("@/pages/store-view"));
const ProductDiscovery = lazyImportDefault(() => import("@/pages/product-discovery"));
const SupplierAnalysis = lazyImportDefault(() => import("@/pages/supplier-analysis"));
const Advertising = lazyImportDefault(() => import("@/pages/advertising"));
const Orders = lazyImportDefault(() => import("@/pages/orders"));
const Automation = lazyImportDefault(() => import("@/pages/automation"));
const CompetitorTrackingPage = lazyImportDefault(() => import("@/pages/competitor-tracking"));
const ProductDescriptionGeneratorPage = lazyImportDefault(() => import("@/pages/product-description-generator"));
const EmailMarketingPage = lazyImportDefault(() => import("@/pages/email-marketing"));
const SocialSharingPage = lazyImportDefault(() => import("@/pages/social-sharing"));
const InventoryTrackingPage = lazyImportDefault(() => import("@/pages/inventory/tracking"));

// Subscription related pages
const SubscriptionPage = lazyImportDefault(() => import("@/pages/subscription"));
const SubscriptionSuccessPage = lazyImportDefault(() => import("@/pages/subscription/success"));
const SubscriptionManagementPage = lazyImportDefault(() => import("@/pages/settings/subscription"));

// Examples and demos
const MobileOptimizationDemo = lazyImportDefault(() => import("@/components/examples/mobile-optimization-demo"));

// Suspense fallback loading component
const PageLoader = () => (
  <div className="flex h-[75vh] w-full items-center justify-center" aria-label="Loading page content">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground" role="status">Loading page...</p>
    </div>
  </div>
);

// Set up global error handling
window.addEventListener('error', (event) => {
  globalErrorHandler(event.error || new Error('Unknown error occurred'));
});

window.addEventListener('unhandledrejection', (event) => {
  globalErrorHandler(
    event.reason instanceof Error 
      ? event.reason 
      : new Error(`Unhandled Promise rejection: ${event.reason}`)
  );
});

// Main app component
function AppContent() {
  const [location, setLocation] = useLocation();
  const { announce, Announcer } = useAnnouncement();
  
  // Create a navigate function
  const navigate = useCallback((path: string) => {
    setLocation(path);
  }, [setLocation]);
  
  // Announce route changes for screen readers
  useEffect(() => {
    // Extract page name from URL for announcement
    const pageName = location === '/' 
      ? 'Dashboard' 
      : location.substring(1).split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
    announce(`Navigated to ${pageName} page`, 'polite');
  }, [location, announce]);
  
  // Define keyboard shortcuts
  const shortcuts = {
    'd': () => navigate('/'),
    's': () => navigate('/store'),
    'p': () => navigate('/product-discovery'),
    'o': () => navigate('/orders'),
    'a': () => navigate('/advertising'),
    'u': () => navigate('/automation'),
    'm': () => navigate('/mobile-optimization-demo'),
    'escape': () => document.activeElement instanceof HTMLElement && document.activeElement.blur(),
  };
  
  // Access auth context to check if user is authenticated
  const { user, isLoading } = useContext(AuthContext);
  
  return (
    <>
      <SkipToContent />
      <Announcer />
      <KeyboardShortcuts shortcuts={shortcuts} />
      
      <ThemeProvider>
        {location === '/auth' ? (
          <main id="main-content" tabIndex={-1} className="outline-none">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <AuthPage />
              </Suspense>
            </ErrorBoundary>
          </main>
        ) : (
          <MainLayout>
            <main id="main-content" tabIndex={-1} className="outline-none">
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Switch>
                    {/* Public route for authentication */}
                    <Route path="/auth" component={AuthPage} />
                    
                    {/* Protected routes that require authentication */}
                    <ProtectedRoute path="/" component={Dashboard} />
                    <ProtectedRoute path="/store" component={StoreView} />
                    <ProtectedRoute path="/product-discovery" component={ProductDiscovery} />
                    <ProtectedRoute path="/supplier-analysis" component={SupplierAnalysis} />
                    <ProtectedRoute path="/advertising" component={Advertising} />
                    <ProtectedRoute path="/orders" component={Orders} />
                    <ProtectedRoute path="/automation" component={Automation} />
                    <ProtectedRoute path="/competitor-tracking" component={CompetitorTrackingPage} />
                    <ProtectedRoute path="/product-description-generator" component={ProductDescriptionGeneratorPage} />
                    <ProtectedRoute path="/email-marketing" component={EmailMarketingPage} />
                    <ProtectedRoute path="/social-sharing" component={SocialSharingPage} />
                    <ProtectedRoute path="/inventory/tracking" component={InventoryTrackingPage} />
                    <ProtectedRoute path="/mobile-optimization-demo" component={MobileOptimizationDemo} />
                    
                    {/* Subscription Routes */}
                    <ProtectedRoute path="/subscription" component={SubscriptionPage} />
                    <ProtectedRoute path="/subscription/success" component={SubscriptionSuccessPage} />
                    <ProtectedRoute path="/settings/subscription" component={SubscriptionManagementPage} />
                    
                    <Route component={NotFound} />
                  </Switch>
                </Suspense>
              </ErrorBoundary>
            </main>
          </MainLayout>
        )}
        <Toaster />
      </ThemeProvider>
    </>
  );
}

// Auth provider component
const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for user authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected route component
const ProtectedRoute: React.FC<{
  component: React.ComponentType;
  path: string;
}> = ({ component: Component, path }) => {
  const { user, isLoading } = useContext(AuthContext);
  
  return (
    <Route path={path}>
      {isLoading ? (
        <PageLoader />
      ) : user ? (
        <Component />
      ) : (
        <Redirect to="/auth" />
      )}
    </Route>
  );
};



function App() {
  return (
    <ErrorBoundary>
      <AnnouncementProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AnnouncementProvider>
    </ErrorBoundary>
  );
}

export default App;
