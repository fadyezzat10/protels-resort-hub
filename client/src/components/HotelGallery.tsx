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
  dining: {
    id: "dining",
    label: "Dining",
    description: "Savor exquisite flavors at our world-class restaurants and bars.",
    images: [
      { src: "/images/italian-restaurant/hero.jpg", alt: "La Trattoria Italian Restaurant" },
      { src: "/images/el-dokka/hero.jpg", alt: "El Dokka Dining Experience" },
      { src: "/images/mongolian-restaurant/hero.jpg", alt: "Mongolian Specialty Restaurant" },
      { src: "/images/italian-restaurant/gallery-1.jpg", alt: "Fine Dining Atmosphere" },
      { src: "/images/el-dokka/gallery-1.jpg", alt: "Seaside Dining" },
      { src: "/images/mongolian-restaurant/gallery-1.jpg", alt: "Live Cooking Station" },
      { src: "/images/italian-restaurant/gallery-2.jpg", alt: "Italian Cuisine" },
      { src: "/images/el-dokka/gallery-2.jpg", alt: "El Dokka Interior" },
      { src: "/images/mongolian-restaurant/gallery-2.jpg", alt: "Mongolian Buffet" },
      { src: "/images/italian-restaurant/gallery-3.jpg", alt: "Chef Specialty" },
      { src: "/images/el-dokka/gallery-3.jpg", alt: "Sunset Dinner" },
      { src: "/images/mongolian-restaurant/gallery-3.jpg", alt: "Authentic Decor" },
    ]
  },
  wellness: {
    id: "wellness",
    label: "Wellness",
    description: "Rejuvenate your body and mind at our luxury spa and fitness center.",
    images: [
      { src: "/images/spa-wellness/hero.jpg", alt: "Luxury Spa" },
      { src: "/images/fitness-center/hero.jpg", alt: "State-of-the-art Gym" },
      { src: "/images/spa-wellness/gallery-1.jpg", alt: "Massage Therapy" },
      { src: "/images/fitness-center/gallery-1.jpg", alt: "Cardio Equipment" },
      { src: "/images/spa-wellness/gallery-2.jpg", alt: "Relaxation Area" },
      { src: "/images/fitness-center/gallery-2.jpg", alt: "Weights Section" },
    ]
  }
};

const beachClubGalleryData: Record<string, Omit<GalleryCategory, "images"> & { images: GalleryImage[] }> = {
  beach: {
    id: "beach",
    label: "Beach",
    description: "Relax on our private sandy beach with crystal clear waters.",
    images: [
      { src: "/images/beach-club/facilities/beach/hero.jpg", alt: "Private Beach Hero" },
      { src: "/images/beach-club/facilities/beach/gallery-1.jpg", alt: "Beach Cabanas" },
      { src: "/images/beach-club/facilities/beach/gallery-2.jpg", alt: "Sunbeds by the Sea" },
      { src: "/images/beach-club/facilities/beach/gallery-3.jpg", alt: "Shoreline View" },
      { src: "/images/beach-club/facilities/beach/gallery-4.jpg", alt: "Beach Atmosphere" },
      { src: "/images/beach-club/facilities/beach/gallery-5.jpg", alt: "Relaxation" },
      { src: "/images/beach-club/facilities/beach/gallery-6.jpg", alt: "Beach View" },
    ]
  }
};

interface HotelGalleryProps {
  hotel?: Hotel;
}

export default function HotelGallery({ hotel }: HotelGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
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

    const isBeachClub = hotel?.id === "beach-club";
    const isLaPlage = hotel?.id === "la-plage";
    
    // For La Plage, we use the specific gallery from data.ts
    if (isLaPlage) {
      const mainGalleryImages = hotel?.gallery?.map((src, idx) => ({
        src,
        alt: `La Plage Gallery Image ${idx + 1}`
      })) || [];

      const allLaPlageImages = [...mainGalleryImages, ...roomImages];

      return {
        all: {
          id: "all",
          label: "La Plage",
          description: "Explore the authentic Zanzibar experience at Protels La Plage.",
          images: allLaPlageImages
        },
        rooms: {
          id: "rooms",
          label: "Rooms",
          description: "Experience ultimate comfort in our swahili-style bungalows.",
          images: roomImages
        }
      };
    }

    const activeStaticData = isBeachClub ? beachClubGalleryData : staticGalleryData;
    
    // For Beach Club, we only have Beach and Rooms images currently.
    const allImages = [
      ...Object.values(activeStaticData).flatMap(cat => cat.images),
      ...roomImages
    ];

    return {
      all: {
        id: "all",
        label: isBeachClub ? "Beach Club" : "Crystal Beach",
        description: isBeachClub 
          ? "Explore the vibrant Protels Beach Club & SPA experience."
          : "Explore the complete Crystal Beach Resort experience.",
        images: allImages
      },
      ...activeStaticData,
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
