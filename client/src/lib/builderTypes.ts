export type SectionType =
  | "hero"
  | "text_block"
  | "image_text"
  | "gallery"
  | "rooms"
  | "cta"
  | "testimonials"
  | "contact"
  | "custom";

export interface SectionStyles {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOverlay?: number;
  backgroundGradient?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginTop?: string;
  marginBottom?: string;
  maxWidth?: string;
  textAlign?: string;
  borderRadius?: string;
}

export interface BuilderSection {
  id: string;
  type: SectionType;
  label: string;
  hidden: boolean;
  content: Record<string, any>;
  styles: SectionStyles;
}

export interface BuilderData {
  sections: BuilderSection[];
}

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: "Hero Section",
  text_block: "Text Block",
  image_text: "Image + Text",
  gallery: "Gallery",
  rooms: "Rooms Section",
  cta: "Call to Action",
  testimonials: "Testimonials",
  contact: "Contact Section",
  custom: "Custom Section",
};

export const SECTION_TYPE_ICONS: Record<SectionType, string> = {
  hero: "🏠",
  text_block: "📝",
  image_text: "🖼️",
  gallery: "📸",
  rooms: "🛏️",
  cta: "📢",
  testimonials: "💬",
  contact: "📧",
  custom: "⚙️",
};

function uid(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function createDefaultSection(type: SectionType): BuilderSection {
  const base: BuilderSection = {
    id: uid(),
    type,
    label: SECTION_TYPE_LABELS[type],
    hidden: false,
    content: {},
    styles: {
      paddingTop: "60px",
      paddingBottom: "60px",
      backgroundColor: "#ffffff",
    },
  };

  switch (type) {
    case "hero":
      base.content = {
        title: "Welcome to Our Resort",
        subtitle: "Experience luxury at its finest",
        buttonText: "Book Now",
        buttonLink: "#",
        backgroundImage: "",
      };
      base.styles = {
        paddingTop: "120px",
        paddingBottom: "80px",
        backgroundColor: "#0c1c2c",
        backgroundOverlay: 0.3,
        textAlign: "center",
      };
      break;
    case "text_block":
      base.content = {
        heading: "About Us",
        body: "Enter your content here. This section is perfect for sharing information about your hotel, services, or any topic.",
        alignment: "center",
      };
      break;
    case "image_text":
      base.content = {
        heading: "Discover More",
        body: "Describe what makes this special.",
        image: "",
        imagePosition: "left",
        imageAlt: "",
        imageBorderRadius: "8px",
      };
      break;
    case "gallery":
      base.content = {
        heading: "Our Gallery",
        images: [],
        columns: 3,
      };
      break;
    case "rooms":
      base.content = {
        heading: "Our Rooms",
        rooms: [
          { name: "Standard Room", description: "Comfortable and elegant", image: "", price: "" },
        ],
      };
      break;
    case "cta":
      base.content = {
        heading: "Ready to Book?",
        body: "Don't miss our special offers",
        buttonText: "Reserve Now",
        buttonLink: "#",
      };
      base.styles.backgroundColor = "#0c1c2c";
      base.styles.textAlign = "center";
      break;
    case "testimonials":
      base.content = {
        heading: "Guest Reviews",
        testimonials: [
          { name: "Guest Name", text: "Amazing experience!", rating: 5 },
        ],
      };
      break;
    case "contact":
      base.content = {
        heading: "Contact Us",
        email: "info@protels.com",
        phone: "+20 123 456 7890",
        address: "Marsa Alam, Egypt",
        showForm: true,
      };
      break;
    case "custom":
      base.content = {
        heading: "Custom Section",
        body: "Add your custom content here.",
      };
      break;
  }

  return base;
}

export const FONT_FAMILIES = [
  "inherit",
  "Cormorant Garamond",
  "Playfair Display",
  "Montserrat",
  "Georgia",
  "Times New Roman",
  "Arial",
  "Helvetica",
];

export const FONT_WEIGHTS = ["300", "400", "500", "600", "700", "800", "900"];

export const TEXT_ALIGNMENTS = ["left", "center", "right"];
