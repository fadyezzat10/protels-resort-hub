import { db } from "./db";
import { hotels } from "@shared/schema";
import { eq } from "drizzle-orm";

const laPlageGallery = Array.from({ length: 60 }, (_, i) => {
  const num = i + 1;
  if (num <= 30) return `/images/la-plage/gallery/gallery-new-${num}.png`;
  if (num >= 31 && num <= 36) return `/images/la-plage/gallery/gallery-new-${num}.jpg`;
  if (num >= 37 && num <= 43) return `/images/la-plage/gallery/gallery-new-${num}.png`;
  if (num >= 44 && num <= 59) return `/images/la-plage/gallery/gallery-new-${num}.jpg`;
  return `/images/la-plage/gallery/gallery-new-${num}.png`;
});

const hotelMigrationData: Record<string, { image: string; roomDetails?: any[]; dining?: any; gallery?: string[] }> = {
  "crystal-beach": {
    image: "/images/hotel-crystal-beach-hero.png",
    roomDetails: [
      { name: "Standard Room", size: "25 m²", bed: "Twin or King Bed", view: "Garden View", amenities: ["Balcony", "Terrace", "Air Conditioning", "Flat Screen TV", "Free Wi-Fi", "Electric Kettle", "Wardrobe", "Non-Smoking", "Bathtub", "Shower", "Private Bathroom"], description: "A charming and comfortable Standard Room designed for a relaxing stay, featuring unique architectural details and warm tones. The room offers a private balcony or terrace with garden views, ensuring a peaceful atmosphere.", images: ["/images/crystal-beach/rooms/standard/standard-5.jpg", "/images/crystal-beach/rooms/standard/standard-6.jpg", "/images/crystal-beach/rooms/standard/standard-1.jpg", "/images/crystal-beach/rooms/standard/standard-4.jpg", "/images/crystal-beach/rooms/standard/standard-3.jpg", "/images/crystal-beach/rooms/standard/standard-2.jpg"] },
      { name: "Superior Room", size: "30 m²", bed: "Twin Beds", view: "Sea View", amenities: ["Balcony", "Air Conditioning", "Flat Screen TV", "Private Bathroom", "Natural Sunlight", "Modern Furniture", "Free Wi-Fi", "Electric Kettle", "Wardrobe", "Non-Smoking", "Shower"], description: "A bright and elegant Superior Room featuring twin beds, modern furnishings, and a private balcony overlooking the beautiful Red Sea.", images: ["/images/crystal-beach/rooms/superior/superior-1.jpg", "/images/crystal-beach/rooms/superior/superior-2.jpg", "/images/crystal-beach/rooms/superior/superior-4.jpg", "/images/crystal-beach/rooms/superior/superior-3.jpg", "/images/crystal-beach/rooms/superior/superior-5.jpg"] },
      { name: "Family Room", size: "45 m²", bed: "King + 2 Twin", view: "Pool View", amenities: ["Balcony", "Terrace", "Air Conditioning", "Flat Screen TV", "Free Wi-Fi", "Electric Kettle", "Wardrobe", "Non-Smoking", "Bathtub", "Shower", "Private Bathroom"], description: "A spacious and comfortable family room designed for relaxation and convenience. Featuring modern furnishings, natural daylight, and a private balcony or terrace.", images: ["/images/crystal-beach/rooms/family/family-room-1.jpg", "/images/crystal-beach/rooms/family/family-room-2.jpg", "/images/crystal-beach/rooms/family/family-room-3.jpg", "/images/crystal-beach/rooms/family/family-room-4.jpg", "/images/crystal-beach/rooms/family/family-room-5.jpg", "/images/crystal-beach/rooms/family/family-room-6.jpg", "/images/crystal-beach/rooms/family/family-room-7.jpg"] },
      { name: "Suite", size: "60 m²", bed: "King Bed", view: "Panoramic Sea View", amenities: ["Balcony", "Terrace", "Air Conditioning", "Flat Screen TV", "Free Wi-Fi", "Electric Kettle", "Wardrobe", "Non-Smoking", "Bathtub", "Shower"], description: "Spacious luxury suite designed for ultimate comfort and relaxation. Featuring modern furniture, natural light, elegant décor, and a private balcony with stunning panoramic sea views.", images: ["/images/crystal-beach/rooms/suite/suite-1.jpg", "/images/crystal-beach/rooms/suite/suite-2.jpg", "/images/crystal-beach/rooms/suite/suite-3.jpg", "/images/crystal-beach/rooms/suite/suite-4.jpg", "/images/crystal-beach/rooms/suite/suite-5.jpg", "/images/crystal-beach/rooms/suite/suite-6.jpg"] }
    ],
    dining: {
      main: { name: "The Grand Buffet", desc: "Indulge in a culinary journey with our extensive international buffet. Featuring live cooking stations, fresh local ingredients, and themed dinner nights.", hours: "Breakfast: 07:00 – 10:30 | Lunch: 13:00 – 15:00 | Dinner: 18:30 – 22:00" },
      specialty: [
        { name: "Al Diwan Oriental", desc: "Experience the authentic tastes of the Middle East with traditional mezzes, grilled meats, and aromatic tagines." },
        { name: "La Trattoria", desc: "A taste of Italy by the sea. Enjoy handcrafted pastas, wood-fired pizzas, and fine wines." }
      ],
      bars: ["Sunset Beach Bar", "Azure Pool Bar", "Lobby Lounge"]
    }
  },
  "beach-club": {
    image: "/images/hotel-beach-club-hero.png",
    roomDetails: [
      { name: "Standard Pool View Room", size: "30 m²", bed: "King or Twin Beds", view: "Garden or Pool View", amenities: ["Balcony", "Air Conditioning", "Flat Screen TV", "Mini Fridge", "Safe Box", "Private Bathroom"], description: "A comfortable and modern Double Room designed for couples or friends. Featuring bright interiors and a private balcony with relaxing garden or pool views.", images: ["/images/beach-club/rooms/standard-pool/hero.jpg", "/images/beach-club/rooms/standard-pool/gallery-1.jpg", "/images/beach-club/rooms/standard-pool/gallery-2.jpg", "/images/beach-club/rooms/standard-pool/gallery-3.jpg", "/images/beach-club/rooms/standard-pool/gallery-4.jpg", "/images/beach-club/rooms/standard-pool/gallery-5.jpg", "/images/beach-club/rooms/standard-pool/gallery-6.jpg"] },
      { name: "Superior Double or Twin Room with Sea View", size: "35 m²", bed: "King or Twin Beds", view: "Sea View", amenities: ["Sea View Balcony", "Air Conditioning", "Flat Screen TV", "Mini Bar", "Coffee/Tea Maker", "Private Bathroom"], description: "Enjoy stunning Red Sea views from this spacious Superior Room.", images: ["/images/beach-club/rooms/superior/superior-1.jpg", "/images/beach-club/rooms/superior/superior-2.jpg", "/images/beach-club/rooms/superior/superior-3.jpg"] },
      { name: "Family Room", size: "50 m²", bed: "King Bed + 2 Sofa Beds", view: "Pool or Garden View", amenities: ["Spacious Balcony", "Separate Living Area", "Air Conditioning", "Flat Screen TV", "Family Bathroom", "Mini Fridge"], description: "Perfect for families, this spacious room features a king bed and a comfortable living area with sofa beds.", images: ["/images/beach-club/rooms/family/family-room-1.jpg", "/images/beach-club/rooms/family/family-room-2.jpg", "/images/beach-club/rooms/family/family-room-3.jpg"] },
      { name: "Junior Suite", size: "65 m²", bed: "King Bed", view: "Sea or Pool View", amenities: ["Large Terrace", "Living Area", "Air Conditioning", "Flat Screen TV", "Premium Toiletries", "Coffee Machine"], description: "Elevate your stay in our stylish Junior Suite with generous living space and a large terrace.", images: ["/images/beach-club/rooms/suite/suite-1.jpg", "/images/beach-club/rooms/suite/suite-2.jpg"] }
    ]
  },
  "la-plage": {
    image: "/images/hotel-la-plage-hero.png",
    roomDetails: [
      { name: "Superior Twin Room", size: "40 m²", bed: "Two Single Beds", view: "Garden or Pool View", amenities: ["Air Conditioning", "Seating Area", "Soft Lighting", "Modern Amenities", "Wooden Furniture", "Wi-Fi"], description: "A bright and spacious Superior Twin Room featuring two comfortable single beds, elegant wooden furniture, and crisp white linens.", images: ["/images/la-plage/rooms/superior-twin/room-1.jpg", "/images/la-plage/rooms/superior-twin/room-2.jpg", "/images/la-plage/rooms/superior-twin/room-3.jpg"] },
      { name: "Bungalow", size: "48 m²", bed: "King Bed", view: "Garden View", amenities: ["Private Terrace", "Outdoor Seating", "Air Conditioning", "Rain Shower", "Coffee Maker", "Garden Access"], description: "Nestled in our lush tropical gardens, this standalone bungalow offers privacy and serenity.", images: ["/images/la-plage/rooms/bungalow/room-detail-1.png"] },
      { name: "Family Bungalow", size: "55 m²", bed: "King Bed", view: "Garden or Resort View", amenities: ["King-size bed", "Air Conditioning", "Wardrobe", "Safe Box", "Mini Fridge", "Spacious Layout", "African-inspired Design"], description: "A spacious and welcoming Family Bungalow, designed for families seeking comfort and privacy.", images: ["/images/la-plage/rooms/family-bungalow/room-detail-1.png", "/images/la-plage/rooms/family-bungalow/room-detail-2.png"] }
    ],
    dining: {
      main: { name: "La Cabana – Main Restaurant", desc: "Savor the essence of the island at La Cabana, where fresh local ingredients meet international culinary artistry.", hours: "Breakfast: 07:00 – 10:00 | Lunch: 12:30 – 14:30 | Dinner: 19:30 – 21:30" },
      specialty: [
        { name: "Beach Bar", desc: "Unwind with refreshing cocktails and cold drinks while soaking in direct beachfront views. (09:00 AM – 12:00 AM)" },
        { name: "Blu Pool Bar", desc: "A vibrant poolside escape with refreshing cocktails and tropical mocktails. (10:00 AM – 06:00 PM)" },
        { name: "Jazz Lobby Bar", desc: "A sophisticated indoor retreat with classic cocktails and light snacks. (10:00 AM – 08:00 PM)" },
        { name: "The Lounge", desc: "An open-air sanctuary with handcrafted cocktails in a calm, breezy atmosphere. (10:00 AM – 11:00 PM)" }
      ]
    },
    gallery: laPlageGallery
  },
  "royal-bay": {
    image: "/images/hotel-royal-bay-hero.jpeg"
  }
};

