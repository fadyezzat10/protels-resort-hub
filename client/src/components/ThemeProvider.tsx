import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

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

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isCMS = location.startsWith("/controlpanal");

  const { data: themeSetting } = useQuery<{ key: string; value: ThemeData }>({
    queryKey: ["/api/public/settings/theme"],
    enabled: !isCMS,
  });

  useEffect(() => {
    if (isCMS || !themeSetting?.value) return;

    const theme = themeSetting.value;
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
      root.style.setProperty("--font-serif", `'${theme.headingFont}', serif`);
    }

    if (theme.bodyFont) {
      root.style.setProperty("--font-sans", `'${theme.bodyFont}', sans-serif`);
    }

    if (theme.logoMaxWidth) {
      root.style.setProperty("--logo-max-width", `${theme.logoMaxWidth}px`);
    }

    if (theme.logoMaxHeight) {
      root.style.setProperty("--logo-max-height", `${theme.logoMaxHeight}px`);
    }

    const fonts: string[] = [];
    if (theme.headingFont) fonts.push(theme.headingFont.replace(/\s+/g, "+"));
    if (theme.bodyFont) fonts.push(theme.bodyFont.replace(/\s+/g, "+"));

    if (fonts.length > 0) {
      const existingLink = document.getElementById("theme-google-fonts");
      if (existingLink) existingLink.remove();

      const link = document.createElement("link");
      link.id = "theme-google-fonts";
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${f}:wght@300;400;500;600;700`).join("&")}&display=swap`;
      document.head.appendChild(link);
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

      const existingLink = document.getElementById("theme-google-fonts");
      if (existingLink) existingLink.remove();
    };
  }, [isCMS, themeSetting]);

  return <>{children}</>;
}
