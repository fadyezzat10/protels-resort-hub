const LEGACY_CMS_FAVICON_URL = "https://protels.com/uploads/1786023687194-115462314.webp";

export function resolveFaviconUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "/favicon.png";

  const url = value.trim();
  return url === LEGACY_CMS_FAVICON_URL ? "/favicon.png" : url;
}
