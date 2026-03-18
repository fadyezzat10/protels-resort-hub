import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar" | "fr" | "de" | "es" | "ru" | "pl" | "cs";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const coreTranslations: Record<"en" | "ar", Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.hotels": "Hotels & Resorts",
    "nav.gallery": "Gallery",
    "nav.about": "About Us",
    "nav.contact": "Contact",
    "nav.careers": "Careers",
    "nav.book": "Book Now",
    "nav.companyProfile": "Company Profile",
    "nav.blog": "Blog",
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
    "contact.sales": "Sales",
    "contact.reservations": "Reservations",
    "contact.mobile": "Mobile",
    "contact.form.title": "Send Us a Message",
    "contact.form.name": "Your Name",
    "contact.form.email": "Email Address",
    "contact.form.phone": "Phone Number",
    "contact.form.hotel": "Select Hotel",
    "contact.form.message": "Your Message",
    "contact.form.submit": "Send Message",
    "contact.form.sending": "Sending...",
    "contact.form.success": "Thank you! Your message has been sent successfully.",
    "contact.form.error": "Something went wrong. Please try again.",
    "contact.form.namePlaceholder": "Enter your full name",
    "contact.form.emailPlaceholder": "Enter your email address",
    "contact.form.phonePlaceholder": "Enter your phone number (optional)",
    "contact.form.messagePlaceholder": "How can we help you?",
    "contact.form.generalInquiry": "General Inquiry",
    "about.title": "About PROTELS",
    "about.desc": "PROTELS Hotels & Resorts offers a unique blend of luxury, comfort, and authentic hospitality in some of the most beautiful coastal destinations in the world.",
    "about.welcomeTo": "Welcome to Protels",
    "about.ourStory": "Our Story",
    "about.redefiningLuxury": "Redefining Luxury Through Authentic Connection",
    "about.authenticHospitality": "Authentic Hospitality",
    "about.authenticHospitalityDesc": "Service that comes from the heart, anticipating your every need with warmth and grace.",
    "about.primeLocations": "Prime Locations",
    "about.primeLocationsDesc": "Resorts nestled in the most breathtaking coastal destinations, celebrating nature's beauty.",
    "about.curatedExperiences": "Curated Experiences",
    "about.curatedExperiencesDesc": "From sunrise yoga to culinary journeys, we craft moments that linger in your memory.",
    "about.ourCollection": "Our Collection",
    "about.discoverResorts": "Discover Our Resorts",
    "about.guestPhilosophy": "Guest Experience Philosophy",
    "about.personalizedService": "Personalized service tailored to your preferences",
    "about.immersiveCultural": "Immersive cultural and culinary experiences",
    "about.holisticWellness": "Holistic wellness and rejuvenation",
    "about.journeyBegins": "Your Journey Begins Here",
    "about.exploreResorts": "Explore Our Resorts",
    "about.quoteText": "We don't just provide a place to sleep; we provide a canvas for your most cherished memories.",
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
    "hotel.bookYourStay": "Book Your Stay",
    "hotel.bestRates": "Best rates guaranteed. No booking fees.",
    "hotel.checkIn": "Check-in",
    "hotel.checkOut": "Check-out",
    "hotel.selectDates": "Select Dates",
    "hotel.needAssistance": "Need Assistance?",
    "hotel.contactConcierge": "Contact Concierge",
    "hotel.roomTypes": "Room Types",
    "hotel.viewRoom": "View Room",
    "hotel.checkRates": "Check Rates",
    "hotel.viewMenu": "View Menu",
    "hotel.reserveTable": "Reserve Your Table",
    "hotel.writeReview": "Write a Review",
    "hotel.googleReviews": "Google Reviews",
    "hotel.reviewCount": "reviews",
    "hotel.diningDrinks": "Dining & Drinks",
    "hotel.authenticCuisine": "Authentic Oriental Cuisine",
    "hotel.experienceTaste": "Experience the Authentic Taste",
    "hotel.italianCuisine": "Italian Cuisine",
    "hotel.italianRestaurant": "Italian Restaurant",
    "hotel.liveCooking": "Live Cooking",
    "hotel.mongolianRestaurant": "Mongolian Restaurant",
    "hotel.galleryHighlights": "Gallery Highlights",
    "hotel.atmosphere": "Atmosphere",
    "hotel.fitnessCenter": "Fitness Center",
    "hotel.spaWellness": "Spa & Wellness Center",
    "hotel.privateBeach": "Private Beach",
    "hotel.poolsAquapark": "Pools & Aquapark",
    "hotel.locationContact": "Location & Contact",
    "hotel.address": "Address",
    "hotel.phone": "Phone",
    "hotel.email": "Email",
    "hotel.viewOnMaps": "View on Google Maps",
    "hotel.allInclusive": "The All-Inclusive Experience",
    "hotel.activitiesLeisure": "Activities & Leisure",
    "hotel.comfortService": "Comfort & Service",
    "hotel.beachfrontDining": "Beachfront Dining Experience",
    "hotel.loungeBar": "The Lounge – Bar & Terrace",
    "hotel.pristineBeachfront": "Pristine Beachfront",
    "hotel.swimmingPools": "Swimming Pools",
    "hotel.extensiveWine": "Extensive Wine Selection",
    "hotel.securePayment": "Secure payment via our official booking engine",
    "hotel.conciergeAvailable": "Our concierge team is available 24/7 to help plan your perfect stay.",
    "cms.uploading": "Uploading...",
    "cms.changeBackground": "Change Background Image",
    "notFound.title": "Page Not Found",
    "notFound.subtitle": "The page you're looking for seems to have drifted away like a wave.",
    "notFound.backHome": "Back to Home",
    "notFound.browseHotels": "Browse Hotels",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.hotels": "الفنادق والمنتجعات",
    "nav.gallery": "المعرض",
    "nav.about": "من نحن",
    "nav.contact": "اتصل بنا",
    "nav.careers": "وظائف",
    "nav.book": "احجز الآن",
    "nav.companyProfile": "ملف الشركة",
    "nav.blog": "المدونة",
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
    "contact.sales": "المبيعات",
    "contact.reservations": "الحجوزات",
    "contact.mobile": "موبايل",
    "contact.form.title": "أرسل لنا رسالة",
    "contact.form.name": "الاسم",
    "contact.form.email": "البريد الإلكتروني",
    "contact.form.phone": "رقم الهاتف",
    "contact.form.hotel": "اختر الفندق",
    "contact.form.message": "رسالتك",
    "contact.form.submit": "إرسال",
    "contact.form.sending": "جارٍ الإرسال...",
    "contact.form.success": "شكراً لك! تم إرسال رسالتك بنجاح.",
    "contact.form.error": "حدث خطأ. يرجى المحاولة مرة أخرى.",
    "contact.form.namePlaceholder": "أدخل اسمك الكامل",
    "contact.form.emailPlaceholder": "أدخل بريدك الإلكتروني",
    "contact.form.phonePlaceholder": "أدخل رقم هاتفك (اختياري)",
    "contact.form.messagePlaceholder": "كيف يمكننا مساعدتك؟",
    "contact.form.generalInquiry": "استفسار عام",
    "about.title": "عن بروتلز",
    "about.desc": "تقدم فنادق ومنتجعات بروتلز مزيجًا فريدًا من الفخامة والراحة وكرم الضيافة الأصيل في أجمل الوجهات الساحلية في العالم.",
    "about.welcomeTo": "مرحباً بكم في بروتلز",
    "about.ourStory": "قصتنا",
    "about.redefiningLuxury": "إعادة تعريف الفخامة من خلال التواصل الأصيل",
    "about.authenticHospitality": "ضيافة أصيلة",
    "about.authenticHospitalityDesc": "خدمة نابعة من القلب، تستبق كل احتياجاتك بدفء ولطف.",
    "about.primeLocations": "مواقع متميزة",
    "about.primeLocationsDesc": "منتجعات تقع في أجمل الوجهات الساحلية، تحتفي بجمال الطبيعة.",
    "about.curatedExperiences": "تجارب مختارة بعناية",
    "about.curatedExperiencesDesc": "من يوغا الفجر إلى الرحلات الطهوية، نصنع لحظات تبقى في ذاكرتك.",
    "about.ourCollection": "مجموعتنا",
    "about.discoverResorts": "اكتشف منتجعاتنا",
    "about.guestPhilosophy": "فلسفة تجربة الضيف",
    "about.personalizedService": "خدمة مخصصة حسب تفضيلاتك",
    "about.immersiveCultural": "تجارب ثقافية وطهوية غامرة",
    "about.holisticWellness": "عافية شاملة وتجديد النشاط",
    "about.journeyBegins": "رحلتك تبدأ من هنا",
    "about.exploreResorts": "استكشف منتجعاتنا",
    "about.quoteText": "نحن لا نوفر مجرد مكان للنوم؛ بل نوفر لوحة لأعز ذكرياتك.",
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
    "hotel.bookYourStay": "احجز إقامتك",
    "hotel.bestRates": "أفضل الأسعار مضمونة. بدون رسوم حجز.",
    "hotel.checkIn": "تسجيل الوصول",
    "hotel.checkOut": "تسجيل المغادرة",
    "hotel.selectDates": "اختر التواريخ",
    "hotel.needAssistance": "هل تحتاج مساعدة؟",
    "hotel.contactConcierge": "تواصل مع الكونسيرج",
    "hotel.roomTypes": "أنواع الغرف",
    "hotel.viewRoom": "عرض الغرفة",
    "hotel.checkRates": "تحقق من الأسعار",
    "hotel.viewMenu": "عرض القائمة",
    "hotel.reserveTable": "احجز طاولتك",
    "hotel.writeReview": "اكتب تقييماً",
    "hotel.googleReviews": "تقييمات جوجل",
    "hotel.reviewCount": "تقييم",
    "hotel.diningDrinks": "المطاعم والمشروبات",
    "hotel.authenticCuisine": "المطبخ الشرقي الأصيل",
    "hotel.experienceTaste": "استمتع بالمذاق الأصيل",
    "hotel.italianCuisine": "المطبخ الإيطالي",
    "hotel.italianRestaurant": "المطعم الإيطالي",
    "hotel.liveCooking": "الطهي الحي",
    "hotel.mongolianRestaurant": "المطعم المنغولي",
    "hotel.galleryHighlights": "أبرز صور المعرض",
    "hotel.atmosphere": "الأجواء",
    "hotel.fitnessCenter": "مركز اللياقة البدنية",
    "hotel.spaWellness": "مركز السبا والعافية",
    "hotel.privateBeach": "الشاطئ الخاص",
    "hotel.poolsAquapark": "المسابح والألعاب المائية",
    "hotel.locationContact": "الموقع والاتصال",
    "hotel.address": "العنوان",
    "hotel.phone": "الهاتف",
    "hotel.email": "البريد الإلكتروني",
    "hotel.viewOnMaps": "عرض على خرائط جوجل",
    "hotel.allInclusive": "تجربة شاملة كلياً",
    "hotel.activitiesLeisure": "الأنشطة والترفيه",
    "hotel.comfortService": "الراحة والخدمة",
    "hotel.beachfrontDining": "تجربة طعام على الشاطئ",
    "hotel.loungeBar": "الصالة – بار وتراس",
    "hotel.pristineBeachfront": "شاطئ نقي",
    "hotel.swimmingPools": "حمامات السباحة",
    "hotel.extensiveWine": "تشكيلة واسعة من النبيذ",
    "hotel.securePayment": "دفع آمن عبر محرك الحجز الرسمي",
    "hotel.conciergeAvailable": "فريق الكونسيرج متاح على مدار الساعة لمساعدتك في التخطيط لإقامة مثالية.",
    "cms.uploading": "جاري الرفع...",
    "cms.changeBackground": "تغيير صورة الخلفية",
    "notFound.title": "الصفحة غير موجودة",
    "notFound.subtitle": "يبدو أن الصفحة التي تبحث عنها قد انجرفت بعيداً مع الأمواج.",
    "notFound.backHome": "العودة للرئيسية",
    "notFound.browseHotels": "تصفح الفنادق",
  },
};

