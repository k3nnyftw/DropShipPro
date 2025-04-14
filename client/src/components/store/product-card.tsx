import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, StarHalf } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    isNew?: boolean;
    isOnSale?: boolean;
    imageUrl: string;
    rating: number;
    reviewCount: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-yellow-400" />);
    }

    return stars;
  };

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-lg bg-gray-100">
        <img 
          src={product.imageUrl}
          alt={product.name} 
          className="w-full h-64 object-cover transition duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <Button 
            variant="default" 
            size="icon"
            className="bg-white text-gray-800 rounded-full p-3 transform translate-y-10 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
        {product.isNew && (
          <div className="absolute top-2 right-2">
            <Badge variant="info">New</Badge>
          </div>
        )}
        {product.isOnSale && (
          <div className="absolute top-2 right-2">
            <Badge variant="danger">-20%</Badge>
          </div>
        )}
      </div>
      <div className="pt-4">
        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-900 font-bold">{formatCurrency(product.price)}</span>
            {product.salePrice && (
              <span className="text-gray-500 line-through text-sm ml-2">
                {formatCurrency(product.salePrice)}
              </span>
            )}
          </div>
          <div className="flex text-yellow-400 items-center">
            {renderStars(product.rating)}
            <span className="text-gray-500 text-sm ml-1">({product.reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
