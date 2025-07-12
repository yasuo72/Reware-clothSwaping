import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Recycle, Bell, Coins, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Navigation() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Get cart items count for authenticated users
  const { data: cartItems = [] } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
                <Recycle className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-slate-800">ReWear</span>
            </div>
            <div className="animate-pulse flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
                <Recycle className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-slate-800">ReWear</span>
            </Link>
            {isAuthenticated && (
              <div className="hidden md:flex space-x-6">
                <Link 
                  href="/browse" 
                  className={`text-slate-600 hover:text-brand-green transition-colors ${
                    location === '/browse' ? 'text-brand-green font-medium' : ''
                  }`}
                >
                  Browse Items
                </Link>
                <a href="#how-it-works" className="text-slate-600 hover:text-brand-green transition-colors">
                  How It Works
                </a>
                <a href="#about" className="text-slate-600 hover:text-brand-green transition-colors">
                  About
                </a>
                {user?.isAdmin && (
                  <Link 
                    href="/admin" 
                    className={`text-slate-600 hover:text-brand-green transition-colors ${
                      location === '/admin' ? 'text-brand-green font-medium' : ''
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <a href="/api/login" className="text-slate-600 hover:text-brand-green transition-colors">
                  Sign In
                </a>
                <Button asChild className="bg-brand-green hover:bg-green-700">
                  <a href="/api/login">Get Started</a>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-amber-50 text-amber-800 hover:bg-amber-100">
                  <Coins className="w-3 h-3 mr-1 text-brand-amber" />
                  {user?.points || 0} pts
                </Badge>
                
                <Button variant="ghost" size="sm" asChild className="relative p-2">
                  <Link href="/cart">
                    <ShoppingCart className="w-4 h-4" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" className="relative p-2">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </Button>

                <Link href="/" className="flex items-center">
                  <Avatar className="w-8 h-8 border-2 border-brand-green">
                    <AvatarImage 
                      src={user?.profileImageUrl || ""} 
                      alt={`${user?.firstName} ${user?.lastName}`} 
                    />
                    <AvatarFallback className="bg-brand-green text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="text-slate-600 hover:text-slate-800"
                >
                  <a href="/api/logout">Logout</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
