import { Hotel } from "@/lib/data";
import { useBookingLink } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import EditableImage from "@/components/EditableImage";
import { useRef, useEffect, useState } from "react";

interface HotelCardProps {
  hotel: Hotel;
  featured?: boolean;
  index?: number;
}

export default function HotelCard({ hotel, featured = false, index = 0 }: HotelCardProps) {
  const { t, language } = useI18n();
  const globalBookingLink = useBookingLink();
  const bookingLink = hotel.bookingLink || globalBookingLink;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "-50px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="h-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
        transition: `opacity 0.6s ease-out ${index * 0.15}s, transform 0.6s ease-out ${index * 0.15}s`,
      }}
    >
      <Card className="overflow-hidden border-none shadow-lg group h-full flex flex-col rounded-none">
        <div className="relative h-64 overflow-hidden">
          <EditableImage
            contentKey={`hotel.${hotel.id}.card`}
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-brand-blue uppercase tracking-wider pointer-events-none">
            4 Stars
          </div>
          {hotel.id === "royal-bay" && (
            <div className="absolute top-4 left-4 bg-brand-gold text-white px-3 py-1 text-xs font-bold rounded-full shadow-md uppercase tracking-wider z-10 pointer-events-none">
              Coming Soon
            </div>
          )}
          {hotel.discount && hotel.id !== "royal-bay" && (
            <div className="absolute top-4 left-4 bg-brand-gold text-white px-3 py-1 text-xs font-bold rounded-full shadow-sm pointer-events-none">
              {hotel.discount}
            </div>
          )}
          {hotel.tripAdvisorRank && hotel.id !== "royal-bay" && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-md pointer-events-none">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#00AF87" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/>
                <circle cx="8.5" cy="11.5" r="2.5"/>
                <circle cx="15.5" cy="11.5" r="2.5"/>
              </svg>
              <span className="text-[10px] font-bold text-[#00AF87] whitespace-nowrap">{hotel.tripAdvisorRank}</span>
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
          
          <p className="text-gray-600 mb-4 line-clamp-4 flex-1 text-[0.8rem] leading-[1.7] break-words">
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
              <Link href={`/hotels/${hotel.id}`} className="flex-1">
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
    </div>
  );
}
