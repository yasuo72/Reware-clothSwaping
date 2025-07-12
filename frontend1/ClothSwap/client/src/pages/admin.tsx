import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  Check, 
  X, 
  Shirt, 
  Shield,
  Eye,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { Item, AdminStats } from "@/types";
import { fetcher } from "@/lib/fetcher";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [filterCategory, setFilterCategory] = useState("all");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "You don't have admin access.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: () => fetcher<AdminStats>("/api/admin/stats"),
    enabled: isAuthenticated && user?.isAdmin,
    retry: false,
  });

  const { data: pendingItems = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ["/api/admin/pending-items"],
    queryFn: () => fetcher<Item[]>("/api/admin/pending-items"),
    enabled: isAuthenticated && user?.isAdmin,
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("PATCH", `/api/admin/items/${itemId}`, {
        status: "approved",
      });
    },
    onSuccess: () => {
      toast({
        title: "Item Approved",
        description: "The item has been approved and is now available for swapping.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("PATCH", `/api/admin/items/${itemId}`, {
        status: "rejected",
      });
    },
    onSuccess: () => {
      toast({
        title: "Item Rejected",
        description: "The item has been rejected and removed from pending review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredItems = pendingItems.filter((item: any) => 
    filterCategory === "all" || item.category === filterCategory
  );

  if (isLoading || !isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
              <p className="text-slate-600 mt-1">Manage platform content and user submissions</p>
            </div>
            <Badge variant="destructive" className="bg-red-50 text-red-800 hover:bg-red-100">
              <Shield className="w-3 h-3 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Reviews</p>
                  <p className="text-3xl font-bold text-orange-600">{stats?.pendingReviews || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-orange-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Approved Today</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.approvedToday || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="text-green-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Rejected Today</p>
                  <p className="text-3xl font-bold text-red-600">{stats?.rejectedToday || 0}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="text-red-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Items</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.totalItems || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shirt className="text-blue-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Items for Review */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Items Pending Review</CardTitle>
              <div className="flex space-x-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="tops">Tops</SelectItem>
                    <SelectItem value="bottoms">Bottoms</SelectItem>
                    <SelectItem value="outerwear">Outerwear</SelectItem>
                    <SelectItem value="dresses">Dresses</SelectItem>
                    <SelectItem value="shoes">Shoes</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-slate-600">No pending items for review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item: any) => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.imageUrls?.[0] ? (
                        <img 
                          src={item.imageUrls[0]} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Shirt className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">
                        Size {item.size} • {item.condition} • {item.pointValue} points
                      </p>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{item.description}</p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(item.id)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm"
                        variant="destructive"
                        disabled={rejectMutation.isPending}
                        onClick={() => rejectMutation.mutate(item.id)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/items/${item.id}`}>
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
