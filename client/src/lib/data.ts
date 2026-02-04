import crystalBeach from "@/assets/images/hotel-crystal-beach.jpg";
import beachClub from "@/assets/images/hotel-beach-club.jpg";
import laPlage from "@/assets/images/hotel-la-plage.jpg";
import royalBay from "@/assets/images/hotel-royal-bay.jpg";

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
}

export const hotels: Hotel[] = [
  {
    id: "crystal-beach",
    name: "Protels Crystal Beach Resort",
    location: "Marsa Alam, Egypt",
    image: crystalBeach,
    description: {
      en: "A stunning beachfront resort in Marsa Alam offering crystal clear waters, vibrant coral reefs, and world-class diving experiences. Perfect for relaxation and underwater adventures.",
      ar: "منتجع شاطئي مذهل في مرسى علم يوفر مياه نقية كريستالية، شعاب مرجانية نابضة بالحياة، وتجارب غوص عالمية المستوى. مثالي للاسترخاء والمغامرات تحت الماء."
    },
    features: ["Private Beach", "Diving Center", "Spa & Wellness", "Kids Club", "All-Inclusive Dining"],
    rooms: ["Standard Room", "Sea View Room", "Family Suite", "Royal Suite"]
  },
  {
    id: "beach-club",
    name: "Protels Beach Club & SPA",
    location: "Marsa Alam, Egypt",
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
    image: laPlage,
    description: {
      en: "Experience the exotic charm of Zanzibar at Protels La Plage. White sandy beaches, turquoise waters, and traditional Swahili hospitality await you.",
      ar: "جرب السحر الاستوائي لزنجبار في بروتلز لا بلاج. شواطئ رملية بيضاء، مياه فيروزية، وضيافة سواحيلية تقليدية بانتظارك."
    },
    features: ["White Sand Beach", "Water Sports", "Cultural Tours", "Oceanfront Dining", "Tropical Gardens"],
    rooms: ["Garden Villa", "Ocean View Suite", "Presidential Villa"]
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
