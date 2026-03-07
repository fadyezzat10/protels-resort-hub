import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HotelCard from "@/components/HotelCard";
import Footer from "@/components/Footer";
import EditableText from "@/components/EditableText";
import SEOHead, { getBreadcrumbJsonLd } from "@/components/SEOHead";
import { useMergedHotels, usePageHeroImage } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";

export default function Hotels() {
  const { t } = useI18n();
  const { hotels } = useMergedHotels();
  const heroImg = usePageHeroImage("hotels", "");

  return (
    <div className="min-h-screen bg-brand-white">
      <SEOHead
        title="Our Hotels & Resorts | Protels – Luxury Beach Resorts in Egypt & Zanzibar"
        description="Explore Protels luxury beach resorts in Marsa Alam, Hurghada, and Zanzibar. All-inclusive packages, diving, spa treatments, and family-friendly activities."
        keywords="Marsa Alam hotels, Red Sea resorts, Protels resorts, Egypt beach resorts, Hurghada hotels, Zanzibar resorts, all-inclusive Egypt"
        ogTitle="Protels Hotels & Resorts Collection"
        ogDescription="Discover our collection of luxury beach resorts along the Red Sea and Indian Ocean."
        jsonLd={getBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Hotels", path: "/hotels" },
        ])}
      />
      <Navbar />
      
      <Hero 
        image={heroImg}
        title={t("nav.hotels")}
        subtitle="Our Collection"
        height="half"
        showButton={false}
        editPrefix="hotels.hero"
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
