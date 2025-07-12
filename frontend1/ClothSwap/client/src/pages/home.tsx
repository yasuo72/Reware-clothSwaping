import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddItemModal from "@/components/add-item-modal";
import ItemCard from "@/components/item-card";
import { 
  Coins, 
  Shirt, 
  Handshake, 
  Star, 
  Plus, 
  Search, 
  User,
  Heart,
  Edit
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: myItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/my-items"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: swaps = [] } = useQuery({
    queryKey: ["/api/swaps"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/point-transactions"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  const successfulSwaps = swaps.filter((swap: any) => swap.status === 'completed').length;
  const userRating = user.rating ? parseFloat(user.rating) : 5.0;

  return (
    <div className="user-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-slate-600 mt-1">Manage your clothing exchanges and discover new items</p>
            </div>
            <Button 
              className="bg-brand-green hover:bg-green-700"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              List New Item
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Available Points</p>
                  <p className="text-3xl font-bold text-brand-amber">{user.points}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Coins className="text-brand-amber w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Items Listed</p>
                  <p className="text-3xl font-bold text-slate-900">{myItems.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shirt className="text-blue-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Successful Swaps</p>
                  <p className="text-3xl font-bold text-slate-900">{successfulSwaps}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Handshake className="text-brand-green w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Rating</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-3xl font-bold text-slate-900">{userRating.toFixed(1)}</p>
                    <Star className="text-yellow-400 w-4 h-4 fill-current" />
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="text-yellow-500 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Listed Items</CardTitle>
                  <Button variant="ghost" size="sm" className="text-brand-green hover:text-green-700">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : myItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Shirt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">You haven't listed any items yet</p>
                    <Button 
                      className="bg-brand-green hover:bg-green-700"
                      onClick={() => setShowAddModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      List Your First Item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myItems.slice(0, 4).map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          {item.imageUrls?.[0] && (
                            <img 
                              src={item.imageUrls[0]} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">{item.title}</h3>
                          <p className="text-sm text-slate-600">Size {item.size} • {item.condition}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge 
                              variant={item.status === 'approved' ? 'default' : 'secondary'}
                              className={item.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {item.status === 'approved' ? 'Available' : item.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-brand-amber text-sm">
                            <Coins className="w-3 h-3 mr-1" />
                            <span>{item.pointValue} pts</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs mt-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-slate-600 text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 3).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                          transaction.type === 'earned' ? 'bg-green-100' : 
                          transaction.type === 'spent' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          <Coins className={`w-4 h-4 ${
                            transaction.type === 'earned' ? 'text-green-600' : 
                            transaction.type === 'spent' ? 'text-red-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-900">{transaction.description}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => setShowAddModal(true)}
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Plus className="text-brand-green w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">List New Item</p>
                    <p className="text-sm text-slate-600">Upload photos and details</p>
                  </div>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-3 h-auto"
                  asChild
                >
                  <a href="/browse">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Search className="text-blue-600 w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900">Browse Items</p>
                      <p className="text-sm text-slate-600">Find your next favorite piece</p>
                    </div>
                  </a>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-3 h-auto"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <User className="text-purple-600 w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">Edit Profile</p>
                    <p className="text-sm text-slate-600">Update your information</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddItemModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
