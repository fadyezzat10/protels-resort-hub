import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import SectionRenderer from "@/components/builder/SectionRenderer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { type BuilderSection } from "@/lib/builderTypes";

export default function BuilderPage() {
  const params = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/public/pages", params.slug, "builder"],
    queryFn: async () => {
      const res = await fetch(`/api/public/pages/${params.slug}/builder`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!params.slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!data || !data.sections || data.sections.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {data.sections
          .filter((s: BuilderSection) => !s.hidden)
          .map((section: BuilderSection) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
      </main>
      <Footer />
    </div>
  );
}
