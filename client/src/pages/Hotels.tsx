import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HotelCard from "@/components/HotelCard";
import Footer from "@/components/Footer";
import { useMergedHotels } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/images/hotels-hero-aerial.jpg";

export default function Hotels() {
  const { t } = useI18n();
  const { hotels } = useMergedHotels();

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />
      
      <Hero 
        image={heroImg}
        title={t("nav.hotels")}
        subtitle="Our Collection"
        height="half"
        showButton={false}
      />

      <section className="py-20 container-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel, index) => (
            <HotelCard key={hotel.id} hotel={hotel} index={index} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
