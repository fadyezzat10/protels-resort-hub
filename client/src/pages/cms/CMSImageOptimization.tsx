import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ImageIcon,
  AlertTriangle,
  CheckCircle,
  Zap,
  Search,
  HardDrive,
  FileWarning,
  Loader2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ImageResult {
  url: string;
  page: string;
  category: string;
  fileSize: number;
  fileSizeBytes: number;
  status: "ok" | "heavy";
  isWebp: boolean;
  exists: boolean;
  recommendedRes: string;
  canOptimize: boolean;
}

interface AnalysisData {
  images: ImageResult[];
  summary: {
    totalImages: number;
    heavyCount: number;
    nonWebpCount: number;
    totalSizeMB: number;
  };
}

export default function CMSImageOptimization() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "heavy" | "ok">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery<AnalysisData>({
    queryKey: ["/api/cms/image-analysis"],
    queryFn: async () => {
      const res = await fetch("/api/cms/image-analysis", { credentials: "include" });
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
        throw new Error(err.message || "Failed to optimize");
      }
      return res.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Image Optimized",
        description: `Saved ${result.savings}% — ${result.originalSize}KB → ${result.newSize}KB`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/image-analysis"] });
    },
    onError: (err: Error) => {
      toast({ title: "Optimization Failed", description: err.message, variant: "destructive" });
    },
  });

  const images = data?.images || [];
  const summary = data?.summary;

  const filtered = images.filter((img) => {
    if (filterStatus !== "all" && img.status !== filterStatus) return false;
    if (filterCategory !== "all" && img.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return img.url.toLowerCase().includes(q) || img.page.toLowerCase().includes(q);
    }
    return true;
  });

  const categories = [...new Set(images.map((i) => i.category))];

  const formatSize = (kb: number) => {
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      hero: "Hero Image",
      gallery: "Gallery",
      room: "Room",
      blog: "Blog",
      media: "Media Library",
    };
    return labels[cat] || cat;
  };

  return (
    <CMSLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 data-testid="text-page-title" className="text-2xl font-serif text-brand-blue">
              Image Optimization
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Analyze and optimize images to improve website performance
            </p>
          </div>
          <Button
            data-testid="button-refresh"
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Rescan
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
            <span className="ml-3 text-gray-500">Scanning images...</span>
          </div>
        ) : summary ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-total-images">
                      {summary.totalImages}
                    </p>
                    <p className="text-xs text-gray-500">Total Images</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600" data-testid="text-heavy-count">
                      {summary.heavyCount}
                    </p>
                    <p className="text-xs text-gray-500">Heavy (&gt;300KB)</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                    <FileWarning className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600" data-testid="text-non-webp">
                      {summary.nonWebpCount}
                    </p>
                    <p className="text-xs text-gray-500">Not WebP</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-total-size">
                      {summary.totalSizeMB} MB
                    </p>
                    <p className="text-xs text-gray-500">Total Size</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  data-testid="input-search"
                  placeholder="Search by URL or page..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "heavy", "ok"] as const).map((s) => (
                  <Button
                    key={s}
                    data-testid={`button-filter-${s}`}
                    variant={filterStatus === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(s)}
                    className={cn(
                      filterStatus === s && s === "heavy" && "bg-red-600 hover:bg-red-700",
                      filterStatus === s && s === "ok" && "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {s === "all" ? "All" : s === "heavy" ? `Heavy (${summary.heavyCount})` : "OK"}
                  </Button>
                ))}
                <select
                  data-testid="select-category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border rounded-md px-3 py-1 text-sm bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{getCategoryLabel(c)}</option>
                  ))}
                </select>
              </div>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-images">
                  <thead>
                    <tr className="border-b bg-gray-50/80">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Preview</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Image URL</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Page</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Size</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Recommended</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Resolution</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-gray-400">
                          No images found matching your filters
                        </td>
                      </tr>
                    ) : (
                      filtered.map((img, i) => (
                        <tr
                          key={img.url}
                          data-testid={`row-image-${i}`}
                          className={cn(
                            "border-b hover:bg-gray-50 transition-colors",
                            img.status === "heavy" && "bg-red-50/40"
                          )}
                        >
                          <td className="px-4 py-3">
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                              {img.exists ? (
                                <img
                                  src={img.url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="max-w-[200px] truncate font-mono text-xs text-gray-700" title={img.url}>
                              {img.url}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {img.isWebp && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                  WebP
                                </span>
                              )}
                              {!img.isWebp && img.exists && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                                  {img.url.split(".").pop()?.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={img.page}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {img.page}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {getCategoryLabel(img.category)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "font-medium text-sm",
                              img.status === "heavy" ? "text-red-600" : "text-gray-700"
                            )}>
                              {img.exists ? formatSize(img.fileSize) : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">&lt; 200 KB</td>
                          <td className="px-4 py-3 text-xs text-gray-500 font-mono">{img.recommendedRes}</td>
                          <td className="px-4 py-3">
                            {img.status === "heavy" ? (
                              <span data-testid={`status-heavy-${i}`} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
                                <AlertTriangle className="w-3 h-3" /> Heavy
                              </span>
                            ) : img.exists ? (
                              <span data-testid={`status-ok-${i}`} className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3" /> OK
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">External</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {img.canOptimize ? (
                              <Button
                                data-testid={`button-optimize-${i}`}
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white"
                                disabled={optimizeMutation.isPending}
                                onClick={() => optimizeMutation.mutate(img.url)}
                              >
                                {optimizeMutation.isPending && optimizeMutation.variables === img.url ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <Zap className="w-3 h-3 mr-1" />
                                )}
                                Optimize
                              </Button>
                            ) : img.isWebp && img.exists ? (
                              <span className="text-xs text-green-500">Already optimized</span>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {filtered.length > 0 && (
                <div className="px-4 py-3 border-t bg-gray-50/50 text-xs text-gray-500">
                  Showing {filtered.length} of {images.length} images
                </div>
              )}
            </Card>
          </>
        ) : null}
      </div>
    </CMSLayout>
  );
}
