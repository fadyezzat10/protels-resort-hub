import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CMSLayout from "./CMSLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Gauge,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Search,
  Loader2,
  ExternalLink,
  RefreshCw,
  ImageIcon,
  Zap,
  Eye,
  ChevronDown,
  ChevronUp,
  Monitor,
  ArrowDownToLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyzedImage {
  url: string;
  page: string;
  renderPosition: string;
  fileSize: number;
  fileSizeBytes: number;
  width: number | null;
  height: number | null;
  format: string;
  isWebp: boolean;
  exists: boolean;
  isLCP: boolean;
  impactLevel: "High" | "Medium" | "Low";
  impactReason: string;
  recommendations: string[];
  recommendedRes: string;
}

interface AnalysisData {
  images: AnalyzedImage[];
  summary: {
    totalImages: number;
    highCount: number;
    mediumCount: number;
    lcpCount: number;
    affectingPerformance: number;
    totalSizeMB: number;
  };
}

function ImpactBadge({ level, isLCP }: { level: string; isLCP: boolean }) {
  if (level === "High") {
    return (
      <span
        data-testid="badge-high"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        High Impact
        {isLCP && <span className="ml-1 text-[10px] bg-red-200 px-1.5 py-0.5 rounded-full">LCP</span>}
      </span>
    );
  }
  if (level === "Medium") {
    return (
      <span
        data-testid="badge-medium"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full"
      >
        <AlertCircle className="w-3.5 h-3.5" />
        Medium
      </span>
    );
  }
  return (
    <span
      data-testid="badge-low"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full"
    >
      <CheckCircle className="w-3.5 h-3.5" />
      Low
    </span>
  );
}

function PositionBadge({ position }: { position: string }) {
  const styles: Record<string, string> = {
    Hero: "bg-purple-50 text-purple-700 border-purple-200",
    Section: "bg-blue-50 text-blue-700 border-blue-200",
    Gallery: "bg-teal-50 text-teal-700 border-teal-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded", styles[position] || "bg-gray-50 text-gray-600 border-gray-200")}>
      {position === "Hero" && <Monitor className="w-3 h-3" />}
      {position === "Gallery" && <ImageIcon className="w-3 h-3" />}
      {position === "Section" && <Eye className="w-3 h-3" />}
      {position}
    </span>
  );
}

