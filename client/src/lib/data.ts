import crystalBeach from "@assets/Protels_Crystal_Beach_Resort_1770196464483.png";
import beachClub from "@assets/DSC05597.png11_1770196278235.png";
import laPlage from "@assets/22_1770196761222.png";
import royalBay from "@assets/WhatsApp_Image_2025-12-22_at_12.58.16_PM_(1)_1770197117342.jpeg";

// Gallery Images for La Plage
import laPlage1 from "@/assets/images/la-plage-1.jpg";
import laPlage2 from "@/assets/images/la-plage-2.jpg";
import laPlage3 from "@/assets/images/la-plage-3.jpg";
import laPlage4 from "@/assets/images/la-plage-4.jpg";
import laPlage5 from "@/assets/images/la-plage-5.jpg";

export interface Hotel {
  id: string;
  name: string;
  location: string;
  image: string;
  description: {
    en: string;
    ar: string;
  };
  features: string[];
  rooms: string[];
  discount?: string;
  dining?: {
    main?: { name: string; desc: string; hours: string };
    specialty?: { name: string; desc: string }[];
    bars?: string[];
  };
  roomDetails?: { name: string; features?: string[] }[];
  gallery?: string[];
  mapLink?: string;
}

export const hotels: Hotel[] = [
  {
    id: "crystal-beach",
    name: "Protels Crystal Beach Resort",
    location: "Marsa Alam – Egypt",
    mapLink: "https://maps.app.goo.gl/2jjgBH1rqGhVRXJZ8",
    image: crystalBeach,
    description: {
      en: "A stunning all-inclusive beachfront resort located on the Red Sea, offering crystal clear waters, vibrant coral reefs, and a relaxing atmosphere ideal for families and couples. Perfect for snorkeling, diving, and unforgettable seaside moments.",
      ar: "منتجع شاطئي مذهل شامل كليًا يقع على البحر الأحمر، ويوفر مياهًا صافية وشعابًا مرجانية نابضة بالحياة وأجواء مريحة مثالية للعائلات والأزواج. مثالية للغطس والغوص ولحظات لا تنسى على شاطئ البحر."
    },
    features: [
      "Private Sandy Beach",
      "Swimming Pools",
      "Diving Center & Snorkeling",
      "Spa & Wellness Area",
      "Kids Club",
      "Animation & Entertainment",
      "24/7 Front Desk",
      "Free Wi-Fi in Public Areas"
    ],
    rooms: ["Standard Room", "Sea View Room", "Family Suite", "Royal Suite"],
    roomDetails: [
      { name: "Standard Room" },
      { name: "Sea View Room" },
      { name: "Family Suite" },
      { name: "Royal Suite" }
    ],
    dining: {
      main: {
        name: "Main Restaurant",
        desc: "Guests enjoy an all-inclusive dining experience with a variety of international and oriental cuisines.",
        hours: "Breakfast: 07:00 – 10:00 | Lunch: 13:00 – 15:00 | Dinner: 19:00 – 22:00"
      },
      specialty: [
        { name: "Oriental Restaurant", desc: "Authentic oriental flavors." },
        { name: "Italian Restaurant", desc: "Pizza – Pasta – Classic Italian Dishes." }
      ],
      bars: ["Beach Bar", "Pool Bar"]
    }
  },
  {
    id: "beach-club",
    name: "Protels Beach Club & SPA",
    location: "Marsa Alam, Egypt",
    mapLink: "https://maps.app.goo.gl/1tX2JCjLMdb5m7Ey8",
    image: beachClub,
    description: {
      en: "An exclusive beach club atmosphere with luxurious spa facilities. Enjoy the perfect blend of entertainment and tranquility on the shores of the Red Sea.",
      ar: "جو نادي شاطئي حصري مع مرافق سبا فاخرة. استمتع بالمزيج المثالي من الترفيه والهدوء على شواطئ البحر الأحمر."
    },
    features: ["Infinity Pool", "Luxury Spa", "Nightly Entertainment", "Gourmet Restaurants", "Fitness Center"],
    rooms: ["Club Room", "Pool View Suite", "Beachfront Bungalow"]
  },
  {
    id: "la-plage",
    name: "Protels La Plage",
    location: "Zanzibar, Tanzania",
    mapLink: "https://maps.app.goo.gl/FV9hhKBY7WkUcfCG9",
    image: laPlage,
    description: {
      en: "Experience the exotic charm of Zanzibar at Protels La Plage. White sandy beaches, turquoise waters, and traditional Swahili hospitality await you.",
      ar: "جرب السحر الاستوائي لزنجبار في بروتلز لا بلاج. شواطئ رملية بيضاء، مياه فيروزية، وضيافة سواحيلية تقليدية بانتظارك."
    },
    discount: "15% OFF",
    features: ["White Sand Beach", "Water Sports", "Cultural Tours", "Oceanfront Dining", "Tropical Gardens"],
    rooms: ["Garden Villa", "Ocean View Suite", "Presidential Villa"],
    gallery: [laPlage, laPlage1, laPlage2, laPlage3, laPlage4, laPlage5]
  },
  {
    id: "royal-bay",
    name: "Protels Royal Bay Resort & Spa",
    location: "Hurghada, Egypt",
    image: royalBay,
    description: {
      en: "A majestic resort in the heart of Hurghada. Royal Bay offers grand architecture, extensive pool landscapes, and activities for the whole family.",
      ar: "منتجع مهيب في قلب الغردقة. يقدم رويال باي هندسة معمارية رائعة، ومناظر طبيعية واسعة للمسبح، وأنشطة لجميع أفراد الأسرة."
    },
    features: ["Aqua Park", "Private Marina", "Multiple Pools", "Tennis Courts", "Shopping Arcade"],
    rooms: ["Superior Room", "Deluxe Sea View", "Family Connected Room", "Royal Suite"]
  }
];

export const bookingLink = "https://protels.book-onlinenow.net/index.aspx?Page=22&portal=259";
