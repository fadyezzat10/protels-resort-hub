import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Maximize2, Bed, Mountain, Wind, Tv, Wifi, Coffee, Shirt, Ban, Bath, ShowerHead, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { RoomDetail } from "@/lib/data";
import { useBookingLink } from "@/lib/cms";
import { cn } from "@/lib/utils";

interface RoomModalProps {
  room: RoomDetail;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoomModal({ room, isOpen, onClose }: RoomModalProps) {
  const bookingLink = useBookingLink();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = room.images || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Icon mapping
  const getIcon = (amenity: string) => {
    switch(amenity.toLowerCase()) {
      case "balcony": return <Home className="w-4 h-4" />;
      case "terrace": return <Mountain className="w-4 h-4" />;
      case "air conditioning": return <Wind className="w-4 h-4" />;
      case "flat screen tv": return <Tv className="w-4 h-4" />;
      case "free wi-fi": return <Wifi className="w-4 h-4" />;
      case "electric kettle": return <Coffee className="w-4 h-4" />;
      case "wardrobe": return <Shirt className="w-4 h-4" />;
      case "non-smoking": return <Ban className="w-4 h-4" />;
      case "bathtub": return <Bath className="w-4 h-4" />;
      case "shower": return <ShowerHead className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[1100px] w-[95vw] max-h-[90vh] p-0 overflow-y-auto bg-white rounded-xl shadow-2xl border-0 scroll-smooth">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Side: Image Gallery */}
          <div className="relative h-64 lg:h-auto bg-gray-100 flex flex-col">
            <div className="relative flex-1 overflow-hidden group min-h-[300px] lg:min-h-full">
              <img 
                src={images[currentImageIndex]} 
                alt={`${room.name} view ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-500 ease-in-out absolute inset-0"
              />
              
              {/* Navigation Arrows */}
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="hidden lg:flex p-4 gap-2 bg-white/5 overflow-x-auto absolute bottom-0 w-full backdrop-blur-md z-10">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    "w-20 h-14 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all",
                    currentImageIndex === idx ? "border-brand-gold opacity-100 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="p-8 lg:p-10 flex flex-col bg-brand-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-3xl font-serif text-brand-blue">{room.name}</h2>
                  <div className="flex gap-0.5">
                    {[1,2,3,4].map(i => <span key={i} className="text-brand-gold text-xs">★</span>)}
                  </div>
                </div>
                <div className="h-0.5 w-12 bg-brand-gold/50 rounded-full" />
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-brand-blue transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 text-sm border-b border-gray-100 pb-6">
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 uppercase text-[10px] tracking-widest font-bold">Room Size</span>
                <div className="flex items-center gap-2 text-brand-blue font-medium">
                  <Maximize2 className="w-4 h-4 text-brand-gold" />
                  {room.size}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 uppercase text-[10px] tracking-widest font-bold">Beds</span>
                <div className="flex items-center gap-2 text-brand-blue font-medium">
                  <Bed className="w-4 h-4 text-brand-gold" />
                  {room.bed}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 uppercase text-[10px] tracking-widest font-bold">View</span>
                <div className="flex items-center gap-2 text-brand-blue font-medium">
                  <Mountain className="w-4 h-4 text-brand-gold" />
                  {room.view}
                </div>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <h3 className="font-serif text-lg text-brand-blue mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                  Room Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-2">
                  {room.amenities?.filter(a => !["Bathtub", "Shower"].includes(a)).map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-brand-gold">{getIcon(amenity)}</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-lg text-brand-blue mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                  Bathroom
                </h3>
                <div className="flex gap-6">
                  {room.amenities?.filter(a => ["Bathtub", "Shower"].includes(a)).map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-brand-gold">{getIcon(amenity)}</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-gray-100 text-gray-600 leading-relaxed text-sm">
                {room.description}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
              <Button asChild className="flex-1 bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold py-6 text-base tracking-wide shadow-md">
                <a href={bookingLink} target="_blank">Check Rates</a>
              </Button>
              <Button variant="outline" className="flex-1 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white py-6 text-base tracking-wide">
                View More Photos
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}