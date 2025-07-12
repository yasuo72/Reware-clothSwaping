import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, User, Shirt } from "lucide-react";

interface ItemCardProps {
  item: {
    id: number;
    title: string;
    category: string;
    size: string;
    condition: string;
    pointValue: number;
    imageUrls?: string[];
    tags?: string[];
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/items/${item.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer">
        <div className="aspect-square overflow-hidden bg-gray-100">
          {item.imageUrls && item.imageUrls.length > 0 ? (
            <img 
              src={item.imageUrls[0]} 
              alt={item.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Shirt className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="capitalize">
              {item.category}
            </Badge>
            <div className="flex items-center text-brand-amber">
              <Coins className="w-3 h-3 mr-1" />
              <span className="text-sm font-medium">{item.pointValue}</span>
            </div>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{item.title}</h3>
          <p className="text-sm text-slate-600 mb-2">Size {item.size} • {item.condition}</p>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center text-xs text-slate-500">
            <User className="w-3 h-3 mr-1" />
            <span>Item Owner</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
