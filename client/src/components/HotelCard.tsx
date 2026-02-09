import { Hotel } from "@/lib/data";
import { useBookingLink } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface HotelCardProps {
  hotel: Hotel;
  featured?: boolean;
  index?: number;
}

export default function HotelCard({ hotel, featured = false, index = 0 }: HotelCardProps) {
  const { t, language } = useI18n();
  const bookingLink = useBookingLink();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut",
        delay: index * 0.15 
      }}
      className="h-full"
    >
      <Card className="overflow-hidden border-none shadow-lg group h-full flex flex-col rounded-none">
        <div className="relative h-64 overflow-hidden">
          <img 
            src={hotel.image} 
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-brand-blue uppercase tracking-wider">
            4 Stars
          </div>
          {hotel.id === "royal-bay" && (
            <div className="absolute top-4 left-4 bg-brand-gold text-white px-3 py-1 text-xs font-bold rounded-full shadow-md uppercase tracking-wider z-10">
              Coming Soon
            </div>
          )}
          {hotel.discount && hotel.id !== "royal-bay" && (
            <div className="absolute top-4 left-4 bg-brand-gold text-white px-3 py-1 text-xs font-bold rounded-full shadow-sm">
              {hotel.discount}
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-6 flex flex-col bg-white">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 mr-1 text-brand-gold" />
              {hotel.location}
            </div>
          </div>
          
          <h3 className="font-serif text-2xl font-bold text-brand-blue mb-3 group-hover:text-brand-gold transition-colors">
            {hotel.name}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-3 flex-1 text-[0.8125rem] leading-[1.75]">
            {hotel.description[language] || hotel.description.en}
          </p>

          <div className="flex flex-col gap-3 mt-auto">
            <div className="flex flex-wrap gap-2 mb-2">
              {hotel.features.slice(0, 3).map(f => (
                <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-sm">
                  {f}
                </span>
              ))}
            </div>
            
            <div className="flex gap-3 mt-2">
              <Link href={`/${hotel.id}`} className="flex-1">
                <Button variant="outline" className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white rounded-none">
                  {t("hotel.view")}
                </Button>
              </Link>
              {hotel.id === "royal-bay" ? (
                <Button disabled className="flex-1 bg-gray-200 text-gray-400 font-bold rounded-none cursor-not-allowed uppercase text-xs tracking-wider pl-0 pr-0">
                  Available Soon
                </Button>
              ) : (
                <Button asChild className="flex-1 bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold rounded-none">
                  <a href={bookingLink} target="_blank" rel="noopener noreferrer">
                    {t("nav.book")}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
