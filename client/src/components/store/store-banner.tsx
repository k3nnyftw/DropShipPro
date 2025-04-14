import React from "react";
import { Button } from "@/components/ui/button";

const StoreBanner: React.FC = () => {
  return (
    <div className="relative">
      <img 
        src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae" 
        alt="Shop banner" 
        className="w-full h-64 sm:h-96 object-cover" 
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 font-display">
            Summer Collection 2023
          </h2>
          <p className="text-white text-lg mb-6">
            Discover our latest trending products at amazing prices
          </p>
          <Button 
            variant="default" 
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            Shop Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoreBanner;
