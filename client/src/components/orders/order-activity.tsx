import React from "react";
import { Card } from "@/components/ui/card";
import { formatDateWithTime } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const OrderActivity: React.FC = () => {
  const { data: activities } = useQuery({
    queryKey: ['/api/orders/activities'],
    initialData: [
      {
        id: 1,
        type: 'new-order',
        title: 'New order',
        customer: 'Jane Cooper',
        orderNumber: '#ORD-7652',
        details: 'Order #ORD-7652 for Wireless Earbuds',
        additionalInfo: '$125.99',
        timestamp: '2023-06-15T10:32:00',
        iconBgColor: 'bg-primary-50',
        iconColor: 'text-primary-500',
        icon: 'shopping-cart'
      },
      {
        id: 2,
        type: 'status-update',
        title: 'Order status updated',
        status: 'Processing',
        statusColor: 'text-yellow-700',
        orderNumber: '#ORD-7651',
        customer: 'Cody Fisher',
        details: 'Order #ORD-7651 for Cody Fisher',
        timestamp: '2023-06-15T09:47:00',
        iconBgColor: 'bg-yellow-50',
        iconColor: 'text-yellow-500',
        icon: 'clock'
      },
      {
        id: 3,
        type: 'shipped',
        title: 'Order shipped',
        orderNumber: '#ORD-7650',
        status: 'Shipped',
        statusColor: 'text-green-700',
        details: 'Tracking number: YW88773652CN',
        timestamp: '2023-06-15T08:22:00',
        iconBgColor: 'bg-green-50',
        iconColor: 'text-green-500',
        icon: 'truck'
      },
      {
        id: 4,
        type: 'refund',
        title: 'Refund processed',
        orderNumber: '#ORD-7649',
        details: '$137.91 refunded to customer',
        timestamp: '2023-06-14T16:55:00',
        iconBgColor: 'bg-red-50',
        iconColor: 'text-red-500',
        icon: 'undo'
      }
    ]
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'shopping-cart':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'clock':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'truck':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        );
      case 'undo':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderActivityContent = (activity: any) => {
    switch (activity.type) {
      case 'new-order':
        return (
          <div>
            <div className="text-sm">
              <span className="font-medium text-gray-900">{activity.title}</span> from <a href="#" className="font-medium text-gray-900">{activity.customer}</a>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {activity.details}
            </p>
            <div className="mt-2 text-sm text-gray-700">
              <p>{activity.additionalInfo} • {formatDateWithTime(activity.timestamp)}</p>
            </div>
          </div>
        );
      case 'status-update':
        return (
          <div>
            <div className="text-sm">
              {activity.title} to <span className={`font-medium ${activity.statusColor}`}>{activity.status}</span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {activity.details}
            </p>
            <div className="mt-2 text-sm text-gray-700">
              <p>{formatDateWithTime(activity.timestamp)}</p>
            </div>
          </div>
        );
      case 'shipped':
        return (
          <div>
            <div className="text-sm">
              Order <span className="font-medium text-gray-900">{activity.orderNumber}</span> has been <span className={`font-medium ${activity.statusColor}`}>{activity.status}</span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {activity.details}
            </p>
            <div className="mt-2 text-sm text-gray-700">
              <p>{formatDateWithTime(activity.timestamp)}</p>
            </div>
          </div>
        );
      case 'refund':
        return (
          <div>
            <div className="text-sm">
              {activity.title} for order <span className="font-medium text-gray-900">{activity.orderNumber}</span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {activity.details}
            </p>
            <div className="mt-2 text-sm text-gray-700">
              <p>{formatDateWithTime(activity.timestamp)}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white p-6">
      <h2 className="text-lg font-semibold mb-4">Order Activity</h2>
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index < activities.length - 1 && (
                  <span 
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" 
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className={`h-10 w-10 rounded-full ${activity.iconBgColor} ${activity.iconColor} flex items-center justify-center ring-8 ring-white`}>
                      {getIcon(activity.icon)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    {renderActivityContent(activity)}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default OrderActivity;
