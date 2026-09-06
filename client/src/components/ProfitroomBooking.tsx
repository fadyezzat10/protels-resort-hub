import { useState } from "react";
    import { CalendarDays, ChevronDown, Search } from "lucide-react";
    import { useCMSSetting } from "@/lib/cms";
    import { normalizeProfitroomBookingConfig } from "@/lib/profitroom";

    function localDateValue(date: Date) {
    const pad = (value: number) => String(value).padStart(2, "0");
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
    }

    function tomorrowValue() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return localDateValue(date);
    }

    export default function ProfitroomBooking() {
    const { data: rawConfig } = useCMSSetting("profitroom_booking_config");
    const { data: legacyEnabledSetting } = useCMSSetting("profitroom_enabled");
    const config = normalizeProfitroomBookingConfig(rawConfig);
    const isEnabled = rawConfig && typeof rawConfig === "object" && "enabled" in rawConfig
      ? config.enabled
      : legacyEnabledSetting !== false && legacyEnabledSetting !== "false";
    const [selectedPropertyId, setSelectedPropertyId] = useState("");
    const [checkIn, setCheckIn] = useState(() => localDateValue(new Date()));
    const [checkOut, setCheckOut] = useState(() => tomorrowValue());

    if (!isEnabled) return null;

    const selectedProperty = config.properties.find((property) => property.id === selectedPropertyId) ?? config.properties[0];
    const iconRadius = Math.min(config.controlRadius, 8);
    const controlStyle = {
      borderColor: config.panelBorderColor,
      borderRadius: config.controlRadius + "px",
      color: config.textColor,
      backgroundColor: config.panelBackground,
    };
    const iconStyle = {
      backgroundColor: config.accentColor,
      color: config.accentTextColor,
      borderRadius: iconRadius + "px",
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!selectedProperty?.bookingUrl.trim()) return;
      window.open(selectedProperty.bookingUrl.trim(), "_blank", "noopener,noreferrer");
    };

    const handleCheckInChange = (value: string) => {
      setCheckIn(value);
      if (value && checkOut <= value) {
        const nextDate = new Date(value + "T00:00:00");
        nextDate.setDate(nextDate.getDate() + 1);
        setCheckOut(localDateValue(nextDate));
      }
    };

    return (
      <section className="bg-brand-white py-8 md:py-12" data-testid="profitroom-booking-section">
        <div className="container-padding">
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-6xl flex-col gap-4 border px-5 py-5 md:flex-row md:items-center md:gap-5 md:px-8" style={{ backgroundColor: config.panelBackground, borderColor: config.panelBorderColor, borderRadius: config.panelRadius + "px", color: config.textColor, boxShadow: config.shadow ? "0 10px 28px rgba(27, 39, 52, 0.12)" : "none" }}>
            <div className="shrink-0 md:min-w-[145px]">
              <span className="block text-center text-base font-semibold tracking-[0.02em] md:text-left" style={{ color: config.textColor }}>{config.heading}</span>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
              <div className="relative flex items-center gap-2">
                {config.propertyLabel && <label htmlFor="profitroom-property" className="shrink-0 text-xs font-medium" style={{ color: config.labelColor }}>{config.propertyLabel}</label>}
                <div className="relative min-w-0 flex-1">
                  <select id="profitroom-property" data-testid="select-profitroom-property" value={selectedProperty?.id ?? ""} onChange={(event) => setSelectedPropertyId(event.target.value)} className="h-10 w-full appearance-none border px-3 pr-9 text-sm outline-none transition focus:ring-2 focus:ring-brand-gold/30" style={controlStyle} aria-label={config.propertyLabel || "Hotel"}>
                    {config.properties.length === 0 ? <option value="">No hotel configured</option> : config.properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: config.accentColor }} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="profitroom-check-in" className="shrink-0 text-xs font-medium" style={{ color: config.labelColor }}>{config.checkInLabel}</label>
                <div className="relative min-w-0 flex-1">
                  <input id="profitroom-check-in" data-testid="input-profitroom-check-in" type="date" value={checkIn} onChange={(event) => handleCheckInChange(event.target.value)} className="h-10 w-full appearance-none border px-3 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-brand-gold/30" style={controlStyle} />
                  <span className="pointer-events-none absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center" style={iconStyle}><CalendarDays className="h-3.5 w-3.5" /></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="profitroom-check-out" className="shrink-0 text-xs font-medium" style={{ color: config.labelColor }}>{config.checkOutLabel}</label>
                <div className="relative min-w-0 flex-1">
                  <input id="profitroom-check-out" data-testid="input-profitroom-check-out" type="date" min={checkIn} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="h-10 w-full appearance-none border px-3 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-brand-gold/30" style={controlStyle} />
                  <span className="pointer-events-none absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center" style={iconStyle}><CalendarDays className="h-3.5 w-3.5" /></span>
                </div>
              </div>
            </div>

            <button type="submit" data-testid="button-profitroom-availability" disabled={!selectedProperty?.bookingUrl.trim()} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 px-5 text-sm font-semibold uppercase tracking-[0.02em] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: config.accentColor, color: config.accentTextColor, borderRadius: config.controlRadius + "px" }}>
              <Search className="h-4 w-4" />
              {config.submitLabel}
            </button>
          </form>
        </div>
      </section>
    );
    }
    