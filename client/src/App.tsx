import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import StoreView from "@/pages/store-view";
import ProductDiscovery from "@/pages/product-discovery";
import SupplierAnalysis from "@/pages/supplier-analysis";
import Advertising from "@/pages/advertising";
import Orders from "@/pages/orders";
import Automation from "@/pages/automation";
import CompetitorTrackingPage from "@/pages/competitor-tracking";
import ProductDescriptionGeneratorPage from "@/pages/product-description-generator";
import EmailMarketingPage from "@/pages/email-marketing";
import SocialSharingPage from "@/pages/social-sharing";

function App() {
  return (
    <>
      <MainLayout>
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
      </MainLayout>
      <Toaster />
    </>
  );
}

export default App;
