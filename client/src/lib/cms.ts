import { useQuery } from "@tanstack/react-query";
import { hotels as staticHotels, type Hotel as StaticHotel, bookingLink as staticBookingLink } from "@/lib/data";

const PLACEHOLDER_IMAGE = "https://placehold.co/800x600/1a2744/c4a97d?text=Hotel";

export function useCMSSetting(key: string) {
  return useQuery({
    queryKey: ["/api/public/settings", key],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/public/settings/${key}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.value;
      } catch {
        return null;
      }
    },
    staleTime: 60000,
    retry: false,
  });
}

export function useCMSAllSettings() {
  return useQuery<Record<string, any>>({
    queryKey: ["/api/public/settings"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/public/settings");
        if (!res.ok) return {};
        return await res.json();
      } catch {
        return {};
      }
    },
    staleTime: 60000,
    retry: false,
  });
}

export function useCMSSeo(path: string) {
  return useQuery({
    queryKey: ["/api/public/seo", path],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/public/seo/${encodeURIComponent(path)}`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    staleTime: 60000,
    retry: false,
  });
}

export function useCMSPage(slug: string) {
  return useQuery({
    queryKey: ["/api/public/pages", slug],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/public/pages/${slug}`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    staleTime: 30000,
    retry: false,
  });
}

