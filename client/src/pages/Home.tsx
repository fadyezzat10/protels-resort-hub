import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HotelCard from "@/components/HotelCard";
import Footer from "@/components/Footer";
import { useMergedHotels } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/images/hero-main.jpg";

// Slider Images
import slider1 from "@assets/Gemini_Generated_Image_g6moaog6moaog6mo_1770195209224.png";
import slider2 from "@assets/DSC05597.png11_1770195240514.png";
import slider3 from "@assets/Protels_Beach_Club_&_SPA_1770195240514.png";
import slider4 from "@assets/1_1770195252319.png";
import slider5 from "@assets/Protels_Crystal_Beach_Resort_1770195252319.png";

export default function Home() {
  const { t } = useI18n();
  const { hotels } = useMergedHotels();

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />
      
      <Hero 
        images={[slider1, slider2, slider3, slider4, slider5]}
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
      />

      {/* Featured Destinations */}
      <section className="py-20 container-padding">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-brand-gold uppercase tracking-widest font-medium text-sm mb-2 block">
            {t("featured.subtitle")}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-brand-blue font-medium">
            {t("featured.title")}
          </h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {hotels.map((hotel, index) => (
            <HotelCard key={hotel.id} hotel={hotel} index={index} />
          ))}
        </div>
      </section>

      {/* Brand Experience Section */}
      <section className="py-24 bg-brand-blue text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container-padding relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif mb-6">{t("about.title")}</h2>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              {t("about.desc")}
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-3xl font-serif text-brand-gold mb-2">4</h3>
                <p className="text-sm uppercase tracking-wider">Luxury Resorts</p>
              </div>
              <div>
                <h3 className="text-3xl font-serif text-brand-gold mb-2">2</h3>
                <p className="text-sm uppercase tracking-wider">Destinations</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {hotels[0] && <img src={hotels[0].image} className="rounded-none w-full h-64 object-cover mt-8" alt="Resort" />}
            {hotels[2] && <img src={hotels[2].image} className="rounded-none w-full h-64 object-cover" alt="Resort" />}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
