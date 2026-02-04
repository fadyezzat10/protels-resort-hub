import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { bookingLink } from "@/lib/data";
import { Menu, X, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import logo from "@assets/سش.pngش_1770193463633.png";

export default function Navbar() {
  const { t, language, setLanguage, dir } = useI18n();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "nav.home" },
    { href: "/hotels", label: "nav.hotels" },
    { href: "/gallery", label: "nav.gallery" },
    { href: "/about", label: "nav.about" },
    { href: "/contact", label: "nav.contact" },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
      )}
    >
      <div className="container-padding flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 group">
            <img 
              src={logo} 
              alt="PROTELS" 
              className={cn(
                "transition-all duration-300 object-contain h-auto",
                isScrolled ? "w-[100px] md:w-[140px] invert" : "w-[115px] md:w-[160px]"
              )} 
            />
          </a>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className={cn(
                  "text-xs font-medium transition-colors hover:text-brand-gold uppercase tracking-widest",
                  location === link.href ? "text-brand-gold" : isScrolled ? "text-brand-blue" : "text-white/90"
                )}
              >
                {t(link.label)}
              </a>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className={cn("flex items-center gap-2 text-xs tracking-widest uppercase font-medium", isScrolled ? "text-brand-blue" : "text-white")}
          >
            <Globe className="w-4 h-4" />
            {language === "en" ? "AR" : "EN"}
          </Button>
          
          <Button 
            asChild 
            className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold px-6 rounded-none text-xs uppercase tracking-widest"
          >
            <a href={bookingLink} target="_blank" rel="noopener noreferrer">
              {t("nav.book")}
            </a>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={cn("md:hidden", isScrolled ? "text-brand-blue" : "text-white")}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t p-6 md:hidden shadow-lg flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a 
                className="text-brand-blue font-medium text-lg py-2 border-b border-gray-100 uppercase tracking-widest text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(link.label)}
              </a>
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-4">
             <Button
              variant="outline"
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="justify-start gap-2 uppercase tracking-widest text-xs rounded-none"
            >
              <Globe className="w-4 h-4" />
              {language === "en" ? "العربية" : "English"}
            </Button>
            <Button 
              asChild 
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue w-full rounded-none uppercase tracking-widest text-xs"
            >
              <a href={bookingLink} target="_blank" rel="noopener noreferrer">
                {t("nav.book")}
              </a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
