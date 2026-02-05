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

// Standard Pool View Room Images (Beach Club)
import standardPoolHero from "@/assets/images/beach-club/standard-pool-view/hero.jpg";
import standardPool1 from "@/assets/images/beach-club/standard-pool-view/gallery-1.jpg";
import standardPool2 from "@/assets/images/beach-club/standard-pool-view/gallery-2.jpg";
import standardPool3 from "@/assets/images/beach-club/standard-pool-view/gallery-3.jpg";
import standardPool4 from "@/assets/images/beach-club/standard-pool-view/gallery-4.jpg";
import standardPool5 from "@/assets/images/beach-club/standard-pool-view/gallery-5.jpg";
import standardPool6 from "@/assets/images/beach-club/standard-pool-view/gallery-6.jpg";

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
      en: "Immerse yourself in a vibrant Red Sea getaway at Protels Beach Club & SPA. Designed for the modern traveler, our resort blends relaxation with energy, offering direct access to a private sandy beach and crystal-clear waters. Enjoy a variety of swimming pools, an exciting aquapark, and a full-service wellness center to recharge your senses. With lively entertainment, diverse dining options, and a welcoming atmosphere, it’s the perfect escape for families, couples, and friends seeking sun, fun, and comfort.",
      ar: "انغمس في أجواء البحر الأحمر النابضة بالحياة في بروتلز بيتش كلوب وسبا. صُمم منتجعنا للمسافر العصري، حيث يمزج بين الاسترخاء والطاقة، ويوفر وصولاً مباشراً إلى شاطئ رملي خاص ومياه كريستالية صافية. استمتع بمجموعة متنوعة من حمامات السباحة، وأكوا بارك مثيرة، ومركز عافية متكامل لتجديد حواسك. مع الترفيه الحيوي، وخيارات الطعام المتنوعة، والجو الترحيبي، إنه الملاذ المثالي للعائلات والأزواج والأصدقاء الباحثين عن الشمس والمرح والراحة."
    },
    features: ["Private Sandy Beach", "Aquapark & Pools", "Spa & Wellness Center", "Family Entertainment", "Beachfront Dining"],
    rooms: ["Standard Pool View Room", "Superior Double or Twin Room with Sea View", "Family Room", "Junior Suite"],
    roomDetails: [
      { 
        name: "Standard Pool View Room",
        size: "30 m²",
        bed: "King or Twin Beds",
        view: "Garden or Pool View",
        amenities: ["Balcony", "Air Conditioning", "Flat Screen TV", "Mini Fridge", "Safe Box", "Private Bathroom"],
        description: "A comfortable and modern Double Room designed for couples or friends. Featuring bright interiors, your choice of a king or twin beds, and a private balcony with relaxing garden or pool views.",
        images: [standardPoolHero, standardPool1, standardPool2, standardPool3, standardPool4, standardPool5, standardPool6]
      },
      { 
        name: "Superior Double or Twin Room with Sea View", 
        size: "35 m²", 
        bed: "King or Twin Beds", 
        view: "Sea View",
        amenities: ["Sea View Balcony", "Air Conditioning", "Flat Screen TV", "Mini Bar", "Coffee/Tea Maker", "Private Bathroom"],
        description: "Enjoy stunning Red Sea views from this spacious Superior Room. Designed with modern beach aesthetics, it offers a private balcony, comfortable bedding, and all essential amenities for a relaxing seaside stay.",
        images: [superior1, superior2, superior3]
      },
      { 
        name: "Family Room", 
        size: "50 m²", 
        bed: "King Bed + 2 Sofa Beds", 
        view: "Pool or Garden View",
        amenities: ["Spacious Balcony", "Separate Living Area", "Air Conditioning", "Flat Screen TV", "Family Bathroom", "Mini Fridge"],
        description: "Perfect for families, this spacious room features a king bed and a comfortable living area with sofa beds. Enjoy ample space, modern amenities, and easy access to the resort’s pools and activities.",
        images: [family1, family2, family3]
      },
      { 
        name: "Junior Suite", 
        size: "65 m²", 
        bed: "King Bed", 
        view: "Sea or Pool View",
        amenities: ["Large Terrace", "Living Area", "Air Conditioning", "Flat Screen TV", "Premium Toiletries", "Coffee Machine"],
        description: "Elevate your stay in our stylish Junior Suite. Offering generous living space, a plush king bed, and a large terrace with beautiful views, it’s the ideal choice for couples seeking extra comfort and luxury.",
        images: [suite1, suite2]
      }
    ]
  },
  {
    id: "la-plage",
    name: "Protels La Plage",
    location: "Zanzibar, Tanzania",
    image: laPlage,
    description: {
      en: "Surrender to the rhythm of the Indian Ocean at Protels La Plage, an intimate sanctuary where African warmth meets barefoot luxury. Nestled on the pristine shores of Zanzibar, our boutique retreat is a celebration of Swahili culture and slow island living. Here, days drift by in harmony with the tides, and the boundaries between nature and comfort dissolve. Designed with local materials and organic textures, every corner whispers of the island's heritage. Whether you're unwinding in a palm-shaded bungalow or savoring spice-infused flavors under the stars, La Plage offers a soulful escape for those seeking deep relaxation and authentic connection.",
      ar: "استسلم لإيقاع المحيط الهندي في بروتلز لا بلاج، ملاذ حميمي يلتقي فيه الدفء الأفريقي بالفخامة البسيطة. يقع منتجعنا البوتيكي على شواطئ زنجبار البكر، وهو احتفال بالثقافة السواحيلية وحياة الجزيرة البطيئة. هنا، تمضي الأيام في انسجام مع المد والجزر، وتذوب الحدود بين الطبيعة والراحة. صمم كل ركن باستخدام مواد محلية وقوام عضوي ليعكس تراث الجزيرة. سواء كنت تسترخي في بنغل مظلل بأشجار النخيل أو تتذوق النكهات الغنية بالتوابل تحت النجوم، يقدم لا بلاج ملاذًا روحيًا لمن يبحثون عن الاسترخاء العميق والاتصال الحقيقي."
    },
    discount: "15% OFF",
    features: ["White Sand Beach", "Water Sports", "Cultural Tours", "Oceanfront Dining", "Tropical Gardens"],
    rooms: ["Superior Twin Room", "Bungalow", "Family Bungalow"],
    roomDetails: [
      {
        name: "Superior Twin Room",
        size: "40 m²",
        bed: "Two Single Beds",
        view: "Garden or Pool View",
        amenities: ["Air Conditioning", "Seating Area", "Soft Lighting", "Modern Amenities", "Wooden Furniture", "Wi-Fi"],
        description: "A bright and spacious Superior Twin Room featuring two comfortable single beds, elegant wooden furniture, and crisp white linens accented with colorful African-inspired textiles. The room offers a calm and welcoming atmosphere with soft lighting, a cozy seating area, air conditioning, and modern amenities. Designed with warm neutral tones and subtle local artwork, it’s ideal for couples or friends seeking comfort and relaxation in a stylish coastal resort setting.",
        images: [
          "/images/la-plage/rooms/superior-twin/room-1.jpg",
          "/images/la-plage/rooms/superior-twin/room-2.jpg",
          "/images/la-plage/rooms/superior-twin/room-3.jpg"
        ]
      },
      {
        name: "Bungalow",
        size: "48 m²",
        bed: "King Bed",
        view: "Garden View",
        amenities: ["Private Terrace", "Outdoor Seating", "Air Conditioning", "Rain Shower", "Coffee Maker", "Garden Access"],
        description: "Nestled in our lush tropical gardens, this standalone bungalow offers privacy and serenity. Featuring natural wood accents and a large terrace perfect for relaxing amidst nature.",
        images: [laPlage4, laPlage5, laPlage1]
      },
      {
        name: "Family Bungalow",
        size: "55 m²",
        bed: "King Bed + 2 Single Beds",
        view: "Garden View",
        amenities: ["Two Sleeping Areas", "Large Terrace", "Family Bathroom", "Air Conditioning", "Mini Fridge", "Easy Beach Access"],
        description: "Ideal for families, this expansive bungalow provides ample space and comfort. Located close to the beach and pool, it offers a peaceful garden setting with separate sleeping areas for privacy.",
        images: [laPlage2, laPlage3, laPlage4]
      }
    ],
    gallery: [
      "/images/la-plage/gallery/gallery-ext_1.jpg",
      "/images/la-plage/gallery/gallery-ext_2.jpg",
      "/images/la-plage/gallery/gallery-ext_3.jpg",
      "/images/la-plage/gallery/gallery-ext_4.jpg",
      "/images/la-plage/gallery/gallery-ext_5.jpg",
      "/images/la-plage/gallery/gallery-ext_6.jpg",
      "/images/la-plage/gallery/gallery-ext_7.jpg",
      "/images/la-plage/gallery/gallery-ext_8.jpg",
      "/images/la-plage/gallery/gallery-ext_9.jpg",
      "/images/la-plage/gallery/gallery-ext_10.jpg",
      "/images/la-plage/gallery/gallery-int_1.jpg",
      "/images/la-plage/gallery/gallery-int_2.jpg",
      "/images/la-plage/gallery/gallery-int_3.jpg",
      "/images/la-plage/gallery/gallery-int_4.jpg",
      "/images/la-plage/gallery/gallery-int_5.jpg",
      "/images/la-plage/gallery/gallery-int_6.jpg",
      "/images/la-plage/gallery/gallery-int_7.jpg",
      "/images/la-plage/gallery/gallery-int_8.jpg",
      "/images/la-plage/gallery/gallery-int_9.jpg",
      "/images/la-plage/gallery/gallery-int_10.jpg"
    ],
    dining: {
      main: {
        name: "La Cabana – Main Restaurant",
        desc: "Savor the essence of the island at La Cabana, where fresh local ingredients meet international culinary artistry. Enjoy an exquisite buffet experience with daily themed dinners in a relaxed, open-air setting that captures the gentle ocean breeze.",
        hours: "Breakfast: 07:00 – 10:00 | Lunch: 12:30 – 14:30 | Dinner: 19:30 – 21:30"
      },
      specialty: [
        { name: "Beach Bar", desc: "Unwind with refreshing cocktails and cold drinks while soaking in direct beachfront views. The perfect spot to watch the dhows sail by. (09:00 AM – 12:00 AM)" },
        { name: "Blu Pool Bar", desc: "A vibrant poolside escape surrounded by palm trees and ocean breeze. Enjoy refreshing cocktails, tropical mocktails, and light snacks in a laid-back African beach setting suitable for sun-soaked relaxation. (10:00 AM – 06:00 PM)" },
        { name: "Jazz Lobby Bar", desc: "A sophisticated indoor retreat inspired by classic jazz vibes. Relax in a warm, elegant setting featuring rich wooden finishes and soft lighting. Offering a curated selection of hot beverages, classic cocktails, and light snacks—ideal for quiet mornings or evening aperitifs. (10:00 AM – 08:00 PM)" },
        { name: "The Lounge", desc: "An open-air sanctuary designed with natural materials and a relaxed African coastal vibe. Sip on refreshing handcrafted cocktails and savor light snacks in a calm, breezy atmosphere. (10:00 AM – 11:00 PM)" }
      ]
    }
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
