import { pool } from "./db";

export interface PageMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
}

const BASE_URL = "https://protels.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og-image.webp`;

const STATIC_META: Record<string, PageMeta> = {
  "/": {
    title: "Luxury Beach Resorts Egypt & Zanzibar | Protels Hotels",
    description:
      "Discover luxury all-inclusive beach resorts in Marsa Alam, Hurghada & Zanzibar. PADI diving, water sports, and 5-star amenities. Book your paradise vacation today.",
    ogTitle: "Luxury Beach Resorts Egypt & Zanzibar | Protels Hotels",
    ogDescription:
      "Discover luxury all-inclusive beach resorts in Marsa Alam, Hurghada & Zanzibar.",
    ogImage: DEFAULT_OG_IMAGE,
    canonical: `${BASE_URL}/`,
  },
  "/about": {
    title: "About Us | Protels Hotels & Resorts – Our Story & Vision",
    description:
      "Learn about Protels Hotels & Resorts, a luxury hospitality brand operating premium beach resorts in Egypt and Zanzibar. Discover our story, values, and commitment to excellence.",
    ogTitle: "About Protels Hotels & Resorts",
    ogDescription:
      "Discover the story behind Protels Hotels & Resorts – luxury beach destinations in Egypt and Zanzibar.",
    ogImage: `${BASE_URL}/images/hotel-beach-club-hero.webp`,
    canonical: `${BASE_URL}/about`,
  },
  "/hotels": {
    title: "Our Hotels & Resorts | Protels – Luxury Beach Resorts in Egypt & Zanzibar",
    description:
      "Explore Protels luxury beach resorts in Marsa Alam, Hurghada, and Zanzibar. All-inclusive packages, diving, spa treatments, and family-friendly activities.",
    ogTitle: "Protels Hotels & Resorts Collection",
    ogDescription:
      "Discover our collection of luxury beach resorts along the Red Sea and Indian Ocean.",
    ogImage: `${BASE_URL}/images/hotel-crystal-beach-hero.webp`,
    canonical: `${BASE_URL}/hotels`,
  },
  "/contact": {
    title: "Contact Us | Protels Hotels & Resorts – Get in Touch",
    description:
      "Contact Protels Hotels & Resorts for reservations, inquiries, and support. Find phone numbers, email addresses, and locations for all our resorts in Marsa Alam, Hurghada, and Zanzibar.",
    ogTitle: "Contact Protels Hotels & Resorts",
    ogDescription:
      "Get in touch with Protels Hotels & Resorts for bookings and inquiries.",
    ogImage: `${BASE_URL}/images/hotel-royal-bay-hero-edited.webp`,
    canonical: `${BASE_URL}/contact`,
  },
  "/gallery": {
    title: "Photo Gallery | Protels Hotels & Resorts – Resort Images",
    description:
      "Browse stunning photos of Protels luxury beach resorts in Egypt and Zanzibar. See our rooms, pools, beaches, dining venues, and facilities.",
    ogTitle: "Protels Hotels & Resorts Gallery",
    ogDescription: "Explore beautiful images from our luxury beach resorts.",
    ogImage: `${BASE_URL}/images/hotel-la-plage-hero.webp`,
    canonical: `${BASE_URL}/gallery`,
  },
  "/careers": {
    title: "Careers | Protels Hotels & Resorts – Join Our Team",
    description:
      "Explore career opportunities at Protels Hotels & Resorts. Join our team at luxury beach resorts in Egypt and Zanzibar. Apply for hospitality positions today.",
    ogTitle: "Careers at Protels Hotels & Resorts",
    ogDescription:
      "Join our team at Protels – luxury beach resorts in Egypt and Zanzibar.",
    ogImage: DEFAULT_OG_IMAGE,
    canonical: `${BASE_URL}/careers`,
  },
  "/blog": {
    title: "Blog | Protels Hotels & Resorts – Travel Tips & Resort News",
    description:
      "Read the latest travel tips, resort news, and insider guides from Protels Hotels & Resorts. Discover Egypt and Zanzibar through our luxury travel blog.",
    ogTitle: "Protels Hotels & Resorts Blog",
    ogDescription:
      "Travel tips, resort news and insider guides from our luxury beach resorts.",
    ogImage: DEFAULT_OG_IMAGE,
    canonical: `${BASE_URL}/blog`,
  },
};

async function getHotelMeta(slug: string): Promise<PageMeta | null> {
  try {
    const result = await pool.query(
      "SELECT name, location, description, image FROM hotels WHERE slug = $1 AND status = 'published' LIMIT 1",
      [slug],
    );
    if (!result.rows.length) return null;
    const hotel = result.rows[0];
    const desc: Record<string, string> = hotel.description || {};
    const descEn =
      desc.en ||
      `Experience luxury at ${hotel.name} in ${hotel.location}. All-inclusive packages, private beach, spa, and world-class dining.`;
    const image =
      hotel.image && hotel.image.startsWith("http")
        ? hotel.image
        : DEFAULT_OG_IMAGE;
    return {
      title: `${hotel.name} | Protels Hotels & Resorts – ${hotel.location}`,
      description: descEn.substring(0, 300),
      ogTitle: hotel.name,
      ogDescription: descEn.substring(0, 200),
      ogImage: image,
      canonical: `${BASE_URL}/hotels/${slug}`,
    };
  } catch {
    return null;
  }
}

