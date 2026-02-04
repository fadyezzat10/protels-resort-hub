import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "ar";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, any>> = {
  en: {
    "nav.home": "Home",
    "nav.hotels": "Hotels & Resorts",
    "nav.gallery": "Gallery",
    "nav.about": "About Us",
    "nav.contact": "Contact",
    "nav.book": "Book Now",
    "hero.title": "Experience Luxury by the Sea",
    "hero.subtitle": "Unforgettable moments in Egypt & Zanzibar",
    "hero.explore": "Explore Our Resorts",
    "featured.title": "Our Destinations",
    "featured.subtitle": "Discover our collection of luxury beach resorts",
    "footer.rights": "All Rights Reserved",
    "contact.title": "Get in Touch",
    "contact.address": "Address",
    "contact.phone": "Phone",
    "contact.email": "Email",
    "about.title": "About PROTELS",
    "about.desc": "PROTELS Hotels & Resorts offers a unique blend of luxury, comfort, and authentic hospitality in some of the most beautiful coastal destinations in the world.",
    "gallery.title": "Photo Gallery",
    "hotel.view": "View Hotel",
    "hotel.rooms": "Rooms & Suites",
    "hotel.features": "Resort Features",
    "hotel.location": "Location",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.hotels": "الفنادق والمنتجعات",
    "nav.gallery": "المعرض",
    "nav.about": "من نحن",
    "nav.contact": "اتصل بنا",
    "nav.book": "احجز الآن",
    "hero.title": "استمتع بالفخامة على شاطئ البحر",
    "hero.subtitle": "لحظات لا تنسى في مصر وزنجبار",
    "hero.explore": "اكتشف منتجعاتنا",
    "featured.title": "وجهاتنا",
    "featured.subtitle": "اكتشف مجموعتنا من المنتجعات الشاطئية الفاخرة",
    "footer.rights": "جميع الحقوق محفوظة",
    "contact.title": "تواصل معنا",
    "contact.address": "العنوان",
    "contact.phone": "الهاتف",
    "contact.email": "البريد الإلكتروني",
    "about.title": "عن بروتلز",
    "about.desc": "تقدم فنادق ومنتجعات بروتلز مزيجًا فريدًا من الفخامة والراحة وكرم الضيافة الأصيل في أجمل الوجهات الساحلية في العالم.",
    "gallery.title": "معرض الصور",
    "hotel.view": "عرض الفندق",
    "hotel.rooms": "الغرف والأجنحة",
    "hotel.features": "ميزات المنتجع",
    "hotel.location": "الموقع",
  }
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  // Update document dir when language changes
  React.useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within a I18nProvider");
  }
  return context;
}
