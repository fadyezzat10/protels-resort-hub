import { useParams, useLocation } from "wouter";
import { hotels, bookingLink } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Check, Wifi, Utensils, Waves, Sun } from "lucide-react";
import NotFound from "@/pages/not-found";

export default function HotelDetails() {
  const { id } = useParams();
  const { t, language } = useI18n();
  const hotel = hotels.find(h => h.id === id);

  if (!hotel) return <NotFound />;

  // Feature Icons mapping
  const getFeatureIcon = (feature: string) => {
    if (feature.includes("Beach")) return <Waves className="w-5 h-5 text-brand-gold" />;
    if (feature.includes("Pool")) return <Waves className="w-5 h-5 text-brand-gold" />;
    if (feature.includes("Dining") || feature.includes("Restaurant")) return <Utensils className="w-5 h-5 text-brand-gold" />;
    return <Sun className="w-5 h-5 text-brand-gold" />;
  };

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />
      
      <Hero 
        image={hotel.image}
        title={hotel.name}
        subtitle={hotel.location}
        height="half"
      />

      <div className="container-padding py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-serif text-brand-blue mb-6">Overview</h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-8">
              {hotel.description[language]}
            </p>

            <h3 className="text-2xl font-serif text-brand-blue mb-6 mt-12">{t("hotel.features")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotel.features.map(feature => (
                <div key={feature} className="flex items-center gap-3 p-4 bg-white border border-gray-100 shadow-sm">
                  {getFeatureIcon(feature)}
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-serif text-brand-blue mb-6 mt-12">{t("hotel.rooms")}</h3>
            <div className="space-y-4">
              {hotel.rooms.map(room => (
                <div key={room} className="p-6 bg-white border border-gray-100 flex items-center justify-between group hover:border-brand-gold transition-colors">
                  <span className="font-medium text-lg text-brand-blue">{room}</span>
                  <Button asChild variant="ghost" className="text-brand-gold hover:text-brand-blue">
                    <a href={bookingLink} target="_blank">Book This Room &rarr;</a>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-brand-blue text-white p-8">
              <h3 className="text-2xl font-serif mb-4 text-brand-gold">Ready to Book?</h3>
              <p className="text-white/70 mb-6">Best rates guaranteed when booking directly through our website.</p>
              <Button asChild className="w-full bg-brand-gold text-brand-blue font-bold hover:bg-white text-lg py-6">
                <a href={bookingLink} target="_blank" rel="noopener noreferrer">
                  {t("nav.book")}
                </a>
              </Button>
            </div>

            <div className="bg-white p-8 border border-gray-100">
               <h3 className="text-xl font-serif mb-4 text-brand-blue">{t("hotel.location")}</h3>
               <div className="flex items-start gap-3 text-gray-600 mb-4">
                 <MapPin className="w-5 h-5 mt-1 shrink-0 text-brand-gold" />
                 {hotel.location}
               </div>
               <div className="aspect-video bg-gray-200 w-full relative group cursor-pointer overflow-hidden">
                 <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                    <span className="text-xs bg-white px-2 py-1 shadow-sm">View on Map</span>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