async function getBlogMeta(slug: string): Promise<PageMeta | null> {
  try {
    const result = await pool.query(
      "SELECT title, excerpt, featured_image, meta_title, meta_description FROM blog_posts WHERE slug = $1 AND status = 'published' LIMIT 1",
      [slug],
    );
    if (!result.rows.length) return null;
    const post = result.rows[0];
    const titleObj: Record<string, string> = post.title || {};
    const excerptObj: Record<string, string> = post.excerpt || {};
    const title = titleObj.en || titleObj.ar || "Blog Post";
    const excerpt =
      excerptObj.en ||
      excerptObj.ar ||
      "Read the latest from Protels Hotels & Resorts.";
    const image = post.featured_image || DEFAULT_OG_IMAGE;
    return {
      title: post.meta_title || `${title} | Protels Hotels & Resorts Blog`,
      description: post.meta_description || excerpt.substring(0, 300),
      ogTitle: title,
      ogDescription: excerpt.substring(0, 200),
      ogImage: image,
      canonical: `${BASE_URL}/blog/${slug}`,
    };
  } catch {
    return null;
  }
}

async function getSeoSettingsMeta(pagePath: string): Promise<Partial<PageMeta> | null> {
  try {
    const result = await pool.query(
      "SELECT meta_title, meta_description, og_title, og_description, og_image, canonical_url FROM seo_settings WHERE page_path = $1 LIMIT 1",
      [pagePath],
    );
    if (!result.rows.length) return null;
    const row = result.rows[0];
    if (!row.meta_title && !row.meta_description) return null;
    return {
      title: row.meta_title || undefined,
      description: row.meta_description || undefined,
      ogTitle: row.og_title || undefined,
      ogDescription: row.og_description || undefined,
      ogImage: row.og_image || undefined,
      canonical: row.canonical_url || undefined,
    };
  } catch {
    return null;
  }
}

export async function getMetaForUrl(urlPath: string): Promise<PageMeta> {
  const cleanPath = urlPath.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";

  const seoOverride = await getSeoSettingsMeta(cleanPath);

  const hotelMatch = cleanPath.match(/^\/hotels\/([^/]+)$/);
  const blogMatch = cleanPath.match(/^\/blog\/([^/]+)$/);

  let base: PageMeta =
    STATIC_META[cleanPath] || STATIC_META["/"];

  if (hotelMatch) {
    const hotelMeta = await getHotelMeta(hotelMatch[1]);
    if (hotelMeta) base = hotelMeta;
  } else if (blogMatch) {
    const blogMeta = await getBlogMeta(blogMatch[1]);
    if (blogMeta) base = blogMeta;
  }

  if (seoOverride) {
    return {
      ...base,
      ...Object.fromEntries(
        Object.entries(seoOverride).filter(([, v]) => v !== undefined),
      ),
    } as PageMeta;
  }

  return base;
}

export function injectMeta(html: string, meta: PageMeta): string {
  const escapedTitle = meta.title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const escapedDesc = meta.description.replace(/"/g, "&quot;");
  const escapedOgTitle = meta.ogTitle.replace(/"/g, "&quot;");
  const escapedOgDesc = meta.ogDescription.replace(/"/g, "&quot;");

  const headEndIndex = html.indexOf("</head>");
  if (headEndIndex === -1) return html;

  let head = html.slice(0, headEndIndex);
  const rest = html.slice(headEndIndex);

  head = head.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapedTitle}</title>`,
  );

  head = head.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${escapedDesc}">`,
  );

  head = head.replace(
    /<meta property="og:title"[^>]*>/,
    `<meta property="og:title" content="${escapedOgTitle}" />`,
  );

  head = head.replace(
    /<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${escapedOgDesc}" />`,
  );

  head = head.replace(
    /<meta property="og:url"[^>]*>/,
    `<meta property="og:url" content="${meta.canonical}" />`,
  );

  head = head.replace(
    /<meta name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${escapedOgTitle}" />`,
  );

  head = head.replace(
    /<meta name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${escapedOgDesc}" />`,
  );

  head = head.replace(
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${meta.canonical}" />`,
  );

  if (meta.ogImage) {
    const escapedOgImage = meta.ogImage.replace(/"/g, "&quot;");
    head = head.replace(
      /<meta property="og:image"[^>]*>/,
      `<meta property="og:image" content="${escapedOgImage}" />`,
    );
    head = head.replace(
      /<meta name="twitter:image"[^>]*>/,
      `<meta name="twitter:image" content="${escapedOgImage}" />`,
    );
  }

  return head + rest;
}
