import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, StarHalf, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ProductDetailDialog from "./product-detail-dialog";
import { useTheme } from "@/contexts/ThemeContext";

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
    inventory?: number;
    category?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const { theme } = useTheme();

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleViewDetails = () => {
    setModalOpen(true);
  };

  // Apply theme styles
  const cardStyle = {
    backgroundColor: theme.colors.background,
    borderRadius: `${theme.layout.borderRadius}px`,
    fontFamily: theme.typography.bodyFont,
  };

  const titleStyle = {
    color: theme.colors.text,
    fontFamily: theme.typography.headingFont,
  };

  const descriptionStyle = {
    color: theme.colors.text,
    opacity: 0.7,
  };

  const priceStyle = {
    color: theme.colors.primary,
    fontFamily: theme.typography.headingFont,
    fontWeight: 'bold' as const,
  };

  const buttonStyle = {
    backgroundColor: theme.colors.primary,
    color: '#ffffff',
    borderRadius: `${theme.layout.borderRadius * 2}px`,
  };

  return (
    <>
      <div 
        className="group cursor-pointer" 
        onClick={handleViewDetails}
        style={cardStyle}
      >
        <div 
          className="relative overflow-hidden bg-gray-100"
          style={{ borderRadius: `${theme.layout.borderRadius}px` }}
        >
          <img 
            src={product.imageUrl}
            alt={product.name} 
            className="w-full h-64 object-cover transition duration-300 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center gap-2">
            <Button 
              variant="default" 
              size="icon"
              className="p-3 transform translate-y-10 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
              onClick={handleAddToCart}
              style={buttonStyle}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button 
              variant="default" 
              size="icon"
              className="p-3 transform translate-y-10 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              style={buttonStyle}
            >
              <Eye className="h-5 w-5" />
            </Button>
          </div>
          {product.isNew && (
            <div className="absolute top-2 right-2">
              <Badge 
                variant="info"
                style={{ 
                  backgroundColor: theme.colors.secondary,
                  color: '#ffffff',
                  borderRadius: `${theme.layout.borderRadius}px` 
                }}
              >
                New
              </Badge>
            </div>
          )}
          {product.isOnSale && (
            <div className="absolute top-2 right-2">
              <Badge 
                variant="danger"
                style={{ 
                  backgroundColor: theme.colors.accent,
                  color: '#ffffff',
                  borderRadius: `${theme.layout.borderRadius}px` 
                }}
              >
                -20%
              </Badge>
            </div>
          )}
        </div>
        <div className="pt-4">
          <h3 
            className="text-lg font-medium"
            style={titleStyle}
          >
            {product.name}
          </h3>
          <p 
            className="text-sm mb-2 line-clamp-2"
            style={descriptionStyle}
          >
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span style={priceStyle}>{formatCurrency(product.price)}</span>
              {product.salePrice && (
                <span className="line-through text-sm ml-2" style={descriptionStyle}>
                  {formatCurrency(product.salePrice)}
                </span>
              )}
            </div>
            <div className="flex text-yellow-400 items-center">
              {renderStars(product.rating)}
              <span className="text-sm ml-1" style={descriptionStyle}>({product.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      <ProductDetailDialog
        product={product}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default ProductCard;
