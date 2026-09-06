export type ProfitroomBookingProperty = {
    id: string;
    name: string;
    bookingUrl: string;
    siteKey: string;
    openMode: "site" | "browse";
    };

    export type ProfitroomBookingConfig = {
    enabled: boolean;
    heading: string;
    propertyLabel: string;
    checkInLabel: string;
    checkOutLabel: string;
    submitLabel: string;
    properties: ProfitroomBookingProperty[];
    panelBackground: string;
    panelBorderColor: string;
    textColor: string;
    labelColor: string;
    accentColor: string;
    accentTextColor: string;
    panelRadius: number;
    controlRadius: number;
    shadow: boolean;
    };

    export const DEFAULT_PROFITROOM_BOOKING_CONFIG: ProfitroomBookingConfig = {
    enabled: true,
    heading: "BOOK ONLINE",
    propertyLabel: "",
    checkInLabel: "Check-in",
    checkOutLabel: "Check-out",
    submitLabel: "CHECK AVAILABILITY",
    properties: [
      { id: "demo-1", name: "Demo 1", bookingUrl: "https://wis.upperbooking.com/1223/be-panel?locale=en&sitekey=presalesdemo", siteKey: "presalesdemo", openMode: "site" },
      { id: "demo-2", name: "Demo 2", bookingUrl: "https://wis.upperbooking.com/1223/be-panel?locale=en&sitekey=presalesdemo2", siteKey: "presalesdemo2", openMode: "site" },
      { id: "demo-3", name: "Demo 3", bookingUrl: "https://wis.upperbooking.com/1223/be-panel?locale=en&sitekey=presalesdemo3", siteKey: "presalesdemo3", openMode: "site" },
      { id: "demo-4", name: "Demo 4", bookingUrl: "https://wis.upperbooking.com/1223/be-panel?locale=en&sitekey=presalesdemo4", siteKey: "presalesdemo4", openMode: "site" },
    ],
    panelBackground: "#ffffff",
    panelBorderColor: "#e2ded8",
    textColor: "#262626",
    labelColor: "#66615b",
    accentColor: "#65d2cf",
    accentTextColor: "#ffffff",
    panelRadius: 14,
    controlRadius: 3,
    shadow: true,
    };

    function readText(value: unknown, fallback: string, allowEmpty = false) {
    if (typeof value !== "string") return fallback;
    if (!allowEmpty && value.trim() === "") return fallback;
    return value;
    }

    function readColor(value: unknown, fallback: string) {
    return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
    }

    function readNumber(value: unknown, fallback: number, min: number, max: number) {
    const parsed = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
    }

    function inferSiteKey(bookingUrl: string) {
    try {
      return new URL(bookingUrl).searchParams.get("sitekey") || "";
    } catch {
      return "";
    }
    }

    export function normalizeProfitroomBookingConfig(value: unknown): ProfitroomBookingConfig {
    const raw = value && typeof value === "object" ? value as Partial<ProfitroomBookingConfig> : {};
    const rawProperties = Array.isArray(raw.properties) ? raw.properties : null;
    const properties = rawProperties === null
      ? DEFAULT_PROFITROOM_BOOKING_CONFIG.properties
      : rawProperties.map((property, index) => {
          if (!property || typeof property !== "object") return null;
          const item = property as Partial<ProfitroomBookingProperty>;
          const bookingUrl = typeof item.bookingUrl === "string" ? item.bookingUrl.trim() : "";
          return {
            id: readText(item.id, "property-" + (index + 1)),
            name: readText(item.name, "Hotel " + (index + 1)),
            bookingUrl,
            siteKey: readText(item.siteKey, inferSiteKey(bookingUrl), true),
            openMode: item.openMode === "browse" ? "browse" : "site",
          };
        }).filter((property): property is ProfitroomBookingProperty => property !== null);

    return {
      enabled: typeof raw.enabled === "boolean" ? raw.enabled : DEFAULT_PROFITROOM_BOOKING_CONFIG.enabled,
      heading: readText(raw.heading, DEFAULT_PROFITROOM_BOOKING_CONFIG.heading),
      propertyLabel: readText(raw.propertyLabel, DEFAULT_PROFITROOM_BOOKING_CONFIG.propertyLabel, true),
      checkInLabel: readText(raw.checkInLabel, DEFAULT_PROFITROOM_BOOKING_CONFIG.checkInLabel),
      checkOutLabel: readText(raw.checkOutLabel, DEFAULT_PROFITROOM_BOOKING_CONFIG.checkOutLabel),
      submitLabel: readText(raw.submitLabel, DEFAULT_PROFITROOM_BOOKING_CONFIG.submitLabel),
      properties,
      panelBackground: readColor(raw.panelBackground, DEFAULT_PROFITROOM_BOOKING_CONFIG.panelBackground),
      panelBorderColor: readColor(raw.panelBorderColor, DEFAULT_PROFITROOM_BOOKING_CONFIG.panelBorderColor),
      textColor: readColor(raw.textColor, DEFAULT_PROFITROOM_BOOKING_CONFIG.textColor),
      labelColor: readColor(raw.labelColor, DEFAULT_PROFITROOM_BOOKING_CONFIG.labelColor),
      accentColor: readColor(raw.accentColor, DEFAULT_PROFITROOM_BOOKING_CONFIG.accentColor),
      accentTextColor: readColor(raw.accentTextColor, DEFAULT_PROFITROOM_BOOKING_CONFIG.accentTextColor),
      panelRadius: readNumber(raw.panelRadius, DEFAULT_PROFITROOM_BOOKING_CONFIG.panelRadius, 0, 32),
      controlRadius: readNumber(raw.controlRadius, DEFAULT_PROFITROOM_BOOKING_CONFIG.controlRadius, 0, 20),
      shadow: typeof raw.shadow === "boolean" ? raw.shadow : DEFAULT_PROFITROOM_BOOKING_CONFIG.shadow,
    };
    }
    