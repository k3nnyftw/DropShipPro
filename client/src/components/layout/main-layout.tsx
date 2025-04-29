import React from "react";
import Header from "./header";
import Footer from "./footer";
import TabNavigation from "./tab-navigation";
import { SkipToContent } from "@/lib/accessibility";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col h-screen bg-gray-50 text-gray-800 overflow-hidden">
      {/* Add skip to content link for keyboard users */}
      <SkipToContent />
      
      <Header />
      
      {/* Add id for skip link target and improve semantics */}
      <main id="main-content" className="flex-grow container mx-auto px-4 py-6 overflow-y-auto">
        <TabNavigation />
        <div className="pt-4" role="region" aria-label="Page content" style={{ minHeight: "100%" }}>
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
