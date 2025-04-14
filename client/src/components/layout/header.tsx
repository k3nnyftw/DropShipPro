import React from "react";
import { Link } from "wouter";
import { Bell, Menu, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600 font-display">
              DropShipify
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200">
            Dashboard
          </Link>
          <Link href="/product-discovery" className="font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200">
            Products
          </Link>
          <Link href="/product-description-generator" className="font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200">
            AI Content
          </Link>
          <Link href="/orders" className="font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200">
            Orders
          </Link>
          <Link href="/supplier-analysis" className="font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200">
            Suppliers
          </Link>
          <Link href="/competitor-tracking" className="font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200">
            Competitors
          </Link>
          <Link href="/advertising" className="font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200">
            Analytics
          </Link>
          <Link href="/email-marketing" className="font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200">
            Email
          </Link>
          <Link href="/social-sharing" className="font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200">
            Social
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-gray-700 hover:text-primary-600"
          >
            <Search size={20} />
          </Button>
          
          <Button
            variant="ghost" 
            size="icon"
            className="relative text-gray-700 hover:text-primary-600"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          
          <div className="relative">
            <Button variant="ghost" size="sm" className="flex items-center text-sm focus:outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="User profile" 
                />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <span className="hidden md:block ml-2 font-medium">Alex</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-700"
          >
            <Menu size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
