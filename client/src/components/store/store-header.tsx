import React from "react";
import { ShoppingCart } from "lucide-react";
import { Link } from "wouter";

const StoreHeader: React.FC = () => {
  return (
    <div className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">YourStoreName</div>
        <div className="hidden sm:flex space-x-6">
          <Link href="/store">
            <a className="text-white hover:text-gray-300">Home</a>
          </Link>
          <Link href="/store">
            <a className="text-white hover:text-gray-300">Shop</a>
          </Link>
          <Link href="/store">
            <a className="text-white hover:text-gray-300">Collections</a>
          </Link>
          <Link href="/store">
            <a className="text-white hover:text-gray-300">About</a>
          </Link>
          <Link href="/store">
            <a className="text-white hover:text-gray-300">Contact</a>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="text-white hover:text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </a>
          <a href="#" className="text-white hover:text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </a>
          <a href="#" className="text-white hover:text-gray-300 relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-primary-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">
              2
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StoreHeader;
