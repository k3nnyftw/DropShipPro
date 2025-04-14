import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, DollarSign, Package, TrendingUp, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TrendingProduct {
  id: number;
  name: string;
  searchVolume: string;
  category: string;
  trendScore: number;
  profitMargin: string;
  competition: string;
  imageUrl: string;
  description?: string;
}

interface ProductDetailModalProps {
  product: TrendingProduct | null;
  open: boolean;
  onClose: () => void;
  onAddToStore: (product: any) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  open,
  onClose,
  onAddToStore
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("details");
  const [editedProduct, setEditedProduct] = useState<any>({
    name: "",
    description: "High-quality product with great features and benefits for customers.",
    price: "0.00",
    costPrice: "0.00",
    salePrice: "",
    category: "",
    imageUrl: "",
    inventory: 100,
    trending: true,
    rating: "5.0",
    reviewCount: 0
  });

  // Initialize the form when the modal opens with a product
  React.useEffect(() => {
    if (product) {
      // Extract profit margin range and use the higher value for price calculation
      const profitMarginRange = product.profitMargin.replace('%', '').split('-');
      const highestProfitMargin = parseInt(profitMarginRange[profitMarginRange.length - 1]) / 100;
      
      // Estimate a cost price based on the category and trend score
      const baseCostPrice = product.category === "Electronics" ? 25 : 15;
      const costPrice = (baseCostPrice + (product.trendScore * 0.5)).toFixed(2);
      
      // Calculate selling price based on the profit margin
      const sellingPrice = (parseFloat(costPrice) * (1 + highestProfitMargin)).toFixed(2);
      
      setEditedProduct({
        name: product.name,
        description: product.description || "High-quality product with great features and benefits for customers.",
        price: sellingPrice,
        costPrice: costPrice,
        salePrice: "",
        category: product.category,
        imageUrl: product.imageUrl,
        inventory: 100,
        trending: true,
        rating: (product.trendScore / 2).toFixed(1),
        reviewCount: 0
      });
    }
  }, [product]);

  const addToStoreMutation = useMutation({
    mutationFn: (productData: any) => {
      return apiRequest('POST', '/api/products', productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products/top'] });
      toast({
        title: "Product added to store",
        description: `${editedProduct.name} has been added to your store successfully.`,
      });
      onClose();
    },
    onError: (error) => {
      console.error("Error adding product:", error);
      toast({
        title: "Error adding product",
        description: "There was an error adding the product to your store. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleAddToStore = () => {
    addToStoreMutation.mutate(editedProduct);
    onAddToStore(editedProduct);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Product Details</DialogTitle>
          <DialogDescription>
            View and edit product details before adding to your store
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <Label htmlFor="name">Product Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={editedProduct.name} 
                    onChange={handleInputChange} 
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    rows={5} 
                    value={editedProduct.description} 
                    onChange={handleInputChange} 
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={editedProduct.category} 
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Home Decor">Home Decor</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="mb-4 rounded-md overflow-hidden aspect-square bg-gray-100">
                  <img 
                    src={editedProduct.imageUrl} 
                    alt={editedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input 
                    id="imageUrl" 
                    name="imageUrl" 
                    value={editedProduct.imageUrl} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                <TrendingUp className="mr-2 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Trend Score</p>
                  <p className="font-semibold">{product.trendScore}/10</p>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg flex items-center">
                <DollarSign className="mr-2 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="font-semibold">{product.profitMargin}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg flex items-center">
                <Star className="mr-2 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Competition</p>
                  <p className="font-semibold">{product.competition}</p>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg flex items-center">
                <Package className="mr-2 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Search Volume</p>
                  <p className="font-semibold text-sm">{product.searchVolume}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <Label htmlFor="price">Selling Price ($)</Label>
                  <Input 
                    id="price" 
                    name="price" 
                    type="number" 
                    step="0.01" 
                    value={editedProduct.price} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="costPrice">Cost Price ($)</Label>
                  <Input 
                    id="costPrice" 
                    name="costPrice" 
                    type="number" 
                    step="0.01" 
                    value={editedProduct.costPrice} 
                    onChange={handleInputChange} 
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Profit margin: {(((parseFloat(editedProduct.price) - parseFloat(editedProduct.costPrice)) / parseFloat(editedProduct.costPrice)) * 100).toFixed(0)}%
                  </p>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="salePrice">Sale Price ($) (Optional)</Label>
                  <Input 
                    id="salePrice" 
                    name="salePrice" 
                    type="number" 
                    step="0.01" 
                    value={editedProduct.salePrice} 
                    onChange={handleInputChange} 
                    placeholder="Leave empty for no sale"
                  />
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <Label htmlFor="inventory">Initial Inventory</Label>
                  <Input 
                    id="inventory" 
                    name="inventory" 
                    type="number" 
                    value={editedProduct.inventory} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="mb-4">
                  <Label>Suppliers for this Product</Label>
                  <div className="mt-2 border border-gray-200 rounded-md p-4">
                    <p className="text-sm">
                      3 suppliers found for this product category. View detailed supplier analysis in the Supplier Analysis section.
                    </p>
                    <Button 
                      variant="link" 
                      className="text-primary-600 p-0 h-auto mt-1"
                      onClick={() => window.open('/supplier-analysis', '_blank')}
                    >
                      View suppliers
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md mt-4">
                  <h4 className="font-medium mb-2">Pricing Recommendations</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center">
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                      Recommended price range: ${(parseFloat(editedProduct.costPrice) * 1.5).toFixed(2)} - ${(parseFloat(editedProduct.costPrice) * 2.5).toFixed(2)}
                    </li>
                    <li className="flex items-center">
                      <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
                      Average market price: ${(parseFloat(editedProduct.costPrice) * 2.2).toFixed(2)}
                    </li>
                    <li className="flex items-center">
                      <span className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></span>
                      Competitor price range: ${(parseFloat(editedProduct.costPrice) * 1.3).toFixed(2)} - ${(parseFloat(editedProduct.costPrice) * 3).toFixed(2)}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between sm:justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="ml-2 gap-2" 
            onClick={handleAddToStore}
            disabled={addToStoreMutation.isPending}
          >
            <ShoppingCart className="h-4 w-4" />
            {addToStoreMutation.isPending ? "Adding..." : "Add to Store"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;