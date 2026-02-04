import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { bookingLink } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface HeroProps {
  image?: string;
  images?: string[];
  title?: string;
  subtitle?: string;
  showButton?: boolean;
  height?: "full" | "half";
}

export default function Hero({ 
  image, 
  images = [],
  title, 
  subtitle, 
  showButton = true,
  height = "full"
}: HeroProps) {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use provided image as fallback if images array is empty
  const heroImages = images.length > 0 ? images : (image ? [image] : []);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <div className={`relative w-full ${height === "full" ? "h-[100vh]" : "h-[60vh]"} overflow-hidden bg-black`}>
      {/* Background Slider */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          key={currentIndex}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <img 
            src={heroImages[currentIndex]} 
            alt="Luxury Resort" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Soft Dark Overlay */}
      <div className="absolute inset-0 bg-black/30 z-10" /> 
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center container-padding">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl"
        >
          {subtitle && (
            <p className="text-brand-gold text-lg md:text-xl uppercase tracking-[0.2em] mb-4 font-medium drop-shadow-md">
              {subtitle}
            </p>
          )}
          {title && (
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-serif text-white mb-8 leading-tight drop-shadow-lg">
              {title}
            </h1>
          )}
          
          {showButton && (
            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold px-6 py-4 md:px-8 md:py-6 text-sm md:text-lg rounded-none min-w-[160px] md:min-w-[200px] shadow-lg hover:shadow-xl transition-all"
              >
                <a href={bookingLink} target="_blank" rel="noopener noreferrer">
                  {t("nav.book")}
                </a>
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Slider Indicators (Optional but nice for UX) */}
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
