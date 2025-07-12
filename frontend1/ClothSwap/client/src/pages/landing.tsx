import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";

// Type definition for items returned from /api/items/featured
interface FeaturedItem {
  id: number | string;
  title: string;
  imageUrls?: string[];
  category: string;
  condition: string;
  pointValue: string;
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const { data: featuredItems = [] } = useQuery<FeaturedItem[]>({
    queryKey: ["/api/items/featured"],
    queryFn: async () => {
      const res = await fetch("/api/items/featured");
      if (!res.ok) {
        throw new Error("Failed to fetch featured items");
      }
      return res.json();
    },
  });

  // Sample data for display purposes
  const newArrivals = [
    { id: 1, name: "Classic Denim", category: "Jeans", price: "25 points", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop" },
    { id: 2, name: "Winter Coat", category: "Outerwear", price: "45 points", image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop" },
    { id: 3, name: "Summer Dress", category: "Dresses", price: "30 points", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop" },
    { id: 4, name: "Casual Shirt", category: "Tops", price: "20 points", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=400&fit=crop" },
  ];

  const menCategories = [
    { name: "T-Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=250&fit=crop" },
    { name: "Jeans", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=250&fit=crop" },
    { name: "Jackets", image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=200&h=250&fit=crop" },
    { name: "Sneakers", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=250&fit=crop" },
    { name: "Sweaters", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=250&fit=crop" },
    { name: "Shorts", image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=200&h=250&fit=crop" },
    { name: "Accessories", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=250&fit=crop" },
    { name: "Bags", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=250&fit=crop" },
  ];

  const womenCategories = [
    { name: "Dresses", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=250&fit=crop" },
    { name: "Blouses", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=250&fit=crop" },
    { name: "Skirts", image: "https://images.unsplash.com/photo-1583496661160-fb5886a13d8e?w=200&h=250&fit=crop" },
    { name: "Heels", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=250&fit=crop" },
  ];

  const testimonials = [
    { name: "Sarah Johnson", rating: 5, comment: "Amazing quality clothes and super easy to swap!", avatar: "https://images.unsplash.com/photo-1494790108755-2616b60b1013?w=50&h=50&fit=crop&crop=face" },
    { name: "Mike Chen", rating: 5, comment: "Love the sustainable approach to fashion. Great community!", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face" },
    { name: "Emma Wilson", rating: 5, comment: "Found so many unique pieces I wouldn't find anywhere else.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face" },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  Discover New
                  <span className="block">Collection</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  ReWear lets you give your clothes a second life.
                  Join our community and discover amazing pre-loved fashion.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg"
                  asChild
                >
                  <a href="/api/login">
                    Shop Now
                    <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg"
                  asChild
                >
                  <a href="#featured">Browse Items</a>
                </Button>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-4">
                  <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="aspect-[3/4] bg-gradient-to-br from-pink-100 to-purple-100"></div>
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Summer Collection</h3>
                      <p className="text-blue-600 font-bold text-sm sm:text-base">From 15 points</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-4 pt-4 sm:pt-8">
                  <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-teal-100"></div>
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Casual Wear</h3>
                      <p className="text-blue-600 font-bold text-sm sm:text-base">From 20 points</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <div id="featured" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Items</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover amazing pre-loved fashion pieces handpicked by our community
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white cursor-pointer"
                  onClick={() => setLocation(`/items/${item.id}`)}
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={item.imageUrls?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=600&fit=crop"} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.condition}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                      {item.title}
                    </h3>
                    <p className="text-blue-600 font-bold text-lg">
                      {item.pointValue} pts
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Value Proposition */}
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            ReWear lets you give your clothes a second life.
          </h2>
          <p className="text-blue-100 text-lg">
            Join our community, swap items, earn points, and build a sustainable wardrobe.
          </p>
        </div>
      </div>

      {/* Summer Value Pack Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge className="bg-orange-100 text-orange-800 mb-2">T-Shirt / Tops</Badge>
              <h2 className="text-3xl font-bold text-gray-900">Summer Value Pack</h2>
              <p className="text-gray-600 mt-2">cool | colorful | comfy</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="rounded-full p-2">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-full p-2">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((item) => (
              <Link key={item.id} href={`/product/${item.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">{item.category}</p>
                    <p className="text-blue-600 font-bold mt-2 text-sm sm:text-base">{item.price}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* New Arrivals */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
            <Button variant="outline">View All</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((item) => (
              <Card 
                key={`new-${item.id}`} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation(`/items/${item.id}`)}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-3">
                  <p className="text-xs text-blue-600 font-medium">{item.category}</p>
                  <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                  <p className="text-blue-600 font-bold text-sm">{item.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Categories for Men */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-8">Categories for Men</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {menCategories.map((category, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-gray-900 text-center">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Categories for Women */}
      <div className="py-16 bg-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Categories for Women</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {womenCategories.map((category, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 text-center">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* In The Spotlight */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">In The Spotlight</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop", bg: "bg-black" },
              { image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop", bg: "bg-pink-100" },
              { image: "https://images.unsplash.com/photo-1583496661160-fb5886a13d8e?w=300&h=400&fit=crop", bg: "bg-orange-400" },
              { image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=400&fit=crop", bg: "bg-pink-300" },
            ].map((item, index) => (
              <Card key={index} className={`overflow-hidden hover:shadow-lg transition-shadow ${item.bg}`}>
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={`Spotlight item ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What Our Community Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <div className="flex items-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Sustainable Fashion Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of fashion lovers who are making a difference, one swap at a time.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-lg"
            asChild
          >
            <a href="/api/login">
              Get Started Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}