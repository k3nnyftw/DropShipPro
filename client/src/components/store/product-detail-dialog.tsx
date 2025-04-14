import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, StarHalf, ShoppingCart, Pencil, Save, Trash, RefreshCw, Tag, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CheckoutPayment } from "./checkout-payment";

interface Product {
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
}

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
  product,
  open,
  onClose,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Initialize the edit form when the modal opens with a product
  React.useEffect(() => {
    if (product) {
      setEditedProduct({
        ...product,
        inventory: product.inventory || 100,
        category: product.category || "Electronics"
      });
    }
  }, [product]);

  const updateProductMutation = useMutation({
    mutationFn: (productData: any) => {
      return apiRequest('PATCH', `/api/products/${productData.id}`, productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products/featured'] });
      toast({
        title: "Product updated",
        description: `${editedProduct?.name} has been updated successfully.`,
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast({
        title: "Error updating product",
        description: "There was an error updating the product. Please try again.",
        variant: "destructive"
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: number) => {
      return apiRequest('DELETE', `/api/products/${productId}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products/featured'] });
      toast({
        title: "Product deleted",
        description: `${product?.name} has been removed from your store.`,
      });
      onClose();
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast({
        title: "Error deleting product",
        description: "There was an error removing the product. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedProduct) return;
    
    const { name, value, type } = e.target;
    if (type === 'number') {
      setEditedProduct({ 
        ...editedProduct, 
        [name]: parseFloat(value) 
      });
    } else {
      setEditedProduct({ 
        ...editedProduct, 
        [name]: value 
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedProduct) return;
    
    const { name, checked } = e.target;
    setEditedProduct({ 
      ...editedProduct, 
      [name]: checked 
    });
  };

  const handleSave = () => {
    if (!editedProduct) return;
    updateProductMutation.mutate(editedProduct);
  };

  const handleDelete = () => {
    if (!product) return;
    
    if (window.confirm(`Are you sure you want to remove "${product.name}" from your store?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    setShowCheckout(true);
  };

  const handlePaymentComplete = (success: boolean, paymentId?: string) => {
    if (!product) return;
    
    if (success) {
      setPaymentCompleted(true);
      toast({
        title: 'Order Completed',
        description: `Your purchase of ${product.name} was successful!`,
      });
      
      // Create an order record in the system after successful payment
      // This could be implemented with a mutation to create an order
    } else {
      toast({
        title: 'Payment Failed',
        description: 'Your payment could not be processed. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResetCheckout = () => {
    setShowCheckout(false);
    setPaymentCompleted(false);
  };

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

  if (!product || !editedProduct) return null;

  // Reset the checkout state when the dialog closes
  const handleCloseDialog = () => {
    handleResetCheckout();
    onClose();
  };

  const renderContent = () => {
    if (showCheckout) {
      return (
        <div className="py-4">
          {paymentCompleted ? (
            <div className="text-center py-8">
              <div className="bg-green-100 text-green-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. Your order has been processed successfully.
              </p>
              <Button onClick={handleResetCheckout}>Continue Shopping</Button>
            </div>
          ) : (
            <CheckoutPayment 
              amount={product.price * 100} // Convert to cents for Stripe
              orderId={product.id}
              onPaymentComplete={handlePaymentComplete}
            />
          )}
        </div>
      );
    }

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="inventory">Inventory & Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {isEditing ? (
                <>
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

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input 
                        id="category" 
                        name="category" 
                        value={editedProduct.category} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating">Rating (0-5)</Label>
                      <Input 
                        id="rating" 
                        name="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={editedProduct.rating} 
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="isNew"
                      name="isNew"
                      checked={editedProduct.isNew || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isNew">Mark as New</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="isOnSale"
                      name="isOnSale"
                      checked={editedProduct.isOnSale || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isOnSale">On Sale</Label>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                  <div className="flex items-center mb-4">
                    {renderStars(product.rating)}
                    <span className="ml-2 text-sm text-gray-500">
                      {product.rating} ({product.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {product.isNew && <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded">New</span>}
                    {product.isOnSale && <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded">Sale</span>}
                    {product.category && <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded">{product.category}</span>}
                  </div>
                  <p className="text-gray-700 mb-6">{product.description}</p>
                  
                  <div className="flex items-baseline mb-4">
                    <span className="text-2xl font-bold text-gray-900 mr-2">
                      {formatCurrency(product.price)}
                    </span>
                    {product.salePrice && (
                      <span className="text-gray-500 line-through">
                        {formatCurrency(product.salePrice)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="mb-4 rounded-md overflow-hidden aspect-square bg-gray-100">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {isEditing && (
                <div className="mb-4">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input 
                    id="imageUrl" 
                    name="imageUrl" 
                    value={editedProduct.imageUrl} 
                    onChange={handleInputChange} 
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {isEditing ? (
                <>
                  <div className="mb-4">
                    <Label htmlFor="price">Regular Price ($)</Label>
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
                    <Label htmlFor="salePrice">Sale Price ($) (Optional)</Label>
                    <Input 
                      id="salePrice" 
                      name="salePrice" 
                      type="number" 
                      step="0.01" 
                      value={editedProduct.salePrice || ''} 
                      onChange={handleInputChange} 
                      placeholder="Leave empty for no sale" 
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="inventory">Inventory</Label>
                    <Input 
                      id="inventory" 
                      name="inventory" 
                      type="number" 
                      value={editedProduct.inventory} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-sm text-gray-500 block mb-1">Regular Price</span>
                      <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
                    </div>
                    {product.salePrice && (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <span className="text-sm text-gray-500 block mb-1">Sale Price</span>
                        <span className="text-lg font-semibold">{formatCurrency(product.salePrice)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Inventory</span>
                      <span className="font-semibold">{product.inventory || 'Not tracked'}</span>
                    </div>
                  </div>
                </>
              )}

              {!isEditing && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Tag className="h-4 w-4 text-blue-500 mr-2" />
                    Product Statistics
                  </h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex justify-between">
                      <span>Page Views</span>
                      <span className="font-medium">246</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Added to Cart</span>
                      <span className="font-medium">32</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Conversion Rate</span>
                      <span className="font-medium">13.0%</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            <div>
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-medium mb-4">Sales Performance</h3>
                <div className="h-48 flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    Sales chart would appear here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  const renderFooterButtons = () => {
    if (showCheckout) {
      return <div />; // Empty div to maintain spacing when in checkout mode
    }

    return (
      <>
        {isEditing ? (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteProductMutation.isPending}
          >
            <Trash className="h-4 w-4 mr-2" />
            {deleteProductMutation.isPending ? "Deleting..." : "Delete Product"}
          </Button>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
        
        {!isEditing && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
            <Button 
              className="gap-2"
              onClick={handleBuyNow}
            >
              <CreditCard className="h-4 w-4" />
              Buy Now
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>
              {isEditing ? "Edit Product" : showCheckout ? "Checkout" : "Product Details"}
            </span>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => setIsEditing(false)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1"
                    onClick={handleSave}
                    disabled={updateProductMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </>
              ) : showCheckout ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={handleResetCheckout}
                >
                  <RefreshCw className="h-4 w-4" />
                  Back to Product
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {renderContent()}

        <DialogFooter className="flex items-center justify-between sm:justify-between mt-6">
          {renderFooterButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;