export async function migrateHotelData() {
  console.log("[migrate] Starting hotel data migration...");

  for (const [slug, data] of Object.entries(hotelMigrationData)) {
    const [existing] = await db.select().from(hotels).where(eq(hotels.slug, slug));
    if (!existing) {
      console.log(`[migrate] Hotel '${slug}' not found in database, skipping.`);
      continue;
    }

    const updates: Record<string, any> = {};

    if (!existing.image && data.image) {
      updates.image = data.image;
    }

    if ((!existing.roomDetails || (Array.isArray(existing.roomDetails) && existing.roomDetails.length === 0)) && data.roomDetails) {
      updates.roomDetails = data.roomDetails;
    }

    if (!existing.dining && data.dining) {
      updates.dining = data.dining;
    }

    if ((!existing.gallery || (Array.isArray(existing.gallery) && existing.gallery.length === 0)) && data.gallery) {
      updates.gallery = data.gallery;
    }

    if (Object.keys(updates).length > 0) {
      await db.update(hotels).set(updates).where(eq(hotels.slug, slug));
      console.log(`[migrate] Updated '${slug}' with: ${Object.keys(updates).join(", ")}`);
    } else {
      console.log(`[migrate] Hotel '${slug}' already has all data, skipping.`);
    }
  }

  console.log("[migrate] Hotel data migration complete.");
}
