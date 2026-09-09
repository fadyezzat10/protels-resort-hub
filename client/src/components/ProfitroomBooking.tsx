import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useCMSSetting } from "@/lib/cms";
import {
  DEFAULT_PROFITROOM_BOOKING_CONFIG,
  normalizeProfitroomBookingConfig,
  PROTELS_BOOKING_URL,
  type ProfitroomBookingProperty,
} from "@/lib/profitroom";

function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function addDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
}

function buildBookingUrl(property: ProfitroomBookingProperty, checkIn: string, checkOut: string) {
  const url = new URL(property.bookingUrl || PROTELS_BOOKING_URL);
  url.searchParams.set("check-in", checkIn);
  url.searchParams.set("check-out", checkOut);
  url.searchParams.set("currency", "USD");
  url.searchParams.set("master-site", "protelshotelsresorts");
  url.searchParams.set("Source", "v7");
  url.searchParams.set("r1_adults", "2");
  return url.toString();
}

export default function ProfitroomBooking() {
  const { data: rawConfig } = useCMSSetting("profitroom_booking_config");
  const { data: legacyEnabledSetting } = useCMSSetting("profitroom_enabled");
  const config = normalizeProfitroomBookingConfig(rawConfig);
  const isEnabled = rawConfig && typeof rawConfig === "object" && "enabled" in rawConfig
    ? config.enabled
    : legacyEnabledSetting !== false && legacyEnabledSetting !== "false";
  const properties = useMemo(() => {
    const configured = config.properties.filter((property) =>
      property.bookingUrl && !/\/locations(?:\?|$)/i.test(property.bookingUrl),
    );
    return configured.length > 0 ? configured : DEFAULT_PROFITROOM_BOOKING_CONFIG.properties;
  }, [config.properties]);
  const today = useMemo(() => toLocalDateString(new Date()), []);
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || "");
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(addDays(today, 1));

  useEffect(() => {
    if (!properties.some((property) => property.id === selectedPropertyId)) {
      setSelectedPropertyId(properties[0]?.id || "");
    }
  }, [properties, selectedPropertyId]);

  if (!isEnabled) return null;

  const selectedProperty = properties.find((property) => property.id === selectedPropertyId) || properties[0];
  const controlStyle = {
    borderColor: config.panelBorderColor,
    borderRadius: config.controlRadius + "px",
    color: config.textColor,
  };

  const handleCheckInChange = (value: string) => {
    setCheckIn(value);
    if (value >= checkOut) setCheckOut(addDays(value, 1));
  };

  const handleSubmit = () => {
    if (!selectedProperty || !checkIn || !checkOut || checkOut <= checkIn) return;
    window.open(buildBookingUrl(selectedProperty, checkIn, checkOut), "_blank", "noopener,noreferrer");
  };

  return (
    <section
      className="bg-brand-white py-8 md:py-12"
      data-testid="profitroom-booking-section"
      aria-label="Book your stay"
    >
      <div className="container-padding">
        <div
          className="mx-auto max-w-6xl border px-4 py-4 shadow-[0_10px_28px_rgba(27,39,52,0.12)] md:px-5"
          style={{
            backgroundColor: config.panelBackground,
            borderColor: config.panelBorderColor,
            borderRadius: config.panelRadius + "px",
          }}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="shrink-0 lg:min-w-[105px] lg:pb-2">
              <span className="text-sm font-semibold tracking-wide" style={{ color: config.textColor }}>
                {config.heading || "BOOK ONLINE"}
              </span>
            </div>

            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium" style={{ color: config.labelColor }}>
              <span>{config.propertyLabel || "Select hotel"}</span>
              <span className="relative">
                <select
                  value={selectedPropertyId}
                  onChange={(event) => setSelectedPropertyId(event.target.value)}
                  className="h-11 w-full appearance-none border bg-white px-3 pr-9 text-sm outline-none transition focus:ring-2 focus:ring-[#65d2cf]/40"
                  style={controlStyle}
                  data-testid="select-profitroom-property"
                  aria-label="Select hotel"
                >
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>{property.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: config.accentColor }} aria-hidden="true" />
              </span>
            </label>

            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium" style={{ color: config.labelColor }}>
              <span>{config.checkInLabel}</span>
              <span className="relative">
                <input
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(event) => handleCheckInChange(event.target.value)}
                  className="h-11 w-full border bg-white px-3 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-[#65d2cf]/40"
                  style={controlStyle}
                  data-testid="input-profitroom-check-in"
                />
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: config.accentColor }} aria-hidden="true" />
              </span>
            </label>

            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium" style={{ color: config.labelColor }}>
              <span>{config.checkOutLabel}</span>
              <span className="relative">
                <input
                  type="date"
                  value={checkOut}
                  min={addDays(checkIn, 1)}
                  onChange={(event) => setCheckOut(event.target.value)}
                  className="h-11 w-full border bg-white px-3 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-[#65d2cf]/40"
                  style={controlStyle}
                  data-testid="input-profitroom-check-out"
                />
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: config.accentColor }} aria-hidden="true" />
              </span>
            </label>

            <button
              type="button"
              onClick={handleSubmit}
              className="h-11 shrink-0 px-5 text-sm font-semibold tracking-wide text-white transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#65d2cf]/50 focus:ring-offset-2 lg:min-w-[185px]"
              style={{ backgroundColor: config.accentColor, borderRadius: config.controlRadius + "px", color: config.accentTextColor }}
              data-testid="button-profitroom-check-availability"
            >
              {config.submitLabel || "CHECK AVAILABILITY"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
