import { useEffect } from "react";
import { useCMSSetting, useCMSSeo } from "@/lib/cms";
import { useLocation } from "wouter";

export default function CMSHead() {
  const [location] = useLocation();
  const { data: gtmId } = useCMSSetting("gtm_id");
  const { data: seo } = useCMSSeo(location);
  const { data: faviconUrl } = useCMSSetting("favicon_url");

  useEffect(() => {
    if (gtmId && typeof gtmId === "string" && gtmId.trim()) {
      if (!document.getElementById("gtm-script")) {
        const script = document.createElement("script");
        script.id = "gtm-script";
        script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
        document.head.appendChild(script);
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

  return null;
}
