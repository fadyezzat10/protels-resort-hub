import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Plus, Pencil, Trash2, LayoutDashboard, ExternalLink, Globe } from "lucide-react";
import { useLocation } from "wouter";

const SLUG_TO_ROUTE: Record<string, string> = {
  home: "/",
  about: "/about",
  "about-us": "/about",
  contact: "/contact",
  careers: "/careers",
  hotels: "/hotels",
  gallery: "/gallery",
  blog: "/blog",
};

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

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇪🇬", dir: "rtl" },
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "es", label: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "ru", label: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "pl", label: "Polski", flag: "🇵🇱", dir: "ltr" },
  { code: "cs", label: "Čeština", flag: "🇨🇿", dir: "ltr" },
] as const;

type LangCode = typeof LANGUAGES[number]["code"];

interface PageForm {
  slug: string;
  title: Record<string, string>;
  content: Record<string, string>;
  metaTitle: string;
  metaDescription: string;
  status: string;
}

const emptyForm: PageForm = {
  slug: "",
  title: {},
  content: {},
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
  const [activeLang, setActiveLang] = useState<LangCode>("en");

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
      title: form.title,
      content: form.content,
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
      title: page.title || {},
      content: page.content || {},
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      status: page.status || "draft",
    });
    setActiveLang("en");
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setActiveLang("en");
    setDialogOpen(true);
  };

  const toggleStatus = (page: any) => {
    const newStatus = page.status === "published" ? "draft" : "published";
    updateMutation.mutate({ id: page.id, data: { status: newStatus } });
  };

  const setTitle = (lang: string, value: string) => {
    setForm({ ...form, title: { ...form.title, [lang]: value } });
  };

  const setContent = (lang: string, value: string) => {
    setForm({ ...form, content: { ...form.content, [lang]: value } });
  };

  const filledLangs = LANGUAGES.filter(
    (l) => (form.title[l.code] || "").trim() || (form.content[l.code] || "").trim()
  );

  const currentLang = LANGUAGES.find((l) => l.code === activeLang)!;

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
              <TableHead>Languages</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  Loading...
                </TableCell>
              </TableRow>
            ) : pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  No pages found. Create your first page.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page: any) => {
                const translatedLangs = LANGUAGES.filter(
                  (l) => (page.title?.[l.code] || "").trim() || (page.content?.[l.code] || "").trim()
                );
                return (
                  <TableRow key={page.id} data-testid={`row-page-${page.id}`}>
                    <TableCell className="font-medium">{page.title?.en || page.slug}</TableCell>
                    <TableCell className="text-gray-500">/{page.slug}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {translatedLangs.length > 0 ? (
                          translatedLangs.map((l) => (
                            <span
                              key={l.code}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200"
                              title={l.label}
                            >
                              {l.flag} {l.code.toUpperCase()}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </div>
                    </TableCell>
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
                      {SLUG_TO_ROUTE[page.slug] ? (
                        <Button
                          data-testid={`button-liveedit-page-${page.id}`}
                          variant="ghost"
                          size="sm"
                          title="تعديل مباشر على الصفحة"
                          onClick={() => {
                            window.open(SLUG_TO_ROUTE[page.slug], "_blank");
                          }}
                        >
                          <ExternalLink className="w-4 h-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button
                          data-testid={`button-builder-page-${page.id}`}
                          variant="ghost"
                          size="sm"
                          title="Visual Editor"
                          onClick={() => setLocation(`/controlpanal/visual-edit/${page.slug}`)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-500" />
                        </Button>
                      )}
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {editingId ? "Edit Page" : "Create New Page"}
            </DialogTitle>
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

            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {LANGUAGES.map((lang) => {
                  const hasTrans = (form.title[lang.code] || "").trim() || (form.content[lang.code] || "").trim();
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      data-testid={`tab-lang-${lang.code}`}
                      onClick={() => setActiveLang(lang.code)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                        activeLang === lang.code
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : hasTrans
                          ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.code.toUpperCase()}</span>
                      {hasTrans && activeLang !== lang.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {filledLangs.length > 0 && (
                <p className="text-xs text-gray-400 mb-2">
                  {filledLangs.length} / {LANGUAGES.length} languages filled
                </p>
              )}
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{currentLang.flag}</span>
                <span className="font-medium text-sm">{currentLang.label}</span>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Title ({currentLang.label})
                </label>
                <Input
                  data-testid={`input-page-title-${activeLang}`}
                  value={form.title[activeLang] || ""}
                  onChange={(e) => setTitle(activeLang, e.target.value)}
                  placeholder={`Title in ${currentLang.label}`}
                  dir={currentLang.dir}
                  required={activeLang === "en"}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Content ({currentLang.label})
                </label>
                <Textarea
                  data-testid={`input-page-content-${activeLang}`}
                  value={form.content[activeLang] || ""}
                  onChange={(e) => setContent(activeLang, e.target.value)}
                  placeholder={`Content in ${currentLang.label}`}
                  rows={6}
                  dir={currentLang.dir}
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