const lazyLoaders: Record<string, () => Promise<Record<string, string>>> = {
  fr: () => import("./translations/fr.json").then((m) => m.default),
  de: () => import("./translations/de.json").then((m) => m.default),
  es: () => import("./translations/es.json").then((m) => m.default),
  ru: () => import("./translations/ru.json").then((m) => m.default),
  pl: () => import("./translations/pl.json").then((m) => m.default),
  cs: () => import("./translations/cs.json").then((m) => m.default),
};

const loadedTranslations: Partial<Record<Language, Record<string, string>>> = {
  en: coreTranslations.en,
  ar: coreTranslations.ar,
};

export const translations = loadedTranslations as Record<Language, Record<string, string>>;

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [, forceUpdate] = useState(0);

  const setLanguage = async (lang: Language) => {
    if (!loadedTranslations[lang] && lazyLoaders[lang]) {
      try {
        const data = await lazyLoaders[lang]();
        loadedTranslations[lang] = data;
      } catch {
        loadedTranslations[lang] = coreTranslations.en;
      }
    }
    setLanguageState(lang);
    forceUpdate((n) => n + 1);
  };

  const t = (key: string): string => {
    const dict = loadedTranslations[language];
    return (dict && dict[key]) || coreTranslations.en[key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

const fallbackI18n: I18nContextType = {
  language: "en",
  setLanguage: () => {},
  t: (key: string) => coreTranslations.en[key] || key,
  dir: "ltr",
};

export function useI18n() {
  const context = useContext(I18nContext);
  return context ?? fallbackI18n;
}
