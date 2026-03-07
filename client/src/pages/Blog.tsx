import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EditableText from "@/components/EditableText";
import SEOHead, { getBreadcrumbJsonLd } from "@/components/SEOHead";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Building2 } from "lucide-react";

const hotelNames: Record<string, string> = {
  "crystal-beach": "Crystal Beach Resort",
  "beach-club": "Beach Club & Spa",
  "royal-bay": "Royal Bay Resort & Spa",
  "la-plage": "La Plage Zanzibar",
};

export default function Blog() {
  const { language } = useI18n();
  const isAr = language === "ar";

  const { data: posts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/public/blog"],
    queryFn: async () => {
      const res = await fetch("/api/public/blog");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-brand-white font-sans" dir={isAr ? "rtl" : "ltr"}>
      <SEOHead
        title={isAr ? "مدونة بروتيلز | أخبار ومقالات السفر والفنادق" : "Blog | Protels Hotels & Resorts – Travel Tips & News"}
        description={isAr
          ? "اكتشف أحدث الأخبار والنصائح حول وجهاتنا ومنتجعاتنا الفاخرة في مصر وزنجبار"
          : "Discover the latest news, travel tips, and stories from Protels luxury beach resorts in Egypt and Zanzibar."}
        keywords="Protels blog, Marsa Alam travel tips, Red Sea diving blog, Zanzibar travel guide, Egypt resort news"
        ogTitle={isAr ? "مدونة بروتيلز" : "Protels Hotels & Resorts Blog"}
        ogDescription="Travel tips, resort news, and destination guides from Protels Hotels & Resorts."
        jsonLd={getBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <Navbar />

      <section className="relative bg-brand-blue py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <EditableText
              contentKey="blog.hero.label"
              defaultValue={isAr ? "مدونة" : "Blog"}
              as="span"
              className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-4 block"
            />
            <EditableText
              contentKey="blog.hero.title"
              defaultValue={isAr ? "أخبار ومقالات" : "News & Articles"}
              as="h1"
              className="text-4xl md:text-6xl font-serif text-white mb-6"
            />
            <EditableText
              contentKey="blog.hero.desc"
              defaultValue={isAr
                ? "اكتشف أحدث الأخبار والنصائح حول وجهاتنا ومنتجعاتنا الفاخرة"
                : "Discover the latest news, travel tips, and stories from our luxury resorts"}
              as="p"
              className="text-white/80 text-lg max-w-2xl mx-auto font-light"
            />
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[16/10] rounded-sm mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : sortedPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {isAr ? "لا توجد مقالات حتى الآن" : "No articles published yet. Check back soon!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedPosts.map((post: any, index: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <article
                      data-testid={`card-blog-${post.slug}`}
                      className="group cursor-pointer bg-white shadow-sm hover:shadow-lg transition-all duration-300 rounded-sm overflow-hidden border border-gray-100"
                    >
                      {post.featuredImage ? (
                        <div className="aspect-[16/10] overflow-hidden">
                          <img loading="lazy"
                            src={post.featuredImage}
                            alt={post.title?.[language] || post.title?.en || ""}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/10] bg-gradient-to-br from-brand-blue/10 to-brand-gold/10 flex items-center justify-center">
                          <span className="text-brand-blue/30 font-serif text-4xl">P</span>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          {post.hotelSlug && (
                            <span className="flex items-center gap-1 text-brand-gold">
                              <Building2 className="w-3 h-3" />
                              {hotelNames[post.hotelSlug] || post.hotelSlug}
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-serif text-brand-blue mb-2 group-hover:text-brand-gold transition-colors line-clamp-2">
                          {post.title?.[language] || post.title?.en || "Untitled"}
                        </h2>
                        <p className="text-gray-500 text-sm line-clamp-3 mb-4 font-light">
                          {post.excerpt?.[language] || post.excerpt?.en || ""}
                        </p>
                        <span className="text-brand-gold text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          {isAr ? "اقرأ المزيد" : "Read More"} <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
