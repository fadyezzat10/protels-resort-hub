import { Link, useLocation } from "wouter";
import { useI18n, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useBookingLink, useHeaderLogo, useCMSAllSettings } from "@/lib/cms";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import defaultLogo from "@assets/سش.pngش_1770193463633.webp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FlagModule = typeof import("@/components/FlagIcons");

const defaultNavLinks = [
  { href: "/", label: "nav.home", visible: true, order: 1 },
  { href: "/hotels", label: "nav.hotels", visible: true, order: 2 },
  { href: "/about", label: "nav.about", visible: true, order: 3 },
  { href: "/careers", label: "nav.careers", visible: true, order: 4 },
  { href: "/contact", label: "nav.contact", visible: true, order: 5 },
  { href: "/gallery", label: "nav.gallery", visible: true, order: 6 },
  { href: "/company-profile", label: "nav.companyProfile", visible: true, order: 7 },
];

function SimpleFlagPlaceholder({ language }: { language: string }) {
  const colors: Record<string, string[]> = {
    en: ["#012169", "#C8102E", "#fff"],
    ar: ["#006C35"],
    fr: ["#002395", "#fff", "#ED2939"],
    de: ["#000", "#DD0000", "#FFCE00"],
    es: ["#AA151B", "#F1BF00"],
    ru: ["#fff", "#0039A6", "#D52B1E"],
    pl: ["#fff", "#DC143C"],
    cs: ["#fff", "#D7141A", "#11457E"],
  };
  const c = colors[language] || colors.en;
  return (
    <svg viewBox="0 0 60 36" className="w-5 h-3.5 rounded-[2px] shadow-sm" aria-hidden>
      {c.length === 1
        ? <rect fill={c[0]} width="60" height="36" />
        : c.length === 2
        ? (<><rect fill={c[0]} width="60" height="18"/><rect fill={c[1]} y="18" width="60" height="18"/></>)
        : (<><rect fill={c[0]} width="20" height="36"/><rect fill={c[1]} x="20" width="20" height="36"/><rect fill={c[2]} x="40" width="20" height="36"/></>)
      }
    </svg>
  );
}

export default function Navbar() {
  const { t, language, setLanguage, dir } = useI18n();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bookingLink = useBookingLink();
  const cmsLogo = useHeaderLogo();
  const logoSrc = cmsLogo || defaultLogo;
  const { data: allSettings } = useCMSAllSettings();
  const [flagMod, setFlagMod] = useState<FlagModule | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadFlags = useCallback(async () => {
    if (!flagMod) {
      const mod = await import("@/components/FlagIcons");
      setFlagMod(mod);
    }
  }, [flagMod]);

  const navLinks = useMemo(() => {
    const config = allSettings?.header_nav_config;
    if (Array.isArray(config) && config.length > 0) {
      return config
        .filter((item: any) => item.visible !== false)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((item: any) => ({ href: item.href, label: item.label }));
    }
    return defaultNavLinks.map((item) => ({ href: item.href, label: item.label }));
  }, [allSettings]);

  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
    { code: "ru", label: "Русский" },
    { code: "pl", label: "Polski" },
    { code: "cs", label: "Čeština" },
  ];

  const CurrentFlag = flagMod?.flagComponents[language];

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
              alt="Protels Hotels & Resorts - Home" 
              className={cn(
                "transition-all duration-300 object-contain h-auto",
                isScrolled ? "w-[100px] md:w-[140px] invert" : "w-[115px] md:w-[160px]"
              )} 
            />
        </Link>

        <div className="hidden md:flex items-center gap-5 lg:gap-7">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={cn(
                "text-[11px] lg:text-xs font-medium transition-colors hover:text-brand-gold uppercase tracking-wider lg:tracking-widest whitespace-nowrap",
                location === link.href ? "text-brand-gold" : isScrolled ? "text-brand-blue" : "text-white/90"
              )}
            >
              {t(link.label)}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <DropdownMenu onOpenChange={(open) => { if (open) loadFlags(); }}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Select language"
                className={cn(
                  "flex items-center gap-2 text-xs tracking-widest uppercase font-medium hover:bg-white/10",
                  isScrolled ? "text-brand-blue hover:bg-brand-blue/5" : "text-white"
                )}
              >
                {CurrentFlag
                  ? <CurrentFlag className="w-5 h-3.5 rounded-[2px] shadow-sm" />
                  : <SimpleFlagPlaceholder language={language} />
                }
                {language.toUpperCase()}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-white/95 backdrop-blur-md border-none shadow-lg p-1">
              {languages.map((lang) => {
                const FlagComp = flagMod?.flagComponents[lang.code];
                return (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "text-xs font-medium cursor-pointer flex items-center gap-2.5 px-3 py-2",
                      language === lang.code ? "bg-brand-gold/10 text-brand-gold" : "text-gray-700 hover:text-brand-blue"
                    )}
                  >
                    {FlagComp
                      ? <FlagComp className="w-5 h-3.5 rounded-[2px] shadow-sm shrink-0" />
                      : <SimpleFlagPlaceholder language={lang.code} />
                    }
                    <span className="uppercase tracking-wider w-5">{lang.code.toUpperCase()}</span>
                    <span className="text-[10px] opacity-60 ml-auto">{lang.label}</span>
                  </DropdownMenuItem>
                );
              })}
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
          onClick={() => { setMobileMenuOpen(!mobileMenuOpen); if (!mobileMenuOpen) loadFlags(); }}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
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
            <div className="grid grid-cols-4 gap-2">
              {languages.map((lang) => {
                const FlagComp = flagMod?.flagComponents[lang.code];
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium uppercase tracking-wider rounded border transition-colors",
                      language === lang.code 
                        ? "bg-brand-gold text-white border-brand-gold" 
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-gold/50"
                    )}
                  >
                    {FlagComp
                      ? <FlagComp className="w-4 h-3 rounded-[1px] shrink-0" />
                      : <SimpleFlagPlaceholder language={lang.code} />
                    }
                    {lang.code}
                  </button>
                );
              })}
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
