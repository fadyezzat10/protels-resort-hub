import { useEffect } from "react";
    import { useCMSSetting } from "@/lib/cms";

    const DEFAULT_PROFITROOM_SCRIPT_SRC =
    "https://wis.upperbooking.com/1223/be-panel?locale=en";

    export default function ProfitroomBooking() {
    const { data: configuredScriptUrl } = useCMSSetting("profitroom_script_url");
    const { data: enabledSetting } = useCMSSetting("profitroom_enabled");

    const scriptSrc =
      typeof configuredScriptUrl === "string" && configuredScriptUrl.trim()
        ? configuredScriptUrl.trim()
        : DEFAULT_PROFITROOM_SCRIPT_SRC;
    const isEnabled = enabledSetting !== false && enabledSetting !== "false";

    useEffect(() => {
      if (!isEnabled || !scriptSrc) return;

      const existingScript = Array.from(
        document.querySelectorAll<HTMLScriptElement>("script[data-profitroom]")
      ).some((script) => script.src === scriptSrc);

      if (existingScript) return;

      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.dataset.profitroom = "booking-engine";
      document.body.appendChild(script);
    }, [isEnabled, scriptSrc]);

    if (!isEnabled) return null;

    return (
      <section
        className="bg-brand-white py-8 md:py-12"
        data-testid="profitroom-booking-section"
      >
        <div className="container-padding">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-brand-gold/20 md:p-6">
            <div className="mb-5 text-center">
              <span className="mb-2 block text-sm font-medium uppercase tracking-widest text-brand-gold">
                Book online
              </span>
              <h2 className="font-serif text-3xl font-medium text-brand-blue md:text-4xl">
                Find your perfect stay
              </h2>
            </div>
            <div className="be-panel min-h-24" />
          </div>
        </div>
      </section>
    );
    }
    