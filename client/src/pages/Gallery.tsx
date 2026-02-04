import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { hotels } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/images/hotel-la-plage.jpg";

export default function Gallery() {
  const { t } = useI18n();
  
  // Combine all images
  const allImages = hotels.map(h => ({ src: h.image, title: h.name }));

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />
      <Hero 
        image={heroImg}
        title={t("nav.gallery")}
        subtitle="Visual Journey"
        height="half"
        showButton={false}
      />
      
      <div className="container-padding py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {allImages.map((img, i) => (
             <div key={i} className="aspect-square relative group overflow-hidden cursor-pointer">
               <img 
                 src={img.src} 
                 alt={img.title}
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <p className="text-white font-serif text-xl text-center px-4">{img.title}</p>
               </div>
             </div>
           ))}
           {/* Duplicate some for the gallery feel since we only have 4 main images */}
           {allImages.map((img, i) => (
             <div key={`dup-${i}`} className="aspect-square relative group overflow-hidden cursor-pointer">
               <img 
                 src={img.src} 
                 alt={img.title}
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <p className="text-white font-serif text-xl text-center px-4">{img.title}</p>
               </div>
             </div>
           ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
