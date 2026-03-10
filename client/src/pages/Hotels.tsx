import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HotelCard from "@/components/HotelCard";
import Footer from "@/components/Footer";
import EditableText from "@/components/EditableText";
import SEOHead, { getBreadcrumbJsonLd } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { useMergedHotels, usePageHeroImage } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";

function HotelCardSkeleton() {
  return (
    <div className="h-full" data-testid="skeleton-hotel-card">
      <div className="overflow-hidden shadow-lg flex flex-col h-full">
        <Skeleton className="h-64 w-full rounded-none" />
        <div className="p-6 flex flex-col flex-1 bg-white">
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-7 w-3/4 mb-3" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-2/3 mb-4" />
          <div className="flex gap-2 mb-4 mt-auto">
            <Skeleton className="h-6 w-16 rounded-sm" />
            <Skeleton className="h-6 w-16 rounded-sm" />
            <Skeleton className="h-6 w-16 rounded-sm" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-none" />
            <Skeleton className="h-10 flex-1 rounded-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hotels() {
  const { t } = useI18n();
  const { hotels, isLoading } = useMergedHotels();
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
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <HotelCardSkeleton key={i} />
              ))}
            </>
          ) : (
            hotels.map((hotel, index) => (
              <HotelCard key={hotel.id} hotel={hotel} index={index} />
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
