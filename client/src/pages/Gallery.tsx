import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { useMergedHotels, useCMSMedia, usePageHeroImage } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";
import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Gallery() {
  const { t } = useI18n();
  const { hotels } = useMergedHotels();
  const { data: cmsMedia } = useCMSMedia();
  const heroImg = usePageHeroImage("gallery", "");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  
  const hotelImages = hotels.map(h => ({ src: h.image, title: h.name }));

  const mediaImages = (cmsMedia || [])
    .filter((m: any) => m.mimeType?.startsWith("image/"))
    .map((m: any) => ({ src: m.url, title: m.alt || m.originalName }));

  const allImages = [...hotelImages, ...mediaImages];

  const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const goNext = useCallback(() => {
    setLightboxIdx(prev => prev !== null ? (prev + 1) % allImages.length : null);
  }, [allImages.length]);
  const goPrev = useCallback(() => {
    setLightboxIdx(prev => prev !== null ? (prev - 1 + allImages.length) % allImages.length : null);
  }, [allImages.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightboxIdx, closeLightbox, goNext, goPrev]);

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />
      <Hero 
        image={heroImg}
        title={t("nav.gallery")}
        subtitle="Visual Journey"
        height="half"
        showButton={false}
        editPrefix="gallery.hero"
      />
      
      <div className="container-padding py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {allImages.map((img, i) => (
             <div
               key={i}
               className="aspect-square relative group overflow-hidden cursor-pointer"
               data-testid={`gallery-image-${i}`}
               onClick={() => openLightbox(i)}
             >
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
           {allImages.length <= 4 && allImages.map((img, i) => (
             <div
               key={`dup-${i}`}
               className="aspect-square relative group overflow-hidden cursor-pointer"
               onClick={() => openLightbox(i)}
             >
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

      <AnimatePresence>
        {lightboxIdx !== null && allImages[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2"
              data-testid="lightbox-close"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-2"
              data-testid="lightbox-prev"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-2"
              data-testid="lightbox-next"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            <motion.img
              key={lightboxIdx}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={allImages[lightboxIdx].src}
              alt={allImages[lightboxIdx].title}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-center">
              <p className="font-serif text-lg">{allImages[lightboxIdx].title}</p>
              <p className="text-white/50 text-sm mt-1">{lightboxIdx + 1} / {allImages.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
