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
    title: "Protels Blog | Travel Tips & Resort Guides",
    description:
      "Read the latest travel tips, resort news, and insider guides from Protels Hotels & Resorts. Discover Egypt and Zanzibar through our luxury travel blog.",
    ogTitle: "Protels Blog | Travel Tips & Resort Guides",
    ogDescription:
      "Travel tips, resort news and insider guides from our luxury beach resorts.",
    ogImage: DEFAULT_OG_IMAGE,
    canonical: `${BASE_URL}/blog`,
  },
};

function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return "";
  const s = str instanceof Date ? str.toISOString() : String(str);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function generateBlogListHtml(posts: Array<{
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  featuredImage: string | null;
  createdAt: string | Date;
  hotelSlug: string | null;
}>): string {
  const items = posts.map((post) => {
    const title = post.title?.en || post.title?.ar || "Untitled";
    const excerpt = post.excerpt?.en || post.excerpt?.ar || "";
    const date = new Date(post.createdAt as string).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const imgTag = post.featuredImage
      ? `<img src="${escapeHtml(post.featuredImage)}" alt="${escapeHtml(title)}" style="width:100%;aspect-ratio:16/10;object-fit:cover;" loading="lazy" />`
      : "";
    return `<article itemscope itemtype="https://schema.org/BlogPosting" style="border:1px solid #e5e7eb;border-radius:4px;overflow:hidden;background:#fff;">
      ${imgTag}
      <div style="padding:1.5rem;">
        <time itemprop="datePublished" datetime="${escapeHtml(post.createdAt)}" style="font-size:0.75rem;color:#9ca3af;display:block;margin-bottom:0.5rem;">${date}</time>
        <h2 itemprop="headline" style="font-size:1.125rem;margin:0 0 0.5rem;"><a itemprop="url" href="/blog/${escapeHtml(post.slug)}" style="color:#1a2744;text-decoration:none;">${escapeHtml(title)}</a></h2>
        <p itemprop="description" style="font-size:0.875rem;color:#6b7280;margin:0 0 1rem;">${escapeHtml(excerpt.substring(0, 200))}</p>
        <a href="/blog/${escapeHtml(post.slug)}" style="color:#c9a96e;font-size:0.875rem;font-weight:500;">Read More →</a>
      </div>
    </article>`;
  }).join("\n");

  return `<main id="ssr-prerender" aria-label="Blog articles" style="max-width:1200px;margin:0 auto;padding:2rem 1.5rem;">
  <h1 style="font-size:2rem;color:#1a2744;margin-bottom:0.5rem;">Protels Blog | Travel Tips &amp; Resort Guides</h1>
  <p style="color:#6b7280;margin-bottom:2rem;">Discover the latest news, travel tips, and stories from Protels luxury beach resorts in Egypt and Zanzibar.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:2rem;">
    ${items || "<p>No articles published yet. Check back soon!</p>"}
  </div>
</main>`;
}

async function generateBlogArticleHtml(post: {
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  featuredImage: string | null;
  createdAt: string | Date;
  hotelSlug: string | null;
  metaTitle: string | null;
}): Promise<string> {
  const title = post.title?.en || post.title?.ar || "Untitled";
  const content = post.content?.en || post.content?.ar || "";
  const date = new Date(post.createdAt as string).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const imgTag = post.featuredImage
    ? `<img src="${escapeHtml(post.featuredImage)}" alt="${escapeHtml(title)}" style="width:100%;max-height:400px;object-fit:cover;margin-bottom:2rem;" />`
    : "";

  return `<main id="ssr-prerender" style="max-width:800px;margin:0 auto;padding:2rem 1.5rem;">
  <nav aria-label="breadcrumb" style="margin-bottom:1.5rem;font-size:0.875rem;color:#9ca3af;">
    <a href="/" style="color:#c9a96e;">Home</a> &rsaquo;
    <a href="/blog" style="color:#c9a96e;">Blog</a> &rsaquo;
    <span>${escapeHtml(title)}</span>
  </nav>
  ${imgTag}
  <article itemscope itemtype="https://schema.org/BlogPosting">
    <header>
      <h1 itemprop="headline" style="font-size:2rem;color:#1a2744;margin:0 0 1rem;line-height:1.3;">${escapeHtml(title)}</h1>
      <time itemprop="datePublished" datetime="${escapeHtml(post.createdAt)}" style="font-size:0.875rem;color:#9ca3af;">${date}</time>
    </header>
    <div itemprop="articleBody" style="margin-top:1.5rem;color:#374151;line-height:1.75;font-size:1rem;">
      ${content}
    </div>
    <footer style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid #e5e7eb;">
      <a href="/blog" style="color:#c9a96e;font-size:0.875rem;">← Back to Blog</a>
    </footer>
  </article>
</main>`;
}

