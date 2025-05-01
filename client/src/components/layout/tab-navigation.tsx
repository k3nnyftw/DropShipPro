import React from "react";
import { useLocation, Link } from "wouter";

const TabNavigation: React.FC = () => {
  const [location] = useLocation();
  
  const tabs = [
    { name: "Dashboard", path: "/" },
    { name: "Store View", path: "/store" },
    { name: "Product Discovery", path: "/product-discovery" },
    { name: "Supplier Analysis", path: "/supplier-analysis" },
    { name: "Inventory", path: "/inventory/tracking" },
    { name: "Advertising", path: "/advertising" },
    { name: "Orders", path: "/orders" },
    { name: "Automation", path: "/automation" }
  ];

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <Link 
              key={tab.path} 
              href={tab.path}
              onClick={(e) => {
                // For any non-functioning tab, prevent default and handle manually
                if (tab.path === "/store") {
                  e.preventDefault();
                  window.location.href = tab.path;
                }
              }}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                (location === tab.path || 
                 (location === "/" && tab.path === "/")) ?
                  "border-primary-500 text-primary-600" :
                  "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;
