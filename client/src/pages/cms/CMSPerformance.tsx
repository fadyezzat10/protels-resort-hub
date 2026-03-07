import { useState, lazy, Suspense } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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
  FileCode,
  Package,
  HardDrive,
  Filter,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

const InlineImageEditor = lazy(() => import("@/components/InlineImageEditor"));

interface AnalyzedImage {
  type: "image";
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
  canOptimize: boolean;
}

interface ScriptEntry {
  type: "script";
  fileName: string;
  filePath: string;
  fileSize: number;
  fileSizeBytes: number;
  gzipSize: number | null;
  chunkType: string;
  impactLevel: "High" | "Medium" | "Low";
  impactReason: string;
  recommendations: string[];
}

interface Summary {
  totalImages: number;
  totalScripts: number;
  imgHighCount: number;
  imgMediumCount: number;
  lcpCount: number;
  imgAffecting: number;
  imgTotalSizeMB: number;
  jsHighCount: number;
  jsMediumCount: number;
  jsAffecting: number;
  jsTotalSizeKB: number;
  overallHighCount: number;
  overallAffecting: number;
}

interface AnalysisData {
  images: AnalyzedImage[];
  scripts: ScriptEntry[];
  summary: Summary;
}

type TabType = "all" | "images" | "scripts";
type ImpactFilter = "all" | "affecting" | "High" | "Medium" | "Low";

function ImpactBadge({ level, isLCP }: { level: string; isLCP?: boolean }) {
  if (level === "High") {
    return (
      <span data-testid="badge-high" className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
        <AlertTriangle className="w-3.5 h-3.5" />
        High Impact
        {isLCP && <span className="ml-0.5 text-[10px] bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full font-bold">LCP</span>}
      </span>
    );
  }
  if (level === "Medium") {
    return (
      <span data-testid="badge-medium" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" />
        Medium
      </span>
    );
  }
  return (
    <span data-testid="badge-low" className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
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
  const icons: Record<string, React.ReactNode> = {
    Hero: <Monitor className="w-3 h-3" />,
    Section: <Eye className="w-3 h-3" />,
    Gallery: <ImageIcon className="w-3 h-3" />,
  };
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded", styles[position] || "bg-gray-50 text-gray-600 border-gray-200")}>
      {icons[position]}
      {position}
    </span>
  );
}

function formatSize(kb: number) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

