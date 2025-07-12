import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, CreditCard, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe (we'll add the key through environment variables)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

function CheckoutForm({ cartItems, totalPoints }: { cartItems: any[], totalPoints: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<'points' | 'card'>('points');
  const [isProcessing, setIsProcessing] = useState(false);

  // Process points payment
  const processPointsPayment = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/checkout/points", {
        cartItems: cartItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          pointsPerItem: item.item.pointValue
        }))
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Order Successful!",
        description: "Your order has been placed successfully using points.",
      });
      setLocation("/orders");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please Log In",
          description: "You need to be logged in to complete checkout.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Payment Failed",
        description: "Failed to process your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Process card payment (through Stripe)
  const processCardPayment = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      // Create payment intent
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: totalPoints * 0.1, // Convert points to dollars (10 points = $1)
        cartItems: cartItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          pointsPerItem: item.item.pointValue
        }))
      });

      const { clientSecret } = response;

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (result.error) {
        toast({
          title: "Payment Failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Order Successful!",
          description: "Your order has been placed successfully.",
        });
        setLocation("/orders");
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "An error occurred during payment processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'points') {
      processPointsPayment.mutate();
    } else {
      await processCardPayment();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === 'points' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="points"
                checked={paymentMethod === 'points'}
                onChange={(e) => setPaymentMethod(e.target.value as 'points')}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <Wallet className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-medium">Use Points</div>
                  <div className="text-sm text-gray-600">Pay with your earned points</div>
                </div>
              </div>
            </label>

            <label className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-medium">Credit Card</div>
                  <div className="text-sm text-gray-600">${(totalPoints * 0.1).toFixed(2)}</div>
                </div>
              </div>
            </label>
          </div>

          {paymentMethod === 'card' && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Information
              </label>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
        disabled={isProcessing || processPointsPayment.isPending || (!stripe && paymentMethod === 'card')}
      >
        {isProcessing || processPointsPayment.isPending ? "Processing..." : 
         paymentMethod === 'points' ? `Pay ${totalPoints} Points` : 
         `Pay $${(totalPoints * 0.1).toFixed(2)}`}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !authLoading && isAuthenticated,
  });

  // Redirect to login if trying to access without auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please Log In",
        description: "You need to be logged in to checkout.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }
  }, [authLoading, isAuthenticated, toast]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Items to Checkout</h2>
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Button onClick={() => setLocation("/")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const totalPoints = cartItems.reduce((sum: number, item: any) => 
    sum + (item.item.pointValue * item.quantity), 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/cart")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((cartItem: any) => (
                  <div key={cartItem.id} className="flex items-center space-x-4">
                    <img 
                      src={cartItem.item.imageUrls?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop"} 
                      alt={cartItem.item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{cartItem.item.title}</h3>
                      <p className="text-sm text-gray-600">Qty: {cartItem.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">
                        {cartItem.item.pointValue * cartItem.quantity} points
                      </p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{totalPoints} points</span>
                </div>

                {user && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Your current balance: <span className="font-bold">{user.points} points</span>
                    </p>
                    {user.points < totalPoints && (
                      <p className="text-sm text-red-600 mt-1">
                        Insufficient points. You need {totalPoints - user.points} more points.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Elements stripe={stripePromise}>
              <CheckoutForm cartItems={cartItems} totalPoints={totalPoints} />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
}