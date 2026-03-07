import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import EditableText from "@/components/EditableText";
import SEOHead, { getBreadcrumbJsonLd } from "@/components/SEOHead";
import { useI18n } from "@/lib/i18n";
import { usePageHeroImage } from "@/lib/cms";
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
    mapEmbedUrl: "https://maps.google.com/maps?q=25.235576,34.795265&z=15&output=embed",
    mapShareUrl: "https://www.google.com/maps?q=25.235576,34.795265"
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
    mapEmbedUrl: "https://maps.google.com/maps?q=25.23666,34.79464&z=15&output=embed",
    mapShareUrl: "https://www.google.com/maps?q=25.23666,34.79464"
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
    mapEmbedUrl: "https://maps.google.com/maps?q=27.1556,33.8236&z=15&output=embed",
    mapShareUrl: "https://www.google.com/maps?q=27.1556,33.8236"
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
    mapEmbedUrl: "https://maps.google.com/maps?q=-6.22587,39.532805&z=15&output=embed",
    mapShareUrl: "https://www.google.com/maps?q=-6.22587,39.532805"
  }
];

export default function Contact() {
  const { t, language } = useI18n();
  const heroImg = usePageHeroImage("contact", "");

  return (
    <div className="min-h-screen bg-brand-white">
      <SEOHead
        title="Contact Us | Protels Hotels & Resorts – Get in Touch"
        description="Contact Protels Hotels & Resorts for reservations, inquiries, and support. Find phone numbers, email addresses, and locations for all our resorts in Marsa Alam, Hurghada, and Zanzibar."
        keywords="Protels contact, Marsa Alam hotel phone, Red Sea resort reservations, Zanzibar hotel contact"
        ogTitle="Contact Protels Hotels & Resorts"
        ogDescription="Get in touch with Protels Hotels & Resorts for bookings and inquiries."
        jsonLd={getBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <Navbar />
      <Hero 
        image={heroImg}
        title={t("nav.contact")}
        subtitle="We're Here For You"
        height="half"
        showButton={false}
        editPrefix="contact.hero"
      />
      
      <div className="container-padding py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <EditableText
            contentKey="contact.title"
            defaultValue={t("contact.title")}
            as="h2"
            className="text-3xl md:text-4xl font-serif text-brand-blue mb-4"
          />
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
