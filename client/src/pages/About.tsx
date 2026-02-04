import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/images/hotel-royal-bay.jpg";

export default function About() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />
      <Hero 
        image={heroImg}
        title={t("nav.about")}
        subtitle="Our Story"
        height="half"
        showButton={false}
      />
      
      <div className="container-padding py-20">
        <div className="max-w-4xl mx-auto text-center">
           <h2 className="text-4xl font-serif text-brand-blue mb-8">{t("about.title")}</h2>
           <p className="text-xl text-gray-600 leading-relaxed mb-12">
             {t("about.desc")}
           </p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
             <div className="bg-white p-8 shadow-sm border-t-4 border-brand-gold">
               <h3 className="font-serif text-xl font-bold text-brand-blue mb-4">Luxury Defined</h3>
               <p className="text-gray-600 text-sm leading-relaxed">We redefine luxury with bespoke services, elegant architecture, and attention to every detail.</p>
             </div>
             <div className="bg-white p-8 shadow-sm border-t-4 border-brand-gold">
               <h3 className="font-serif text-xl font-bold text-brand-blue mb-4">Authentic Locations</h3>
               <p className="text-gray-600 text-sm leading-relaxed">Our resorts are located in the most pristine coastal areas, offering direct access to nature's wonders.</p>
             </div>
             <div className="bg-white p-8 shadow-sm border-t-4 border-brand-gold">
               <h3 className="font-serif text-xl font-bold text-brand-blue mb-4">Unforgettable Memories</h3>
               <p className="text-gray-600 text-sm leading-relaxed">From romantic getaways to family adventures, we curate experiences that last a lifetime.</p>
             </div>
           </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
