import { useEffect } from "react";
import { useCMSSetting } from "@/lib/cms";
import { normalizeProfitroomBookingConfig } from "@/lib/profitroom";

const DEFAULT_PROFITROOM_SCRIPT_SRC = "https://wis.upperbooking.com/protelshotelsresorts/be-panel?locale=en";
const PROFITROOM_SCRIPT_SELECTOR = "script[data-profitroom-booking-engine]";

function isLegacyDemoScript(value: string) {
  return /upperbooking\.com\/1223\//i.test(value) || /presalesdemo/i.test(value);
}

export default function ProfitroomBooking() {
  const { data: rawConfig } = useCMSSetting("profitroom_booking_config");
  const { data: legacyEnabledSetting } = useCMSSetting("profitroom_enabled");
  const { data: scriptUrlSetting } = useCMSSetting("profitroom_script_url");
  const config = normalizeProfitroomBookingConfig(rawConfig);
  const isEnabled = rawConfig && typeof rawConfig === "object" && "enabled" in rawConfig
    ? config.enabled
    : legacyEnabledSetting !== false && legacyEnabledSetting !== "false";

  const configuredScript = typeof scriptUrlSetting === "string" ? scriptUrlSetting.trim() : "";
  const scriptSrc = configuredScript && !isLegacyDemoScript(configuredScript)
    ? configuredScript
    : DEFAULT_PROFITROOM_SCRIPT_SRC;

  useEffect(() => {
    if (!isEnabled) return;

    const drawPanel = () => window._drawPanel?.(".be-panel", "prepend");
    const existingScript = document.querySelector(PROFITROOM_SCRIPT_SELECTOR)
      ?? Array.from(document.scripts).find((candidate) => candidate.src === scriptSrc);

    if (existingScript) {
      existingScript.addEventListener("load", drawPanel, { once: true });
      drawPanel();
      return () => existingScript.removeEventListener("load", drawPanel);
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.dataset.profitroomBookingEngine = "true";
    script.dataset.profitroom = "booking-engine";
    script.addEventListener("load", drawPanel, { once: true });
    document.body.appendChild(script);
    return () => script.removeEventListener("load", drawPanel);
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
        </div>
      </div>
    </section>
  );
}
