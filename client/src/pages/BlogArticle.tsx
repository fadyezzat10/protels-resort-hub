import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead, { getBreadcrumbJsonLd } from "@/components/SEOHead";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Calendar, Building2, ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb";

function fixContentLinks(html: string): string {
  return html.replace(/href="https?:\/\/[^"]*protels[^"]*\/(hotels\/[^"]*|gallery|about|contact|careers|blog[^"]*)"/gi, (match) => {
    const pathMatch = match.match(/protels[^"]*\/(hotels\/[^"]*|gallery|about|contact|careers|blog[^"]*)/i);
    if (pathMatch) {
      return `href="/${pathMatch[1]}"`;
    }
    return match;
  });
}

const hotelNames: Record<string, string> = {
  "crystal-beach": "Crystal Beach Resort",
  "beach-club": "Beach Club & Spa",
  "royal-bay": "Royal Bay Resort & Spa",
  "la-plage": "La Plage Zanzibar",
};

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useI18n();
  const isAr = language === "ar";

  const contentRef = useRef<HTMLDivElement>(null);

  const { data: post, isLoading, error } = useQuery<any>({
    queryKey: ["/api/public/blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/public/blog/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const defaultDesc = "Discover luxury beachfront resorts in Marsa Alam, Hurghada & Zanzibar at Protels Hotels & Resorts.";
  const articleTitle = post ? (post.metaTitle || ((post.title?.[language] || post.title?.en || "Blog") + " | Protels Hotels & Resorts")) : "Blog | Protels Hotels & Resorts";
  const articleDesc = post ? (post.metaDescription || post.excerpt?.[language] || post.excerpt?.en || defaultDesc) : defaultDesc;
  const encodedSlug = slug ? encodeURIComponent(slug) : "";

  const blogArticleJsonLd = post ? [
    getBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title?.[language] || post.title?.en || "Article", path: `/blog/${slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title?.[language] || post.title?.en || "",
      "description": articleDesc,
      "image": post.featuredImage || undefined,
      "datePublished": post.createdAt,
      "dateModified": post.updatedAt || post.createdAt,
      "author": { "@type": "Organization", "name": "Protels Hotels & Resorts" },
      "publisher": { "@type": "Organization", "name": "Protels Hotels & Resorts" },
      "mainEntityOfPage": `https://protels.com/blog/${encodedSlug}`,
    },
  ] : undefined;

  useEffect(() => {
    if (contentRef.current) {
      const links = contentRef.current.querySelectorAll("a[href]");
      links.forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (href.startsWith("http://") || href.startsWith("https://")) {
          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noopener noreferrer");
        }
      });
    }
  }, [post, language]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-white font-sans" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-32">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-brand-white font-sans" dir={isAr ? "rtl" : "ltr"}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
          <h1 className="text-3xl font-serif text-brand-blue mb-4">
            {isAr ? "المقال غير موجود" : "Article Not Found"}
          </h1>
          <p className="text-gray-500 mb-8">
            {isAr ? "عذراً، هذا المقال غير متوفر" : "Sorry, this article could not be found."}
          </p>
          <Link href="/blog" className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-blue transition-colors cursor-pointer">
            {isAr ? (
              <>
                {"العودة إلى المدونة"} <ArrowLeft className="w-4 h-4" />
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" /> {"Back to Blog"}
              </>
            )}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const title = post.title?.[language] || post.title?.en || "Untitled";
  const content = post.content?.[language] || post.content?.en || "";

  return (
    <div className="min-h-screen bg-brand-white font-sans" dir={isAr ? "rtl" : "ltr"}>
      <SEOHead
        title={articleTitle}
        description={articleDesc}
        ogTitle={post.title?.[language] || post.title?.en || ""}
        ogDescription={articleDesc}
        ogImage={post.featuredImage || undefined}
        ogType="article"
        canonical={`https://protels.com/blog/${encodedSlug}`}
        jsonLd={blogArticleJsonLd}
      />
      <Navbar />
      <PageBreadcrumb items={[
        { label: isAr ? "المدونة" : "Blog", href: "/blog" },
        { label: title },
      ]} />

      {post.featuredImage && (
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <img loading="lazy"
            src={post.featuredImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/blog" className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-blue transition-colors text-sm mb-8 cursor-pointer">
            {isAr ? (
              <>
                {"العودة إلى المدونة"} <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" /> {"Back to Blog"}
              </>
            )}
          </Link>

          <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {post.hotelSlug && (
              <Link href={`/hotels/${post.hotelSlug}`} className="flex items-center gap-1 text-brand-gold hover:text-brand-blue transition-colors cursor-pointer">
                <Building2 className="w-4 h-4" />
                {hotelNames[post.hotelSlug] || post.hotelSlug}
              </Link>
            )}
          </div>

          <h1 data-testid="text-blog-article-title" className="text-3xl md:text-5xl font-serif text-brand-blue mb-8 leading-tight">
            {title}
          </h1>

          <div className="w-24 h-1 bg-brand-gold mb-10" />

          <div
            data-testid="text-blog-article-content"
            ref={contentRef}
            className="prose prose-lg max-w-none text-gray-700 font-light leading-relaxed
              prose-headings:font-serif prose-headings:text-brand-blue prose-headings:font-normal
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:mb-6
              prose-a:text-brand-gold prose-a:no-underline hover:prose-a:text-brand-blue
              prose-img:rounded-sm prose-img:shadow-md
              prose-blockquote:border-brand-gold prose-blockquote:text-gray-600 prose-blockquote:italic
              prose-strong:text-brand-blue prose-strong:font-semibold
              prose-ul:list-disc prose-ol:list-decimal"
            dangerouslySetInnerHTML={{ __html: fixContentLinks(content) }}
          />

          {post.hotelSlug && (
            <div className="mt-16 p-8 bg-gray-50 border border-gray-100 rounded-sm">
              <p className="text-sm text-gray-500 mb-3">
                {isAr ? "هذا المقال مرتبط بـ" : "This article is about"}
              </p>
              <h3 className="text-xl font-serif text-brand-blue mb-4">
                Protels {hotelNames[post.hotelSlug] || post.hotelSlug}
              </h3>
              <Link href={`/hotels/${post.hotelSlug}`} className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-blue transition-colors text-sm font-medium cursor-pointer">
                {isAr ? "استكشف المنتجع" : "Explore this resort"} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>
      </article>

      <Footer />
    </div>
  );
}
