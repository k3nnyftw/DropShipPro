import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import StoreHeader from "@/components/store/store-header";
import StoreBanner from "@/components/store/store-banner";
import ProductCard from "@/components/store/product-card";
import { StoreThemeEditor, ThemeOptions } from "@/components/store/theme-editor";
import { useQuery } from "@tanstack/react-query";
import { Eye, Palette, ExternalLink } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const StoreView: React.FC = () => {
  const [themeEditorOpen, setThemeEditorOpen] = useState(false);
  const { theme, updateTheme } = useTheme();
  const { toast } = useToast();
  
  const { data: products } = useQuery({
    queryKey: ['/api/products/featured'],
    initialData: [
      {
        id: 1,
        name: "Wireless Earbuds",
        description: "Bluetooth 5.0 with Noise Cancellation",
        price: 49.99,
        salePrice: 69.99,
        isNew: true,
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
        rating: 4.5,
        reviewCount: 42
      },
      {
        id: 2,
        name: "Adjustable Laptop Stand",
        description: "Ergonomic Design, Aluminum",
        price: 35.50,
        imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45",
        rating: 4.0,
        reviewCount: 28
      },
      {
        id: 3,
        name: "Fitness Smart Watch",
        description: "Heart Rate & Sleep Monitor",
        price: 59.99,
        salePrice: 74.99,
        isOnSale: true,
        imageUrl: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf",
        rating: 5.0,
        reviewCount: 56
      },
      {
        id: 4,
        name: "Portable Power Bank",
        description: "10000mAh, Fast Charging",
        price: 29.99,
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
        rating: 3.5,
        reviewCount: 37
      }
    ]
  });

  const handleThemeSave = (newTheme: ThemeOptions) => {
    // Update the theme using our context
    updateTheme(newTheme);
    
    // Show success message
    toast({
      title: "Theme updated",
      description: "Your store theme has been successfully updated."
    });
  };
  
  const openStorePreview = () => {
    // Open a new tab with the store preview
    window.open("/store-preview", "_blank");
    toast({
      title: "Store preview opened",
      description: "Your store has been opened in a new tab."
    });
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">Your Online Store</h1>
          <p className="text-gray-600">Preview and manage how customers see your store</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="default"
            onClick={() => setThemeEditorOpen(true)}
          >
            <Palette className="mr-2 h-4 w-4" />
            Edit Theme
          </Button>
          <Button onClick={openStorePreview}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit Store
          </Button>
        </div>
      </div>

      {/* Store Preview */}
      <Card 
        className="bg-white rounded-lg shadow-sm overflow-hidden"
        style={{
          backgroundColor: theme.colors.background,
          borderRadius: `${theme.layout.borderRadius}px`
        }}
      >
        <StoreHeader />
        <StoreBanner />

        {/* Featured Products */}
        <div 
          className="container mx-auto py-8 px-4"
          style={{
            maxWidth: `${theme.layout.contentWidth}px`,
            padding: `${theme.layout.spacing}px`,
          }}
        >
          <h2 
            className="text-2xl font-bold mb-6"
            style={{
              color: theme.colors.text,
              fontFamily: theme.typography.headingFont
            }}
          >
            Featured Products
          </h2>
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            style={{
              gap: `${theme.layout.spacing}px`
            }}
          >
            {products.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              style={{
                borderColor: theme.colors.primary,
                color: theme.colors.primary
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View All Products
            </Button>
          </div>
        </div>
      </Card>

      {/* Theme Editor Modal */}
      <StoreThemeEditor
        open={themeEditorOpen}
        onOpenChange={setThemeEditorOpen}
        initialTheme={theme}
        onSave={handleThemeSave}
      />
    </>
  );
};

export default StoreView;
