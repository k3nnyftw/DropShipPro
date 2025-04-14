import React from "react";
import Header from "./header";
import Footer from "./footer";
import TabNavigation from "./tab-navigation";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <TabNavigation />
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
