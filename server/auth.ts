import bcrypt from "bcryptjs";
import { storage } from "./storage";

export async function seedAdmin() {
  const existing = await storage.getUserByUsername("Fezzat");
  if (!existing) {
    const hashed = await bcrypt.hash("Fezzat246810", 12);
    await storage.createUser({
      username: "Fezzat",
      password: hashed,
      role: "super_admin",
    });
    console.log("Default admin user 'Fezzat' created.");
  }
}

export async function seedContent() {
  const existingPages = await storage.getPages();
  if (existingPages.length === 0) {
    const pagesToSeed = [
      {
        slug: "home",
        title: { en: "Home", ar: "الرئيسية", fr: "Accueil", de: "Startseite", es: "Inicio", ru: "Главная" },
        content: { en: "Welcome to PROTELS Hotels & Resorts", ar: "مرحباً بكم في بروتلز للفنادق والمنتجعات" },
        status: "published",
      },
      {
        slug: "about",
        title: { en: "About Us", ar: "من نحن", fr: "À propos", de: "Über uns", es: "Sobre nosotros", ru: "О нас" },
        content: {
          en: "PROTELS Hotels & Resorts is a premier hospitality brand operating luxury beach resorts across Egypt and East Africa. With properties in Marsa Alam, Hurghada, and Zanzibar, we offer exceptional all-inclusive experiences where pristine waters meet world-class service.",
          ar: "بروتلز للفنادق والمنتجعات هي علامة تجارية رائدة في مجال الضيافة تدير منتجعات شاطئية فاخرة في مصر وشرق أفريقيا. مع منشآت في مرسى علم والغردقة وزنجبار، نقدم تجارب استثنائية شاملة كلياً حيث تلتقي المياه النقية بالخدمة العالمية.",
        },
        status: "published",
      },
      {
        slug: "hotels",
        title: { en: "Our Hotels", ar: "فنادقنا", fr: "Nos Hôtels", de: "Unsere Hotels", es: "Nuestros Hoteles", ru: "Наши Отели" },
        content: { en: "Discover our collection of luxury resorts", ar: "اكتشف مجموعتنا من المنتجعات الفاخرة" },
        status: "published",
      },
      {
        slug: "gallery",
        title: { en: "Gallery", ar: "معرض الصور", fr: "Galerie", de: "Galerie", es: "Galería", ru: "Галерея" },
        content: { en: "Explore our stunning resorts through photos", ar: "استكشف منتجعاتنا المذهلة من خلال الصور" },
        status: "published",
      },
      {
        slug: "contact",
        title: { en: "Contact Us", ar: "اتصل بنا", fr: "Contactez-nous", de: "Kontakt", es: "Contáctenos", ru: "Контакты" },
        content: { en: "Get in touch with PROTELS Hotels & Resorts", ar: "تواصل مع بروتلز للفنادق والمنتجعات" },
        status: "published",
      },
      {
        slug: "careers",
        title: { en: "Careers", ar: "الوظائف", fr: "Carrières", de: "Karriere", es: "Empleo", ru: "Карьера" },
        content: { en: "Join the PROTELS team", ar: "انضم لفريق بروتلز" },
        status: "published",
      },
    ];

    for (const page of pagesToSeed) {
      await storage.createPage(page);
    }
    console.log(`Seeded ${pagesToSeed.length} pages.`);
  }

  const existingHotels = await storage.getHotels();
  if (existingHotels.length === 0) {
    const hotelsToSeed = [
      {
        slug: "crystal-beach",
        name: "Protels Crystal Beach Resort",
        location: "Marsa Alam, Egypt",
        description: {
          en: "Discover a sanctuary of luxury on the shores of the Red Sea. Protels Crystal Beach Resort offers an exclusive all-inclusive experience where pristine waters meet exceptional service. Whether you seek vibrant coral reef exploration or tranquil relaxation by our infinity pools, our resort provides the perfect setting for unforgettable memories. Ideal for families and couples alike, we combine modern comfort with the natural beauty of Marsa Alam.",
          ar: "اكتشف ملاذًا من الفخامة على شواطئ البحر الأحمر. يقدم منتجع بروتلز كريستال بيتش تجربة حصرية شاملة كليًا حيث تلتقي المياه النقية بالخدمة الاستثنائية. سواء كنت تبحث عن استكشاف الشعاب المرجانية النابضة بالحياة أو الاسترخاء الهادئ بجانب حمامات السباحة اللامتناهية، يوفر منتجعنا المكان المثالي لذكريات لا تُنسى.",
          fr: "Découvrez un sanctuaire de luxe sur les rives de la mer Rouge. Protels Crystal Beach Resort offre une expérience exclusive tout compris où les eaux cristallines rencontrent un service exceptionnel.",
          de: "Entdecken Sie ein Heiligtum des Luxus an den Ufern des Roten Meeres. Das Protels Crystal Beach Resort bietet ein exklusives All-Inclusive-Erlebnis.",
          es: "Descubra un santuario de lujo a orillas del Mar Rojo. Protels Crystal Beach Resort ofrece una experiencia exclusiva todo incluido.",
          ru: "Откройте для себя святилище роскоши на берегах Красного моря. Protels Crystal Beach Resort предлагает эксклюзивный отдых по системе «все включено».",
        },
        features: ["Private Sandy Beach", "Multiple Swimming Pools", "PADI Diving Center", "Luxury Spa & Wellness", "Kids Club & Activities", "Day & Night Entertainment", "24-Hour Concierge", "High-Speed Wi-Fi"],
        rooms: ["Standard Room", "Superior Room", "Family Room", "Suite"],
        mapLink: "https://maps.app.goo.gl/2jjgBH1rqGhVRXJZ8",
        status: "published",
        sortOrder: 1,
      },
      {
        slug: "beach-club",
        name: "Protels Beach Club & SPA",
        location: "Marsa Alam, Egypt",
        description: {
          en: "Immerse yourself in a vibrant Red Sea getaway at Protels Beach Club & SPA. Designed for the modern traveler, our resort blends relaxation with energy, offering direct access to a private sandy beach and crystal-clear waters. Enjoy a variety of swimming pools, an exciting aquapark, and a full-service wellness center.",
          ar: "انغمس في أجواء البحر الأحمر النابضة بالحياة في بروتلز بيتش كلوب وسبا. صُمم منتجعنا للمسافر العصري، حيث يمزج بين الاسترخاء والطاقة، ويوفر وصولاً مباشراً إلى شاطئ رملي خاص ومياه كريستالية صافية.",
          fr: "Plongez dans une escapade vibrante en mer Rouge au Protels Beach Club & SPA.",
          de: "Tauchen Sie ein in einen lebhaften Kurzurlaub am Roten Meer im Protels Beach Club & SPA.",
          es: "Sumérjase en una vibrante escapada al Mar Rojo en Protels Beach Club & SPA.",
          ru: "Погрузитесь в яркий отдых на Красном море в Protels Beach Club & SPA.",
        },
        features: ["Private Sandy Beach", "Aquapark & Pools", "Spa & Wellness Center", "Family Entertainment", "Beachfront Dining"],
        rooms: ["Standard Pool View Room", "Superior Double or Twin Room with Sea View", "Family Room", "Junior Suite"],
        status: "published",
        sortOrder: 2,
      },
      {
        slug: "la-plage",
        name: "Protels La Plage",
        location: "Zanzibar, Tanzania",
        discount: "15% OFF",
        description: {
          en: "Surrender to the rhythm of the Indian Ocean at Protels La Plage, an intimate sanctuary where African warmth meets barefoot luxury. Nestled on the pristine shores of Zanzibar, our boutique retreat is a celebration of Swahili culture and slow island living.",
          ar: "استسلم لإيقاع المحيط الهندي في بروتلز لا بلاج، ملاذ حميمي يلتقي فيه الدفء الأفريقي بالفخامة البسيطة. يقع منتجعنا البوتيكي على شواطئ زنجبار البكر، وهو احتفال بالثقافة السواحيلية وحياة الجزيرة البطيئة.",
          fr: "Abandonnez-vous au rythme de l'océan Indien au Protels La Plage.",
          de: "Geben Sie sich im Protels La Plage dem Rhythmus des Indischen Ozeans hin.",
          es: "Entréguese al ritmo del Océano Índico en Protels La Plage.",
          ru: "Сдайтесь ритму Индийского океана в Protels La Plage.",
        },
        features: ["White Sand Beach", "Water Sports", "Cultural Tours", "Oceanfront Dining", "Tropical Gardens"],
        rooms: ["Superior Twin Room", "Bungalow", "Family Bungalow"],
        status: "published",
        sortOrder: 3,
      },
      {
        slug: "royal-bay",
        name: "Protels Royal Bay Resort & Spa",
        location: "Hurghada, Egypt",
        description: {
          en: "A majestic resort in the heart of Hurghada. Royal Bay offers grand architecture, extensive pool landscapes, and activities for the whole family.",
          ar: "منتجع مهيب في قلب الغردقة. يقدم رويال باي هندسة معمارية رائعة، ومناظر طبيعية واسعة للمسبح، وأنشطة لجميع أفراد الأسرة.",
          fr: "Un complexe majestueux au cœur d'Hurghada.",
          de: "Ein majestätisches Resort im Herzen von Hurghada.",
          es: "Un majestuoso resort en el corazón de Hurghada.",
          ru: "Величественный курорт в самом сердце Хургады.",
        },
        features: ["Aqua Park", "Private Marina", "Multiple Pools", "Tennis Courts", "Shopping Arcade"],
        rooms: ["Superior Room", "Deluxe Sea View", "Family Connected Room", "Royal Suite"],
        status: "published",
        sortOrder: 4,
      },
    ];

    for (const hotel of hotelsToSeed) {
      await storage.createHotel(hotel);
    }
    console.log(`Seeded ${hotelsToSeed.length} hotels.`);
  }

  const defaultSettings: Record<string, any> = {
    site_name: "PROTELS Hotels & Resorts",
    contact_email: "info@protels.com",
    social_links: {
      facebook: "https://facebook.com/protels",
      instagram: "https://instagram.com/protels",
    },
  };
  let seededSettings = 0;
  for (const [key, value] of Object.entries(defaultSettings)) {
    const existing = await storage.getSetting(key);
    if (!existing) {
      await storage.upsertSetting(key, value);
      seededSettings++;
    }
  }
  if (seededSettings > 0) {
    console.log(`Seeded ${seededSettings} default global settings.`);
  }
}

export async function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}
