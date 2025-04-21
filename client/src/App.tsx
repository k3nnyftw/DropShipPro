import { Route, Switch, useLocation } from "wouter";
import { Suspense, lazy, useEffect, useCallback } from "react";
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
  
  return (
    <>
      <SkipToContent />
      <Announcer />
      <KeyboardShortcuts shortcuts={shortcuts} />
      
      <ThemeProvider>
        <MainLayout>
          <main id="main-content" tabIndex={-1} className="outline-none">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/store" component={StoreView} />
                  <Route path="/product-discovery" component={ProductDiscovery} />
                  <Route path="/supplier-analysis" component={SupplierAnalysis} />
                  <Route path="/advertising" component={Advertising} />
                  <Route path="/orders" component={Orders} />
                  <Route path="/automation" component={Automation} />
                  <Route path="/competitor-tracking" component={CompetitorTrackingPage} />
                  <Route path="/product-description-generator" component={ProductDescriptionGeneratorPage} />
                  <Route path="/email-marketing" component={EmailMarketingPage} />
                  <Route path="/social-sharing" component={SocialSharingPage} />
                  <Route path="/mobile-optimization-demo" component={MobileOptimizationDemo} />
                  
                  {/* Subscription Routes */}
                  <Route path="/subscription" component={SubscriptionPage} />
                  <Route path="/subscription/success" component={SubscriptionSuccessPage} />
                  <Route path="/settings/subscription" component={SubscriptionManagementPage} />
                  
                  <Route component={NotFound} />
                </Switch>
              </Suspense>
            </ErrorBoundary>
          </main>
        </MainLayout>
        <Toaster />
      </ThemeProvider>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AnnouncementProvider>
        <AppContent />
      </AnnouncementProvider>
    </ErrorBoundary>
  );
}

export default App;
