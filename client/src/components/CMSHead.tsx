import { useEffect } from "react";
import { useCMSSetting, useCMSSeo } from "@/lib/cms";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";

const SUPPORTED_LANGS = ["en", "ar", "fr", "de", "es", "ru", "pl", "cs"];

export default function CMSHead() {
  const [location] = useLocation();
  const { language } = useI18n();
  const { data: gtmId } = useCMSSetting("gtm_id");
  const { data: seo } = useCMSSeo(location);
  const { data: faviconUrl } = useCMSSetting("favicon_url");

  useEffect(() => {
    if (gtmId && typeof gtmId === "string" && gtmId.trim()) {
      const id = gtmId.trim();
      if (id.startsWith("GTM-")) {
        if (!document.getElementById("gtm-script")) {
          const script = document.createElement("script");
          script.id = "gtm-script";
          script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`;
          document.head.appendChild(script);
        }
      } else if (id.startsWith("G-") || id.startsWith("AW-")) {
        if (!document.getElementById("gtag-script")) {
          const loader = document.createElement("script");
          loader.id = "gtag-script";
          loader.async = true;
          loader.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
          document.head.appendChild(loader);

          const config = document.createElement("script");
          config.id = "gtag-config";
          config.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`;
          document.head.appendChild(config);
        }
      }
    }
  }, [gtmId]);

  useEffect(() => {
    if (seo) {
      if (seo.metaTitle) document.title = seo.metaTitle;
      const setMeta = (name: string, content: string, attr = "name") => {
        if (!content) return;
        let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
        if (!el) {
          el = document.createElement("meta");
          el.setAttribute(attr, name);
          document.head.appendChild(el);
        }
        el.content = content;
      };
      if (seo.metaDescription) setMeta("description", seo.metaDescription);
      if (seo.ogTitle) setMeta("og:title", seo.ogTitle, "property");
      if (seo.ogDescription) setMeta("og:description", seo.ogDescription, "property");
      if (seo.ogImage) setMeta("og:image", seo.ogImage, "property");
      if (seo.robots) setMeta("robots", seo.robots);
      if (seo.canonicalUrl) {
        let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!link) {
          link = document.createElement("link");
          link.rel = "canonical";
          document.head.appendChild(link);
        }
        link.href = seo.canonicalUrl;
      }
    }
  }, [seo]);

  useEffect(() => {
    if (faviconUrl && typeof faviconUrl === "string" && faviconUrl.trim()) {
      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (link) {
        link.href = faviconUrl;
      }
    }
  }, [faviconUrl]);

  useEffect(() => {
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    const base = window.location.origin + location;
    SUPPORTED_LANGS.forEach((lang) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = lang;
      link.href = base;
      document.head.appendChild(link);
    });
    const xDefault = document.createElement("link");
    xDefault.rel = "alternate";
    xDefault.hreflang = "x-default";
    xDefault.href = base;
    document.head.appendChild(xDefault);
    return () => {
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    };
  }, [location, language]);

  return null;
}
