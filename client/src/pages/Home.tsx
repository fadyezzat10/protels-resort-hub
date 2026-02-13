import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HotelCard from "@/components/HotelCard";
import Footer from "@/components/Footer";
import EditableText from "@/components/EditableText";
import EditableImage from "@/components/EditableImage";
import { useMergedHotels, useHeroContent, useBookingLink } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";

import slider1 from "@assets/Gemini_Generated_Image_g6moaog6moaog6mo_1770195209224.png";
import slider2 from "@assets/DSC05597.png11_1770195240514.png";
import slider3 from "@assets/Protels_Beach_Club_&_SPA_1770195240514.png";
import slider4 from "@assets/1_1770195252319.png";
import slider5 from "@assets/Protels_Crystal_Beach_Resort_1770195252319.png";

const staticSliderImages = [slider1, slider2, slider3, slider4, slider5];

export default function Home() {
  const { t, language } = useI18n();
  const { hotels } = useMergedHotels();
  const { heroTitle, heroSubtitle, heroImages, heroVideo } = useHeroContent(language);
  const bookingLink = useBookingLink();

  const finalHeroImages = heroImages.length > 0 ? heroImages : staticSliderImages;

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />
      
      <Hero 
        images={finalHeroImages}
        video={heroVideo || undefined}
        title={heroTitle || t("hero.title")}
        subtitle={heroSubtitle || t("hero.subtitle")}
        bookingLink={bookingLink}
        editPrefix="home.hero"
      />

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
