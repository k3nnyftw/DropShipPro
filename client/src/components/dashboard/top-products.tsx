import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const TopProducts: React.FC = () => {
  const { data: products } = useQuery({
    queryKey: ['/api/products/top'],
    initialData: [
      {
        id: 1,
        name: 'Wireless Earbuds',
        orders: 14,
        revenue: 560.00,
        change: 24,
        imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12'
      },
      {
        id: 2,
        name: 'Laptop Stand',
        orders: 11,
        revenue: 385.00,
        change: 18,
        imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45'
      },
      {
        id: 3,
        name: 'Smart Watch',
        orders: 9,
        revenue: 297.00,
        change: -4,
        imageUrl: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf'
      },
      {
        id: 4,
        name: 'Portable Charger',
        orders: 8,
        revenue: 152.00,
        change: 12,
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083'
      }
    ]
  });

  return (
    <Card className="bg-white shadow-sm h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Top Products</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center">
              <img 
                src={product.imageUrl}
                alt={product.name} 
                className="w-12 h-12 rounded object-cover" 
              />
              <div className="ml-4 flex-grow">
                <h3 className="text-sm font-medium">{product.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{product.orders} orders</span>
                  <span className="mx-2">•</span>
                  <span>${product.revenue.toFixed(2)}</span>
                </div>
              </div>
              <div className={`flex items-center ${product.change >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                {product.change >= 0 ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(product.change)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <Button 
          variant="link" 
          className="text-primary-600 hover:text-primary-500 text-sm font-medium block text-center w-full"
        >
          View all products
        </Button>
      </div>
    </Card>
  );
};

export default TopProducts;
