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
import { Star, StarHalf, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import SupplierDetailModal from "./supplier-detail-modal";

const SupplierComparison: React.FC = () => {
  const { toast } = useToast();
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers/wireless-earbuds'],
    initialData: [
      {
        id: 1,
        name: 'ShenTech Electronics',
        location: 'Guangzhou, China',
        rating: 4.7,
        reviewCount: 243,
        price: '$18.50/unit',
        minOrder: '10 units',
        shippingTime: '10-15 days',
        returnPolicy: '30-day',
        imageUrl: '/placeholder-supplier-1.png'
      },
      {
        id: 2,
        name: 'TechPro Solutions',
        location: 'Shenzhen, China',
        rating: 4.1,
        reviewCount: 186,
        price: '$17.25/unit',
        minOrder: '5 units',
        shippingTime: '12-18 days',
        returnPolicy: '15-day',
        imageUrl: '/placeholder-supplier-2.png'
      },
      {
        id: 3,
        name: 'GlobalAudio Inc.',
        location: 'Hong Kong',
        rating: 4.9,
        reviewCount: 312,
        price: '$22.00/unit',
        minOrder: '20 units',
        shippingTime: '7-10 days',
        returnPolicy: '60-day',
        imageUrl: '/placeholder-supplier-3.png'
      }
    ]
  });

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400" />);
    }

    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-yellow-400" />);
    }

    return stars;
  };

  const getReturnPolicyBadge = (policy: string) => {
    if (policy.includes('60')) {
      return <Badge variant="success">{policy}</Badge>;
    } else if (policy.includes('30')) {
      return <Badge variant="success">{policy}</Badge>;
    } else {
      return <Badge variant="warning">{policy}</Badge>;
    }
  };

  const handleSupplierSelect = (supplier: any) => {
    setSelectedSupplier(supplier);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleContactSupplier = (supplier: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSupplier(supplier);
    setModalOpen(true);
  };

  return (
    <>
      <Card className="bg-white p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Top Suppliers for "Wireless Earbuds"</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Shipping Time</TableHead>
                <TableHead>Return Policy</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow 
                  key={supplier.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSupplierSelect(supplier)}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                          {supplier.name.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        <div className="text-sm text-gray-500">{supplier.location}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="mr-2 flex">
                        {renderStars(supplier.rating)}
                      </div>
                      <span className="text-sm text-gray-700">
                        {supplier.rating} ({supplier.reviewCount})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {supplier.price}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {supplier.minOrder}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {supplier.shippingTime}
                  </TableCell>
                  <TableCell>
                    {getReturnPolicyBadge(supplier.returnPolicy)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="link" 
                      className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                      onClick={(e) => handleContactSupplier(supplier, e)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Contact
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <SupplierDetailModal
        supplier={selectedSupplier}
        open={modalOpen}
        onClose={handleModalClose}
      />
    </>
  );
};

export default SupplierComparison;
