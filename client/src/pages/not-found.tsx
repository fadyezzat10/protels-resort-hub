import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Home, Hotel } from "lucide-react";

export default function NotFound() {
  const { t, dir } = useI18n();

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      <SEOHead
        title="404 - Page Not Found | Protels Hotels & Resorts"
        description="The page you are looking for could not be found."
        noindex={true}
      />
      <Navbar />

      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f2240] to-[#0a1628] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-6 py-20 max-w-2xl mx-auto">
          <p className="text-brand-gold text-8xl md:text-9xl font-serif tracking-wider mb-4" data-testid="text-404-code" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            404
          </p>

          <div className="w-24 h-[1px] bg-brand-gold/40 mx-auto mb-8" />

          <h1
            className="text-white text-3xl md:text-4xl font-serif tracking-wide mb-4"
            data-testid="text-404-title"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("notFound.title")}
          </h1>

          <p
            className="text-white/60 text-base md:text-lg leading-relaxed mb-12 max-w-md mx-auto"
            data-testid="text-404-subtitle"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {t("notFound.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold px-8 py-3 rounded-none text-xs uppercase tracking-[0.2em] h-12 min-w-[200px]"
              data-testid="button-back-home"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                {t("notFound.backHome")}
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold font-bold px-8 py-3 rounded-none text-xs uppercase tracking-[0.2em] h-12 min-w-[200px] bg-transparent"
              data-testid="button-browse-hotels"
            >
              <Link href="/hotels">
                <Hotel className="w-4 h-4 mr-2" />
                {t("notFound.browseHotels")}
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