function ImageRow({ img, index, onOptimize, optimizing }: {
  img: AnalyzedImage;
  index: number;
  onOptimize: (url: string) => void;
  optimizing: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const hasRecs = img.recommendations.length > 0;

  return (
    <>
      <tr
        data-testid={`row-image-${index}`}
        className={cn(
          "border-b transition-colors",
          (hasRecs || img.exists) && "cursor-pointer",
          img.impactLevel === "High" && "bg-red-50/60 hover:bg-red-50",
          img.impactLevel === "Medium" && "bg-amber-50/40 hover:bg-amber-50/60",
          img.impactLevel === "Low" && "hover:bg-gray-50",
          editing && "border-b-0 bg-blue-50/30",
        )}
        onClick={() => { if (!editing) { hasRecs && setExpanded(!expanded); } }}
      >
        <td className="px-4 py-3">
          <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 border flex-shrink-0">
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
          <div className="max-w-[200px] truncate font-mono text-xs text-gray-700" title={img.url}>
            {img.url.split("/").pop()}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{img.format}</span>
            {img.width && img.height && (
              <span className="text-[10px] text-gray-400">{img.width}×{img.height}</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <a href={img.page} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1" onClick={e => e.stopPropagation()}>
            {img.page} <ExternalLink className="w-3 h-3" />
          </a>
        </td>
        <td className="px-4 py-3">
          <span className={cn("text-sm font-semibold", img.fileSize > 300 ? "text-red-600" : img.fileSize > 150 ? "text-amber-600" : "text-gray-700")}>
            {img.exists ? formatSize(img.fileSize) : "—"}
          </span>
          <div className="text-[10px] text-gray-400 mt-0.5">&lt; 200 KB</div>
        </td>
        <td className="px-4 py-3"><PositionBadge position={img.renderPosition} /></td>
        <td className="px-4 py-3"><ImpactBadge level={img.impactLevel} isLCP={img.isLCP} /></td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {img.exists && img.canOptimize && (
              <Button
                data-testid={`button-optimize-${index}`}
                size="sm"
                variant="outline"
                className="text-xs h-7 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white"
                disabled={optimizing === img.url}
                onClick={(e) => { e.stopPropagation(); onOptimize(img.url); }}
              >
                {optimizing === img.url ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
                Optimize
              </Button>
            )}
            {img.exists && (
              <Button
                data-testid={`button-edit-${index}`}
                size="sm"
                variant={editing ? "default" : "outline"}
                className={cn("text-xs h-7", editing ? "bg-brand-blue hover:bg-brand-blue/90 text-white" : "border-blue-300 text-blue-600 hover:bg-blue-50")}
                onClick={(e) => { e.stopPropagation(); setEditing(!editing); setExpanded(false); }}
              >
                <Pencil className="w-3 h-3 mr-1" />
                {editing ? "Close" : "Edit"}
              </Button>
            )}
            {!img.canOptimize && !editing && img.isWebp && img.exists && (
              <span className="text-[10px] text-green-500 font-medium">Optimized</span>
            )}
            {hasRecs && !editing && (expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)}
          </div>
        </td>
      </tr>
      {editing && img.exists && (
        <tr>
          <td colSpan={7} className="p-0">
            <Suspense fallback={<div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-brand-gold" /></div>}>
              <InlineImageEditor
                url={img.url}
                width={img.width}
                height={img.height}
                format={img.format}
                onClose={() => setEditing(false)}
              />
            </Suspense>
          </td>
        </tr>
      )}
      {expanded && hasRecs && !editing && (
        <tr className={cn(img.impactLevel === "High" && "bg-red-50/30", img.impactLevel === "Medium" && "bg-amber-50/20")}>
          <td colSpan={7} className="px-4 py-3 border-b">
            <div className="ml-16 space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {img.isLCP ? "High Impact — Slowing the page (LCP Element)" : img.impactReason}
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
                Recommended: <span className="font-mono">{img.recommendedRes}</span> &middot; Target: &lt; 200 KB
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ScriptRow({ script, index }: { script: ScriptEntry; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasRecs = script.recommendations.length > 0;

  return (
    <>
      <tr
        data-testid={`row-script-${index}`}
        className={cn(
          "border-b transition-colors",
          hasRecs && "cursor-pointer",
          script.impactLevel === "High" && "bg-red-50/60 hover:bg-red-50",
          script.impactLevel === "Medium" && "bg-amber-50/40 hover:bg-amber-50/60",
          script.impactLevel === "Low" && "hover:bg-gray-50",
        )}
        onClick={() => hasRecs && setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <div className="w-11 h-11 rounded-lg bg-slate-100 border flex items-center justify-center flex-shrink-0">
            <FileCode className="w-5 h-5 text-slate-500" />
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="max-w-[200px] truncate font-mono text-xs text-gray-700" title={script.fileName}>
            {script.fileName}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] uppercase font-bold bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">JS</span>
            <span className="text-[10px] text-gray-400 capitalize">{script.chunkType}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="text-xs text-gray-500">All pages</span>
        </td>
        <td className="px-4 py-3">
          <span className={cn("text-sm font-semibold", script.fileSize > 300 ? "text-red-600" : script.fileSize > 100 ? "text-amber-600" : "text-gray-700")}>
            {formatSize(script.fileSize)}
          </span>
          {script.gzipSize && (
            <div className="text-[10px] text-gray-400 mt-0.5">~{script.gzipSize} KB gzipped</div>
          )}
        </td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 border-yellow-200">
            <FileCode className="w-3 h-3" />
            Script
          </span>
        </td>
        <td className="px-4 py-3"><ImpactBadge level={script.impactLevel} /></td>
        <td className="px-4 py-3">
          {hasRecs && (expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)}
        </td>
      </tr>
      {expanded && hasRecs && (
        <tr className={cn(script.impactLevel === "High" && "bg-red-50/30", script.impactLevel === "Medium" && "bg-amber-50/20")}>
          <td colSpan={7} className="px-4 py-3 border-b">
            <div className="ml-16 space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-amber-500" />
                {script.impactReason}
              </p>
              <ul className="space-y-1.5">
                {script.recommendations.map((rec, ri) => (
                  <li key={ri} className="flex items-start gap-2 text-xs text-gray-600">
                    <ArrowDownToLine className="w-3.5 h-3.5 text-brand-gold mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function CMSPerformance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterImpact, setFilterImpact] = useState<ImpactFilter>("all");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery<AnalysisData>({
    queryKey: ["/api/cms/performance-analysis"],
    queryFn: async () => {
      const res = await fetch("/api/cms/performance-analysis", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch("/api/cms/optimize-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      return res.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Image Optimized",
        description: `Saved ${result.savings}% — ${result.originalSize} KB → ${result.newSize} KB (WebP)`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/performance-analysis"] });
    },
    onError: (err: Error) => {
      toast({ title: "Optimization Failed", description: err.message, variant: "destructive" });
    },
  });

  const images = data?.images || [];
  const scripts = data?.scripts || [];
  const summary = data?.summary;

  const filterItem = (item: { impactLevel: string; recommendations: string[]; url?: string; page?: string; fileName?: string }) => {
    if (filterImpact === "affecting" && item.recommendations.length === 0) return false;
    if (filterImpact === "High" && item.impactLevel !== "High") return false;
    if (filterImpact === "Medium" && item.impactLevel !== "Medium") return false;
    if (filterImpact === "Low" && item.impactLevel !== "Low") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchFields = [item.url, item.page, item.fileName].filter(Boolean).join(" ").toLowerCase();
      return searchFields.includes(q);
    }
    return true;
  };

  const filteredImages = images.filter(filterItem);
  const filteredScripts = scripts.filter(filterItem);

  const showImages = activeTab === "all" || activeTab === "images";
  const showScripts = activeTab === "all" || activeTab === "scripts";

  return (
    <CMSLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 data-testid="text-perf-title" className="text-2xl font-serif text-brand-blue flex items-center gap-2">
              <Gauge className="w-7 h-7 text-brand-gold" />
              Website Performance Analyzer
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Scan all pages to detect elements slowing down the website
            </p>
          </div>
          <Button data-testid="button-rescan" variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Scan Website
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
            <span className="text-gray-500 text-sm">Scanning all pages and assets...</span>
            <span className="text-gray-400 text-xs">Analyzing images, scripts, and detecting LCP elements...</span>
          </div>
        ) : summary ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold text-red-600" data-testid="text-high-total">{summary.overallHighCount}</p>
                      <p className="text-[11px] text-gray-500">High Impact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-2xl font-bold text-amber-600" data-testid="text-affecting">{summary.overallAffecting}</p>
                      <p className="text-[11px] text-gray-500">Need Attention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600" data-testid="text-lcp">{summary.lcpCount}</p>
                      <p className="text-[11px] text-gray-500">LCP Elements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-400">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-img-count">{summary.totalImages}</p>
                      <p className="text-[11px] text-gray-500">Images ({summary.imgTotalSizeMB} MB)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileCode className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-js-count">{summary.totalScripts}</p>
                      <p className="text-[11px] text-gray-500">Scripts ({summary.jsTotalSizeKB} KB)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-total-size">{summary.imgTotalSizeMB + Math.round(summary.jsTotalSizeKB / 1024)} MB</p>
                      <p className="text-[11px] text-gray-500">Total Assets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {summary.overallHighCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    {summary.overallHighCount} element{summary.overallHighCount > 1 ? "s" : ""} significantly slowing your website
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {summary.imgHighCount > 0 && `${summary.imgHighCount} heavy image${summary.imgHighCount > 1 ? "s" : ""} (including ${summary.lcpCount} LCP candidate${summary.lcpCount > 1 ? "s" : ""}). `}
                    {summary.jsHighCount > 0 && `${summary.jsHighCount} large JavaScript bundle${summary.jsHighCount > 1 ? "s" : ""} blocking page render. `}
                    Fixing these will noticeably improve page speed and Core Web Vitals.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                {([
                  { key: "all" as TabType, label: "All Elements", icon: <Package className="w-3.5 h-3.5" /> },
                  { key: "images" as TabType, label: `Images (${images.length})`, icon: <ImageIcon className="w-3.5 h-3.5" /> },
                  { key: "scripts" as TabType, label: `Scripts (${scripts.length})`, icon: <FileCode className="w-3.5 h-3.5" /> },
                ]).map(({ key, label, icon }) => (
                  <button
                    key={key}
                    data-testid={`tab-${key}`}
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md transition-all",
                      activeTab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    data-testid="input-perf-search"
                    placeholder="Search by filename, URL, or page..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {([
                    { key: "all" as ImpactFilter, label: "All", color: "" },
                    { key: "affecting" as ImpactFilter, label: `Slowing (${summary.overallAffecting})`, color: "bg-brand-gold hover:bg-brand-gold/90" },
                    { key: "High" as ImpactFilter, label: `High (${summary.overallHighCount})`, color: "bg-red-600 hover:bg-red-700" },
                    { key: "Medium" as ImpactFilter, label: `Medium (${summary.imgMediumCount + summary.jsMediumCount})`, color: "bg-amber-600 hover:bg-amber-700" },
                  ]).map(({ key, label, color }) => (
                    <Button
                      key={key}
                      data-testid={`button-filter-${key}`}
                      variant={filterImpact === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterImpact(key)}
                      className={cn("text-xs", filterImpact === key && color)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-performance">
                  <thead>
                    <tr className="border-b bg-gray-50/80">
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-14"></th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Resource</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Page</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Size</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Position / Type</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Impact</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs w-32">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showImages && filteredImages.length > 0 && (
                      <>
                        {activeTab === "all" && (
                          <tr className="bg-blue-50/50">
                            <td colSpan={7} className="px-4 py-2">
                              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                                <ImageIcon className="w-3.5 h-3.5" />
                                Images ({filteredImages.length})
                              </span>
                            </td>
                          </tr>
                        )}
                        {filteredImages.map((img, i) => (
                          <ImageRow
                            key={img.url + img.page}
                            img={img}
                            index={i}
                            onOptimize={(url) => optimizeMutation.mutate(url)}
                            optimizing={optimizeMutation.isPending ? (optimizeMutation.variables as string) : null}
                          />
                        ))}
                      </>
                    )}
                    {showScripts && filteredScripts.length > 0 && (
                      <>
                        {activeTab === "all" && (
                          <tr className="bg-yellow-50/50">
                            <td colSpan={7} className="px-4 py-2">
                              <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wider flex items-center gap-1.5">
                                <FileCode className="w-3.5 h-3.5" />
                                JavaScript Bundles ({filteredScripts.length})
                              </span>
                            </td>
                          </tr>
                        )}
                        {filteredScripts.map((s, i) => (
                          <ScriptRow key={s.fileName} script={s} index={i} />
                        ))}
                      </>
                    )}
                    {(showImages ? filteredImages.length : 0) + (showScripts ? filteredScripts.length : 0) === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-gray-400">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                          <p className="text-sm font-medium">No elements match your filters</p>
                          <p className="text-xs mt-1">Try changing the filter or search query</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
                <span>
                  {showImages ? filteredImages.length : 0} image{filteredImages.length !== 1 ? "s" : ""}
                  {showScripts && ` · ${filteredScripts.length} script${filteredScripts.length !== 1 ? "s" : ""}`}
                </span>
                <span>
                  Total: {summary.imgTotalSizeMB} MB images + {summary.jsTotalSizeKB} KB scripts
                </span>
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </CMSLayout>
  );
}
