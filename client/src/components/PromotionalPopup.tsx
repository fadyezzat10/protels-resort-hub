import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Star } from "lucide-react";

interface PopupConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonUrl: string;
  secondaryButtonText: string;
  backgroundImage: string;
  discountBadge: string;
  delaySeconds: number;
  autoCloseSecs: number;
  showOnce: boolean;
  daysBeforeRepeat: number;
  overlayOpacity: number;
  primaryColor: string;
  accentColor: string;
}

const LS_KEY = "protels_popup_dismissed";

function shouldShow(config: PopupConfig): boolean {
  if (!config.showOnce) return true;
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return true;
  try {
    const { ts } = JSON.parse(raw);
    const daysSince = (Date.now() - ts) / 86400000;
    return daysSince >= (config.daysBeforeRepeat ?? 7);
  } catch {
    return true;
  }
}

function markDismissed() {
  localStorage.setItem(LS_KEY, JSON.stringify({ ts: Date.now() }));
}

export default function PromotionalPopup() {
  const [visible, setVisible] = useState(false);

  const { data: config } = useQuery<PopupConfig | null>({
    queryKey: ["/api/public/promotional-popup"],
    queryFn: async () => {
      const res = await fetch("/api/public/promotional-popup");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!config) return;
    if (!shouldShow(config)) return;
    const delay = (config.delaySeconds ?? 4) * 1000;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [config]);

  useEffect(() => {
    if (!visible || !config?.autoCloseSecs) return;
    const t = setTimeout(() => close(), config.autoCloseSecs * 1000);
    return () => clearTimeout(t);
  }, [visible, config]);

  const close = useCallback(() => {
    setVisible(false);
    markDismissed();
  }, []);

  if (!config) return null;

  const primary = config.primaryColor || "#c9a96e";
  const overlay = config.overlayOpacity ?? 0.6;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: overlay }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] bg-black cursor-pointer"
            onClick={close}
          />

          {/* Popup */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg pointer-events-auto overflow-hidden rounded-2xl shadow-2xl"
              style={{ background: "rgba(15,25,45,0.82)", backdropFilter: "blur(20px)", border: "1px solid rgba(201,169,110,0.25)" }}
            >
              {/* Background image */}
              {config.backgroundImage && (
                <div
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: `url(${config.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
                />
              )}

              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${primary}, transparent)` }} />

              {/* Close button */}
              <button
                onClick={close}
                data-testid="popup-close"
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative p-7 md:p-9">
                {/* Discount badge */}
                {config.discountBadge && (
                  <div className="flex justify-center mb-5">
                    <span
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold"
                      style={{ background: `${primary}22`, color: primary, border: `1px solid ${primary}55` }}
                    >
                      <Star className="w-3.5 h-3.5" fill="currentColor" />
                      {config.discountBadge}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h2
                  className="text-center text-2xl md:text-3xl font-serif font-light mb-2 leading-tight"
                  style={{ color: primary }}
                  data-testid="popup-title"
                >
                  {config.title}
                </h2>

                {/* Subtitle */}
                {config.subtitle && (
                  <p className="text-center text-white/80 text-base mb-4 font-light">
                    {config.subtitle}
                  </p>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px" style={{ background: `${primary}33` }} />
                  <div className="w-1 h-1 rounded-full" style={{ background: primary }} />
                  <div className="flex-1 h-px" style={{ background: `${primary}33` }} />
                </div>

                {/* Description */}
                {config.description && (
                  <p className="text-center text-white/65 text-sm mb-6 leading-relaxed font-light">
                    {config.description}
                  </p>
                )}

                {/* Features */}
                {config.features?.length > 0 && (
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-7">
                    {config.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-white/75">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={config.buttonUrl || "#"}
                    onClick={close}
                    data-testid="popup-cta"
                    className="flex-1 text-center py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)`, color: config.accentColor || "#0f1929", boxShadow: `0 4px 20px ${primary}44` }}
                  >
                    {config.buttonText || "Book Now"}
                  </a>
                  <button
                    onClick={close}
                    data-testid="popup-dismiss"
                    className="flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10"
                    style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)" }}
                  >
                    {config.secondaryButtonText || "Maybe Later"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
