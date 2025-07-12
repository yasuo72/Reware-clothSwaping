import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Coins, 
  ArrowLeft, 
  Heart, 
  RefreshCcw, 
  Star, 
  User,
  X
} from "lucide-react";
import { useState } from "react";

interface Item {
  id: number;
  ownerId: number;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  brand?: string;
  pointValue: number;
  status: string;
  imageUrls?: string[];
  tags?: string[];
}

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [swapMessage, setSwapMessage] = useState("");

  const { data: item, isLoading } = useQuery<Item | null>({
    queryKey: ["/api/items", id],
    enabled: !!id,
  });

  const redeemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/swaps", {
        itemId: parseInt(id!),
        type: "redeem",
        message: "Point redemption request",
      });
    },
    onSuccess: () => {
      toast({
        title: "Redemption Successful!",
        description: "The item has been redeemed with your points.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/swaps"] });
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
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const swapMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/swaps", {
        itemId: parseInt(id!),
        type: "swap",
        message: swapMessage,
      });
    },
    onSuccess: () => {
      toast({
        title: "Swap Request Sent!",
        description: "Your swap request has been sent to the item owner.",
      });
      setSwapDialogOpen(false);
      setSwapMessage("");
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
        title: "Swap Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Item Not Found</h2>
            <p className="text-slate-600 mb-4">The item you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <a href="/browse">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Browse
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canRedeem = !!user?.points && !!item && user.points >= item.pointValue;
  const isOwner = !!user?.id && !!item && user.id === item.ownerId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <a href="/browse">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </a>
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
            {item.imageUrls && item.imageUrls.length > 0 ? (
              <img 
                src={item.imageUrls[selectedImageIndex]} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                  <p className="text-gray-500">No image available</p>
                </div>
              </div>
            )}
          </div>
          
          {item.imageUrls && item.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.imageUrls.map((url: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-brand-green' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={url} 
                    alt={`${item.title} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          {/* Owner Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12 border-2 border-brand-green">
                  <AvatarImage src="" alt="Owner" />
                  <AvatarFallback className="bg-brand-green text-white">
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Item Owner</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-slate-600">5.0 (23 reviews)</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Item Info */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{item.title}</h1>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <span className="text-slate-600">Category:</span>
                <span className="ml-2 text-slate-900 font-medium capitalize">{item.category}</span>
              </div>
              <div>
                <span className="text-slate-600">Size:</span>
                <span className="ml-2 text-slate-900 font-medium">{item.size}</span>
              </div>
              <div>
                <span className="text-slate-600">Condition:</span>
                <span className="ml-2 text-slate-900 font-medium capitalize">{item.condition}</span>
              </div>
              {item.brand && (
                <div>
                  <span className="text-slate-600">Brand:</span>
                  <span className="ml-2 text-slate-900 font-medium">{item.brand}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
              <p className="text-slate-600 leading-relaxed">{item.description}</p>
            </div>

            <Separator />

            {/* Point Value & Actions */}
            <div className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Coins className="text-brand-amber w-6 h-6" />
                  <span className="text-2xl font-bold text-slate-900">{item.pointValue}</span>
                  <span className="text-slate-600">points</span>
                </div>
                <Badge 
                  variant={item.status === 'approved' ? 'default' : 'secondary'}
                  className={item.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                >
                  {item.status === 'approved' ? 'Available' : item.status}
                </Badge>
              </div>

              {!isOwner && item.status === 'approved' && (
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-brand-green hover:bg-green-700"
                    disabled={!canRedeem || redeemMutation.isPending}
                    onClick={() => redeemMutation.mutate()}
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    {redeemMutation.isPending ? "Redeeming..." : "Redeem with Points"}
                  </Button>
                  
                  {!canRedeem && user && (
                    <p className="text-sm text-red-600 text-center">
                      You need {item.pointValue - (user.points ?? 0)} more points to redeem this item
                    </p>
                  )}
                  
                  <Dialog open={swapDialogOpen} onOpenChange={setSwapDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white">
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Request Item Swap
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Item Swap</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-slate-600">
                          Send a message to the item owner to request a swap. Include details about what you'd like to offer in exchange.
                        </p>
                        <Textarea
                          placeholder="Hi! I'm interested in swapping this item. I have a..."
                          value={swapMessage}
                          onChange={(e) => setSwapMessage(e.target.value)}
                          rows={4}
                        />
                        <div className="flex space-x-3">
                          <Button 
                            variant="outline" 
                            onClick={() => setSwapDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => swapMutation.mutate()}
                            disabled={!swapMessage.trim() || swapMutation.isPending}
                            className="flex-1 bg-brand-green hover:bg-green-700"
                          >
                            {swapMutation.isPending ? "Sending..." : "Send Request"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="ghost" className="w-full text-slate-600 hover:text-slate-800">
                    <Heart className="w-4 h-4 mr-2" />
                    Add to Wishlist
                  </Button>
                </div>
              )}

              {isOwner && (
                <div className="text-center py-4">
                  <p className="text-slate-600 mb-4">This is your item</p>
                  <Button variant="outline">
                    Edit Item Details
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
