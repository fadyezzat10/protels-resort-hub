import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useBookingLink } from "@/lib/cms";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface HeroProps {
  image?: string;
  images?: string[];
  title?: string;
  subtitle?: string;
  showButton?: boolean;
  height?: "full" | "half" | "large";
  bookingLink?: string;
}

export default function Hero({ 
  image, 
  images = [],
  title, 
  subtitle, 
  showButton = true,
  height = "full",
  bookingLink: bookingLinkProp,
}: HeroProps) {
  const { t } = useI18n();
  const cmsBookingLink = useBookingLink();
  const finalBookingLink = bookingLinkProp || cmsBookingLink;
  const [currentIndex, setCurrentIndex] = useState(0);

  const heroImages = images.length > 0 ? images : (image ? [image] : []);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroImages.length]);

  const getHeightClass = () => {
    switch (height) {
      case "full": return "h-[100vh]";
      case "large": return "h-[90vh]";
      case "half": return "h-[50vh] min-h-[500px]";
      default: return "h-[100vh]";
    }
  };

  return (
    <div className={`relative w-full ${getHeightClass()} overflow-hidden bg-brand-dark`}>
      <AnimatePresence mode="popLayout">
        <motion.div 
          key={currentIndex}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <img 
            src={heroImages[currentIndex]} 
            alt="Luxury Resort" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute inset-0 bg-black/20 z-10" /> 
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40 z-10" />

      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center container-padding pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="max-w-5xl"
        >
          {subtitle && (
            <p className="text-white/90 text-sm md:text-base uppercase tracking-[0.3em] mb-6 font-medium drop-shadow-md">
              {subtitle}
            </p>
          )}
          {title && (
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-10 leading-tight drop-shadow-xl font-medium">
              {title}
            </h1>
          )}
          
          {showButton && (
            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-[#C8A97E] hover:bg-[#b8966c] text-white font-bold px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
              >
                <a href={finalBookingLink} target="_blank" rel="noopener noreferrer">
                  {t("nav.book")}
                </a>
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {heroImages.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "bg-brand-gold w-8" : "bg-white/50 hover:bg-white"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
