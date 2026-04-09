import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import SEOHead, { getBreadcrumbJsonLd } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { useMergedHotels, useCMSMedia, usePageHeroImage } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";
import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageBreadcrumb from "@/components/PageBreadcrumb";

export default function Gallery() {
  const { t } = useI18n();
  const { hotels, isLoading: hotelsLoading } = useMergedHotels();
  const { data: cmsMedia, isLoading: mediaLoading } = useCMSMedia();
  const isLoading = hotelsLoading || mediaLoading;
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
      <SEOHead
        title="Photo Gallery | Protels Hotels & Resorts – Resort Images"
        description="Browse stunning photos of Protels luxury beach resorts in Egypt and Zanzibar. See our rooms, pools, beaches, dining venues, and facilities."
        keywords="Protels resort photos, Marsa Alam hotel gallery, Red Sea resort images, Zanzibar beach resort pictures"
        ogTitle="Protels Hotels & Resorts Gallery"
        ogDescription="Explore beautiful images from our luxury beach resorts."
        ogImage="https://protels.com/images/hotel-la-plage-hero.webp"
        jsonLd={getBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ])}
      />
      <Navbar />
      <PageBreadcrumb items={[{ label: t("nav.gallery") }]} />
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
           {isLoading ? (
             [1, 2, 3, 4, 5, 6].map((i) => (
               <div key={i} className="aspect-square" data-testid={`skeleton-gallery-${i}`}>
                 <Skeleton className="w-full h-full rounded-none" />
               </div>
             ))
           ) : (
             <>
               {allImages.map((img, i) => (
                 <div
                   key={i}
                   className="aspect-square relative group overflow-hidden cursor-pointer"
                   data-testid={`gallery-image-${i}`}
                   onClick={() => openLightbox(i)}
                 >
                   <img loading="lazy" 
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
                   <img loading="lazy" 
                     src={img.src} 
                     alt={img.title}
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <p className="text-white font-serif text-xl text-center px-4">{img.title}</p>
                   </div>
                 </div>
               ))}
             </>
           )}
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
              className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-3 min-w-[48px] min-h-[48px] flex items-center justify-center"
              data-testid="lightbox-close"
              aria-label="Close image lightbox"
            >
              <X className="w-8 h-8" aria-hidden="true" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-3 min-w-[48px] min-h-[48px] flex items-center justify-center"
              data-testid="lightbox-prev"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-10 h-10" aria-hidden="true" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-3 min-w-[48px] min-h-[48px] flex items-center justify-center"
              data-testid="lightbox-next"
              aria-label="Next image"
            >
              <ChevronRight className="w-10 h-10" aria-hidden="true" />
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
