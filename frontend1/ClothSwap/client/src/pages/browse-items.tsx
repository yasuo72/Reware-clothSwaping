import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import ItemCard from "@/components/item-card";
import { Search, Filter } from "lucide-react";

// Define the shape of an item returned from the API so that TypeScript can infer
// the correct type instead of falling back to `unknown`.
export type Item = {
  id: number;
  title: string;
  description: string;
  brand?: string;
  // Add any other fields you expect here
};

export default function BrowseItems() {
  const [category, setCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ["items", { category: category === "all" ? undefined : category, status: "approved" }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category !== "all") params.append("category", category);
      params.append("status", "approved");

      const res = await fetch(`/api/items?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch items");
      }
      return res.json() as Promise<Item[]>;
    },
  });

  const filteredItems = items.filter((item: any) => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Items</h1>
        <p className="text-slate-600">Discover amazing clothing items available for swap or redemption</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Categories" />
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

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No items found</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm || category 
              ? "Try adjusting your search or filters" 
              : "No items are currently available"}
          </p>
          {(searchTerm || category) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setCategory("");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-600">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item: any) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
