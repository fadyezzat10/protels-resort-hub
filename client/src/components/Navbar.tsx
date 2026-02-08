import { Link, useLocation } from "wouter";
import { useI18n, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useBookingLink, useHeaderLogo } from "@/lib/cms";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import defaultLogo from "@assets/سش.pngش_1770193463633.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { t, language, setLanguage, dir } = useI18n();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bookingLink = useBookingLink();
  const cmsLogo = useHeaderLogo();
  const logoSrc = cmsLogo || defaultLogo;

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
    { href: "/about", label: "nav.about" },
    { href: "/careers", label: "nav.careers" },
    { href: "/contact", label: "nav.contact" },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
    { code: "ru", label: "Русский" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
      )}
      dir={dir}
    >
      <div className="container-padding flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
            <img 
              src={logoSrc} 
              alt="PROTELS" 
              className={cn(
                "transition-all duration-300 object-contain h-auto",
                isScrolled ? "w-[100px] md:w-[140px] invert" : "w-[115px] md:w-[160px]"
              )} 
            />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={cn(
                "text-xs font-medium transition-colors hover:text-brand-gold uppercase tracking-widest",
                location === link.href ? "text-brand-gold" : isScrolled ? "text-brand-blue" : "text-white/90"
              )}
            >
              {t(link.label)}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-2 text-xs tracking-widest uppercase font-medium hover:bg-white/10",
                  isScrolled ? "text-brand-blue hover:bg-brand-blue/5" : "text-white"
                )}
              >
                <Globe className="w-4 h-4" />
                {language.toUpperCase()}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-white/95 backdrop-blur-md border-none shadow-lg">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    "text-xs font-medium uppercase tracking-wider cursor-pointer",
                    language === lang.code ? "bg-brand-gold/10 text-brand-gold" : "text-gray-700 hover:text-brand-blue"
                  )}
                >
                  <span className="w-6">{lang.code.toUpperCase()}</span>
                  <span className="opacity-70 ml-2 text-[10px] capitalize hidden">{lang.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            asChild 
            className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold px-6 rounded-none text-xs uppercase tracking-widest"
          >
            <a href={bookingLink} target="_blank" rel="noopener noreferrer">
              {t("nav.book")}
            </a>
          </Button>
        </div>

        <button
          className={cn("md:hidden", isScrolled ? "text-brand-blue" : "text-white")}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t p-6 md:hidden shadow-lg flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-brand-blue font-medium text-lg py-2 border-b border-gray-100 uppercase tracking-widest text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t(link.label)}
            </Link>
          ))}
          
          <div className="py-4 border-b border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Select Language</p>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "px-2 py-2 text-xs font-medium uppercase tracking-wider rounded border transition-colors",
                    language === lang.code 
                      ? "bg-brand-gold text-white border-brand-gold" 
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-gold/50"
                  )}
                >
                  {lang.code}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <Button 
              asChild 
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue w-full rounded-none uppercase tracking-widest text-xs h-10"
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
