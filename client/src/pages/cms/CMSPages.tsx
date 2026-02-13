import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Plus, Pencil, Trash2, LayoutDashboard } from "lucide-react";
import { useLocation } from "wouter";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface PageForm {
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  metaTitle: string;
  metaDescription: string;
  status: string;
}

const emptyForm: PageForm = {
  slug: "",
  titleEn: "",
  titleAr: "",
  contentEn: "",
  contentAr: "",
  metaTitle: "",
  metaDescription: "",
  status: "draft",
};

export default function CMSPages() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PageForm>(emptyForm);

  const { data: pages = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cms/pages"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/cms/pages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/dashboard"] });
      setDialogOpen(false);
      setForm(emptyForm);
      toast({ title: "Page created successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/cms/pages/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: "Page updated successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cms/pages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/dashboard"] });
      setDeleteId(null);
      toast({ title: "Page deleted successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      slug: form.slug,
      title: { en: form.titleEn, ar: form.titleAr },
      content: { en: form.contentEn, ar: form.contentAr },
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      status: form.status,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (page: any) => {
    setEditingId(page.id);
    setForm({
      slug: page.slug || "",
      titleEn: page.title?.en || "",
      titleAr: page.title?.ar || "",
      contentEn: page.content?.en || "",
      contentAr: page.content?.ar || "",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      status: page.status || "draft",
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const toggleStatus = (page: any) => {
    const newStatus = page.status === "published" ? "draft" : "published";
    updateMutation.mutate({ id: page.id, data: { status: newStatus } });
  };

  return (
    <CMSLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">Pages</h2>
          <p className="text-gray-500">Manage website pages</p>
        </div>
        <Button data-testid="button-create-page" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Page
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  Loading...
                </TableCell>
              </TableRow>
            ) : pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  No pages found. Create your first page.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page: any) => (
                <TableRow key={page.id} data-testid={`row-page-${page.id}`}>
                  <TableCell className="font-medium">{page.title?.en || page.slug}</TableCell>
                  <TableCell className="text-gray-500">/{page.slug}</TableCell>
                  <TableCell>
                    <Badge
                      data-testid={`badge-status-${page.id}`}
                      className="cursor-pointer"
                      variant={page.status === "published" ? "default" : "secondary"}
                      onClick={() => toggleStatus(page)}
                    >
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      data-testid={`button-builder-page-${page.id}`}
                      variant="ghost"
                      size="sm"
                      title="Visual Editor"
                      onClick={() => setLocation(`/controlpanal/visual-edit/${page.slug}`)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button
                      data-testid={`button-edit-page-${page.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(page)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      data-testid={`button-delete-page-${page.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(page.id)}
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
            <DialogTitle>{editingId ? "Edit Page" : "Create New Page"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-page">
            <div>
              <label className="text-sm font-medium mb-1 block">Slug</label>
              <Input
                data-testid="input-page-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="page-slug"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title (English)</label>
                <Input
                  data-testid="input-page-title-en"
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  placeholder="English title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Title (Arabic)</label>
                <Input
                  data-testid="input-page-title-ar"
                  value={form.titleAr}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  placeholder="Arabic title"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Content (English)</label>
                <Textarea
                  data-testid="input-page-content-en"
                  value={form.contentEn}
                  onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
                  placeholder="English content"
                  rows={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content (Arabic)</label>
                <Textarea
                  data-testid="input-page-content-ar"
                  value={form.contentAr}
                  onChange={(e) => setForm({ ...form, contentAr: e.target.value })}
                  placeholder="Arabic content"
                  rows={5}
                  dir="rtl"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Meta Title</label>
              <Input
                data-testid="input-page-meta-title"
                value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                placeholder="SEO meta title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Meta Description</label>
              <Textarea
                data-testid="input-page-meta-desc"
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                placeholder="SEO meta description"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger data-testid="select-page-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                data-testid="button-save-page"
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Page"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this page? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete-page"
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
