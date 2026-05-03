import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Plus, Pencil, Trash2, RefreshCw, Globe, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface SeoForm {
  id?: number;
  pagePath: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
}

const emptyForm: SeoForm = {
  pagePath: "",
  metaTitle: "",
  metaDescription: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  canonicalUrl: "",
  robots: "index, follow",
};

const STATIC_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/hotels", label: "Hotels" },
  { path: "/contact", label: "Contact" },
  { path: "/gallery", label: "Gallery" },
  { path: "/careers", label: "Careers" },
  { path: "/blog", label: "Blog" },
];

export default function CMSSeo() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<SeoForm>(emptyForm);

  const regenerateSitemapMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/regenerate-sitemap");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `Sitemap regenerated — ${data.urls} URLs written to sitemap.xml` });
    },
    onError: (err: Error) => toast({ title: "Error regenerating sitemap", description: err.message, variant: "destructive" }),
  });

  const { data: seoEntries = [], isLoading: seoLoading } = useQuery<any[]>({
    queryKey: ["/api/cms/seo"],
  });

  const { data: hotelsData = [] } = useQuery<any[]>({
    queryKey: ["/api/cms/hotels"],
    queryFn: async () => {
      const res = await fetch("/api/cms/hotels", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: SeoForm) => {
      const { id: _id, ...payload } = data;
      await apiRequest("PUT", "/api/cms/seo", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/seo"] });
      setDialogOpen(false);
      setForm(emptyForm);
      toast({ title: "SEO settings saved successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cms/seo/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/seo"] });
      setDeleteId(null);
      toast({ title: "SEO entry deleted" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pagePath.trim()) {
      toast({ title: "Page path is required", variant: "destructive" });
      return;
    }
    saveMutation.mutate(form);
  };

  const openEdit = (entry: any) => {
    setForm({
      id: entry.id,
      pagePath: entry.pagePath || "",
      metaTitle: entry.metaTitle || "",
      metaDescription: entry.metaDescription || "",
      ogTitle: entry.ogTitle || "",
      ogDescription: entry.ogDescription || "",
      ogImage: entry.ogImage || "",
      canonicalUrl: entry.canonicalUrl || "",
      robots: entry.robots || "index, follow",
    });
    setDialogOpen(true);
  };

  const openCreate = (prefillPath?: string) => {
    setForm({ ...emptyForm, pagePath: prefillPath || "" });
    setDialogOpen(true);
  };

  const getEntryForPath = (path: string) =>
    seoEntries.find((e: any) => e.pagePath === path);

  const hotelRoutes = hotelsData.map((h: any) => ({
    path: `/hotels/${h.slug}`,
    label: h.name || h.slug,
    hotel: h,
  }));

  const allKnownPaths = [
    ...STATIC_ROUTES.map((r) => r.path),
    ...hotelRoutes.map((r) => r.path),
  ];

  const customEntries = seoEntries.filter(
    (e: any) => !allKnownPaths.includes(e.pagePath)
  );

  return (
    <CMSLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">SEO Settings</h2>
          <p className="text-gray-500">Manage page titles, descriptions, and Open Graph tags per route</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-testid="button-regenerate-sitemap"
            variant="outline"
            onClick={() => regenerateSitemapMutation.mutate()}
            disabled={regenerateSitemapMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${regenerateSitemapMutation.isPending ? "animate-spin" : ""}`} />
            {regenerateSitemapMutation.isPending ? "Regenerating..." : "Regenerate Sitemap"}
          </Button>
          <Button data-testid="button-add-custom-seo" onClick={() => openCreate()}>
            <Plus className="w-4 h-4 mr-2" /> Custom Route
          </Button>
        </div>
      </div>

      {seoLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <div className="animate-spin w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full mr-3" />
          Loading SEO settings...
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-blue" />
              Static Pages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {STATIC_ROUTES.map((route) => {
                const entry = getEntryForPath(route.path);
                return (
                  <RouteCard
                    key={route.path}
                    path={route.path}
                    label={route.label}
                    entry={entry}
                    onEdit={() => entry ? openEdit(entry) : openCreate(route.path)}
                    onDelete={entry ? () => setDeleteId(entry.id) : undefined}
                  />
                );
              })}
            </div>
          </section>

          {hotelRoutes.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-blue" />
                Hotel Pages
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {hotelRoutes.map((route) => {
                  const entry = getEntryForPath(route.path);
                  return (
                    <RouteCard
                      key={route.path}
                      path={route.path}
                      label={route.label}
                      entry={entry}
                      showOgImage
                      onEdit={() => entry ? openEdit(entry) : openCreate(route.path)}
                      onDelete={entry ? () => setDeleteId(entry.id) : undefined}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {customEntries.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-blue" />
                Custom Routes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {customEntries.map((entry: any) => (
                  <RouteCard
                    key={entry.id}
                    path={entry.pagePath}
                    label={entry.pagePath}
                    entry={entry}
                    onEdit={() => openEdit(entry)}
                    onDelete={() => setDeleteId(entry.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form.id ? `Edit SEO — ${form.pagePath}` : "Add SEO Entry"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-seo">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Page Path <span className="text-red-500">*</span>
              </label>
              <Input
                data-testid="input-seo-page-path"
                value={form.pagePath}
                onChange={(e) => setForm({ ...form, pagePath: e.target.value })}
                placeholder="/about or /hotels/beach-club"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Use the URL path, e.g. <code>/about</code> or <code>/hotels/beach-club</code></p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Search Engine (Google)</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Meta Title</label>
                  <Input
                    data-testid="input-seo-meta-title"
                    value={form.metaTitle}
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                    placeholder="Page title shown in browser tab and Google results"
                    maxLength={70}
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.metaTitle.length}/70 characters recommended</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Meta Description</label>
                  <Textarea
                    data-testid="input-seo-meta-desc"
                    value={form.metaDescription}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    placeholder="Short description shown under the title in Google search results"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.metaDescription.length}/160 characters recommended</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Social Sharing (Open Graph)</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">OG Title</label>
                  <Input
                    data-testid="input-seo-og-title"
                    value={form.ogTitle}
                    onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
                    placeholder="Title shown when shared on Facebook, Twitter, etc. (leave blank to use Meta Title)"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">OG Description</label>
                  <Textarea
                    data-testid="input-seo-og-desc"
                    value={form.ogDescription}
                    onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
                    placeholder="Description for social sharing (leave blank to use Meta Description)"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">OG Image URL</label>
                  <Input
                    data-testid="input-seo-og-image"
                    value={form.ogImage}
                    onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                    placeholder="https://... (image shown when this page is shared on social media)"
                  />
                  {form.ogImage && (
                    <img
                      src={form.ogImage}
                      alt="OG Image preview"
                      className="mt-2 h-24 w-full object-cover rounded border"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Advanced</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Canonical URL</label>
                  <Input
                    data-testid="input-seo-canonical"
                    value={form.canonicalUrl}
                    onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                    placeholder="https://protels.com/about"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Robots</label>
                  <Input
                    data-testid="input-seo-robots"
                    value={form.robots}
                    onChange={(e) => setForm({ ...form, robots: e.target.value })}
                    placeholder="index, follow"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                data-testid="button-save-seo"
                type="submit"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Saving..." : "Save SEO Settings"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove SEO Override</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the custom SEO settings for this page. The page will fall back to its default metadata. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete-seo"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Override
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}

interface RouteCardProps {
  path: string;
  label: string;
  entry?: any;
  showOgImage?: boolean;
  onEdit: () => void;
  onDelete?: () => void;
}

function RouteCard({ path, label, entry, showOgImage, onEdit, onDelete }: RouteCardProps) {
  const hasOverride = !!entry;

  return (
    <div
      data-testid={`card-seo-${path.replace(/\//g, "-").replace(/^-/, "")}`}
      className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{label}</p>
          <p className="text-xs text-gray-400 font-mono truncate">{path}</p>
        </div>
        {hasOverride ? (
          <Badge
            data-testid={`status-seo-${path.replace(/\//g, "-").replace(/^-/, "")}`}
            className="bg-green-100 text-green-700 border-green-200 shrink-0 text-[10px]"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Custom
          </Badge>
        ) : (
          <Badge
            data-testid={`status-seo-${path.replace(/\//g, "-").replace(/^-/, "")}`}
            variant="outline"
            className="text-gray-400 shrink-0 text-[10px]"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            Default
          </Badge>
        )}
      </div>

      {hasOverride && (
        <div className="space-y-1 text-xs text-gray-500">
          {entry.metaTitle && (
            <p className="truncate">
              <span className="font-medium text-gray-600">Title:</span> {entry.metaTitle}
            </p>
          )}
          {entry.metaDescription && (
            <p className="line-clamp-2">
              <span className="font-medium text-gray-600">Desc:</span> {entry.metaDescription}
            </p>
          )}
          {showOgImage && entry.ogImage && (
            <img
              src={entry.ogImage}
              alt="OG preview"
              className="mt-1 h-16 w-full object-cover rounded border"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>
      )}

      {!hasOverride && (
        <p className="text-xs text-gray-400 italic">
          Using default metadata. Click Edit to add a custom override.
        </p>
      )}

      <div className="flex gap-2 mt-auto pt-1">
        <Button
          data-testid={`button-edit-seo-${path.replace(/\//g, "-").replace(/^-/, "")}`}
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onEdit}
        >
          <Pencil className="w-3 h-3 mr-1" />
          {hasOverride ? "Edit" : "Add Override"}
        </Button>
        {hasOverride && onDelete && (
          <Button
            data-testid={`button-delete-seo-${path.replace(/\//g, "-").replace(/^-/, "")}`}
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
