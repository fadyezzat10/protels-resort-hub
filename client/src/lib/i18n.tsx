import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "ar" | "fr" | "de" | "es" | "ru";

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
    "nav.careers": "Careers",
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
    "hotel.overview": "Overview",
    "hotel.accommodation": "Accommodation",
    "hotel.dining": "Dining",
    "hotel.facilities": "Facilities",
    "hotel.reviews": "Share Your Experience",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.hotels": "الفنادق والمنتجعات",
    "nav.gallery": "المعرض",
    "nav.about": "من نحن",
    "nav.contact": "اتصل بنا",
    "nav.careers": "وظائف",
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
    "hotel.overview": "نظرة عامة",
    "hotel.accommodation": "الإقامة",
    "hotel.dining": "المطاعم",
    "hotel.facilities": "المرافق",
    "hotel.reviews": "شارك تجربتك",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.hotels": "Hôtels & Complexes",
    "nav.gallery": "Galerie",
    "nav.about": "À Propos",
    "nav.contact": "Contact",
    "nav.careers": "Carrières",
    "nav.book": "Réserver",
    "hero.title": "Vivez le Luxe au Bord de la Mer",
    "hero.subtitle": "Des moments inoubliables en Égypte et à Zanzibar",
    "hero.explore": "Explorer Nos Complexes",
    "featured.title": "Nos Destinations",
    "featured.subtitle": "Découvrez notre collection de complexes balnéaires de luxe",
    "footer.rights": "Tous Droits Réservés",
    "contact.title": "Contactez-nous",
    "contact.address": "Adresse",
    "contact.phone": "Téléphone",
    "contact.email": "Email",
    "about.title": "À Propos de PROTELS",
    "about.desc": "PROTELS Hotels & Resorts offre un mélange unique de luxe, de confort et d'hospitalité authentique dans certaines des plus belles destinations côtières du monde.",
    "gallery.title": "Galerie Photos",
    "hotel.view": "Voir l'Hôtel",
    "hotel.rooms": "Chambres & Suites",
    "hotel.features": "Caractéristiques du Complexe",
    "hotel.location": "Emplacement",
    "hotel.overview": "Aperçu",
    "hotel.accommodation": "Hébergement",
    "hotel.dining": "Restauration",
    "hotel.facilities": "Installations",
    "hotel.reviews": "Partagez Votre Expérience",
  },
  de: {
    "nav.home": "Startseite",
    "nav.hotels": "Hotels & Resorts",
    "nav.gallery": "Galerie",
    "nav.about": "Über Uns",
    "nav.contact": "Kontakt",
    "nav.careers": "Karriere",
    "nav.book": "Buchen",
    "hero.title": "Erleben Sie Luxus am Meer",
    "hero.subtitle": "Unvergessliche Momente in Ägypten & Sansibar",
    "hero.explore": "Unsere Resorts Entdecken",
    "featured.title": "Unsere Reiseziele",
    "featured.subtitle": "Entdecken Sie unsere Kollektion luxuriöser Strandresorts",
    "footer.rights": "Alle Rechte Vorbehalten",
    "contact.title": "Kontaktieren Sie Uns",
    "contact.address": "Adresse",
    "contact.phone": "Telefon",
    "contact.email": "E-Mail",
    "about.title": "Über PROTELS",
    "about.desc": "PROTELS Hotels & Resorts bietet eine einzigartige Mischung aus Luxus, Komfort und authentischer Gastfreundschaft an einigen der schönsten Küstenziele der Welt.",
    "gallery.title": "Fotogalerie",
    "hotel.view": "Hotel Ansehen",
    "hotel.rooms": "Zimmer & Suiten",
    "hotel.features": "Resort-Ausstattung",
    "hotel.location": "Standort",
    "hotel.overview": "Übersicht",
    "hotel.accommodation": "Unterkunft",
    "hotel.dining": "Gastronomie",
    "hotel.facilities": "Einrichtungen",
    "hotel.reviews": "Teilen Sie Ihre Erfahrung",
  },
  es: {
    "nav.home": "Inicio",
    "nav.hotels": "Hoteles y Resorts",
    "nav.gallery": "Galería",
    "nav.about": "Nosotros",
    "nav.contact": "Contacto",
    "nav.careers": "Carreras",
    "nav.book": "Reservar",
    "hero.title": "Experimente el Lujo Junto al Mar",
    "hero.subtitle": "Momentos inolvidables en Egipto y Zanzíbar",
    "hero.explore": "Explore Nuestros Resorts",
    "featured.title": "Nuestros Destinos",
    "featured.subtitle": "Descubra nuestra colección de resorts de playa de lujo",
    "footer.rights": "Todos los Derechos Reservados",
    "contact.title": "Póngase en Contacto",
    "contact.address": "Dirección",
    "contact.phone": "Teléfono",
    "contact.email": "Correo",
    "about.title": "Sobre PROTELS",
    "about.desc": "PROTELS Hotels & Resorts ofrece una mezcla única de lujo, confort y hospitalidad auténtica en algunos de los destinos costeros más hermosos del mundo.",
    "gallery.title": "Galería de Fotos",
    "hotel.view": "Ver Hotel",
    "hotel.rooms": "Habitaciones y Suites",
    "hotel.features": "Características del Resort",
    "hotel.location": "Ubicación",
    "hotel.overview": "Descripción General",
    "hotel.accommodation": "Alojamiento",
    "hotel.dining": "Comedor",
    "hotel.facilities": "Instalaciones",
    "hotel.reviews": "Comparta Su Experiencia",
  },
  ru: {
    "nav.home": "Главная",
    "nav.hotels": "Отели и Курорты",
    "nav.gallery": "Галерея",
    "nav.about": "О Нас",
    "nav.contact": "Контакты",
    "nav.careers": "Карьера",
    "nav.book": "Забронировать",
    "hero.title": "Роскошь на Берегу Моря",
    "hero.subtitle": "Незабываемые моменты в Египте и на Занзибаре",
    "hero.explore": "Исследуйте Наши Курорты",
    "featured.title": "Наши Направления",
    "featured.subtitle": "Откройте для себя нашу коллекцию роскошных пляжных курортов",
    "footer.rights": "Все Права Защищены",
    "contact.title": "Свяжитесь с Нами",
    "contact.address": "Адрес",
    "contact.phone": "Телефон",
    "contact.email": "Email",
    "about.title": "О PROTELS",
    "about.desc": "PROTELS Hotels & Resorts предлагает уникальное сочетание роскоши, комфорта и подлинного гостеприимства в самых красивых прибрежных направлениях мира.",
    "gallery.title": "Фотогалерея",
    "hotel.view": "Посмотреть Отель",
    "hotel.rooms": "Номера и Люксы",
    "hotel.features": "Особенности Курорта",
    "hotel.location": "Расположение",
    "hotel.overview": "Обзор",
    "hotel.accommodation": "Проживание",
    "hotel.dining": "Питание",
    "hotel.facilities": "Удобства",
    "hotel.reviews": "Поделитесь Своим Опытом",
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
