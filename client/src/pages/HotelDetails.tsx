import { useLocation, Link, useRoute } from "wouter";
import { hotels, bookingLink, RoomDetail } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Utensils, Waves, Sun, Phone, Mail, Clock, Wifi, Coffee, Wine, Maximize2, Bed, Mountain, Dumbbell, Sparkles, Umbrella } from "lucide-react";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { cn } from "@/lib/utils";
import HotelGallery from "@/components/HotelGallery";
import RoomModal from "@/components/RoomModal";

import tribalPattern from "@/assets/images/tribal-pattern.png";

export default function HotelDetails() {
  const [location, setLocation] = useLocation();
  const { t, language } = useI18n();

  // Match the dynamic route to get parameters
  const [match, params] = useRoute("/:hotelId/:section?");
  
  // Extract hotelId and section from the route parameters
  const hotelId = params?.hotelId || location.split('/')[1];
  const activeSection = params?.section || "overview";
  
  const hotel = hotels.find(h => h.id === hotelId);
  const [selectedRoom, setSelectedRoom] = useState<RoomDetail | null>(null);

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
    if (feature.includes("Beach") || feature.includes("Snorkeling")) return <Waves className="w-5 h-5 text-brand-gold" />;
    if (feature.includes("Pool")) return <Waves className="w-5 h-5 text-brand-gold" />;
    if (feature.includes("Dining") || feature.includes("Restaurant")) return <Utensils className="w-5 h-5 text-brand-gold" />;
    if (feature.includes("Spa") || feature.includes("Wellness")) return <Sun className="w-5 h-5 text-brand-gold" />;
    if (feature.includes("Wi-Fi")) return <Wifi className="w-5 h-5 text-brand-gold" />;
    if (feature.includes("Desk")) return <Clock className="w-5 h-5 text-brand-gold" />;
    return <Sun className="w-5 h-5 text-brand-gold" />;
  };

  const isLaPlage = hotel.id === "la-plage";

  return (
    <div className={cn("min-h-screen bg-brand-white transition-colors duration-500", isLaPlage && "bg-[#F9F6F0]")}>
      {isLaPlage && (
        <style>{`
          .la-plage-theme {
            --color-brand-blue: hsl(180 60% 25%); /* Deep Teal */
            --color-brand-blue-light: hsl(175 50% 35%);
            --color-brand-gold: hsl(25 70% 50%); /* Burnt Orange/Terracotta */
            --color-brand-gold-light: hsl(30 60% 85%);
            --color-brand-white: hsl(40 33% 96%); /* Warm Beige */
            --color-background: hsl(40 33% 96%);
            
            /* Font overrides if needed, but keeping hierarchy */
          }
          
          .la-plage-theme .font-serif {
            /* Maybe a slightly more organic serif if possible, but keeping standard for now */
          }
        `}</style>
      )}

      {/* Tribal Pattern Overlay for La Plage */}
      {isLaPlage && (
        <div 
          className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-multiply"
          style={{ backgroundImage: `url(${tribalPattern})`, backgroundSize: '400px' }}
        />
      )}

      <div className={cn("relative z-10", isLaPlage && "la-plage-theme")}>
      <Navbar />
      
      <Hero 
        image={hotel.image}
        title={hotel.name}
        subtitle={hotel.location}
        height="large"
      />

      <div className={cn("h-12 bg-white", isLaPlage && "bg-[#F9F6F0]")} />

      {/* Sticky Tabs Navigation */}
      <div className={cn(
        "sticky top-[72px] md:top-[88px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100/50 shadow-sm transition-all duration-300",
        isLaPlage && "bg-[#F9F6F0]/95 border-[#8B5A2B]/10"
      )}>
        <div className="container-padding">
          <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap py-2 thin-scrollbar">
            {tabs.map((tab) => (
              <Link key={tab.id} href={tab.id === "overview" ? `/${hotelId}` : `/${hotelId}/${tab.id}`}>
                <a
                  className={cn(
                    "py-2 px-3 text-[13px] font-medium tracking-[0.5px] transition-all border-b-2 text-center shrink-0",
                    activeSection === tab.id || (tab.id === "overview" && !params?.section)
                      ? "border-[#C8A97E] text-[#222222]" 
                      : "border-transparent text-[#777777] hover:text-[#222222]",
                    isLaPlage && (activeSection === tab.id || (tab.id === "overview" && !params?.section)
                      ? "border-[var(--color-brand-gold)] text-[var(--color-brand-blue)]" 
                      : "text-[#8B5A2B]/70 hover:text-[var(--color-brand-blue)]")
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
              <section className="animate-in fade-in duration-500 py-6">
                <h2 className={cn("text-3xl font-serif text-brand-blue mb-8", isLaPlage && "text-[var(--color-brand-blue)]")}>Overview</h2>
                <p className={cn("text-gray-600 leading-loose text-lg", isLaPlage && "text-[#5D4E40]")}>
                  {hotel.description[language]}
                </p>
                
                {/* Review Links */}
                {hotel.id === "crystal-beach" && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="text-xl font-serif text-brand-blue mb-6">Share Your Experience</h3>
                    <div className="flex flex-wrap gap-4">
                      {/* Google Review */}
                      <Button 
                        asChild 
                        variant="outline" 
                        className="border-brand-gold text-brand-blue hover:bg-brand-gold hover:text-white transition-all duration-300 rounded-lg px-6 py-6 h-auto shadow-sm group"
                      >
                        <a href="https://www.google.com/travel/hotels/entity/CgoI4MiL4MqIv7s9EAE/reviews" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" className="group-hover:fill-white"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" className="group-hover:fill-white"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" className="group-hover:fill-white"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" className="group-hover:fill-white"/>
                          </svg>
                          <div className="text-left">
                            <span className="block text-xs text-gray-400 group-hover:text-white/80 font-medium">Google Reviews</span>
                            <span className="font-bold">Write a Review</span>
                          </div>
                        </a>
                      </Button>

                      {/* TripAdvisor Review */}
                      <Button 
                        asChild 
                        variant="outline" 
                        className="border-brand-gold text-brand-blue hover:bg-brand-gold hover:text-white transition-all duration-300 rounded-lg px-6 py-6 h-auto shadow-sm group"
                      >
                        <a href="https://www.tripadvisor.com/Hotel_Review-g311425-d25806577-Reviews-Protels_Crystal_Beach_Resort-Marsa_Alam_Red_Sea_and_Sinai.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" className="text-[#00AF87] group-hover:text-white"/>
                            <circle cx="8.5" cy="12" r="2.5" className="text-[#00AF87] group-hover:text-white"/>
                            <circle cx="15.5" cy="12" r="2.5" className="text-[#00AF87] group-hover:text-white"/>
                            <path d="M12 14.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                          </svg>
                          <div className="text-left">
                            <span className="block text-xs text-gray-400 group-hover:text-white/80 font-medium">TripAdvisor</span>
                            <span className="font-bold">Write a Review</span>
                          </div>
                        </a>
                      </Button>

                      {/* HolidayCheck Review */}
                      <Button 
                        asChild 
                        variant="outline" 
                        className="border-brand-gold text-brand-blue hover:bg-brand-gold hover:text-white transition-all duration-300 rounded-lg px-6 py-6 h-auto shadow-sm group"
                      >
                        <a href="https://www.holidaycheck.de/hi/protels-crystal-beach-resort/2ec35bc0-c841-31df-a623-7a581476340f" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-[#005CA9] group-hover:bg-white rounded flex items-center justify-center text-white group-hover:text-[#005CA9] font-bold text-xs">
                            HC
                          </div>
                          <div className="text-left">
                            <span className="block text-xs text-gray-400 group-hover:text-white/80 font-medium">HolidayCheck</span>
                            <span className="font-bold">Write a Review</span>
                          </div>
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Review Links for Beach Club */}
                {hotel.id === "beach-club" && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="text-xl font-serif text-brand-blue mb-6">Share Your Experience</h3>
                    <div className="flex flex-wrap gap-4">
                      {/* Google Review */}
                      <Button 
                        asChild 
                        variant="outline" 
                        className="border-brand-gold text-brand-blue hover:bg-brand-gold hover:text-white transition-all duration-300 rounded-lg px-6 py-6 h-auto shadow-sm group"
                      >
                        <a href="https://maps.app.goo.gl/EXBcPe3twgkpnF9KA" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" className="group-hover:fill-white"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" className="group-hover:fill-white"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" className="group-hover:fill-white"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" className="group-hover:fill-white"/>
                          </svg>
                          <div className="text-left">
                            <span className="block text-xs text-gray-400 group-hover:text-white/80 font-medium">Google Reviews</span>
                            <span className="font-bold">Write a Review</span>
                          </div>
                        </a>
                      </Button>

                      {/* TripAdvisor Review */}
                      <Button 
                        asChild 
                        variant="outline" 
                        className="border-brand-gold text-brand-blue hover:bg-brand-gold hover:text-white transition-all duration-300 rounded-lg px-6 py-6 h-auto shadow-sm group"
                      >
                        <a href="https://www.tripadvisor.com/Hotel_Review-g311425-d33402481-Reviews-Protels_Beach_Club_Spa-Marsa_Alam_Red_Sea_and_Sinai.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" className="text-[#00AF87] group-hover:text-white"/>
                            <circle cx="8.5" cy="12" r="2.5" className="text-[#00AF87] group-hover:text-white"/>
                            <circle cx="15.5" cy="12" r="2.5" className="text-[#00AF87] group-hover:text-white"/>
                            <path d="M12 14.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                          </svg>
                          <div className="text-left">
                            <span className="block text-xs text-gray-400 group-hover:text-white/80 font-medium">TripAdvisor</span>
                            <span className="font-bold">Write a Review</span>
                          </div>
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Review Links for La Plage */}
                {hotel.id === "la-plage" && (
                  <div className="mt-8 pt-8 border-t border-[#8B5A2B]/10">
                    <h3 className="text-xl font-serif text-[var(--color-brand-blue)] mb-6">Share Your Experience</h3>
                    <div className="flex flex-wrap gap-4">
                      {/* Google Review */}
                      <Button 
                        asChild 
                        variant="outline" 
                        className="border-[var(--color-brand-gold)] text-[var(--color-brand-blue)] hover:bg-[var(--color-brand-gold)] hover:text-white transition-all duration-300 rounded-lg px-6 py-6 h-auto shadow-sm hover:shadow-md group bg-white/50 backdrop-blur-sm"
                      >
                        <a href="https://g.page/r/CQ2_btA0HUnEEBM/review" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" className="group-hover:fill-white"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" className="group-hover:fill-white"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" className="group-hover:fill-white"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" className="group-hover:fill-white"/>
                          </svg>
                          <div className="text-left">
                            <span className="block text-xs text-gray-500 group-hover:text-white/90 font-medium">Google Reviews</span>
                            <span className="font-bold">Write a Review</span>
                          </div>
                        </a>
                      </Button>

                      {/* TripAdvisor Review */}
                      <Button 
                        asChild 
                        variant="outline" 
                        className="border-[var(--color-brand-gold)] text-[var(--color-brand-blue)] hover:bg-[var(--color-brand-gold)] hover:text-white transition-all duration-300 rounded-lg px-6 py-6 h-auto shadow-sm hover:shadow-md group bg-white/50 backdrop-blur-sm"
                      >
                        <a href="https://www.tripadvisor.com/Hotel_Review-g482884-d34015525-Reviews-Protels_La_Plage-Zanzibar_Island_Zanzibar_Archipelago.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" className="text-[#00AF87] group-hover:text-white"/>
                            <circle cx="8.5" cy="12" r="2.5" className="text-[#00AF87] group-hover:text-white"/>
                            <circle cx="15.5" cy="12" r="2.5" className="text-[#00AF87] group-hover:text-white"/>
                            <path d="M12 14.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                          </svg>
                          <div className="text-left">
                            <span className="block text-xs text-gray-500 group-hover:text-white/90 font-medium">TripAdvisor</span>
                            <span className="font-bold">Write a Review</span>
                          </div>
                        </a>
                      </Button>

                      {/* HolidayCheck Review */}
                      <Button 
                        asChild 
                        variant="outline" 
                        className="border-[var(--color-brand-gold)] text-[var(--color-brand-blue)] hover:bg-[var(--color-brand-gold)] hover:text-white transition-all duration-300 rounded-lg px-6 py-6 h-auto shadow-sm hover:shadow-md group bg-white/50 backdrop-blur-sm"
                      >
                        <a href="https://www.holidaycheck.de/hi/protels-la-plage/1dfdb0c7-0622-42f0-9fe6-c237fc1883a1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-[#005CA9] group-hover:bg-white rounded flex items-center justify-center text-white group-hover:text-[#005CA9] font-bold text-xs">
                            HC
                          </div>
                          <div className="text-left">
                            <span className="block text-xs text-gray-500 group-hover:text-white/90 font-medium">HolidayCheck</span>
                            <span className="font-bold">Write a Review</span>
                          </div>
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Accommodation */}
            {activeSection === "accommodation" && (
              <section className="animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-serif text-brand-blue">Accommodation</h2>
                  <span className="text-sm text-gray-500 uppercase tracking-wider">{hotel.roomDetails?.length || hotel.rooms.length} Room Types</span>
                </div>
                
                {hotel.id === "crystal-beach" || hotel.id === "beach-club" || hotel.id === "la-plage" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hotel.roomDetails?.map((room, idx) => (
                      <div key={idx} className="group bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={room.images?.[0] || hotel.image} 
                            alt={room.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="font-serif text-xl font-bold text-brand-blue">{room.name}</h3>
                          </div>
                          <p className="text-xs text-gray-400 mb-4 line-clamp-2">{room.description || "Luxury room with premium amenities."}</p>
                          
                          <div className="grid grid-cols-2 gap-2 mb-6 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Maximize2 className="w-3.5 h-3.5 text-brand-gold" /> {room.size || "Unknown"}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Bed className="w-3.5 h-3.5 text-brand-gold" /> {room.bed || "Standard"}
                            </div>
                            <div className="flex items-center gap-1.5 col-span-2">
                              <Mountain className="w-3.5 h-3.5 text-brand-gold" /> {room.view || "Various Views"}
                            </div>
                          </div>
                          
                          <div className="mt-auto">
                            <Button 
                              className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold tracking-wide"
                              onClick={() => setSelectedRoom(room)}
                            >
                              View Room
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Render standard layout for other rooms if needed or just empty if all covered by roomDetails */}
                  </div>
                ) : (
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
                )}
              </section>
            )}

            {/* Dining */}
            {activeSection === "dining" && (
              <section className="animate-in fade-in duration-500">
                <h2 className={cn("text-3xl font-serif text-brand-blue mb-8", isLaPlage && "text-[var(--color-brand-blue)]")}>Dining & Drinks</h2>
                
                {/* El Dokka Restaurant Section - Hidden for La Plage */}
                {!isLaPlage && (
                <>
                <div className="mb-16 bg-white border border-gray-100 shadow-sm overflow-hidden rounded-lg">
                  {/* Hero Image */}
                  <div className="h-[400px] relative">
                    <img 
                      src="/images/el-dokka/hero.jpg" 
                      alt="El Dokka Restaurant" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                       <h3 className="text-4xl font-serif text-white mb-2">El Dokka Restaurant</h3>
                       <p className="text-white/90 text-lg font-light">Authentic Oriental Cuisine</p>
                    </div>
                  </div>

                  <div className="p-8 md:p-12">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                      <div className="flex justify-center mb-6">
                        <Utensils className="w-10 h-10 text-[#C8A97E]" />
                      </div>
                      <h4 className="text-2xl font-serif text-[#1a2332] mb-6">Experience the Authentic Taste</h4>
                      <p className="text-gray-600 leading-relaxed text-lg mb-8">
                        Experience the authentic taste of traditional oriental cuisine at El Dokka Restaurant.
                        A warm and cozy dining atmosphere inspired by local culture, handcrafted décor, and rich flavors.
                        Enjoy a selection of grilled specialties, traditional dishes, and freshly prepared meals that bring the true taste of the region to your table.
                      </p>
                      <Button className="bg-[#C8A97E] hover:bg-[#b0936a] text-white px-8 py-6 rounded-full text-lg font-medium transition-all hover:scale-105">
                        View Menu
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="aspect-[4/3] overflow-hidden rounded-lg group cursor-pointer">
                          <img 
                            src={`/images/el-dokka/gallery-${num}.jpg`}
                            alt={`El Dokka Detail ${num}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Italian Restaurant Section */}
                <div className="mb-16 bg-[#FDFCF8] border border-gray-100 shadow-sm overflow-hidden rounded-lg">
                  <div className="flex flex-col lg:flex-row">
                    {/* Hero Image - Left Side on Desktop */}
                    <div className="lg:w-7/12 relative h-[400px] lg:h-auto overflow-hidden group">
                      <img 
                        src="/images/italian-restaurant/hero.jpg" 
                        alt="Italian Restaurant" 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent lg:hidden" />
                      <div className="absolute bottom-6 left-6 lg:hidden text-white">
                         <span className="bg-brand-gold text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">Italian Cuisine</span>
                         <h3 className="text-3xl font-serif">Italian Restaurant</h3>
                      </div>
                    </div>

                    {/* Content - Right Side on Desktop */}
                    <div className="lg:w-5/12 p-8 lg:p-12 flex flex-col justify-center relative">
                      <div className="hidden lg:block mb-6">
                         <span className="bg-brand-gold/10 text-brand-gold text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">Italian Cuisine</span>
                         <h3 className="text-4xl font-serif text-brand-blue mb-2">Italian Restaurant</h3>
                         <div className="w-12 h-0.5 bg-brand-gold mt-4"></div>
                      </div>
                      
                      <p className="text-gray-600 leading-relaxed text-lg mb-8 font-light">
                        Experience authentic Italian flavors in a romantic seaside setting.
                        Enjoy handcrafted pasta, gourmet dishes, and a warm elegant atmosphere perfect for unforgettable evenings.
                      </p>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                           <Clock className="w-4 h-4 text-brand-gold" />
                           <span>Dinner: 18:30 - 22:30</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                           <Wine className="w-4 h-4 text-brand-gold" />
                           <span>Extensive Wine Selection</span>
                        </div>
                      </div>

                      <Button className="w-fit bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-6 rounded-full text-lg font-medium transition-all hover:translate-x-1 shadow-md hover:shadow-lg">
                        View Menu
                      </Button>
                    </div>
                  </div>

                  {/* Gallery Slider (Scroll Snap) */}
                  <div className="p-8 border-t border-gray-100/50">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Gallery Highlights</h4>
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory thin-scrollbar">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <div key={num} className="snap-center shrink-0 w-[280px] md:w-[320px] aspect-[4/3] rounded-lg overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all">
                          <img 
                            src={`/images/italian-restaurant/gallery-${num}.jpg`}
                            alt={`Italian Dish ${num}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mongolian Restaurant Section */}
                <div className="mb-16 bg-[#FFFBF7] border border-gray-100 shadow-sm overflow-hidden rounded-lg">
                  <div className="flex flex-col lg:flex-row">
                    {/* Hero Image - Left Side on Desktop */}
                    <div className="lg:w-7/12 relative h-[400px] lg:h-auto overflow-hidden group">
                      <img 
                        src="/images/mongolian-restaurant/hero.jpg" 
                        alt="Mongolian Restaurant" 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent lg:hidden" />
                      <div className="absolute bottom-6 left-6 lg:hidden text-white">
                         <span className="bg-[#C8A97E] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">Live Cooking</span>
                         <h3 className="text-3xl font-serif">Mongolian Restaurant</h3>
                      </div>
                    </div>

                    {/* Content - Right Side on Desktop */}
                    <div className="lg:w-5/12 p-8 lg:p-12 flex flex-col justify-center relative">
                      <div className="hidden lg:block mb-6">
                         <span className="bg-[#C8A97E]/10 text-[#C8A97E] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">Live Cooking</span>
                         <h3 className="text-4xl font-serif text-[#1a2332] mb-2">Mongolian Restaurant</h3>
                         <div className="w-12 h-0.5 bg-[#C8A97E] mt-4"></div>
                      </div>
                      
                      <p className="text-gray-600 leading-relaxed text-lg mb-8 font-light">
                        Savor the vibrant tastes of Asia at our Mongolian Restaurant, where live cooking stations bring fresh ingredients to life. Enjoy a personalized dining experience with authentic flavors in a warm, inviting oriental atmosphere.
                      </p>

                      <Button className="w-fit bg-[#1a2332] hover:bg-[#2c3b55] text-white px-8 py-6 rounded-full text-lg font-medium transition-all hover:translate-x-1 shadow-md hover:shadow-lg">
                        Reserve Your Table
                      </Button>
                    </div>
                  </div>

                  {/* Gallery Slider (Scroll Snap) */}
                  <div className="p-8 border-t border-gray-100/50">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Atmosphere</h4>
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory thin-scrollbar">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="snap-center shrink-0 w-[280px] md:w-[320px] aspect-[4/3] rounded-lg overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all">
                          <img 
                            src={`/images/mongolian-restaurant/gallery-${num}.jpg`}
                            alt={`Mongolian Detail ${num}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                </>
                )}

                {hotel.dining ? (
                  <div className="space-y-8">
                    {/* Main Restaurant */}
                    {hotel.dining.main && (
                      <div className="bg-gray-50 p-8 border border-gray-100">
                        <div className="flex items-start gap-4">
                          <Utensils className="w-8 h-8 text-brand-gold shrink-0" />
                          <div>
                            <h3 className="font-serif text-2xl font-bold text-brand-blue mb-2">{hotel.dining.main.name}</h3>
                            <p className="text-gray-600 mb-4">{hotel.dining.main.desc}</p>
                            <div className="inline-block bg-white px-4 py-2 text-xs font-bold text-brand-blue uppercase tracking-wider border border-gray-200">
                              {hotel.dining.main.hours}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Specialty Restaurants */}
                      {hotel.dining.specialty?.map((rest, idx) => (
                        <div key={idx} className="bg-white p-6 border border-gray-100 hover:border-brand-gold transition-colors">
                          <Coffee className="w-6 h-6 text-brand-gold mb-3" />
                          <h3 className="font-serif text-lg font-bold text-brand-blue mb-2">{rest.name}</h3>
                          <p className="text-sm text-gray-600">{rest.desc}</p>
                        </div>
                      ))}
                      
                      {/* Bars */}
                      {hotel.dining.bars && (
                        <div className="bg-white p-6 border border-gray-100 hover:border-brand-gold transition-colors">
                          <Wine className="w-6 h-6 text-brand-gold mb-3" />
                          <h3 className="font-serif text-lg font-bold text-brand-blue mb-2">Bars</h3>
                          <ul className="space-y-2">
                            {hotel.dining.bars.map((bar, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                <div className="w-1 h-1 bg-brand-gold rounded-full" /> {bar}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Default Fallback Layout for other hotels
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
                )}
              </section>
            )}

            {/* Facilities */}
            {activeSection === "facilities" && (
              <section className="animate-in fade-in duration-500">
                <h2 className="text-3xl font-serif text-brand-blue mb-8">Resort Facilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotel.features.map(feature => (
                    <div key={feature} className="flex items-center gap-4 p-4 bg-white border border-gray-100 hover:shadow-sm transition-shadow">
                      {getFeatureIcon(feature)}
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Fitness Center Section */}
                <div className="mt-16 bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="p-2 bg-[#C8A97E]/10 rounded-full">
                                <Dumbbell className="w-6 h-6 text-[#C8A97E]" />
                             </div>
                             <h3 className="text-3xl font-serif text-[#1a2332]">Fitness Center</h3>
                          </div>
                          <p className="text-gray-600 leading-relaxed text-lg font-light mb-8 max-w-3xl">
                            Stay active during your stay with our fully equipped fitness center, featuring modern cardio machines, strength training equipment, and a bright, comfortable atmosphere suitable for all fitness levels.
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6">
                             {[
                               "Modern Cardio Machines", 
                               "Strength Training Area", 
                               "Air-Conditioned Space", 
                               "Natural Lighting",
                               "Open Daily"
                             ].map((item, i) => (
                               <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#C8A97E]" />
                                  {item}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Gallery Slider */}
                    <div className="pt-8 border-t border-gray-100">
                      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory thin-scrollbar">
                        {/* Hero Image first, then gallery images */}
                        {["hero", "gallery-1", "gallery-2", "gallery-3", "gallery-4", "gallery-5"].map((img, i) => (
                          <div key={i} className="snap-center shrink-0 w-[280px] md:w-[360px] aspect-[4/3] rounded-lg overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all">
                            <img 
                              src={`/images/fitness-center/${img}.jpg`}
                              alt={`Fitness Center ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spa & Wellness Center Section */}
                <div className="mt-16 bg-[#FDFCF8] border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="p-2 bg-[#C8A97E]/10 rounded-full">
                                <Sparkles className="w-6 h-6 text-[#C8A97E]" />
                             </div>
                             <h3 className="text-3xl font-serif text-[#1a2332]">Spa & Wellness Center</h3>
                          </div>
                          <p className="text-gray-600 leading-relaxed text-lg font-light mb-8 max-w-3xl">
                            Experience ultimate relaxation at our Spa & Wellness Center, designed to provide a peaceful escape during your stay. Enjoy professional massage rooms, soothing ambiance, and modern wellness facilities that help rejuvenate both body and mind.
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6">
                             {[
                               "Private Treatment Rooms", 
                               "Steam Rooms", 
                               "Indoor Pool", 
                               "Professional Massage", 
                               "Relaxation Area"
                             ].map((item, i) => (
                               <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#C8A97E]" />
                                  {item}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Gallery Slider */}
                    <div className="pt-8 border-t border-gray-100/50">
                      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory thin-scrollbar">
                        {/* Hero Image first, then gallery images */}
                        {["hero", "gallery-1", "gallery-2", "gallery-3"].map((img, i) => (
                          <div key={i} className="snap-center shrink-0 w-[280px] md:w-[360px] aspect-[4/3] rounded-lg overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all">
                            <img 
                              src={`/images/spa-wellness/${img}.jpg`}
                              alt={`Spa & Wellness ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Private Beach Facilities Section - Hidden for La Plage */}
                {!isLaPlage && (
                <div className="mt-16 bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="p-2 bg-[#C8A97E]/10 rounded-full">
                                <Umbrella className="w-6 h-6 text-[#C8A97E]" />
                             </div>
                             <h3 className="text-3xl font-serif text-[#1a2332]">Private Beach</h3>
                          </div>
                          <p className="text-gray-600 leading-relaxed text-lg font-light mb-8 max-w-3xl">
                            Relax on our exclusive private beach, featuring soft golden sand and crystal-clear turquoise waters. Unwind in our modern white cabanas or on comfortable sunbeds under the shade of palm trees, enjoying a peaceful atmosphere and premium beach service.
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6">
                             {[
                               "Private Cabanas", 
                               "Sunbeds & Umbrellas", 
                               "Long Wooden Pier", 
                               "Beach Bar Service", 
                               "Towel Service"
                             ].map((item, i) => (
                               <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#C8A97E]" />
                                  {item}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Gallery Slider */}
                    <div className="pt-8 border-t border-gray-100">
                      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory thin-scrollbar">
                        {/* Hero Image first, then gallery images */}
                        {(hotel.id === "beach-club" 
                          ? ["hero", "gallery-1", "gallery-2", "gallery-3", "gallery-4", "gallery-5", "gallery-6"] 
                          : ["hero", "gallery-1", "gallery-2", "gallery-3", "gallery-4", "gallery-5"]
                        ).map((img, i) => (
                          <div key={i} className="snap-center shrink-0 w-[280px] md:w-[360px] aspect-[4/3] rounded-lg overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all">
                            <img 
                              src={hotel.id === "beach-club" 
                                ? `/images/beach-club/facilities/beach/${img}.jpg` 
                                : `/images/private-beach/${img}.jpg`
                              }
                              alt={`Private Beach ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* Pools & Aquapark Section - Hidden for La Plage */}
                {!isLaPlage && (
                <div className="mt-16 bg-[#FDFCF8] border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="p-2 bg-[#C8A97E]/10 rounded-full">
                                <Waves className="w-6 h-6 text-[#C8A97E]" />
                             </div>
                             <h3 className="text-3xl font-serif text-[#1a2332]">Pools & Aquapark</h3>
                          </div>
                          <p className="text-gray-600 leading-relaxed text-lg font-light mb-8 max-w-3xl">
                            Dive into relaxation and fun with our multiple swimming pools and exciting aquapark. Whether you prefer lounging by the pool with a refreshing drink or enjoying thrilling water slides, our resort offers the perfect water experience for all ages.
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6">
                             {[
                               "Multiple Swimming Pools", 
                               "Kids Aquapark", 
                               "Water Slides", 
                               "Poolside Bars", 
                               "Heated Pools (Winter)"
                             ].map((item, i) => (
                               <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#C8A97E]" />
                                  {item}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Gallery Slider */}
                    <div className="pt-8 border-t border-gray-100/50">
                      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory thin-scrollbar">
                        {/* Hero Image first, then gallery images */}
                        {["hero", "gallery-1", "gallery-2", "gallery-3", "gallery-4", "gallery-5"].map((img, i) => (
                          <div key={i} className="snap-center shrink-0 w-[280px] md:w-[360px] aspect-[4/3] rounded-lg overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all">
                            <img 
                              src={`/images/pools-aquapark/${img}.jpg`}
                              alt={`Pools & Aquapark ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* La Plage Specific - Beach / Beachfront */}
                {isLaPlage && (
                <div className="mt-16 bg-[#F9F6F0] border border-[#8B5A2B]/10 shadow-sm rounded-lg overflow-hidden">
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="p-2 bg-[#8B5A2B]/10 rounded-full">
                                <Umbrella className="w-6 h-6 text-[#8B5A2B]" />
                             </div>
                             <h3 className="text-3xl font-serif text-[var(--color-brand-blue)]">Pristine Beachfront</h3>
                          </div>
                          <p className="text-[#5D4E40] leading-relaxed text-lg font-light mb-8 max-w-3xl">
                            Step onto the powder-soft white sands of our private Zanzibar beach. Framed by swaying coconut palms and the turquoise Indian Ocean, this is your sanctuary for pure island relaxation. Whether basking in the sun or taking a barefoot stroll at low tide, experience the authentic soul of the coast.
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6">
                             {[
                               "Private White Sand Beach", 
                               "Turquoise Lagoon", 
                               "Palm-Shaded Loungers", 
                               "Oceanfront Service", 
                               "Sunset Views"
                             ].map((item, i) => (
                               <div key={i} className="flex items-center gap-3 text-sm text-[#8B5A2B]">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#8B5A2B]" />
                                  {item}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Gallery Slider */}
                    <div className="pt-8 border-t border-[#8B5A2B]/10">
                      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory thin-scrollbar">
                        {[
                          "aerial-1.png", "aerial-2.png", "aerial-3.png", "aerial-4.png", 
                          "aerial-5.png", "aerial-6.png", "aerial-7.png", "aerial-8.png",
                          "pool-palm-1.png", "pool-palm-2.png"
                        ].map((img, i) => (
                          <div key={i} className="snap-center shrink-0 w-[280px] md:w-[360px] aspect-[4/3] rounded-lg overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all">
                            <img 
                              src={`/images/la-plage/facilities/${img}`}
                              alt={`La Plage Beach ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* La Plage Specific - Pools & Relaxation */}
                {isLaPlage && (
                <div className="mt-16 bg-[#F9F6F0] border border-[#8B5A2B]/10 shadow-sm rounded-lg overflow-hidden">
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="p-2 bg-[#8B5A2B]/10 rounded-full">
                                <Waves className="w-6 h-6 text-[#8B5A2B]" />
                             </div>
                             <h3 className="text-3xl font-serif text-[var(--color-brand-blue)]">Swimming Pools</h3>
                          </div>
                          <p className="text-[#5D4E40] leading-relaxed text-lg font-light mb-8 max-w-3xl">
                            Unwind in our stunning swimming pools, designed to blend seamlessly with the natural island landscape. Relax on comfortable sun loungers, enjoy refreshing dips, and let the gentle rhythm of Zanzibar wash over you in our peaceful aquatic sanctuary.
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6">
                             {[
                               "Expansive Main Pool", 
                               "Relaxation Zones", 
                               "Palm-Shaded Sunbeds", 
                               "Swim-up Bar", 
                               "Kid-Friendly Areas"
                             ].map((item, i) => (
                               <div key={i} className="flex items-center gap-3 text-sm text-[#8B5A2B]">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#8B5A2B]" />
                                  {item}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Gallery Slider */}
                    <div className="pt-8 border-t border-[#8B5A2B]/10">
                      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory thin-scrollbar">
                        {[
                          "pool-hero.png", "pool-1.jpg", "pool-2.jpg", "pool-3.jpg", 
                          "pool-4.jpg", "pool-5.jpg", "pool-6.jpg", "pool-7.png",
                          "pool-8.png", "pool-9.png", "pool-10.png", "pool-11.png", "pool-12.png"
                        ].map((img, i) => (
                          <div key={i} className="snap-center shrink-0 w-[280px] md:w-[360px] aspect-[4/3] rounded-lg overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all">
                            <img 
                              src={`/images/la-plage/facilities/pools/${img}`}
                              alt={`La Plage Pool ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </section>
            )}

            {/* Gallery Preview */}
            {activeSection === "gallery" && (
              <section className="animate-in fade-in duration-500 mb-20">
                <HotelGallery hotel={hotel} />
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
                           {hotel.mapLink && (
                             <a 
                               href={hotel.mapLink}
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="text-xs font-bold text-brand-gold uppercase tracking-wider hover:underline flex items-center gap-1 mt-2"
                             >
                               View on Google Maps
                             </a>
                           )}
                         </div>
                       </div>
                       <div className="flex items-start gap-3">
                         <Phone className="w-5 h-5 text-brand-gold mt-1" />
                         <div>
                           <span className="block font-bold text-brand-blue mb-1">Phone</span>
                           <span className="text-gray-600">+20 123 456 7890</span>
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
                     {hotel.id === "crystal-beach" ? (
                      <div className="h-full min-h-[300px] w-full bg-gray-100 overflow-hidden">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          style={{ border: 0, minHeight: '300px' }}
                          loading="lazy" 
                          allowFullScreen 
                          src="https://maps.google.com/maps?cid=4429004655439307872&output=embed"
                          title="Protels Crystal Beach Resort Location"
                        />
                      </div>
                    ) : hotel.id === "la-plage" ? (
                      <div className="h-full min-h-[300px] w-full bg-gray-100 overflow-hidden">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          style={{ border: 0, minHeight: '300px' }}
                          loading="lazy" 
                          allowFullScreen 
                          src="https://maps.google.com/maps?cid=14143868217406177037&output=embed"
                          title="Protels La Plage Location"
                        />
                      </div>
                    ) : hotel.id === "beach-club" ? (
                      <div className="h-full min-h-[300px] w-full bg-gray-100 overflow-hidden">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          style={{ border: 0, minHeight: '300px' }}
                          loading="lazy" 
                          allowFullScreen 
                          src="https://maps.google.com/maps?cid=2437922038492058707&output=embed"
                          title="Protels Beach Club & SPA Location"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-100 h-full min-h-[200px] flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Map Integration</span>
                      </div>
                    )}
                   </div>
                </div>
              </section>
            )}

          </div>

          {/* Sticky Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-[160px] space-y-8 w-[90%] ml-auto">
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

      {selectedRoom && (
        <RoomModal 
          room={selectedRoom} 
          isOpen={!!selectedRoom} 
          onClose={() => setSelectedRoom(null)} 
        />
      )}
      </div>
    </div>
  );
}
