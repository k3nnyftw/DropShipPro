import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const RecentOrders: React.FC = () => {
  const { data: orders } = useQuery({
    queryKey: ['/api/orders/recent'],
    initialData: [
      {
        id: 1,
        orderNumber: '#ORD-7652',
        customer: 'Jane Cooper',
        status: 'Shipped',
        date: '2023-06-15',
        total: 125.99
      },
      {
        id: 2,
        orderNumber: '#ORD-7651',
        customer: 'Cody Fisher',
        status: 'Processing',
        date: '2023-06-15',
        total: 78.50
      },
      {
        id: 3,
        orderNumber: '#ORD-7650',
        customer: 'Esther Howard',
        status: 'Delivered',
        date: '2023-06-14',
        total: 96.35
      },
      {
        id: 4,
        orderNumber: '#ORD-7649',
        customer: 'Cameron Williamson',
        status: 'Refunded',
        date: '2023-06-14',
        total: 137.91
      }
    ]
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shipped':
        return 'success';
      case 'processing':
        return 'warning';
      case 'delivered':
        return 'info';
      case 'refunded':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Card className="bg-white shadow-sm h-full">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <Button variant="link">View All</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(order.date)}</TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-right">
        <Button variant="link" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
          Export <Download className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
};

export default RecentOrders;
