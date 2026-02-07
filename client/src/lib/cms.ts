import { useQuery } from "@tanstack/react-query";

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
  return useQuery({
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
