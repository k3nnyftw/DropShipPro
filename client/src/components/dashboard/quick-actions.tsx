import React from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Plus, Search, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const QuickActions: React.FC = () => {
  const { data: actions } = useQuery({
    queryKey: ['/api/dashboard/quick-actions'],
    initialData: [
      {
        id: 1,
        title: 'Add New Product',
        description: 'List a new item in your store',
        icon: <Plus />,
        backgroundColor: 'bg-primary-100',
        iconColor: 'text-primary-600',
        link: '/product-discovery'
      },
      {
        id: 2,
        title: 'Find Products',
        description: 'Discover trending products',
        icon: <Search />,
        backgroundColor: 'bg-green-100',
        iconColor: 'text-green-600',
        link: '/product-discovery'
      },
      {
        id: 3,
        title: 'Create Campaign',
        description: 'Promote your products',
        icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>,
        backgroundColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
        link: '/advertising'
      },
      {
        id: 4,
        title: 'Store Settings',
        description: 'Customize your shop',
        icon: <Settings />,
        backgroundColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        link: '/store'
      }
    ]
  });

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {actions.map((action) => (
          <Link 
            key={action.id} 
            href={action.link}
            className="bg-white rounded-lg shadow-sm p-6 flex items-center hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-full ${action.backgroundColor} ${action.iconColor}`}>
              {action.icon}
            </div>
            <div className="ml-4">
              <h3 className="font-medium">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
