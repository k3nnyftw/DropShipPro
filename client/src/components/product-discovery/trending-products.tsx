import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Info, Star, StarHalf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ProductDetailModal from "./product-detail-modal";

const TrendingProducts: React.FC = () => {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "add">("view");

  const { data: products } = useQuery({
    queryKey: ['/api/products/trending'],
    initialData: [
      {
        id: 1,
        name: 'Solar-Powered Phone Charger',
        searchVolume: '10,000+ monthly searches',
        category: 'Electronics',
        trendScore: 9.3,
        profitMargin: '65-80%',
        competition: 'Medium',
        imageUrl: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb'
      },
      {
        id: 2,
        name: 'Foldable Laptop Stand',
        searchVolume: '8,500+ monthly searches',
        category: 'Office',
        trendScore: 8.7,
        profitMargin: '50-65%',
        competition: 'High',
        imageUrl: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137'
      },
      {
        id: 3,
        name: 'Minimalist Desk Lamp',
        searchVolume: '12,000+ monthly searches',
        category: 'Home Decor',
        trendScore: 9.8,
        profitMargin: '70-85%',
        competition: 'Low',
        imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1'
      },
      {
        id: 4,
        name: 'Leather Watch Band',
        searchVolume: '7,200+ monthly searches',
        category: 'Fashion',
        trendScore: 7.6,
        profitMargin: '40-55%',
        competition: 'Medium',
        imageUrl: 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80'
      }
    ]
  });

  const renderStars = (score: number) => {
    const maxScore = 10;
    const starCount = 5;
    const normalizedScore = (score / maxScore) * starCount;
    const fullStars = Math.floor(normalizedScore);
    const hasHalfStar = normalizedScore % 1 >= 0.5;
    
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400" />);
    }
    
    const remainingStars = starCount - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-yellow-400" />);
    }
    
    return (
      <div className="flex">
        {stars}
      </div>
    );
  };

  const getCompetitionBadge = (competition: string) => {
    switch (competition.toLowerCase()) {
      case 'low':
        return <Badge variant="success">Low</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'high':
        return <Badge variant="danger">High</Badge>;
      default:
        return <Badge>{competition}</Badge>;
    }
  };

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleAddToStore = (product: any) => {
    setSelectedProduct(product);
    setModalMode("add");
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleProductAdded = (product: any) => {
    // This function is called from the modal when a product is successfully added
    toast({
      title: "Product added successfully",
      description: `${product.name} has been added to your store.`,
    });
  };

  return (
    <>
      <Card className="bg-white p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Trending Products</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Trend Score</TableHead>
                <TableHead>Est. Profit Margin</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetails(product)}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded object-cover" 
                          src={product.imageUrl} 
                          alt={product.name} 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.searchVolume}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {product.category}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="mr-2 flex">
                        {renderStars(product.trendScore)}
                      </div>
                      <span className="text-sm text-gray-700">{product.trendScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">{product.profitMargin}</span>
                  </TableCell>
                  <TableCell>
                    {getCompetitionBadge(product.competition)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-2">
                      <Button 
                        variant="lightBlue" 
                        size="iconSm" 
                        title="Add to store"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToStore(product);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="gray" 
                        size="iconSm" 
                        title="View details"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(product);
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ProductDetailModal
        product={selectedProduct}
        open={modalOpen}
        onClose={handleModalClose}
        onAddToStore={handleProductAdded}
      />
    </>
  );
};

export default TrendingProducts;
