import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Star, 
  DollarSign, 
  Package, 
  Truck, 
  Calendar, 
  ShieldCheck,
  Check,
  X,
  Mail,
  MessageSquare,
  ExternalLink
} from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: string;
  minOrder: string | number;
  shippingTime: string;
  returnPolicy: string;
  imageUrl: string;
  website?: string;
}

interface SupplierDetailModalProps {
  supplier: Supplier | null;
  open: boolean;
  onClose: () => void;
}

const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  supplier,
  open,
  onClose,
}) => {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = React.useState("details");

  const handleContactSupplier = () => {
    toast({
      title: "Message sent to supplier",
      description: `Your inquiry has been sent to ${supplier?.name}. You will be notified when they respond.`,
    });
    onClose();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="fill-yellow-400 text-yellow-400 half-filled" />);
    }

    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-yellow-400" />);
    }

    return (
      <div className="flex">
        {stars}
        <span className="ml-2 text-sm font-medium">
          {rating} ({supplier?.reviewCount} reviews)
        </span>
      </div>
    );
  };

  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Supplier Details</DialogTitle>
          <DialogDescription>
            Review supplier information before contacting
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Supplier Info</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Terms</TabsTrigger>
            <TabsTrigger value="samples">Product Samples</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <div className="h-20 w-20 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-3xl font-semibold mx-auto mb-3">
                    {supplier.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-medium">{supplier.name}</h3>
                  <div className="flex items-center justify-center mt-2">
                    <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-500">{supplier.location}</span>
                  </div>
                  <div className="mt-4">
                    {renderStars(parseFloat(supplier.rating.toString()))}
                  </div>
                  <div className="mt-4">
                    <Badge variant="outline" className="mr-2">Verified</Badge>
                    <Badge variant="outline">Premium</Badge>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-4">Supplier Overview</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium">Pricing</span>
                    </div>
                    <p className="mt-2 text-sm">{supplier.price} per unit</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Bulk discount available for orders over 100 units
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-orange-500 mr-2" />
                      <span className="font-medium">Minimum Order</span>
                    </div>
                    <p className="mt-2 text-sm">{supplier.minOrder}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sample orders available (1-3 units)
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="font-medium">Years in Business</span>
                    </div>
                    <p className="mt-2 text-sm">5+ years</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Established in 2018
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center">
                      <ShieldCheck className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="font-medium">Certifications</span>
                    </div>
                    <p className="mt-2 text-sm">ISO 9001, CE, RoHS</p>
                    <p className="text-xs text-gray-500 mt-1">
                      All products quality tested
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Supplier Capabilities</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Custom packaging</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Private labeling</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Customized products</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Product testing</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Dropshipping services</span>
                    </li>
                    <li className="flex items-center">
                      <X className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-gray-500">No MOQ exceptions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                
                <div className="bg-gray-50 p-5 rounded-lg mb-4">
                  <div className="flex items-start">
                    <Truck className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Average Shipping Time</h4>
                      <p className="text-sm mt-1">{supplier.shippingTime}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Express shipping option available (3-5 days) for additional fee
                      </p>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-medium mb-3">Shipping Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border border-gray-200 rounded-md p-3">
                    <span className="text-sm font-medium">Standard Shipping</span>
                    <span className="text-sm">10-15 days</span>
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-md p-3">
                    <span className="text-sm font-medium">Express Shipping</span>
                    <span className="text-sm">3-5 days</span>
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-md p-3">
                    <span className="text-sm font-medium">Bulk Orders (100+ units)</span>
                    <span className="text-sm">15-20 days</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Terms & Policies</h3>
                
                <div className="bg-gray-50 p-5 rounded-lg mb-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Return Policy</h4>
                      <p className="text-sm mt-1">{supplier.returnPolicy}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Defective items can be returned within the policy period
                      </p>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-medium mb-3">Payment Methods</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-200 rounded-md p-3 text-center">
                    <span className="text-sm">PayPal</span>
                  </div>
                  <div className="border border-gray-200 rounded-md p-3 text-center">
                    <span className="text-sm">Credit Card</span>
                  </div>
                  <div className="border border-gray-200 rounded-md p-3 text-center">
                    <span className="text-sm">Wire Transfer</span>
                  </div>
                  <div className="border border-gray-200 rounded-md p-3 text-center">
                    <span className="text-sm">Trade Assurance</span>
                  </div>
                </div>
                
                <div className="mt-4 bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium flex items-center text-blue-700">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Buyer Protection
                  </h4>
                  <p className="text-sm mt-2 text-blue-700">
                    This supplier offers trade assurance protection for your orders
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="samples" className="space-y-4 mt-4">
            <h3 className="text-lg font-medium mb-4">Product Samples</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb" 
                    alt="Product sample" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm">Solar Power Bank 10000mAh</h4>
                  <p className="text-sm text-gray-500 mt-1">Sample: $15.00/unit</p>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3" 
                    alt="Product sample" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm">Solar Power Bank 20000mAh</h4>
                  <p className="text-sm text-gray-500 mt-1">Sample: $22.50/unit</p>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1534131261637-1915ae1c58c1" 
                    alt="Product sample" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm">Portable Solar Panel</h4>
                  <p className="text-sm text-gray-500 mt-1">Sample: $18.75/unit</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <h4 className="font-medium mb-2">Sample Order Policy</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span>
                  Sample orders can be placed for 1-3 units of any product
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span>
                  Sample prices are approximately 20% higher than bulk order prices
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span>
                  Sample shipping takes 5-7 days via express courier
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span>
                  Sample costs can be deducted from your first bulk order over 50 units
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between sm:justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {supplier.website && (
            <Button 
              variant="outline"
              className="gap-2 bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700"
              onClick={() => {
                window.open(supplier.website, '_blank', 'noopener,noreferrer');
                toast({
                  title: "Opening supplier website",
                  description: "The supplier's website is opening in a new tab."
                });
              }}
            >
              <ExternalLink className="h-4 w-4" />
              Visit Website
            </Button>
          )}
          <Button 
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast({
                title: "Email drafted",
                description: `An email draft to ${supplier.name} has been prepared.`,
              });
            }}
          >
            <Mail className="h-4 w-4" />
            Email Supplier
          </Button>
          <Button 
            className="gap-2"
            onClick={handleContactSupplier}
          >
            <MessageSquare className="h-4 w-4" />
            Message Supplier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierDetailModal;