import React, { useState } from "react";
import { 
  ShoppingCart, Search, User, Menu, X, Heart, 
  Package, Home, TagIcon, Grid3X3, Phone, Info 
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";

const StoreHeader: React.FC = () => {
  const [location, navigate] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { theme } = useTheme();
  
  // Mock cart items
  const cartItems = [
    { id: 1, name: "Wireless Earbuds", price: 49.99, quantity: 1 },
    { id: 2, name: "Fitness Smart Watch", price: 59.99, quantity: 1 }
  ];
  
  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  // Apply theme styles
  const headerStyle = {
    backgroundColor: theme.colors.primary,
    color: '#ffffff', 
    padding: `${theme.layout.spacing / 2}px ${theme.layout.spacing}px`
  };

  const logoStyle = {
    fontFamily: theme.typography.headingFont,
    fontWeight: 'bold'
  };
  
  const buttonStyle = {
    color: '#ffffff',
    fontFamily: theme.typography.bodyFont
  };
  
  return (
    <div style={headerStyle}>
      <div 
        className="container mx-auto flex justify-between items-center"
        style={{ maxWidth: `${theme.layout.contentWidth}px` }}
      >
        <div 
          className="text-xl font-bold cursor-pointer" 
          onClick={() => handleNavigate("/store")}
          style={logoStyle}
        >
          YourStoreName
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Button 
            variant="link" 
            className="text-white hover:text-gray-300 p-0"
            onClick={() => handleNavigate("/store")}
            style={buttonStyle}
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </Button>
          <Button 
            variant="link" 
            className="text-white hover:text-gray-300 p-0"
            onClick={() => handleNavigate("/store?category=all")}
            style={buttonStyle}
          >
            <TagIcon className="w-4 h-4 mr-1" />
            Shop
          </Button>
          <Button 
            variant="link" 
            className="text-white hover:text-gray-300 p-0"
            onClick={() => handleNavigate("/store?view=collections")}
            style={buttonStyle}
          >
            <Grid3X3 className="w-4 h-4 mr-1" />
            Collections
          </Button>
          <Button 
            variant="link" 
            className="text-white hover:text-gray-300 p-0"
            onClick={() => handleNavigate("/store?page=about")}
            style={buttonStyle}
          >
            <Info className="w-4 h-4 mr-1" />
            About
          </Button>
          <Button 
            variant="link" 
            className="text-white hover:text-gray-300 p-0"
            onClick={() => handleNavigate("/store?page=contact")}
            style={buttonStyle}
          >
            <Phone className="w-4 h-4 mr-1" />
            Contact
          </Button>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="text-white p-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72" style={{ fontFamily: theme.typography.bodyFont }}>
              <div className="py-6 flex flex-col space-y-4">
                <Button 
                  variant="ghost" 
                  className="flex justify-start"
                  onClick={() => handleNavigate("/store")}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex justify-start"
                  onClick={() => handleNavigate("/store?category=all")}
                >
                  <TagIcon className="w-4 h-4 mr-2" />
                  Shop
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex justify-start"
                  onClick={() => handleNavigate("/store?view=collections")}
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Collections
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex justify-start"
                  onClick={() => handleNavigate("/store?page=about")}
                >
                  <Info className="w-4 h-4 mr-2" />
                  About
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex justify-start"
                  onClick={() => handleNavigate("/store?page=contact")}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Icons */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:text-gray-300 p-1"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:text-gray-300 p-1"
            onClick={() => setAccountOpen(true)}
          >
            <User className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:text-gray-300 p-1 relative"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            <span 
              className="absolute -top-1 -right-1 text-xs text-white rounded-full w-4 h-4 flex items-center justify-center"
              style={{ 
                backgroundColor: theme.colors.accent,
                borderRadius: `${theme.layout.borderRadius}px` 
              }}
            >
              {cartItems.length}
            </span>
          </Button>
        </div>
      </div>
      
      {/* Search Modal */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-md" style={{ fontFamily: theme.typography.bodyFont }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: theme.typography.headingFont }}>Search products</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                placeholder="What are you looking for?"
                className="col-span-3"
                style={{ borderRadius: `${theme.layout.borderRadius}px` }}
              />
            </div>
            <Button 
              type="submit"
              style={{ 
                backgroundColor: theme.colors.primary,
                borderRadius: `${theme.layout.borderRadius}px` 
              }}
            >
              Search
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <div className="text-sm text-muted-foreground">
              Popular searches: Headphones, Smart watches, Phone accessories
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cart Drawer */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-md" style={{ fontFamily: theme.typography.bodyFont }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: theme.typography.headingFont }}>Your Shopping Cart</DialogTitle>
          </DialogHeader>
          
          {cartItems.length > 0 ? (
            <>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                      <Button variant="ghost" size="sm" className="text-red-500 h-6 p-0">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between border-t pt-3">
                <p className="font-medium">Total:</p>
                <p className="font-bold">${cartTotal.toFixed(2)}</p>
              </div>
              
              <DialogFooter>
                <Button 
                  className="w-full mt-4"
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/store?page=checkout");
                  }}
                  style={{ 
                    backgroundColor: theme.colors.primary,
                    borderRadius: `${theme.layout.borderRadius}px` 
                  }}
                >
                  Checkout
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="text-center py-6">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Your cart is empty</p>
              <Button 
                variant="outline" 
                className="mt-3"
                onClick={() => {
                  setCartOpen(false);
                  navigate("/store?category=all");
                }}
                style={{ 
                  borderColor: theme.colors.primary,
                  color: theme.colors.primary,
                  borderRadius: `${theme.layout.borderRadius}px` 
                }}
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Account Modal */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent style={{ fontFamily: theme.typography.bodyFont }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: theme.typography.headingFont }}>Your Account</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Button
              onClick={() => {
                setAccountOpen(false);
                navigate("/store?page=orders");
              }}
              variant="outline"
              className="justify-start"
              style={{ 
                borderRadius: `${theme.layout.borderRadius}px`,
                borderColor: theme.colors.secondary 
              }}
            >
              <Package className="mr-2 h-4 w-4" />
              Your Orders
            </Button>
            
            <Button
              onClick={() => {
                setAccountOpen(false);
                navigate("/store?page=wishlist");
              }}
              variant="outline"
              className="justify-start"
              style={{ 
                borderRadius: `${theme.layout.borderRadius}px`,
                borderColor: theme.colors.secondary 
              }}
            >
              <Heart className="mr-2 h-4 w-4" />
              Wishlist
            </Button>
            
            <Button
              onClick={() => {
                setAccountOpen(false);
                navigate("/store?page=profile");
              }}
              variant="outline"
              className="justify-start"
              style={{ 
                borderRadius: `${theme.layout.borderRadius}px`,
                borderColor: theme.colors.secondary 
              }}
            >
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </Button>
          </div>
          
          <DialogFooter>
            <Button 
              className="w-full" 
              variant="default"
              style={{ 
                backgroundColor: theme.colors.primary,
                borderRadius: `${theme.layout.borderRadius}px` 
              }}
            >
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreHeader;
