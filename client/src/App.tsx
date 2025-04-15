import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layout/main-layout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import { lazyImportDefault } from "@/lib/lazyImport";
import { Loader2 } from "lucide-react";

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

// Suspense fallback loading component
const PageLoader = () => (
  <div className="flex h-[75vh] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading page...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MainLayout>
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
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </ErrorBoundary>
        </MainLayout>
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
