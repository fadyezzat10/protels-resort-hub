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

// Standard Room Images
import standard1 from "@/assets/images/standard-1.jpg";
import standard2 from "@/assets/images/standard-2.jpg";
import standard3 from "@/assets/images/standard-3.jpg";
import standard4 from "@/assets/images/standard-4.jpg";
import standard5 from "@/assets/images/standard-5.jpg";
import standard6 from "@/assets/images/standard-6.jpg";

// Suite Images
import suite1 from "@/assets/images/suite-1.jpg";
import suite2 from "@/assets/images/suite-2.jpg";
import suite3 from "@/assets/images/suite-3.jpg";
import suite4 from "@/assets/images/suite-4.jpg";
import suite5 from "@/assets/images/suite-5.jpg";
import suite6 from "@/assets/images/suite-6.jpg";

// Superior Room Images
import superior1 from "@/assets/images/superior-1.jpg";
import superior2 from "@/assets/images/superior-2.jpg";
import superior3 from "@/assets/images/superior-3.jpg";
import superior4 from "@/assets/images/superior-4.jpg";
import superior5 from "@/assets/images/superior-5.jpg";

// Family Room Images
import family1 from "@/assets/images/family-room-1.jpg";
import family2 from "@/assets/images/family-room-2.jpg";
import family3 from "@/assets/images/family-room-3.jpg";
import family4 from "@/assets/images/family-room-4.jpg";
import family5 from "@/assets/images/family-room-5.jpg";
import family6 from "@/assets/images/family-room-6.jpg";
import family7 from "@/assets/images/family-room-7.jpg";

export interface RoomDetail {
  name: string;
  size?: string;
  bed?: string;
  view?: string;
  amenities?: string[];
  description?: string;
  features?: string[];
  images?: string[];
}

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
  roomDetails?: RoomDetail[];
  gallery?: string[];
  mapLink?: string;
}

export const hotels: Hotel[] = [
  {
    id: "crystal-beach",
    name: "Protels Crystal Beach Resort",
    location: "Marsa Alam, Egypt",
    mapLink: "https://maps.app.goo.gl/2jjgBH1rqGhVRXJZ8",
    image: crystalBeach,
    description: {
      en: "Discover a sanctuary of luxury on the shores of the Red Sea. Protels Crystal Beach Resort offers an exclusive all-inclusive experience where pristine waters meet exceptional service. Whether you seek vibrant coral reef exploration or tranquil relaxation by our infinity pools, our resort provides the perfect setting for unforgettable memories. Ideal for families and couples alike, we combine modern comfort with the natural beauty of Marsa Alam.",
      ar: "اكتشف ملاذًا من الفخامة على شواطئ البحر الأحمر. يقدم منتجع بروتلز كريستال بيتش تجربة حصرية شاملة كليًا حيث تلتقي المياه النقية بالخدمة الاستثنائية. سواء كنت تبحث عن استكشاف الشعاب المرجانية النابضة بالحياة أو الاسترخاء الهادئ بجانب حمامات السباحة اللامتناهية، يوفر منتجعنا المكان المثالي لذكريات لا تُنسى. مثالي للعائلات والأزواج على حد سواء، نجمع بين الراحة العصرية والجمال الطبيعي لمرسى علم."
    },
    features: [
      "Private Sandy Beach",
      "Multiple Swimming Pools",
      "PADI Diving Center",
      "Luxury Spa & Wellness",
      "Kids Club & Activities",
      "Day & Night Entertainment",
      "24-Hour Concierge",
      "High-Speed Wi-Fi"
    ],
    rooms: ["Standard Room", "Superior Room", "Family Room", "Suite"],
    roomDetails: [
      { 
        name: "Standard Room",
        size: "25 m²",
        bed: "Twin or King Bed",
        view: "Garden View",
        amenities: ["Balcony", "Terrace", "Air Conditioning", "Flat Screen TV", "Free Wi-Fi", "Electric Kettle", "Wardrobe", "Non-Smoking", "Bathtub", "Shower", "Private Bathroom"],
        description: "A charming and comfortable Standard Room designed for a relaxing stay, featuring unique architectural details and warm tones. The room offers a private balcony or terrace with garden views, ensuring a peaceful atmosphere. Guests enjoy modern amenities including air conditioning, a flat-screen TV, and a well-appointed private bathroom, making it an ideal choice for a memorable coastal retreat.",
        images: [standard5, standard6, standard1, standard4, standard3, standard2]
      },
      { 
        name: "Superior Room", 
        size: "30 m²", 
        bed: "Twin Beds", 
        view: "Sea View",
        amenities: ["Balcony", "Air Conditioning", "Flat Screen TV", "Private Bathroom", "Natural Sunlight", "Modern Furniture", "Free Wi-Fi", "Electric Kettle", "Wardrobe", "Non-Smoking", "Shower"],
        description: "A bright and elegant Superior Room featuring twin beds, modern furnishings, and a private balcony overlooking the beautiful Red Sea. Designed with natural light and calming blue tones, the room offers comfort, space, and a relaxing atmosphere ideal for both couples and families.",
        images: [superior1, superior2, superior4, superior3, superior5]
      },
      { 
        name: "Family Room", 
        size: "45 m²", 
        bed: "King + 2 Twin", 
        view: "Pool View",
        amenities: ["Balcony", "Terrace", "Air Conditioning", "Flat Screen TV", "Free Wi-Fi", "Electric Kettle", "Wardrobe", "Non-Smoking", "Bathtub", "Shower", "Private Bathroom"],
        description: "A spacious and comfortable family room designed for relaxation and convenience. Featuring modern furnishings, natural daylight, and a private balcony or terrace with garden or partial sea views. The room includes air conditioning, a flat-screen TV, and a private bathroom with premium amenities. Ideal for families seeking comfort, space, and a peaceful coastal atmosphere near the beach.",
        images: [family1, family2, family3, family4, family5, family6, family7]
      },
      { 
        name: "Suite", 
        size: "60 m²", 
        bed: "King Bed", 
        view: "Panoramic Sea View",
        amenities: ["Balcony", "Terrace", "Air Conditioning", "Flat Screen TV", "Free Wi-Fi", "Electric Kettle", "Wardrobe", "Non-Smoking", "Bathtub", "Shower"],
        description: "Spacious luxury suite designed for ultimate comfort and relaxation. Featuring modern furniture, natural light, elegant décor, and a private balcony with stunning panoramic sea views. Ideal for couples and families seeking a premium seaside experience.",
        images: [suite1, suite2, suite3, suite4, suite5, suite6]
      }
    ],
    dining: {
      main: {
        name: "The Grand Buffet",
        desc: "Indulge in a culinary journey with our extensive international buffet. Featuring live cooking stations, fresh local ingredients, and themed dinner nights, The Grand Buffet offers a sophisticated dining experience for breakfast, lunch, and dinner.",
        hours: "Breakfast: 07:00 – 10:30 | Lunch: 13:00 – 15:00 | Dinner: 18:30 – 22:00"
      },
      specialty: [
        { name: "Al Diwan Oriental", desc: "Experience the authentic tastes of the Middle East with traditional mezzes, grilled meats, and aromatic tagines in an elegant setting." },
        { name: "La Trattoria", desc: "A taste of Italy by the sea. Enjoy handcrafted pastas, wood-fired pizzas, and a selection of fine wines in a romantic atmosphere." }
      ],
      bars: ["Sunset Beach Bar", "Azure Pool Bar", "Lobby Lounge"]
    }
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