export function useCMSHotels() {
  return useQuery<any[] | null>({
    queryKey: ["/api/public/hotels"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/public/hotels");
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    staleTime: 30000,
    retry: false,
  });
}

export function useCMSHotel(slug: string) {
  return useQuery({
    queryKey: ["/api/public/hotels", slug],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/public/hotels/${slug}`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    staleTime: 30000,
    retry: false,
  });
}

function mergeCMSHotel(staticHotel: StaticHotel, cmsHotel: any): StaticHotel {
  return {
    ...staticHotel,
    name: cmsHotel.name || staticHotel.name,
    location: cmsHotel.location || staticHotel.location,
    image: cmsHotel.image || staticHotel.image,
    description: {
      ...staticHotel.description,
      ...(cmsHotel.description || {}),
    },
    features: cmsHotel.features?.length ? cmsHotel.features : staticHotel.features,
    rooms: cmsHotel.rooms?.length ? cmsHotel.rooms : staticHotel.rooms,
    discount: cmsHotel.discount ?? staticHotel.discount,
    dining: cmsHotel.dining || staticHotel.dining,
    roomDetails: cmsHotel.roomDetails?.length ? cmsHotel.roomDetails : staticHotel.roomDetails,
    gallery: cmsHotel.gallery?.length ? cmsHotel.gallery : staticHotel.gallery,
    mapLink: cmsHotel.mapLink || staticHotel.mapLink,
    heroVideo: cmsHotel.heroVideo || staticHotel.heroVideo,
    theme: cmsHotel.theme || staticHotel.theme,
    tabConfig: cmsHotel.tabConfig || staticHotel.tabConfig,
    bookingLink: cmsHotel.bookingLink || staticHotel.bookingLink,
    ratings: cmsHotel.ratings || staticHotel.ratings,
  };
}

export function useMergedHotels(): { hotels: StaticHotel[]; isLoading: boolean } {
  const { data: cmsHotels, isLoading } = useCMSHotels();

  if (!cmsHotels || cmsHotels.length === 0) {
    return { hotels: staticHotels, isLoading };
  }

  const merged = staticHotels.map((staticHotel) => {
    const cmsMatch = cmsHotels.find((ch: any) => ch.slug === staticHotel.id);
    if (cmsMatch) {
      return mergeCMSHotel(staticHotel, cmsMatch);
    }
    return staticHotel;
  });

  const newCMSHotels = cmsHotels
    .filter((ch: any) => !staticHotels.find((sh) => sh.id === ch.slug))
    .map((ch: any): StaticHotel => ({
      id: ch.slug,
      name: ch.name || "New Hotel",
      location: ch.location || "",
      image: ch.image || PLACEHOLDER_IMAGE,
      description: ch.description || { en: "", ar: "" },
      features: ch.features || [],
      rooms: ch.rooms || [],
      discount: ch.discount,
      dining: ch.dining,
      roomDetails: ch.roomDetails || [],
      gallery: ch.gallery || [],
      mapLink: ch.mapLink,
      bookingLink: ch.bookingLink,
      ratings: ch.ratings,
    }));

  return { hotels: [...merged, ...newCMSHotels], isLoading };
}

export function useCMSMedia() {
  return useQuery<any[] | null>({
    queryKey: ["/api/public/media"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/public/media");
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    staleTime: 30000,
    retry: false,
  });
}

export function useMergedHotel(hotelId: string): { hotel: StaticHotel | null; isLoading: boolean } {
  const { data: cmsHotel, isLoading } = useCMSHotel(hotelId);
  const staticHotel = staticHotels.find((h) => h.id === hotelId);

  if (cmsHotel && staticHotel) {
    return { hotel: mergeCMSHotel(staticHotel, cmsHotel), isLoading };
  }

  if (cmsHotel && !staticHotel) {
    return {
      hotel: {
        id: cmsHotel.slug,
        name: cmsHotel.name || "New Hotel",
        location: cmsHotel.location || "",
        image: cmsHotel.image || PLACEHOLDER_IMAGE,
        description: cmsHotel.description || { en: "", ar: "" },
        features: cmsHotel.features || [],
        rooms: cmsHotel.rooms || [],
        discount: cmsHotel.discount,
        dining: cmsHotel.dining,
        roomDetails: cmsHotel.roomDetails || [],
        gallery: cmsHotel.gallery || [],
        mapLink: cmsHotel.mapLink,
        heroVideo: cmsHotel.heroVideo,
        theme: cmsHotel.theme,
        tabConfig: cmsHotel.tabConfig,
        bookingLink: cmsHotel.bookingLink,
        ratings: cmsHotel.ratings,
      },
      isLoading,
    };
  }

  return { hotel: staticHotel || null, isLoading };
}

export function useBookingLink(): string {
  const { data: settings } = useCMSAllSettings();
  return settings?.booking_link || staticBookingLink;
}

export function useHeaderLogo(): string | null {
  const { data: settings } = useCMSAllSettings();
  return settings?.header_logo || null;
}

export function useHeroContent(language: string) {
  const { data: settings } = useCMSAllSettings();

  const heroTitle = settings?.hero_title?.[language] || settings?.hero_title?.en || null;
  const heroSubtitle = settings?.hero_subtitle?.[language] || settings?.hero_subtitle?.en || null;
  const heroImages: string[] = settings?.hero_images?.length ? settings.hero_images : [];
  const heroVideo: string | null = settings?.hero_video || null;

  return { heroTitle, heroSubtitle, heroImages, heroVideo };
}

export function usePageHeroImage(pageKey: string, fallback: string): string {
  const { data: settings } = useCMSAllSettings();
  const settingKey = `page_hero_${pageKey}`;
  const value = settings?.[settingKey];
  if (typeof value === "string" && value) return value;
  return fallback;
}

export function useRoyalBayVideo(language: string) {
  const { data: settings } = useCMSAllSettings();
  
  const videoUrl = settings?.royal_bay_video_url || "";
  const title = settings?.royal_bay_video_title?.[language] || settings?.royal_bay_video_title?.en || "";
  const description = settings?.royal_bay_video_description?.[language] || settings?.royal_bay_video_description?.en || "";
  const visible = settings?.royal_bay_video_visible !== false;

  return { videoUrl, title, description, visible };
}

export function useFooterContent(language: string) {
  const { data: settings } = useCMSAllSettings();

  return {
    address: settings?.contact_address || "Marsa Alam, Red Sea, Egypt",
    phone: settings?.contact_phone || "+20 123 456 7890",
    email: settings?.contact_email || "info@protels.com",
    socialLinks: settings?.social_links || {},
    description: settings?.footer_description?.[language] || settings?.footer_description?.en || "",
    siteName: settings?.site_name || "PROTELS Hotels & Resorts",
  };
}
