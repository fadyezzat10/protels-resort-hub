import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/images/hotel-beach-club.jpg";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const { t } = useI18n();

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          <div>
            <h2 className="text-3xl font-serif text-brand-blue mb-8">{t("contact.title")}</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-blue mb-1">{t("contact.address")}</h3>
                  <p className="text-gray-600">Head Office: Cairo, Egypt<br/>Resorts in Marsa Alam, Hurghada, Zanzibar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-blue mb-1">{t("contact.phone")}</h3>
                  <p className="text-gray-600">+20 123 456 7890<br/>+20 100 000 0000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-blue mb-1">{t("contact.email")}</h3>
                  <p className="text-gray-600">reservations@protels.com<br/>info@protels.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 border border-gray-100">
             {/* Simple Google Maps Placeholder */}
             <div className="w-full h-full min-h-[400px] bg-gray-200 flex items-center justify-center">
               <span className="text-gray-500 font-medium">Google Map Embed</span>
             </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
