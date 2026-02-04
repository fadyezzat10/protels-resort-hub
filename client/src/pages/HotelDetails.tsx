import { useLocation, Link, useRoute } from "wouter";
import { hotels, bookingLink } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Utensils, Waves, Sun, Phone, Mail, Clock, Wifi } from "lucide-react";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function HotelDetails() {
  const [location, setLocation] = useLocation();
  const { t, language } = useI18n();

  // Match the dynamic route to get parameters
  const [match, params] = useRoute("/:hotelId/:section?");
  
  // Extract hotelId and section from the route parameters
  // If not matching the dynamic route (should be impossible given App.tsx), fallback to simple logic
  const hotelId = params?.hotelId || location.split('/')[1];
  const activeSection = params?.section || "overview";
  
  const hotel = hotels.find(h => h.id === hotelId);

  if (!hotel) return <NotFound />;

  // Tabs Configuration
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "accommodation", label: "Accommodation" },
    { id: "dining", label: "Dining" },
    { id: "facilities", label: "Facilities" },
    { id: "gallery", label: "Gallery" },
    { id: "contact", label: "Contact" },
  ];

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

      {/* Sticky Tabs Navigation */}
      <div className="sticky top-[72px] md:top-[88px] z-40 bg-white border-b border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
        <div className="container-padding">
          <div className="flex items-center gap-8 min-w-max">
            {tabs.map((tab) => (
              <Link key={tab.id} href={tab.id === "overview" ? `/${hotelId}` : `/${hotelId}/${tab.id}`}>
                <a
                  className={cn(
                    "py-4 text-sm uppercase tracking-widest font-medium border-b-2 transition-colors",
                    activeSection === tab.id || (tab.id === "overview" && !params?.section)
                      ? "border-brand-gold text-brand-blue" 
                      : "border-transparent text-gray-400 hover:text-brand-blue"
                  )}
                >
                  {tab.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container-padding py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-20 min-h-[500px]">
            
            {/* Overview */}
            {(activeSection === "overview" || !params?.section) && (
              <section className="animate-in fade-in duration-500">
                <h2 className="text-3xl font-serif text-brand-blue mb-6">Overview</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {hotel.description[language]}
                </p>
              </section>
            )}

            {/* Accommodation */}
            {activeSection === "accommodation" && (
              <section className="animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-serif text-brand-blue">Accommodation</h2>
                  <span className="text-sm text-gray-500 uppercase tracking-wider">{hotel.rooms.length} Room Types</span>
                </div>
                <div className="space-y-6">
                  {hotel.rooms.map((room, idx) => (
                    <div key={room} className="group bg-white border border-gray-100 p-6 hover:border-brand-gold transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-brand-blue mb-2">{room}</h3>
                        <p className="text-sm text-gray-500">Luxury amenities • Garden or Sea View • King Size Bed</p>
                      </div>
                      <Button asChild variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white rounded-none whitespace-nowrap">
                        <a href={bookingLink} target="_blank">Check Rates</a>
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Dining */}
            {activeSection === "dining" && (
              <section className="animate-in fade-in duration-500">
                <h2 className="text-3xl font-serif text-brand-blue mb-8">Dining & Drinks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-gray-50 p-6">
                      <Utensils className="w-8 h-8 text-brand-gold mb-4" />
                      <h3 className="font-serif text-xl font-bold text-brand-blue mb-2">Main Restaurant</h3>
                      <p className="text-gray-600 text-sm mb-4">International buffet serving breakfast, lunch, and dinner with live cooking stations.</p>
                      <div className="text-xs font-bold text-brand-blue uppercase tracking-wider">07:00 - 22:00</div>
                   </div>
                   <div className="bg-gray-50 p-6">
                      <Utensils className="w-8 h-8 text-brand-gold mb-4" />
                      <h3 className="font-serif text-xl font-bold text-brand-blue mb-2">Beach Bar</h3>
                      <p className="text-gray-600 text-sm mb-4">Refreshing cocktails and light snacks served right on the sandy beach.</p>
                      <div className="text-xs font-bold text-brand-blue uppercase tracking-wider">10:00 - Sunset</div>
                   </div>
                </div>
              </section>
            )}

            {/* Facilities */}
            {activeSection === "facilities" && (
              <section className="animate-in fade-in duration-500">
                <h2 className="text-3xl font-serif text-brand-blue mb-8">Resort Facilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotel.features.map(feature => (
                    <div key={feature} className="flex items-center gap-4 p-4 bg-white border border-gray-100">
                      {getFeatureIcon(feature)}
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-4 p-4 bg-white border border-gray-100">
                    <Wifi className="w-5 h-5 text-brand-gold" />
                    <span className="text-gray-700 font-medium">Free High-Speed Wi-Fi</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white border border-gray-100">
                    <Clock className="w-5 h-5 text-brand-gold" />
                    <span className="text-gray-700 font-medium">24/7 Front Desk</span>
                  </div>
                </div>
              </section>
            )}

            {/* Gallery Preview */}
            {activeSection === "gallery" && (
              <section className="animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-3xl font-serif text-brand-blue">Gallery</h2>
                   <Button asChild variant="link" className="text-brand-gold">
                     <a href="/gallery">View All Photos &rarr;</a>
                   </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 h-96">
                  <div className="h-full">
                    <img src={hotel.image} className="w-full h-full object-cover" alt="Gallery 1" />
                  </div>
                  <div className="grid grid-rows-2 gap-4 h-full">
                     <div className="bg-gray-200">
                       <img src={hotel.image} className="w-full h-full object-cover opacity-80" alt="Gallery 2" />
                     </div>
                     <div className="bg-gray-200">
                       <img src={hotel.image} className="w-full h-full object-cover opacity-80" alt="Gallery 3" />
                     </div>
                  </div>
                </div>
              </section>
            )}

            {/* Contact */}
            {activeSection === "contact" && (
              <section className="mb-20 animate-in fade-in duration-500">
                <h2 className="text-3xl font-serif text-brand-blue mb-8">Location & Contact</h2>
                <div className="bg-white border border-gray-100 p-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                     <div className="space-y-4">
                       <div className="flex items-start gap-3">
                         <MapPin className="w-5 h-5 text-brand-gold mt-1" />
                         <div>
                           <span className="block font-bold text-brand-blue mb-1">Address</span>
                           <span className="text-gray-600">{hotel.location}</span>
                         </div>
                       </div>
                       <div className="flex items-start gap-3">
                         <Phone className="w-5 h-5 text-brand-gold mt-1" />
                         <div>
                           <span className="block font-bold text-brand-blue mb-1">Phone</span>
                           <span className="text-gray-600">+20 123 456 7890</span>
                         </div>
                       </div>
                       <div className="flex items-start gap-3">
                         <Mail className="w-5 h-5 text-brand-gold mt-1" />
                         <div>
                           <span className="block font-bold text-brand-blue mb-1">Email</span>
                           <span className="text-gray-600">reservations@protels.com</span>
                         </div>
                       </div>
                     </div>
                     <div className="bg-gray-100 h-full min-h-[200px] flex items-center justify-center">
                       <span className="text-gray-400 text-sm">Map Integration</span>
                     </div>
                   </div>
                </div>
              </section>
            )}

          </div>

          {/* Sticky Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-[160px] space-y-8">
              <div className="bg-brand-blue text-white p-8 shadow-xl">
                <h3 className="text-2xl font-serif mb-2 text-brand-gold">Book Your Stay</h3>
                <p className="text-white/70 mb-6 text-sm">Best rates guaranteed. No booking fees.</p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                    <span className="text-white/60">Check-in</span>
                    <span>14:00</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                    <span className="text-white/60">Check-out</span>
                    <span>12:00</span>
                  </div>
                </div>

                <Button asChild className="w-full bg-brand-gold text-brand-blue font-bold hover:bg-white text-lg py-6 shadow-md transition-all hover:scale-105">
                  <a href={bookingLink} target="_blank" rel="noopener noreferrer">
                    {t("nav.book")}
                  </a>
                </Button>
                
                <p className="text-center text-xs text-white/40 mt-4">Secure payment via our official booking engine</p>
              </div>

              <div className="bg-white p-6 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-brand-blue mb-4">Need Assistance?</h4>
                <p className="text-gray-600 text-sm mb-4">Our concierge team is available 24/7 to help plan your perfect stay.</p>
                <Button variant="outline" className="w-full text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white">
                  Contact Concierge
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
