import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { PageFlip } from "page-flip";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface CompanyProfileData {
  pdfUrl: string;
  coverImage: string;
  title: string;
  status: string;
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
      <div className="pt-24 pb-16">
        <div className="text-center mb-8 px-4">
          <h1 data-testid="text-company-profile-title" className="text-3xl md:text-4xl font-serif text-brand-blue mb-2">
            {profile.title || (isAr ? "ملف الشركة" : "Company Profile")}
          </h1>
        </div>
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
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPDF() {
      try {
        setLoading(true);
        setError(false);
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        const numPages = pdf.numPages;
        setTotalPages(numPages);

        const isMobile = window.innerWidth < 768;
        const scale = isMobile ? 1.2 : 1.5;
        const quality = isMobile ? 0.7 : 0.85;
        const pageImages: string[] = [];

        for (let i = 1; i <= numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });

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
          setPages(pageImages);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading PDF:", err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    loadPDF();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (loading || error || pages.length === 0 || !flipbookRef.current || initRef.current) return;

    const container = flipbookRef.current;
    let rafId: number;

    const tryInit = () => {
      if (initRef.current || !container) return;

      const containerWidth = containerRef.current?.clientWidth || 0;
      if (containerWidth === 0) {
        rafId = requestAnimationFrame(tryInit);
        return;
      }

      const isMobile = containerWidth < 768;
      const pageWidth = isMobile ? Math.min(containerWidth - 32, 400) : Math.min(Math.floor((containerWidth - 40) / 2), 500);
      const pageHeight = Math.floor(pageWidth * 1.414);

      const flipbook = new PageFlip(container, {
        width: pageWidth,
        height: pageHeight,
        size: "fixed",
        minWidth: 200,
        maxWidth: 600,
        minHeight: 283,
        maxHeight: 849,
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

      flipbook.on("flip", (e: any) => {
        setCurrentPage(e.data);
      });

      pageFlipRef.current = flipbook;
      initRef.current = true;
    };

    rafId = requestAnimationFrame(() => {
      requestAnimationFrame(tryInit);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.destroy();
        } catch {}
        pageFlipRef.current = null;
      }
      initRef.current = false;
    };
  }, [pages, loading, error]);

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
            <img src={coverImage} alt="Cover" className="w-64 h-auto rounded-lg shadow-xl mb-4 object-contain" />
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
          display: loading || error ? "none" : "flex",
        }}
      >
        <div ref={flipbookRef} data-testid="flipbook-container" />
      </div>

      {!loading && !error && pages.length > 0 && (
        <div className={`flex items-center justify-center gap-3 py-4 flex-wrap ${isFullscreen ? "absolute bottom-4 left-0 right-0" : ""}`}>
          <button
            data-testid="button-prev-page"
            onClick={goPrev}
            className="p-2 rounded-full bg-brand-blue text-white hover:bg-brand-blue/80 transition-colors disabled:opacity-30"
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span data-testid="text-page-indicator" className={`text-sm font-medium px-4 ${isFullscreen ? "text-white" : "text-gray-600"}`}>
            {currentPage + 1} / {totalPages}
          </span>

          <button
            data-testid="button-next-page"
            onClick={goNext}
            className="p-2 rounded-full bg-brand-blue text-white hover:bg-brand-blue/80 transition-colors disabled:opacity-30"
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1 ml-4 border-l pl-4 border-gray-300">
            <button
              data-testid="button-zoom-out"
              onClick={handleZoomOut}
              className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${isFullscreen ? "text-white hover:bg-white/20" : "text-gray-600"}`}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className={`text-xs font-medium w-12 text-center ${isFullscreen ? "text-white" : "text-gray-500"}`}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              data-testid="button-zoom-in"
              onClick={handleZoomIn}
              className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${isFullscreen ? "text-white hover:bg-white/20" : "text-gray-600"}`}
              disabled={zoom >= 2.5}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            data-testid="button-fullscreen"
            onClick={toggleFullscreen}
            className={`p-2 rounded-full hover:bg-gray-200 transition-colors ml-2 ${isFullscreen ? "text-white hover:bg-white/20" : "text-gray-600"}`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
