import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { bookingLink } from "@/lib/data";
import { motion } from "framer-motion";

interface HeroProps {
  image: string;
  title?: string;
  subtitle?: string;
  showButton?: boolean;
  height?: "full" | "half";
}

export default function Hero({ 
  image, 
  title, 
  subtitle, 
  showButton = true,
  height = "full"
}: HeroProps) {
  const { t } = useI18n();

  return (
    <div className={`relative w-full ${height === "full" ? "h-[100vh]" : "h-[60vh]"} overflow-hidden bg-black`}>
      {/* Background Image with Zoom Effect */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
      >
        <img 
          src={image} 
          alt="Luxury Resort" 
          className="w-full h-full object-cover opacity-70"
        />
      </motion.div>
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/80 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center container-padding">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl"
        >
          {subtitle && (
            <p className="text-brand-gold text-lg md:text-xl uppercase tracking-[0.2em] mb-4 font-medium">
              {subtitle}
            </p>
          )}
          {title && (
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-8 leading-tight">
              {title}
            </h1>
          )}
          
          {showButton && (
            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold px-8 py-6 text-lg rounded-none min-w-[200px]"
              >
                <a href={bookingLink} target="_blank" rel="noopener noreferrer">
                  {t("nav.book")}
                </a>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
