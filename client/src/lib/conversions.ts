/**
 * Fire a Google Ads "Purchase / Booking" conversion event.
 * Safe to call even before gtag loads (queued via dataLayer).
 */
export function fireBookingConversion() {
  try {
    const g = (window as any).gtag;
    if (typeof g === "function") {
      g("event", "conversion", {
        send_to: "AW-17918703028/zrVFCIXfgdocELTrpuBC",
        value: 1.0,
        currency: "EGP",
        transaction_id: "",
      });
    }
  } catch (_) {}
}
