import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { fetchHomeData } from "@/lib/cms";

interface ThemeData {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  headingFont?: string;
  bodyFont?: string;
  logoMaxWidth?: number;
  logoMaxHeight?: number;
}

const SELF_HOSTED_FONTS: Record<string, { heading: string; body: string }> = {
  "Cormorant Garamond": { heading: "'Cormorant Garamond', serif", body: "'Montserrat', sans-serif" },
  "Montserrat": { heading: "'Cormorant Garamond', serif", body: "'Montserrat', sans-serif" },
  "Cairo": { heading: "'Cairo', sans-serif", body: "'Cairo', sans-serif" },
};

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isCMS = location.startsWith("/controlpanal");
  const queryClient = useQueryClient();

  const { data: theme } = useQuery<ThemeData | null>({
    queryKey: ["/api/public/settings", "theme"],
    queryFn: async () => {
      try {
        const homeData = await queryClient.fetchQuery<{ settings: Record<string, any>; hotels: any[]; seo: any | null }>({
          queryKey: ["/api/public/home-data"],
          queryFn: fetchHomeData,
          staleTime: 60000,
        });
        return (homeData?.settings?.theme as ThemeData) || null;
      } catch {
        try {
          const res = await fetch("/api/public/settings/theme", { credentials: "include" });
          if (!res.ok) return null;
          const data = await res.json();
          return (data?.value as ThemeData) || null;
        } catch {
          return null;
        }
      }
    },
    enabled: !isCMS,
    staleTime: 60000,
    retry: false,
  });

  useEffect(() => {
    if (isCMS || !theme) return;

    const root = document.documentElement;

    if (theme.primaryColor) {
      root.style.setProperty("--color-brand-blue", theme.primaryColor);
      root.style.setProperty("--color-primary", theme.primaryColor);
      root.style.setProperty("--color-foreground", theme.primaryColor);
      root.style.setProperty("--color-card-foreground", theme.primaryColor);
    }

    if (theme.secondaryColor) {
      root.style.setProperty("--color-brand-gold", theme.secondaryColor);
      root.style.setProperty("--color-secondary", theme.secondaryColor);
      root.style.setProperty("--color-ring", theme.secondaryColor);
    }

    if (theme.backgroundColor) {
      root.style.setProperty("--color-background", theme.backgroundColor);
      root.style.setProperty("--color-brand-white", theme.backgroundColor);
    }

    if (theme.headingFont) {
      const fontEntry = SELF_HOSTED_FONTS[theme.headingFont];
      const value = fontEntry ? fontEntry.heading : `'${theme.headingFont}', serif`;
      root.style.setProperty("--font-serif", value);
    }

    if (theme.bodyFont) {
      const fontEntry = SELF_HOSTED_FONTS[theme.bodyFont];
      const value = fontEntry ? fontEntry.body : `'${theme.bodyFont}', sans-serif`;
      root.style.setProperty("--font-sans", value);
    }

    if (theme.logoMaxWidth) {
      root.style.setProperty("--logo-max-width", `${theme.logoMaxWidth}px`);
    }

    if (theme.logoMaxHeight) {
      root.style.setProperty("--logo-max-height", `${theme.logoMaxHeight}px`);
    }

    return () => {
      const props = [
        "--color-brand-blue", "--color-primary", "--color-foreground", "--color-card-foreground",
        "--color-brand-gold", "--color-secondary", "--color-ring",
        "--color-background", "--color-brand-white",
        "--font-serif", "--font-sans",
        "--logo-max-width", "--logo-max-height",
      ];
      props.forEach((p) => root.style.removeProperty(p));
    };
  }, [isCMS, theme]);

  return <>{children}</>;
}
