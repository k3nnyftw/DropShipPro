import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const StoreBanner: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="relative">
      <img 
        src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae" 
        alt="Shop banner" 
        className="w-full h-64 sm:h-96 object-cover" 
        style={{
          borderRadius: `${theme.layout.borderRadius / 2}px`
        }}
      />
      <div 
        className="absolute inset-0 bg-black bg-opacity-40 flex items-center"
        style={{
          borderRadius: `${theme.layout.borderRadius / 2}px`
        }}
      >
        <div 
          className="container mx-auto px-6"
          style={{
            maxWidth: `${theme.layout.contentWidth}px`
          }}
        >
          <h2 
            className="text-3xl sm:text-4xl font-bold text-white mb-2"
            style={{
              fontFamily: theme.typography.headingFont
            }}
          >
            Summer Collection 2023
          </h2>
          <p 
            className="text-white text-lg mb-6"
            style={{
              fontFamily: theme.typography.bodyFont,
              fontSize: `${theme.typography.baseSize}px`
            }}
          >
            Discover our latest trending products at amazing prices
          </p>
          <Button 
            variant="default" 
            size="lg"
            style={{
              backgroundColor: theme.colors.primary,
              color: '#ffffff',
              borderRadius: `${theme.layout.borderRadius}px`
            }}
          >
            Shop Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoreBanner;
