import { useLocation, Link, useRoute } from "wouter";
import { hotels, bookingLink, RoomDetail } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Utensils, Waves, Sun, Phone, Mail, Clock, Wifi, Coffee, Wine, Maximize2, Bed, Mountain } from "lucide-react";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { cn } from "@/lib/utils";
import RoomModal from "@/components/RoomModal";

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

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />
      
      <Hero 
        image={hotel.image}
        title={hotel.name}
        subtitle={hotel.location}
        height="large"
      />

      <div className="h-12 bg-white" />

      {/* Sticky Tabs Navigation */}
      <div className="sticky top-[72px] md:top-[88px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100/50 shadow-sm transition-all duration-300">
        <div className="container-padding">
          <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap py-2 thin-scrollbar">
            {tabs.map((tab) => (
              <Link key={tab.id} href={tab.id === "overview" ? `/${hotelId}` : `/${hotelId}/${tab.id}`}>
                <a
                  className={cn(
                    "py-2 px-3 text-[13px] font-medium tracking-[0.5px] transition-all border-b-2 text-center shrink-0",
                    activeSection === tab.id || (tab.id === "overview" && !params?.section)
                      ? "border-[#C8A97E] text-[#222222]" 
                      : "border-transparent text-[#777777] hover:text-[#222222]"
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
                <h2 className="text-3xl font-serif text-brand-blue mb-8">Overview</h2>
                <p className="text-gray-600 leading-loose text-lg">
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
              </section>
            )}

            {/* Accommodation */}
            {activeSection === "accommodation" && (
              <section className="animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-serif text-brand-blue">Accommodation</h2>
                  <span className="text-sm text-gray-500 uppercase tracking-wider">{hotel.roomDetails?.length || hotel.rooms.length} Room Types</span>
                </div>
                
                {hotel.id === "crystal-beach" ? (
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
                <h2 className="text-3xl font-serif text-brand-blue mb-8">Dining & Drinks</h2>
                
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
              </section>
            )}

            {/* Gallery Preview */}
            {activeSection === "gallery" && (
              <section className="animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-3xl font-serif text-brand-blue">Gallery</h2>
                </div>
                
                {hotel.gallery ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotel.gallery.map((img, idx) => (
                      <div key={idx} className="aspect-square relative group overflow-hidden cursor-pointer">
                        <img 
                          src={img} 
                          alt={`Gallery image ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}
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
  );
}
