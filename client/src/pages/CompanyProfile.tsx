import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { PageFlip } from "page-flip";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface CompanyProfileData {
  pdfUrl: string;
  coverImage: string;
  title: string;
  status: string;
  heroSubtitle?: string | null;
  heroTitleSizeDesktop?: string | null;
  heroTitleSizeMobile?: string | null;
  heroLetterSpacing?: string | null;
  heroFontFamily?: string | null;
  heroFontWeight?: string | null;
  heroTextTransform?: string | null;
  customFontUrl?: string | null;
  customFontName?: string | null;
}

export default function CompanyProfile() {
  const { language } = useI18n();
  const isAr = language === "ar";

  const { data: profile, isLoading: profileLoading } = useQuery<CompanyProfileData>({
    queryKey: ["/api/public/company-profile"],
    queryFn: async () => {
      const res = await fetch("/api/public/company-profile");
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    retry: false,
  });

  useEffect(() => {
    const pageTitle = profile?.title
      ? `${profile.title} | Protels Hotels & Resorts`
      : "Company Profile | Protels Hotels & Resorts";
    document.title = pageTitle;
    return () => {
      document.title = "Protels Hotels & Resorts – Luxury Beach Resorts in Egypt & Zanzibar";
    };
  }, [profile]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-brand-white font-sans" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-brand-white font-sans" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <h1 className="text-2xl font-serif text-brand-blue mb-2">
              {isAr ? "ملف الشركة" : "Company Profile"}
            </h1>
            <p className="text-gray-500">
              {isAr ? "غير متوفر حالياً" : "Not available at this time"}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-white font-sans" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />
      {profile.customFontUrl && profile.customFontName && (
        <style>{`@font-face { font-family: '${profile.customFontName}'; src: url('${profile.customFontUrl}'); font-display: swap; }`}</style>
      )}
      <div className="bg-primary text-white relative overflow-hidden" style={{ padding: '120px 0 80px 0' }}>
        <div className="absolute inset-0 bg-black/30 z-0"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1
            data-testid="text-company-profile-title"
            className="company-profile-hero-title mb-6 text-white drop-shadow-md"
            style={{
              fontFamily: profile.heroFontFamily
                ? `'${profile.heroFontFamily}', serif`
                : "inherit",
              fontSize: profile.heroTitleSizeMobile || "30px",
              letterSpacing: profile.heroLetterSpacing || "0.1em",
              fontWeight: Number(profile.heroFontWeight) || 700,
              textTransform: (profile.heroTextTransform || "uppercase") as any,
            }}
          >
            <style>{`@media (min-width: 768px) { .company-profile-hero-title { font-size: ${profile.heroTitleSizeDesktop || "48px"} !important; } }`}</style>
            {profile.title || (isAr ? "ملف الشركة" : "Company Profile")}
          </h1>
          <div className="w-20 h-1 bg-white/40 mx-auto mb-6 rounded-full"></div>
          <p className="text-base md:text-lg max-w-3xl mx-auto text-white/95 font-light leading-relaxed tracking-wide">
            {profile.heroSubtitle || (isAr
              ? "اكتشف رؤيتنا وقيمنا ومنتجعاتنا الفاخرة عبر وجهاتنا المتميزة"
              : "Discover our vision, values, and premium resorts across our exclusive destinations")}
          </p>
        </div>
      </div>
      <div className="pb-16 pt-10">
        {profile.pdfUrl ? (
          <FlipbookViewer pdfUrl={profile.pdfUrl} coverImage={profile.coverImage} />
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500">
              {isAr ? "لم يتم تحميل الملف بعد" : "Document not yet uploaded"}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function FlipbookViewer({ pdfUrl, coverImage }: { pdfUrl: string; coverImage?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipbookRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<any>(null);
  const initRef = useRef(false);
  const pagesRef = useRef<string[]>([]);
  const aspectRatioRef = useRef(1.414);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPDF() {
      try {
        console.log("[Flipbook] Loading PDF from:", pdfUrl);
        setLoading(true);
        setError(false);
        setPdfReady(false);
        setLoadingProgress(0);

        const absoluteUrl = pdfUrl.startsWith("http") ? pdfUrl : `${window.location.origin}${pdfUrl}`;
        console.log("[Flipbook] Resolved PDF URL:", absoluteUrl);

        const loadingTask = pdfjsLib.getDocument(absoluteUrl);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const numPages = pdf.numPages;
        console.log("[Flipbook] PDF loaded, pages:", numPages);
        setTotalPages(numPages);

        const isMobile = window.innerWidth < 768;
        const scale = isMobile ? 1.2 : 1.5;
        const quality = isMobile ? 0.7 : 0.85;
        const pageImages: string[] = [];

        for (let i = 1; i <= numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });

          if (i === 1) {
            aspectRatioRef.current = viewport.height / viewport.width;
            console.log("[Flipbook] Page aspect ratio (h/w):", aspectRatioRef.current, "landscape:", aspectRatioRef.current < 1);
          }

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport, canvas } as any).promise;
          pageImages.push(canvas.toDataURL("image/jpeg", quality));
          canvas.width = 0;
          canvas.height = 0;
          if (!cancelled) setLoadingProgress(Math.round((i / numPages) * 100));
        }

        if (!cancelled) {
          console.log("[Flipbook] All pages rendered:", pageImages.length);
          pagesRef.current = pageImages;
          setLoading(false);
          setPdfReady(true);
        }
      } catch (err) {
        console.error("[Flipbook] Error loading PDF:", err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    loadPDF();

    return () => {
      console.log("[Flipbook] PDF load effect cleanup");
      cancelled = true;
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdfReady || initRef.current) return;

    const pages = pagesRef.current;
    if (pages.length === 0) return;

    const container = flipbookRef.current;
    if (!container) {
      console.error("[Flipbook] Container ref not available");
      return;
    }

    let rafId: number;
    let attempts = 0;

    const tryInit = () => {
      if (initRef.current) return;
      attempts++;

      const containerWidth = containerRef.current?.clientWidth || 0;
      if (containerWidth === 0 && attempts < 60) {
        rafId = requestAnimationFrame(tryInit);
        return;
      }

      const finalWidth = containerWidth || 800;
      console.log("[Flipbook] Initializing PageFlip, container width:", finalWidth, "attempt:", attempts);

      try {
        const isMobile = finalWidth < 768;
        const ratio = aspectRatioRef.current;
        const isLandscape = ratio < 1;

        let pageWidth: number;
        let pageHeight: number;

        if (isLandscape) {
          pageWidth = isMobile ? Math.min(finalWidth - 32, 500) : Math.min(Math.floor((finalWidth - 40) / 2), 600);
          pageHeight = Math.floor(pageWidth * ratio);
        } else {
          pageWidth = isMobile ? Math.min(finalWidth - 32, 400) : Math.min(Math.floor((finalWidth - 40) / 2), 500);
          pageHeight = Math.floor(pageWidth * ratio);
        }

        console.log("[Flipbook] Page dimensions:", pageWidth, "x", pageHeight, "ratio:", ratio, "landscape:", isLandscape);

        const flipbook = new PageFlip(container, {
          width: pageWidth,
          height: pageHeight,
          size: "fixed",
          minWidth: isLandscape ? 280 : 200,
          maxWidth: isLandscape ? 800 : 600,
          minHeight: isLandscape ? 198 : 283,
          maxHeight: isLandscape ? 566 : 849,
          showCover: true,
          mobileScrollSupport: true,
          swipeDistance: 30,
          clickEventForward: true,
          useMouseEvents: true,
          flippingTime: 800,
          usePortrait: isMobile,
          startZIndex: 0,
          autoSize: false,
          maxShadowOpacity: 0.5,
          drawShadow: true,
        });

        const pagesElements: HTMLElement[] = [];
        pages.forEach((dataUrl, index) => {
          const div = document.createElement("div");
          div.className = "flipbook-page";
          div.style.cssText = "background: white; overflow: hidden;";
          const img = document.createElement("img");
          img.src = dataUrl;
          img.alt = `Page ${index + 1}`;
          img.style.cssText = "width: 100%; height: 100%; object-fit: contain; pointer-events: none;";
          div.appendChild(img);
          pagesElements.push(div);
        });

        flipbook.loadFromHTML(pagesElements);
        console.log("[Flipbook] PageFlip initialized successfully with", pages.length, "pages");

        flipbook.on("flip", (e: any) => {
          setCurrentPage(e.data);
        });

        pageFlipRef.current = flipbook;
        initRef.current = true;
      } catch (err) {
        console.error("[Flipbook] PageFlip initialization error:", err);
      }
    };

    rafId = requestAnimationFrame(() => {
      requestAnimationFrame(tryInit);
    });

    return () => {
      console.log("[Flipbook] PageFlip cleanup");
      cancelAnimationFrame(rafId);
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.destroy();
        } catch (err) {
          console.error("[Flipbook] Destroy error:", err);
        }
        pageFlipRef.current = null;
      }
      initRef.current = false;
    };
  }, [pdfReady]);

  const goNext = () => pageFlipRef.current?.flipNext();
  const goPrev = () => pageFlipRef.current?.flipPrev();

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${isFullscreen ? "bg-gray-900 flex flex-col items-center justify-center h-screen" : ""}`}
    >
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          {coverImage && (
            <img loading="lazy" src={coverImage} alt="Cover" className="w-64 h-auto rounded-lg shadow-xl mb-4 object-contain" />
          )}
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          <p className="text-gray-500 text-sm">Loading document... {loadingProgress}%</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-blue rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">Unable to load the document.</p>
        </div>
      )}

      <div
        className="flex items-center justify-center overflow-auto py-4"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center top",
          transition: "transform 0.3s ease",
          visibility: loading || error ? "hidden" : "visible",
          height: loading || error ? 0 : "auto",
          overflow: loading || error ? "hidden" : "auto",
        }}
      >
        <div ref={flipbookRef} data-testid="flipbook-container" />
      </div>

      {!loading && !error && pdfReady && (
        <div className={`flex items-center justify-center gap-3 py-4 flex-wrap ${isFullscreen ? "absolute bottom-4 left-0 right-0" : ""}`}>
          <button
            data-testid="button-prev-page"
            onClick={goPrev}
            aria-label="Previous page"
            className="p-3 min-w-[44px] min-h-[44px] rounded-full bg-brand-blue text-white hover:bg-brand-blue/80 transition-colors disabled:opacity-30 flex items-center justify-center"
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          <span data-testid="text-page-indicator" className={`text-sm font-medium px-4 ${isFullscreen ? "text-white" : "text-gray-600"}`}>
            {currentPage + 1} / {totalPages}
          </span>

          <button
            data-testid="button-next-page"
            onClick={goNext}
            aria-label="Next page"
            className="p-3 min-w-[44px] min-h-[44px] rounded-full bg-brand-blue text-white hover:bg-brand-blue/80 transition-colors disabled:opacity-30 flex items-center justify-center"
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-1 ml-4 border-l pl-4 border-gray-300">
            <button
              data-testid="button-zoom-out"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className={`p-3 min-w-[44px] min-h-[44px] rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center ${isFullscreen ? "text-white hover:bg-white/20" : "text-gray-600"}`}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className={`text-xs font-medium w-12 text-center ${isFullscreen ? "text-white" : "text-gray-500"}`}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              data-testid="button-zoom-in"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className={`p-3 min-w-[44px] min-h-[44px] rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center ${isFullscreen ? "text-white hover:bg-white/20" : "text-gray-600"}`}
              disabled={zoom >= 2.5}
            >
              <ZoomIn className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <button
            data-testid="button-fullscreen"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className={`p-3 min-w-[44px] min-h-[44px] rounded-full hover:bg-gray-200 transition-colors ml-2 flex items-center justify-center ${isFullscreen ? "text-white hover:bg-white/20" : "text-gray-600"}`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" aria-hidden="true" /> : <Maximize2 className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>
      )}
    </div>
  );
}
