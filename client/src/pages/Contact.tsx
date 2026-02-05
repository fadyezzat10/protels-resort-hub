import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/images/hotel-beach-club.jpg";
import { Mail, Phone, MapPin, Smartphone, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Configuration object for hotel contact details
const hotelsContactInfo = [
  {
    id: "crystal-beach",
    name: "Protels Crystal Beach Resort",
    country: "Egypt",
    city: "Marsa Alam",
    address: "20 Km North of Marsa Alam Red Sea 84721, Egypt",
    emailSales: null,
    emailReservations: "info@protels.com",
    phone: "+20 65 338 0063",
    mobile: "+20 150 092 5579",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5000!2d34.795265!3d25.235576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x3d76fc44ac02e460!5e0!3m2!1sen!2sus",
    mapShareUrl: "https://www.google.com/maps?cid=4429004655439307872"
  },
  {
    id: "beach-club",
    name: "Protels Beach Club & SPA",
    country: "Egypt",
    city: "Marsa Alam",
    address: "20 Km North of Marsa Alam, Red Sea 84721, Egypt",
    emailSales: null,
    emailReservations: "info@protels.com",
    phone: "+20 65 338 0063",
    mobile: "+20 150 092 5579",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5000!2d34.79464!3d25.23666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x21d53d2d666a5453!5e0!3m2!1sen!2sus",
    mapShareUrl: "https://www.google.com/maps?cid=2437922038492058707"
  },
  {
    id: "royal-bay",
    name: "Protels Royal Bay Resort & Spa",
    country: "Egypt",
    city: "Hurghada",
    address: "Safaga Road, Hurghada",
    emailSales: "sales.royalbay@protels.com",
    emailReservations: "reservation.royalbay@protels.com",
    phone: "+20 65 346 0000",
    mobile: "+20 120 000 0003",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3621.6337225227745!2d33.8236!3d27.1556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1452870000000001%3A0x1234567890abcdef!2sProtels%20Royal%20Bay%20Resort!5e0!3m2!1sen!2seg!4v1709123456791!5m2!1sen!2seg",
    mapShareUrl: "https://www.google.com/maps/search/?api=1&query=Protels+Royal+Bay+Resort"
  },
  {
    id: "la-plage",
    name: "Protels La Plage",
    country: "Tanzania",
    city: "Zanzibar",
    address: "Kiwengwa Beach, Zanzibar Island",
    emailSales: "sales.laplage@protels.com",
    emailReservations: "reservation.laplage@protels.com",
    phone: "+255 24 123 4567",
    mobile: "+255 77 123 4567",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5000!2d39.532805!3d-6.22587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xc4491d34d06ebf0d!5e0!3m2!1sen!2sus",
    mapShareUrl: "https://www.google.com/maps?cid=14143868217406177037"
  }
];

export default function Contact() {
  const { t, language } = useI18n();

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />
      <Hero 
        image={heroImg}
        title={t("nav.contact")}
        subtitle="We're Here For You"
        height="half"
        showButton={false}
      />
      
      <div className="container-padding py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-brand-blue mb-4">{t("contact.title")}</h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto" />
        </div>

        <div className="grid grid-cols-1 gap-12">
          {hotelsContactInfo.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Contact Details */}
                <div className="p-8 lg:p-10 lg:col-span-2 bg-white">
                  <div className="flex flex-col h-full">
                    <div className="mb-8">
                      <span className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-2 block">
                        {hotel.city}, {hotel.country}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-serif text-brand-blue font-medium">
                        {hotel.name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 flex-grow">
                      {/* Address */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-gold shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">{t("contact.address")}</h4>
                          <p className="text-gray-600 leading-relaxed">{hotel.address}</p>
                        </div>
                      </div>

                      {/* Phone & Mobile */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-gold shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">{t("contact.phone")}</h4>
                          <div className="text-gray-600 space-y-1">
                            <a href={`tel:${hotel.phone}`} className="block hover:text-brand-blue transition-colors">
                              {hotel.phone}
                            </a>
                            {hotel.mobile && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 uppercase">{t("contact.mobile")}:</span>
                                <a href={`tel:${hotel.mobile}`} className="hover:text-brand-blue transition-colors">
                                  {hotel.mobile}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Emails */}
                      <div className="flex items-start gap-4 md:col-span-2">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-gold shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="w-full">
                          <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">{t("contact.email")}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            {hotel.emailReservations && (
                              <div className="bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center justify-between group hover:border-brand-gold/30 transition-colors">
                                <div>
                                  <span className="text-xs text-gray-500 block mb-0.5">{t("contact.reservations")}</span>
                                  <a href={`mailto:${hotel.emailReservations}`} className="text-brand-blue font-medium hover:underline text-sm break-all">
                                    {hotel.emailReservations}
                                  </a>
                                </div>
                              </div>
                            )}
                            {hotel.emailSales && (
                              <div className="bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center justify-between group hover:border-brand-gold/30 transition-colors">
                                <div>
                                  <span className="text-xs text-gray-500 block mb-0.5">{t("contact.sales")}</span>
                                  <a href={`mailto:${hotel.emailSales}`} className="text-brand-blue font-medium hover:underline text-sm break-all">
                                    {hotel.emailSales}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Section */}
                <div className="bg-gray-100 min-h-[300px] lg:min-h-full border-l border-gray-100 relative group">
                  <iframe 
                    src={hotel.mapEmbedUrl}
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, minHeight: "300px" }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute bottom-4 right-4">
                    <Button size="sm" variant="secondary" className="bg-white shadow-md hover:bg-brand-blue hover:text-white" asChild>
                      <a 
                        href={hotel.mapShareUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Open in Google Maps
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
