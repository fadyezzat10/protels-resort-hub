import { useEffect } from "react";
import { useLocation } from "wouter";

interface SEOProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  keywords?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
}

const BASE_URL = "https://protels.com";
const DEFAULT_IMAGE = "https://protels.com/images/og-default.webp";
const SITE_NAME = "Protels Hotels & Resorts";

export default function SEOHead({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  canonical,
  keywords,
  jsonLd,
  noindex,
}: SEOProps) {
  const [location] = useLocation();

  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    if (description) setMeta("name", "description", description);
    if (keywords) setMeta("name", "keywords", keywords);
    if (noindex) setMeta("name", "robots", "noindex, nofollow");

    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:url", canonical || `${BASE_URL}${location}`);
    if (ogTitle || title) setMeta("property", "og:title", ogTitle || title || SITE_NAME);
    if (ogDescription || description) setMeta("property", "og:description", ogDescription || description || "");
    setMeta("property", "og:image", ogImage || DEFAULT_IMAGE);

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:site", "@protels");
    if (ogTitle || title) setMeta("name", "twitter:title", ogTitle || title || SITE_NAME);
    if (ogDescription || description) setMeta("name", "twitter:description", ogDescription || description || "");
    setMeta("name", "twitter:image", ogImage || DEFAULT_IMAGE);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical || `${BASE_URL}${location}`;

    const existingLd = document.querySelectorAll('script[data-seo-jsonld]');
    existingLd.forEach((el) => el.remove());

    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      items.forEach((item) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-jsonld", "true");
        script.textContent = JSON.stringify(item);
        document.head.appendChild(script);
      });
    }

    return () => {
      document.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove());
    };
  }, [title, description, ogTitle, ogDescription, ogImage, ogType, canonical, keywords, jsonLd, noindex, location]);

  return null;
}

export function getHotelJsonLd(hotel: {
  name: string;
  id: string;
  location: string;
  description: { en: string };
  image?: string;
  features?: string[];
  rooms?: string[];
}) {
  const isEgypt = hotel.location.includes("Egypt");
  const addressParts = hotel.location.split(", ");

  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": hotel.name,
    "url": `${BASE_URL}/hotels/${hotel.id}`,
    "description": hotel.description.en,
    "image": hotel.image ? (hotel.image.startsWith("http") ? hotel.image : `${BASE_URL}${hotel.image}`) : DEFAULT_IMAGE,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": addressParts[0] || hotel.location,
      "addressCountry": isEgypt ? "EG" : "TZ",
    },
    "geo": getHotelGeo(hotel.id),
    "starRating": {
      "@type": "Rating",
      "ratingValue": hotel.id === "la-plage" ? "4" : "5",
    },
    "priceRange": "$$$",
    "amenityFeature": (hotel.features || []).map((f) => ({
      "@type": "LocationFeatureSpecification",
      "name": f,
      "value": true,
    })),
    "numberOfRooms": hotel.rooms?.length || undefined,
    "checkinTime": "14:00",
    "checkoutTime": "12:00",
    "currenciesAccepted": isEgypt ? "USD, EUR, EGP" : "USD, EUR, TZS",
    "paymentAccepted": "Cash, Credit Card",
    "telephone": isEgypt ? "+20-100-000-0000" : "+255-000-000-000",
  };
}

function getHotelGeo(id: string) {
  const coords: Record<string, { lat: string; lng: string }> = {
    "crystal-beach": { lat: "25.0657", lng: "34.9016" },
    "beach-club": { lat: "25.0534", lng: "34.8923" },
    "la-plage": { lat: "-6.1333", lng: "39.3667" },
    "royal-bay": { lat: "27.1783", lng: "33.8314" },
  };
  const c = coords[id];
  if (!c) return undefined;
  return {
    "@type": "GeoCoordinates",
    "latitude": c.lat,
    "longitude": c.lng,
  };
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Protels Hotels & Resorts",
    "url": BASE_URL,
    "logo": `${BASE_URL}/images/logo.webp`,
    "description": "Luxury beach resorts in Egypt (Marsa Alam, Hurghada) and Zanzibar, Tanzania offering all-inclusive vacation packages, diving, spa, and family entertainment.",
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "reservations",
      "availableLanguage": ["English", "Arabic", "French", "German", "Spanish", "Russian", "Polish", "Czech"],
    },
  };
}

export function getBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": `${BASE_URL}${item.path}`,
    })),
  };
}
