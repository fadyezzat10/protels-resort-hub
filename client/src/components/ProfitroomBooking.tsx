import { useState } from "react";
    import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
    import { useCMSSetting } from "@/lib/cms";
    import { normalizeProfitroomBookingConfig, type ProfitroomBookingConfig } from "@/lib/profitroom";

    type CalendarMode = "check-in" | "check-out";

    const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

    function localDateValue(date: Date) {
    const pad = (value: number) => String(value).padStart(2, "0");
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
    }

    function tomorrowValue() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return localDateValue(date);
    }

    function parseDateValue(value: string) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
    }

    function formatDateValue(value: string) {
    if (!value) return "";
    const date = parseDateValue(value);
    const pad = (part: number) => String(part).padStart(2, "0");
    return pad(date.getMonth() + 1) + "/" + pad(date.getDate()) + "/" + date.getFullYear();
    }

    function addMonths(date: Date, amount: number) {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);
    }

    function monthLabel(date: Date) {
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date).toUpperCase();
    }

    function monthDays(month: Date) {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1, 12);
    const leadingDays = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0, 12).getDate();
    const cells: Array<Date | null> = Array.from({ length: leadingDays }, () => null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, monthIndex, day, 12));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
    }

    type CalendarMonthProps = {
    month: Date;
    mode: CalendarMode;
    checkIn: string;
    checkOut: string;
    draftDate: string;
    config: ProfitroomBookingConfig;
    onPick: (value: string) => void;
    };

    function CalendarMonth({ month, mode, checkIn, checkOut, draftDate, config, onPick }: CalendarMonthProps) {
    const cells = monthDays(month);
    const today = localDateValue(new Date());

    return (
      <div className="min-w-0">
        <div className="mb-3 text-center text-sm font-bold tracking-wide" style={{ color: config.textColor }}>
          {monthLabel(month)}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium" style={{ color: config.labelColor }}>
          {WEEKDAYS.map((weekday) => <span key={weekday} className="py-1">{weekday}</span>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1 border-t pt-2" style={{ borderColor: config.panelBorderColor }}>
          {cells.map((date, index) => {
            if (!date) return <span key={"empty-" + index} className="h-9" />;
            const value = localDateValue(date);
            const isCheckIn = value === checkIn;
            const isCheckOut = value === checkOut;
            const isDraft = value === draftDate;
            const isInRange = Boolean(checkIn && checkOut && value > checkIn && value < checkOut);
            const isDisabled = mode === "check-out" && Boolean(checkIn) && value <= checkIn;
            const isToday = value === today;
            const isSelected = isDraft || (mode === "check-in" ? isCheckIn : isCheckOut);

            return (
              <button
                key={value}
                type="button"
                disabled={isDisabled}
                onClick={() => onPick(value)}
                className="relative h-9 text-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-30"
                style={{
                  backgroundColor: isSelected ? config.accentColor : isInRange ? config.accentColor + "26" : "transparent",
                  color: isSelected ? config.accentTextColor : config.textColor,
                  borderRadius: Math.min(config.controlRadius + 2, 8) + "px",
                  boxShadow: isToday && !isSelected ? "inset 0 0 0 1px " + config.accentColor : "none",
                  fontWeight: isSelected ? 700 : 400,
                }}
                aria-label={new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(date)}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
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
    const [calendarMode, setCalendarMode] = useState<CalendarMode>("check-in");
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(() => {
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth(), 1, 12);
    });
    const [draftDate, setDraftDate] = useState("");

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

    const openCalendar = (mode: CalendarMode) => {
      const value = mode === "check-in" ? checkIn : checkOut;
      const baseDate = value ? parseDateValue(value) : new Date();
      setCalendarMode(mode);
      setDraftDate(value);
      setCalendarMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1, 12));
      setCalendarOpen(true);
    };

    const closeCalendar = () => setCalendarOpen(false);

    const handleCalendarPick = (value: string) => {
      setDraftDate(value);
    };

    const applyCalendarDate = () => {
      if (!draftDate) return;
      if (calendarMode === "check-in") {
        setCheckIn(draftDate);
        if (checkOut <= draftDate) {
          const nextDate = parseDateValue(draftDate);
          nextDate.setDate(nextDate.getDate() + 1);
          setCheckOut(localDateValue(nextDate));
        }
      } else {
        setCheckOut(draftDate);
      }
      closeCalendar();
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!selectedProperty?.bookingUrl.trim()) return;
      window.open(selectedProperty.bookingUrl.trim(), "_blank", "noopener,noreferrer");
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
                <span className="shrink-0 text-xs font-medium" style={{ color: config.labelColor }}>{config.checkInLabel}</span>
                <button type="button" data-testid="button-profitroom-check-in" onClick={() => openCalendar("check-in")} className="relative flex h-10 min-w-0 flex-1 items-center justify-between gap-2 border px-3 text-left text-sm outline-none transition hover:brightness-95 focus:ring-2 focus:ring-brand-gold/30" style={controlStyle} aria-label="Choose check-in date">
                  <span>{formatDateValue(checkIn)}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center" style={iconStyle}><CalendarDays className="h-3.5 w-3.5" /></span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="shrink-0 text-xs font-medium" style={{ color: config.labelColor }}>{config.checkOutLabel}</span>
                <button type="button" data-testid="button-profitroom-check-out" onClick={() => openCalendar("check-out")} className="relative flex h-10 min-w-0 flex-1 items-center justify-between gap-2 border px-3 text-left text-sm outline-none transition hover:brightness-95 focus:ring-2 focus:ring-brand-gold/30" style={controlStyle} aria-label="Choose check-out date">
                  <span>{formatDateValue(checkOut)}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center" style={iconStyle}><CalendarDays className="h-3.5 w-3.5" /></span>
                </button>
              </div>
            </div>

            <button type="submit" data-testid="button-profitroom-availability" disabled={!selectedProperty?.bookingUrl.trim()} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 px-5 text-sm font-semibold uppercase tracking-[0.02em] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: config.accentColor, color: config.accentTextColor, borderRadius: config.controlRadius + "px" }}>
              <Search className="h-4 w-4" />
              {config.submitLabel}
            </button>
          </form>
        </div>

        {calendarOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={calendarMode === "check-in" ? "Choose check-in date" : "Choose check-out date"} onMouseDown={(event) => { if (event.target === event.currentTarget) closeCalendar(); }}>
            <div className="w-full max-w-[800px] overflow-hidden bg-white shadow-2xl" style={{ borderRadius: config.panelRadius + "px" }} onMouseDown={(event) => event.stopPropagation()}>
              <div className="flex items-center gap-3 border-b px-4 py-4 sm:px-5" style={{ borderColor: config.panelBorderColor }}>
                <button type="button" onClick={() => setCalendarMonth((current) => addMonths(current, -1))} className="flex h-9 w-9 shrink-0 items-center justify-center transition hover:brightness-95" style={{ backgroundColor: "#e1e3e5", color: config.textColor, borderRadius: iconRadius + "px" }} aria-label="Previous months"><ChevronLeft className="h-5 w-5" /></button>
                <div className="grid flex-1 grid-cols-2 gap-3 text-center text-sm font-bold tracking-wide" style={{ color: config.textColor }}><span>{monthLabel(calendarMonth)}</span><span>{monthLabel(addMonths(calendarMonth, 1))}</span></div>
                <button type="button" onClick={() => setCalendarMonth((current) => addMonths(current, 1))} className="flex h-9 w-9 shrink-0 items-center justify-center transition hover:brightness-95" style={{ backgroundColor: config.accentColor, color: config.accentTextColor, borderRadius: iconRadius + "px" }} aria-label="Next months"><ChevronRight className="h-5 w-5" /></button>
              </div>

              <div className="grid grid-cols-1 gap-7 p-5 sm:grid-cols-2 sm:gap-8 sm:px-7 sm:py-6">
                <CalendarMonth month={calendarMonth} mode={calendarMode} checkIn={checkIn} checkOut={checkOut} draftDate={draftDate} config={config} onPick={handleCalendarPick} />
                <CalendarMonth month={addMonths(calendarMonth, 1)} mode={calendarMode} checkIn={checkIn} checkOut={checkOut} draftDate={draftDate} config={config} onPick={handleCalendarPick} />
              </div>

              <div className="flex flex-col gap-3 border-t bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5" style={{ borderColor: config.panelBorderColor }}>
                <div className="border px-4 py-2 text-sm" style={{ borderColor: config.accentColor, backgroundColor: config.accentColor + "18", color: config.textColor }}>{calendarMode === "check-in" ? "Select check-in date." : "Select check-out date."}</div>
                <button type="button" onClick={applyCalendarDate} disabled={!draftDate} className="h-10 min-w-[180px] px-6 text-sm font-semibold uppercase tracking-wide transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: config.accentColor, color: config.accentTextColor, borderRadius: config.controlRadius + "px" }}>SELECT</button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
    }
    