function ImageRow({ img, index }: { img: AnalyzedImage; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const formatSize = (kb: number) => {
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
  };

  return (
    <>
      <tr
        data-testid={`row-perf-image-${index}`}
        className={cn(
          "border-b transition-colors cursor-pointer",
          img.impactLevel === "High" && "bg-red-50/60 hover:bg-red-50",
          img.impactLevel === "Medium" && "bg-amber-50/40 hover:bg-amber-50/60",
          img.impactLevel === "Low" && "hover:bg-gray-50"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border">
            {img.exists ? (
              <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ImageIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="max-w-[220px] truncate font-mono text-xs text-gray-700" title={img.url}>
            {img.url.split("/").pop()}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
              {img.format}
            </span>
            {img.width && img.height && (
              <span className="text-[10px] text-gray-400">
                {img.width}×{img.height}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <a
            href={img.page}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {img.page}
            <ExternalLink className="w-3 h-3" />
          </a>
        </td>
        <td className="px-4 py-3">
          <span className={cn("text-sm font-semibold", img.fileSize > 300 ? "text-red-600" : img.fileSize > 150 ? "text-amber-600" : "text-gray-700")}>
            {img.exists ? formatSize(img.fileSize) : "—"}
          </span>
        </td>
        <td className="px-4 py-3">
          <PositionBadge position={img.renderPosition} />
        </td>
        <td className="px-4 py-3">
          <ImpactBadge level={img.impactLevel} isLCP={img.isLCP} />
        </td>
        <td className="px-4 py-3 text-gray-400">
          {img.recommendations.length > 0 ? (
            expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
          ) : null}
        </td>
      </tr>
      {expanded && img.recommendations.length > 0 && (
        <tr className={cn(
          img.impactLevel === "High" && "bg-red-50/30",
          img.impactLevel === "Medium" && "bg-amber-50/20",
        )}>
          <td colSpan={7} className="px-4 py-3 border-b">
            <div className="ml-16 space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {img.isLCP ? "High Impact — Slowing the page" : img.impactReason}
              </p>
              <ul className="space-y-1.5">
                {img.recommendations.map((rec, ri) => (
                  <li key={ri} className="flex items-start gap-2 text-xs text-gray-600">
                    <ArrowDownToLine className="w-3.5 h-3.5 text-brand-gold mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
              <div className="text-[11px] text-gray-400 mt-1">
                Recommended resolution: <span className="font-mono">{img.recommendedRes}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function CMSPerformance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterImpact, setFilterImpact] = useState<"all" | "affecting" | "High" | "Medium" | "Low">("all");
  const [filterPosition, setFilterPosition] = useState<string>("all");

  const { data, isLoading, refetch } = useQuery<AnalysisData>({
    queryKey: ["/api/cms/performance-analysis"],
    queryFn: async () => {
      const res = await fetch("/api/cms/performance-analysis", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const images = data?.images || [];
  const summary = data?.summary;

  const filtered = images.filter((img) => {
    if (filterImpact === "affecting" && img.recommendations.length === 0) return false;
    if (filterImpact === "High" && img.impactLevel !== "High") return false;
    if (filterImpact === "Medium" && img.impactLevel !== "Medium") return false;
    if (filterImpact === "Low" && img.impactLevel !== "Low") return false;
    if (filterPosition !== "all" && img.renderPosition !== filterPosition) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return img.url.toLowerCase().includes(q) || img.page.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <CMSLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 data-testid="text-perf-title" className="text-2xl font-serif text-brand-blue flex items-center gap-2">
              <Gauge className="w-7 h-7 text-brand-gold" />
              Performance Impact Analyzer
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Detect images that slow down page load and get optimization recommendations
            </p>
          </div>
          <Button
            data-testid="button-rescan"
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Rescan Pages
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
            <span className="text-gray-500 text-sm">Analyzing images across all pages...</span>
            <span className="text-gray-400 text-xs">Reading dimensions, detecting LCP candidates...</span>
          </div>
        ) : summary ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Card className="border-l-4 border-l-gray-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-perf-total">{summary.totalImages}</p>
                      <p className="text-[11px] text-gray-500">Total Images</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold text-red-600" data-testid="text-perf-high">{summary.highCount}</p>
                      <p className="text-[11px] text-gray-500">High Impact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-2xl font-bold text-amber-600" data-testid="text-perf-medium">{summary.mediumCount}</p>
                      <p className="text-[11px] text-gray-500">Medium Impact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600" data-testid="text-perf-lcp">{summary.lcpCount}</p>
                      <p className="text-[11px] text-gray-500">LCP Images</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-brand-gold">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Gauge className="w-5 h-5 text-brand-gold" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-perf-affecting">{summary.affectingPerformance}</p>
                      <p className="text-[11px] text-gray-500">Need Attention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {summary.highCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    {summary.highCount} image{summary.highCount > 1 ? "s" : ""} significantly slowing page load
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    These images are LCP candidates or exceed 500 KB. Optimizing them will noticeably improve page speed and Core Web Vitals score.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  data-testid="input-perf-search"
                  placeholder="Search by filename or page..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {([
                  { key: "all", label: "All" },
                  { key: "affecting", label: `Affecting (${summary.affectingPerformance})` },
                  { key: "High", label: `High (${summary.highCount})` },
                  { key: "Medium", label: `Medium (${summary.mediumCount})` },
                ] as const).map(({ key, label }) => (
                  <Button
                    key={key}
                    data-testid={`button-filter-impact-${key}`}
                    variant={filterImpact === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterImpact(key)}
                    className={cn(
                      "text-xs",
                      filterImpact === key && key === "High" && "bg-red-600 hover:bg-red-700",
                      filterImpact === key && key === "Medium" && "bg-amber-600 hover:bg-amber-700",
                      filterImpact === key && key === "affecting" && "bg-brand-gold hover:bg-brand-gold/90",
                    )}
                  >
                    {label}
                  </Button>
                ))}
                <select
                  data-testid="select-position"
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="border rounded-md px-3 py-1 text-xs bg-white"
                >
                  <option value="all">All Positions</option>
                  <option value="Hero">Hero</option>
                  <option value="Section">Section</option>
                  <option value="Gallery">Gallery</option>
                </select>
              </div>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-performance">
                  <thead>
                    <tr className="border-b bg-gray-50/80">
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-14"></th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Image</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Page</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">File Size</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Position</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Impact</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-gray-400">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                          <p className="text-sm">No images match your filters</p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((img, i) => <ImageRow key={img.url + img.page} img={img} index={i} />)
                    )}
                  </tbody>
                </table>
              </div>
              {filtered.length > 0 && (
                <div className="px-4 py-3 border-t bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Showing {filtered.length} of {images.length} images
                  </span>
                  <span>
                    Total size: {summary.totalSizeMB} MB
                  </span>
                </div>
              )}
            </Card>
          </>
        ) : null}
      </div>
    </CMSLayout>
  );
}
