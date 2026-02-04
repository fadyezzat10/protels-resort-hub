import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Maximize2, X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { Hotel } from "@/lib/data";

type GalleryImage = {
  src: string;
  alt: string;
};

type GalleryCategory = {
  id: string;
  label: string;
  description: string;
  images: GalleryImage[];
};

const staticGalleryData: Record<string, Omit<GalleryCategory, "images"> & { images: GalleryImage[] }> = {
  beach: {
    id: "beach",
    label: "Beach",
    description: "Relax on our pristine sandy beaches with crystal clear waters.",
    images: [
      { src: "/images/private-beach/hero.jpg", alt: "Private Beach Hero" },
      { src: "/images/private-beach/gallery-1.jpg", alt: "Beach Cabanas" },
      { src: "/images/private-beach/gallery-2.jpg", alt: "Sunbeds by the Sea" },
      { src: "/images/private-beach/gallery-3.jpg", alt: "Pier View" },
      { src: "/images/private-beach/gallery-4.jpg", alt: "Golden Hour at Beach" },
      { src: "/images/private-beach/gallery-5.jpg", alt: "Beach Bar" },
    ]
  },
  pools: {
    id: "pools",
    label: "Pools",
    description: "Dive into our refreshing pools and exciting aquapark adventures.",
    images: [
      { src: "/images/pools-aquapark/hero.jpg", alt: "Main Pool" },
      { src: "/images/pools-aquapark/gallery-1.jpg", alt: "Aquapark Slides" },
      { src: "/images/pools-aquapark/gallery-2.jpg", alt: "Kids Pool" },
      { src: "/images/pools-aquapark/gallery-3.jpg", alt: "Pool Bar" },
      { src: "/images/pools-aquapark/gallery-4.jpg", alt: "Relaxing Poolside" },
      { src: "/images/pools-aquapark/gallery-5.jpg", alt: "Night Pool View" },
    ]
  },
  facilities: {
    id: "facilities",
    label: "Facilities",
    description: "Enjoy world-class dining, wellness, and recreational activities.",
    images: [
      { src: "/images/facilities/hero.jpg", alt: "Spa & Wellness" },
      { src: "/images/facilities/gallery-1.jpg", alt: "Fitness Center" },
      { src: "/images/facilities/gallery-2.jpg", alt: "Italian Restaurant" },
      { src: "/images/facilities/gallery-3.jpg", alt: "Massage Room" },
      { src: "/images/facilities/gallery-4.jpg", alt: "El Dokka Dining" },
      { src: "/images/facilities/gallery-5.jpg", alt: "Mongolian Restaurant" },
    ]
  }
};

interface HotelGalleryProps {
  hotel?: Hotel;
}

export default function HotelGallery({ hotel }: HotelGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("beach");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const galleryData = useMemo(() => {
    // Get dynamic room images from hotel data
    const roomImages: GalleryImage[] = [];
    
    if (hotel && hotel.roomDetails) {
      hotel.roomDetails.forEach(room => {
        if (room.images && room.images.length > 0) {
          room.images.forEach((img, idx) => {
            roomImages.push({
              src: img,
              alt: `${room.name} - Image ${idx + 1}`
            });
          });
        }
      });
    }

    // Fallback if no room images found in data
    if (roomImages.length === 0) {
      roomImages.push(
        { src: "/images/rooms/hero.jpg", alt: "Luxury Ocean View Room" },
        { src: "/images/rooms/gallery-1.jpg", alt: "King Size Bed" },
        { src: "/images/rooms/gallery-2.jpg", alt: "Balcony Sea View" },
        { src: "/images/rooms/gallery-3.jpg", alt: "Modern Bathroom" },
        { src: "/images/rooms/gallery-4.jpg", alt: "Suite Living Area" },
        { src: "/images/rooms/gallery-5.jpg", alt: "Bright Interior" },
      );
    }

    return {
      ...staticGalleryData,
      rooms: {
        id: "rooms",
        label: "Rooms",
        description: "Experience ultimate comfort in our modern, well-appointed rooms.",
        images: roomImages
      }
    };
  }, [hotel]);

  const currentCategory = galleryData[activeCategory as keyof typeof galleryData];
  const allImages = currentCategory?.images || [];

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "unset";
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Gallery Header & Navigation */}
      <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-serif text-[#1a2332] flex items-center gap-2">
              <Camera className="w-6 h-6 text-[#C8A97E]" />
              Resort Gallery
            </h2>
            <p className="text-gray-500 mt-2 text-sm">{currentCategory.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {Object.values(galleryData).map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeCategory === category.id
                    ? "bg-[#1a2332] text-white shadow-md transform scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#C8A97E] hover:text-[#C8A97E]"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Image */}
            <div 
              className="w-full h-[300px] md:h-[450px] rounded-lg overflow-hidden mb-6 group cursor-pointer relative"
              onClick={() => openLightbox(0)}
            >
              <img
                src={allImages[0].src}
                alt={allImages[0].alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" /> View Fullscreen
                </span>
              </div>
            </div>

            {/* Grid Images */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allImages.slice(1).map((img, index) => (
                <div
                  key={index + 1}
                  className="aspect-[4/3] rounded-lg overflow-hidden cursor-pointer relative group"
                  onClick={() => openLightbox(index + 1)}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
              onClick={closeLightbox}
            >
              <X className="w-8 h-8" />
            </button>

            <button
              className="absolute left-4 md:left-8 text-white/70 hover:text-white transition-colors p-4 hover:bg-white/10 rounded-full"
              onClick={prevImage}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              className="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors p-4 hover:bg-white/10 rounded-full"
              onClick={nextImage}
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div 
              className="max-w-[90vw] max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={allImages[currentImageIndex].src}
                alt={allImages[currentImageIndex].alt}
                className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl"
              />
              <div className="absolute -bottom-10 left-0 right-0 text-center text-white/80 font-light tracking-wide">
                {allImages[currentImageIndex].alt}
              </div>
              <div className="absolute -top-10 left-0 text-white/50 text-sm">
                 {currentImageIndex + 1} / {allImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
