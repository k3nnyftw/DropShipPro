import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StoreHeader from "@/components/store/store-header";
import StoreBanner from "@/components/store/store-banner";
import ProductCard from "@/components/store/product-card";
import { useQuery } from "@tanstack/react-query";

const StoreView: React.FC = () => {
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

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">Your Online Store</h1>
          <p className="text-gray-600">Preview and manage how customers see your store</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="default">
            Edit Theme
          </Button>
          <Button>
            Visit Store
          </Button>
        </div>
      </div>

      {/* Store Preview */}
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden">
        <StoreHeader />
        <StoreBanner />

        {/* Featured Products */}
        <div className="container mx-auto py-8 px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline">
              View All Products
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default StoreView;
