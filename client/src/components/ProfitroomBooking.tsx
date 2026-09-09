import { useEffect, useState } from "react";
import { useCMSSetting } from "@/lib/cms";
import {
  normalizeProfitroomBookingConfig,
  normalizeProfitroomScriptUrl,
  PROTELS_BOOKING_URL,
} from "@/lib/profitroom";

const PROFITROOM_SCRIPT_SELECTOR = "script[data-profitroom-booking-engine]";

declare global {
  interface Window {
    _drawPanel?: (selector: string, position: string) => void;
  }
}

export default function ProfitroomBooking() {
  const { data: rawConfig } = useCMSSetting("profitroom_booking_config");
  const { data: legacyEnabledSetting } = useCMSSetting("profitroom_enabled");
  const { data: scriptUrlSetting } = useCMSSetting("profitroom_script_url");
  const [panelError, setPanelError] = useState(false);
  const config = normalizeProfitroomBookingConfig(rawConfig);
  const isEnabled = rawConfig && typeof rawConfig === "object" && "enabled" in rawConfig
    ? config.enabled
    : legacyEnabledSetting !== false && legacyEnabledSetting !== "false";

  const scriptSrc = normalizeProfitroomScriptUrl(scriptUrlSetting);

  useEffect(() => {
    if (!isEnabled) {
      setPanelError(false);
      return;
    }

    setPanelError(false);
    let active = true;
    const drawPanel = () => {
      if (!active) return;
      if (typeof window._drawPanel !== "function") {
        setPanelError(true);
        return;
      }
      window._drawPanel(".be-panel", "prepend");
    };
    const handleScriptError = () => {
      if (active) setPanelError(true);
    };
    const existingScript = document.querySelector(PROFITROOM_SCRIPT_SELECTOR)
      ?? Array.from(document.scripts).find((candidate) => candidate.src === scriptSrc);

    if (existingScript) {
      existingScript.addEventListener("load", drawPanel, { once: true });
      existingScript.addEventListener("error", handleScriptError, { once: true });
      if (typeof window._drawPanel === "function") drawPanel();
      return () => {
        active = false;
        existingScript.removeEventListener("load", drawPanel);
        existingScript.removeEventListener("error", handleScriptError);
      };
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.dataset.profitroomBookingEngine = "true";
    script.dataset.profitroom = "booking-engine";
    script.addEventListener("load", drawPanel, { once: true });
    script.addEventListener("error", handleScriptError, { once: true });
    document.body.appendChild(script);
    return () => {
      active = false;
      script.removeEventListener("load", drawPanel);
      script.removeEventListener("error", handleScriptError);
    };
  }, [isEnabled, scriptSrc]);

  if (!isEnabled) return null;

  return (
    <section
      className="bg-brand-white py-8 md:py-12"
      data-testid="profitroom-booking-section"
      aria-label="Book your stay"
    >
      <div className="container-padding">
        <div
          className="mx-auto max-w-6xl overflow-visible border px-3 py-3 md:px-5 md:py-4"
          style={{
            backgroundColor: config.panelBackground,
            borderColor: config.panelBorderColor,
            borderRadius: config.panelRadius + "px",
            boxShadow: config.shadow ? "0 10px 28px rgba(27, 39, 52, 0.12)" : "none",
          }}
        >
          <div className="be-panel" data-testid="profitroom-booking-panel" />
          {panelError && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
              <span>Booking panel is temporarily unavailable. </span>
              <a href={PROTELS_BOOKING_URL} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">
                Open the official booking portal
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
