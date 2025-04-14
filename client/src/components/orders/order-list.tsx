import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const OrderList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
    initialData: [
      {
        id: 1,
        orderNumber: '#ORD-7652',
        date: '2023-06-15',
        customer: {
          name: 'Jane Cooper',
          email: 'jane@example.com',
          initials: 'JC',
        },
        status: 'Shipped',
        paymentStatus: 'Paid',
        fulfillment: 'Yanwen Express',
        total: 125.99
      },
      {
        id: 2,
        orderNumber: '#ORD-7651',
        date: '2023-06-15',
        customer: {
          name: 'Cody Fisher',
          email: 'cody@example.com',
          initials: 'CF',
        },
        status: 'Processing',
        paymentStatus: 'Paid',
        fulfillment: 'Not fulfilled',
        total: 78.50
      },
      {
        id: 3,
        orderNumber: '#ORD-7650',
        date: '2023-06-14',
        customer: {
          name: 'Esther Howard',
          email: 'esther@example.com',
          initials: 'EH',
        },
        status: 'Delivered',
        paymentStatus: 'Paid',
        fulfillment: 'ePacket',
        total: 96.35
      },
      {
        id: 4,
        orderNumber: '#ORD-7649',
        date: '2023-06-14',
        customer: {
          name: 'Cameron Williamson',
          email: 'cameron@example.com',
          initials: 'CW',
        },
        status: 'Refunded',
        paymentStatus: 'Refunded',
        fulfillment: 'Cancelled',
        total: 137.91
      }
    ]
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOrders = 120; // This would come from the API in a real application
  const totalPages = Math.ceil(totalOrders / 10);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shipped':
        return <Badge variant="success">Shipped</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'delivered':
        return <Badge variant="info">Delivered</Badge>;
      case 'refunded':
        return <Badge variant="danger">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    if (status.toLowerCase() === 'paid') {
      return (
        <span className="text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Paid
        </span>
      );
    } else if (status.toLowerCase() === 'refunded') {
      return (
        <span className="text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Refunded
        </span>
      );
    } else {
      return <span>{status}</span>;
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <div className="relative">
          <Input 
            type="text"
            placeholder="Search orders..."
            className="pl-8 pr-3 text-sm"
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Fulfillment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{formatDate(order.date)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                        {order.customer.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {getPaymentStatusIcon(order.paymentStatus)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {order.fulfillment}
                </TableCell>
                <TableCell className="text-sm text-gray-900 font-medium">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="link" className="text-primary-600 hover:text-primary-900">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredOrders.length}</span> of <span className="font-medium">{totalOrders}</span> results
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OrderList;
