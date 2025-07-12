import { useState } from "react";
import { Button } from "@/components/ui/button";
import ItemCard from "@/components/item-card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedCarouselProps {
  items: any[];
}

export default function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 4;
  const totalSlides = Math.ceil(items.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">No featured items available</p>
      </div>
    );
  }

  const visibleItems = items.slice(
    currentSlide * itemsPerSlide,
    (currentSlide + 1) * itemsPerSlide
  );

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
      
      {totalSlides > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full hover:bg-gray-50"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full hover:bg-gray-50"
            onClick={nextSlide}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-brand-green' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
