import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useBookingLink } from "@/lib/cms";
import { useState, useEffect, useRef, useCallback } from "react";
import EditableText from "@/components/EditableText";
import { useEditMode } from "@/lib/editMode";
import { Camera, Loader2 } from "lucide-react";

interface HeroProps {
  image?: string;
  images?: string[];
  video?: string;
  title?: string;
  subtitle?: string;
  showButton?: boolean;
  height?: "full" | "half" | "large";
  bookingLink?: string;
  editPrefix?: string;
}

export default function Hero({ 
  image, 
  images = [],
  video,
  title, 
  subtitle, 
  showButton = true,
  height = "full",
  bookingLink: bookingLinkProp,
  editPrefix = "hero",
}: HeroProps) {
  const { t } = useI18n();
  const cmsBookingLink = useBookingLink();
  const finalBookingLink = bookingLinkProp || cmsBookingLink;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isEditMode, pageContent, updateContent, uploadImage, setSelectedKey } = useEditMode();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const heroImages = images.length > 0 ? images : (image ? [image] : []);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const timer = setInterval(() => {
      setPrevIndex(currentIndex);
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
      setTimeout(() => setIsTransitioning(false), 2000);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroImages.length, currentIndex]);

  const getImgSrc = (idx: number) => {
    const key = `img:${editPrefix}.bg.${idx}`;
    return pageContent[key] ?? heroImages[idx];
  };

  const currentSrc = getImgSrc(currentIndex);
  const prevSrc = getImgSrc(prevIndex);

  const imgKey = `img:${editPrefix}.bg.${currentIndex}`;

  const handleImageClick = useCallback(() => {
    if (isEditMode) {
      setSelectedKey(imgKey);
      fileRef.current?.click();
    }
  }, [isEditMode, imgKey, setSelectedKey]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      updateContent(imgKey, url);
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [imgKey, updateContent, uploadImage]);

  const getHeightClass = () => {
    switch (height) {
      case "full": return "h-[100vh]";
      case "large": return "h-[90vh]";
      case "half": return "h-[50vh] min-h-[500px]";
      default: return "h-[100vh]";
    }
  };

  return (
    <div className={`relative w-full ${getHeightClass()} overflow-hidden bg-brand-dark`}>
      {video ? (
        <div className="absolute inset-0 w-full h-full">
          <video
            src={video}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          {heroImages.length > 0 && (
            <div className="absolute inset-0 w-full h-full">
              <img src={currentSrc} alt="Overlay" className="w-full h-full object-cover mix-blend-overlay opacity-30" />
            </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={currentSrc}
            alt="Luxury Resort"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 1 }}
          />
          {prevIndex !== currentIndex && (
            <img
              src={prevSrc}
              alt="Resort"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                zIndex: 2, 
                opacity: isTransitioning ? 0 : 1, 
                transition: "opacity 2s ease-in-out" 
              }}
            />
          )}
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" /> 
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40 z-10 pointer-events-none" />

      {isEditMode && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60]">
          <button
            onClick={handleImageClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-xl transition-all duration-200 hover:scale-105"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-bold">جاري الرفع...</span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span className="text-sm font-bold">تغيير صورة الخلفية</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center container-padding pt-20">
        <div className="max-w-5xl animate-fade-in-up">
          {subtitle && (
            <EditableText
              contentKey={`${editPrefix}.subtitle`}
              defaultValue={subtitle}
              as="p"
              className="text-white/90 text-sm md:text-base uppercase tracking-[0.3em] mb-6 font-medium drop-shadow-md"
            />
          )}
          {title && (
            <EditableText
              contentKey={`${editPrefix}.title`}
              defaultValue={title}
              as="h1"
              className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-10 leading-tight drop-shadow-xl font-medium"
            />
          )}
          
          {showButton && (
            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-[#C8A97E] hover:bg-[#b8966c] text-white font-bold px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
              >
                <a href={finalBookingLink} target="_blank" rel="noopener noreferrer">
                  {t("nav.book")}
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      {heroImages.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "bg-brand-gold w-8" : "bg-white/50 hover:bg-white"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
