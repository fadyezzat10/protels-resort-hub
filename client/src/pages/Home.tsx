import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HotelCard from "@/components/HotelCard";
import Footer from "@/components/Footer";
import EditableText from "@/components/EditableText";
import EditableImage from "@/components/EditableImage";
import SEOHead, { getOrganizationJsonLd, getHotelJsonLd, getBreadcrumbJsonLd, getFAQJsonLd } from "@/components/SEOHead";
import { useMergedHotels, useHeroContent, useBookingLink, useRoyalBayVideo } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";
import { Play } from "lucide-react";
import { useState, useRef, useCallback } from "react";

import slider1 from "@assets/Gemini_Generated_Image_g6moaog6moaog6mo_1770195209224.png";
import slider2 from "@assets/DSC05597.png11_1770195240514.png";
import slider3 from "@assets/Protels_Beach_Club_&_SPA_1770195240514.png";
import slider4 from "@assets/1_1770195252319.png";
import slider5 from "@assets/Protels_Crystal_Beach_Resort_1770195252319.png";

const staticSliderImages = [slider1, slider2, slider3, slider4, slider5];

export function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function RoyalBayVideoSection({ videoUrl, title, description }: { videoUrl: string; title: string; description: string }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeId = getYouTubeId(videoUrl);
  const isYoutube = !!youtubeId;

  const handlePlay = useCallback(() => {
    setPlaying(true);
    if (!isYoutube && videoRef.current) {
      videoRef.current.play();
    }
  }, [isYoutube]);

  return (
    <section className="py-20 bg-brand-white" data-testid="royal-bay-video-section">
      <div className="container-padding">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-brand-gold uppercase tracking-widest font-medium text-sm mb-2 block">
            Coming Soon
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-brand-blue font-medium mb-4">
            {title || "Protels Royal Bay Resort & Spa"}
          </h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mb-6" />
          <p className="text-gray-600 text-lg leading-relaxed">
            {description || "Opening Summer 2026 in Hurghada, Egypt"}
          </p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto aspect-video rounded-xl overflow-hidden shadow-2xl group">
          {isYoutube ? (
            playing ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={title}
              />
            ) : (
              <>
                <img loading="lazy"
                  src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div
                  data-testid="royal-bay-play-overlay"
                  className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer group-hover:bg-black/40 transition-colors"
                  onClick={handlePlay}
                >
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-brand-blue ml-1" fill="currentColor" />
                  </div>
                </div>
              </>
            )
          ) : (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover"
                controls={playing}
                playsInline
                preload="metadata"
                data-testid="royal-bay-video-player"
              />
              {!playing && (
                <div
                  data-testid="royal-bay-mp4-play-overlay"
                  className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer group-hover:bg-black/40 transition-colors"
                  onClick={handlePlay}
                >
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-brand-blue ml-1" fill="currentColor" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t, language } = useI18n();
  const { hotels } = useMergedHotels();
  const { heroTitle, heroSubtitle, heroImages, heroVideo } = useHeroContent(language);
  const bookingLink = useBookingLink();
  const royalBay = useRoyalBayVideo(language);

  const finalHeroImages = heroImages.length > 0 ? heroImages : staticSliderImages;

  const hotelFAQs = [
    { question: "What resorts does Protels Hotels & Resorts operate?", answer: "Protels operates four luxury resorts: Crystal Beach Resort and Beach Club & Spa in Marsa Alam (Egypt), Royal Bay Resort & Spa in Hurghada (Egypt), and La Plage in Zanzibar (Tanzania)." },
    { question: "Are Protels resorts all-inclusive?", answer: "Yes, all Protels resorts offer comprehensive all-inclusive packages including meals, drinks, activities, and entertainment." },
    { question: "Does Protels offer diving and water sports?", answer: "Yes, our Red Sea resorts feature PADI-certified diving centers with access to world-class coral reefs and a variety of water sports activities." },
    { question: "Are Protels resorts family-friendly?", answer: "Absolutely! Our resorts offer kids clubs, family rooms, aqua parks, pools, and supervised activities for children of all ages." },
    { question: "How can I book a stay at a Protels resort?", answer: "You can book directly through our website using the 'Book Now' button on any resort page, or contact our reservations team via email at info@protels.com." },
  ];

  const homeJsonLd = [
    getOrganizationJsonLd(),
    getBreadcrumbJsonLd([{ name: "Home", path: "/" }]),
    getFAQJsonLd(hotelFAQs),
    ...hotels.map((h) => getHotelJsonLd(h as any)),
  ];

  return (
    <div className="min-h-screen bg-brand-white">
      <SEOHead
        title="Protels Hotels & Resorts – Luxury Beach Resorts in Egypt & Zanzibar"
        description="Discover luxury beachfront resorts in Marsa Alam, Hurghada & Zanzibar. All-inclusive packages, diving, spa, family activities. Book your Red Sea vacation at Protels."
        keywords="Marsa Alam hotels, Red Sea resorts, Protels resorts, Egypt beach resorts, Hurghada hotels, Zanzibar resorts, luxury beach resort Egypt, all-inclusive Red Sea, diving resort Egypt"
        ogTitle="Protels Hotels & Resorts – Luxury Beach Resorts"
        ogDescription="Experience luxury at our premier beach resorts in Marsa Alam, Hurghada, and Zanzibar. All-inclusive vacation packages with diving, spa & family fun."
        canonical="https://protels.com/"
        jsonLd={homeJsonLd}
      />
      <Navbar />
      
      <Hero 
        images={finalHeroImages}
        video={heroVideo || undefined}
        title={heroTitle || t("hero.title")}
        subtitle={heroSubtitle || t("hero.subtitle")}
        bookingLink={bookingLink}
        editPrefix="home.hero"
      />

      {royalBay.visible && royalBay.videoUrl && (
        <RoyalBayVideoSection
          videoUrl={royalBay.videoUrl}
          title={royalBay.title}
          description={royalBay.description}
        />
      )}

      <section className="py-20 container-padding">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <EditableText
            contentKey="home.featured.subtitle"
            defaultValue={t("featured.subtitle")}
            as="span"
            className="text-brand-gold uppercase tracking-widest font-medium text-sm mb-2 block"
          />
          <EditableText
            contentKey="home.featured.title"
            defaultValue={t("featured.title")}
            as="h2"
            className="text-4xl md:text-5xl font-serif text-brand-blue font-medium"
          />
          <div className="w-24 h-1 bg-brand-gold mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {hotels.map((hotel, index) => (
            <HotelCard key={hotel.id} hotel={hotel} index={index} />
          ))}
        </div>
      </section>

      <section className="py-24 bg-brand-blue text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container-padding relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <EditableText
              contentKey="home.about.title"
              defaultValue={t("about.title")}
              as="h2"
              className="text-4xl md:text-5xl font-serif mb-6"
            />
            <EditableText
              contentKey="home.about.desc"
              defaultValue={t("about.desc")}
              as="p"
              className="text-white/80 text-lg leading-relaxed mb-8"
            />
            <div className="grid grid-cols-2 gap-8">
              <div>
                <EditableText
                  contentKey="home.stats.resorts"
                  defaultValue={String(hotels.length)}
                  as="h3"
                  className="text-3xl font-serif text-brand-gold mb-2"
                />
                <EditableText
                  contentKey="home.stats.resorts.label"
                  defaultValue="Luxury Resorts"
                  as="p"
                  className="text-sm uppercase tracking-wider"
                />
              </div>
              <div>
                <EditableText
                  contentKey="home.stats.destinations"
                  defaultValue="2"
                  as="h3"
                  className="text-3xl font-serif text-brand-gold mb-2"
                />
                <EditableText
                  contentKey="home.stats.destinations.label"
                  defaultValue="Destinations"
                  as="p"
                  className="text-sm uppercase tracking-wider"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {hotels[0] && (
              <EditableImage
                contentKey="home.about.image1"
                defaultSrc={hotels[0].image}
                className="rounded-none w-full h-64 object-cover mt-8"
                alt="Resort"
              />
            )}
            {hotels[2] && (
              <EditableImage
                contentKey="home.about.image2"
                defaultSrc={hotels[2].image}
                className="rounded-none w-full h-64 object-cover"
                alt="Resort"
              />
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
