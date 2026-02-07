import { useQuery } from "@tanstack/react-query";
import { hotels as staticHotels, type Hotel as StaticHotel } from "@/lib/data";

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
      },
      isLoading,
    };
  }

  return { hotel: staticHotel || null, isLoading };
}
