import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Plus, Pencil, Trash2, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export default function CMSSeo() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
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

  const { data: seoEntries = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cms/seo"],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: SeoForm) => {
      await apiRequest("PUT", "/api/cms/seo", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/seo"] });
      setDialogOpen(false);
      setEditingId(null);
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
    setEditingId(entry.id);
    setForm({
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

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  return (
    <CMSLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">SEO Management</h2>
          <p className="text-gray-500">Manage SEO settings per page</p>
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
          <Button data-testid="button-create-seo" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add SEO Entry
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page Path</TableHead>
              <TableHead>Meta Title</TableHead>
              <TableHead>Meta Description</TableHead>
              <TableHead>Robots</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">Loading...</TableCell>
              </TableRow>
            ) : seoEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2" />
                  No SEO entries. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              seoEntries.map((entry: any) => (
                <TableRow key={entry.id} data-testid={`row-seo-${entry.id}`}>
                  <TableCell className="font-medium">{entry.pagePath}</TableCell>
                  <TableCell className="text-gray-500 max-w-[200px] truncate">
                    {entry.metaTitle || "—"}
                  </TableCell>
                  <TableCell className="text-gray-500 max-w-[200px] truncate">
                    {entry.metaDescription || "—"}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">{entry.robots || "—"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      data-testid={`button-edit-seo-${entry.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(entry)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      data-testid={`button-delete-seo-${entry.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(entry.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit SEO Entry" : "Add SEO Entry"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-seo">
            <div>
              <label className="text-sm font-medium mb-1 block">Page Path</label>
              <Input
                data-testid="input-seo-page-path"
                value={form.pagePath}
                onChange={(e) => setForm({ ...form, pagePath: e.target.value })}
                placeholder="/about or /hotels/beach-club"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Meta Title</label>
              <Input
                data-testid="input-seo-meta-title"
                value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                placeholder="Page title for search engines"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Meta Description</label>
              <Textarea
                data-testid="input-seo-meta-desc"
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                placeholder="Page description for search engines"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">OG Title</label>
                <Input
                  data-testid="input-seo-og-title"
                  value={form.ogTitle}
                  onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
                  placeholder="Open Graph title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">OG Image</label>
                <Input
                  data-testid="input-seo-og-image"
                  value={form.ogImage}
                  onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">OG Description</label>
              <Textarea
                data-testid="input-seo-og-desc"
                value={form.ogDescription}
                onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
                placeholder="Open Graph description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Canonical URL</label>
                <Input
                  data-testid="input-seo-canonical"
                  value={form.canonicalUrl}
                  onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                  placeholder="https://..."
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
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                data-testid="button-save-seo"
                type="submit"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Saving..." : "Save SEO"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete SEO Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this SEO entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete-seo"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}