function generateHotelHtml(hotel: {
  slug: string;
  name: string;
  location: string;
  description: Record<string, string>;
  features: string[];
  ratings: Array<{ platform: string; rating: number; maxRating: number; reviewCount?: number; reviewUrl?: string }> | null;
  image: string | null;
  address: string | null;
  tripAdvisorRank: string | null;
}): string {
  const descEn = hotel.description?.en || hotel.description?.ar || "";
  const googleRating = hotel.ratings?.find(r => r.platform === "google");
  const taRating = hotel.ratings?.find(r => r.platform === "tripadvisor");

  const featuresHtml = hotel.features?.length
    ? `<ul style="display:flex;flex-wrap:wrap;gap:0.5rem;list-style:none;padding:0;margin:1rem 0;">
        ${hotel.features.map(f => `<li style="background:#f3f0e8;color:#1a2744;padding:0.25rem 0.75rem;border-radius:999px;font-size:0.875rem;">${escapeHtml(f)}</li>`).join("")}
      </ul>`
    : "";

  const ratingBadges: string[] = [];
  if (googleRating) {
    ratingBadges.push(
      `<span itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating" style="display:inline-flex;align-items:center;gap:0.4rem;background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:0.3rem 0.7rem;font-size:0.875rem;">
        <meta itemprop="ratingValue" content="${googleRating.rating}" />
        <meta itemprop="bestRating" content="${googleRating.maxRating}" />
        ${googleRating.reviewCount ? `<meta itemprop="reviewCount" content="${googleRating.reviewCount}" />` : ""}
        ⭐ <strong>${googleRating.rating}</strong><span style="color:#6b7280;">/ ${googleRating.maxRating} Google</span>
      </span>`
    );
  }
  if (taRating) {
    ratingBadges.push(
      `<span style="display:inline-flex;align-items:center;gap:0.4rem;background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:0.3rem 0.7rem;font-size:0.875rem;">
        🏅 <strong>${taRating.rating}</strong><span style="color:#6b7280;">/ ${taRating.maxRating} TripAdvisor</span>
      </span>`
    );
  }
  if (hotel.tripAdvisorRank) {
    ratingBadges.push(
      `<span style="display:inline-flex;align-items:center;gap:0.4rem;background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:0.3rem 0.7rem;font-size:0.875rem;">
        🏆 <span style="color:#6b7280;">TripAdvisor Rank:</span> <strong>${escapeHtml(hotel.tripAdvisorRank)}</strong>
      </span>`
    );
  }

  const imgTag = hotel.image
    ? `<img src="${escapeHtml(hotel.image)}" alt="${escapeHtml(hotel.name)}" style="width:100%;max-height:420px;object-fit:cover;border-radius:4px;margin-bottom:1.5rem;" />`
    : "";

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": hotel.name,
    "description": descEn.substring(0, 300),
    "url": `${BASE_URL}/hotels/${hotel.slug}`,
    "image": hotel.image || DEFAULT_OG_IMAGE,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": hotel.location,
    },
    ...(googleRating ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": googleRating.rating,
        "bestRating": googleRating.maxRating,
        ...(googleRating.reviewCount ? { "reviewCount": googleRating.reviewCount } : {}),
      },
    } : {}),
    "amenityFeature": (hotel.features || []).map(f => ({
      "@type": "LocationFeatureSpecification",
      "name": f,
      "value": true,
    })),
  }).replace(/</g, "\\u003c");

  return `<main id="ssr-prerender" itemscope itemtype="https://schema.org/LodgingBusiness" style="max-width:900px;margin:0 auto;padding:2rem 1.5rem;">
  <script type="application/ld+json">${jsonLd}</script>
  <nav aria-label="breadcrumb" style="margin-bottom:1.5rem;font-size:0.875rem;color:#9ca3af;">
    <a href="/" style="color:#c9a96e;">Home</a> &rsaquo;
    <a href="/hotels" style="color:#c9a96e;">Hotels</a> &rsaquo;
    <span style="color:#1a2744;">${escapeHtml(hotel.name)}</span>
  </nav>
  ${imgTag}
  <h1 itemprop="name" style="font-size:2rem;color:#1a2744;margin:0 0 0.5rem;line-height:1.3;">${escapeHtml(hotel.name)}</h1>
  <p style="color:#c9a96e;font-size:1rem;margin:0 0 1rem;">
    📍 <span itemprop="address">${escapeHtml(hotel.location)}</span>${hotel.address ? ` — ${escapeHtml(hotel.address)}` : ""}
  </p>
  ${ratingBadges.length ? `<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.25rem;">${ratingBadges.join("")}</div>` : ""}
  ${descEn ? `<p itemprop="description" style="color:#374151;line-height:1.75;font-size:1rem;margin-bottom:1.5rem;">${escapeHtml(descEn.substring(0, 500))}</p>` : ""}
  ${featuresHtml}
  <p style="margin-top:1.5rem;">
    <a href="/hotels" style="color:#c9a96e;font-size:0.875rem;">← All Hotels</a>
  </p>
</main>`;
}

export async function getPrerenderedHtml(urlPath: string): Promise<string | null> {
  const cleanPath = urlPath.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";

  const hotelMatch = cleanPath.match(/^\/hotels\/([^/]+)$/);
  if (hotelMatch) {
    try {
      const result = await pool.query(
        `SELECT slug, name, location, description, features, ratings, image, address, tripadvisor_rank
         FROM hotels WHERE slug = $1 AND status = 'published' LIMIT 1`,
        [hotelMatch[1]],
      );
      if (!result.rows.length) return null;
      const r = result.rows[0];
      return generateHotelHtml({
        slug: r.slug,
        name: r.name,
        location: r.location,
        description: r.description || {},
        features: r.features || [],
        ratings: r.ratings || null,
        image: r.image || null,
        address: r.address || null,
        tripAdvisorRank: r.tripadvisor_rank || null,
      });
    } catch {
      return null;
    }
  }

  if (cleanPath === "/blog") {
    try {
      const result = await pool.query(
        `SELECT slug, title, excerpt, featured_image, created_at, hotel_slug
         FROM blog_posts WHERE status = 'published'
         ORDER BY created_at DESC`,
      );
      const posts = result.rows.map((r) => ({
        slug: r.slug,
        title: r.title || {},
        excerpt: r.excerpt || {},
        featuredImage: r.featured_image || null,
        createdAt: r.created_at,
        hotelSlug: r.hotel_slug || null,
      }));
      return generateBlogListHtml(posts);
    } catch {
      return null;
    }
  }

  const blogMatch = cleanPath.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    try {
      const result = await pool.query(
        `SELECT slug, title, excerpt, content, featured_image, created_at, hotel_slug, meta_title
         FROM blog_posts WHERE slug = $1 AND status = 'published' LIMIT 1`,
        [blogMatch[1]],
      );
      if (!result.rows.length) return null;
      const r = result.rows[0];
      return generateBlogArticleHtml({
        slug: r.slug,
        title: r.title || {},
        excerpt: r.excerpt || {},
        content: r.content || {},
        featuredImage: r.featured_image || null,
        createdAt: r.created_at,
        hotelSlug: r.hotel_slug || null,
        metaTitle: r.meta_title || null,
      });
    } catch {
      return null;
    }
  }

  return null;
}

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

export function injectMeta(html: string, meta: PageMeta, prerenderHtml?: string | null): string {
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

  let body = rest;
  if (prerenderHtml) {
    body = body.replace(
      '<div id="root"></div>',
      () => `<div id="root">${prerenderHtml}</div>`,
    );
  }

  return head + body;
}
