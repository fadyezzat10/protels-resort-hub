import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Newspaper,
  Link as LinkIcon,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface BlogForm {
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  excerptEn: string;
  excerptAr: string;
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
  hotelSlug: string;
  status: string;
}

const emptyForm: BlogForm = {
  slug: "",
  titleEn: "",
  titleAr: "",
  contentEn: "",
  contentAr: "",
  excerptEn: "",
  excerptAr: "",
  featuredImage: "",
  metaTitle: "",
  metaDescription: "",
  hotelSlug: "",
  status: "draft",
};

const hotelOptions = [
  { value: "", label: "None (General)" },
  { value: "crystal-beach", label: "Crystal Beach Resort" },
  { value: "beach-club", label: "Beach Club & Spa" },
  { value: "royal-bay", label: "Royal Bay Resort & Spa" },
  { value: "la-plage", label: "La Plage Zanzibar" },
];

export default function CMSBlog() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [activeTab, setActiveTab] = useState<"en" | "ar">("en");

  const { data: posts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cms/blog"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/cms/blog", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/blog"] });
      setDialogOpen(false);
      setForm(emptyForm);
      toast({ title: "Blog post created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/cms/blog/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/blog"] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: "Blog post updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cms/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/blog"] });
      setDeleteId(null);
      toast({ title: "Blog post deleted" });
    },
  });

  const handleSubmit = () => {
    const payload = {
      slug: form.slug,
      title: { en: form.titleEn, ar: form.titleAr },
      content: { en: form.contentEn, ar: form.contentAr },
      excerpt: { en: form.excerptEn, ar: form.excerptAr },
      featuredImage: form.featuredImage || null,
      metaTitle: form.metaTitle || null,
      metaDescription: form.metaDescription || null,
      hotelSlug: form.hotelSlug === "none" ? null : (form.hotelSlug || null),
      status: form.status,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (post: any) => {
    setEditingId(post.id);
    setForm({
      slug: post.slug,
      titleEn: post.title?.en || "",
      titleAr: post.title?.ar || "",
      contentEn: post.content?.en || "",
      contentAr: post.content?.ar || "",
      excerptEn: post.excerpt?.en || "",
      excerptAr: post.excerpt?.ar || "",
      featuredImage: post.featuredImage || "",
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      hotelSlug: post.hotelSlug || "",
      status: post.status,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  return (
    <CMSLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">Blog Articles</h2>
          <p className="text-gray-500">Manage your blog content for SEO</p>
        </div>
        <Button data-testid="button-create-blog" onClick={openCreate} className="bg-brand-blue hover:bg-brand-blue/90">
          <Plus className="w-4 h-4 mr-2" /> New Article
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No articles yet</h3>
            <p className="text-gray-400 mb-6">Create your first blog article to boost SEO and drive bookings.</p>
            <Button data-testid="button-create-first-blog" onClick={openCreate} className="bg-brand-blue hover:bg-brand-blue/90">
              <Plus className="w-4 h-4 mr-2" /> Create First Article
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 data-testid={`text-blog-title-${post.id}`} className="text-lg font-semibold text-brand-blue truncate">
                        {post.title?.en || "Untitled"}
                      </h3>
                      <Badge variant={post.status === "published" ? "default" : "secondary"} className={post.status === "published" ? "bg-green-100 text-green-800" : ""}>
                        {post.status === "published" ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate mb-1">/blog/{post.slug}</p>
                    {post.hotelSlug && (
                      <div className="flex items-center gap-1 text-xs text-brand-gold">
                        <LinkIcon className="w-3 h-3" />
                        {hotelOptions.find(h => h.value === post.hotelSlug)?.label || post.hotelSlug}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button data-testid={`button-edit-blog-${post.id}`} variant="outline" size="sm" onClick={() => openEdit(post)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button data-testid={`button-delete-blog-${post.id}`} variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteId(post.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-brand-blue font-serif text-2xl">
              {editingId ? "Edit Article" : "Create New Article"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  data-testid="input-blog-slug"
                  placeholder="my-article-title"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger data-testid="select-blog-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant={activeTab === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("en")}
                className={activeTab === "en" ? "bg-brand-blue" : ""}
              >
                English
              </Button>
              <Button
                type="button"
                variant={activeTab === "ar" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("ar")}
                className={activeTab === "ar" ? "bg-brand-blue" : ""}
              >
                Arabic
              </Button>
            </div>

            {activeTab === "en" ? (
              <div className="space-y-4">
                <div>
                  <Label>Title (English)</Label>
                  <Input
                    data-testid="input-blog-title-en"
                    placeholder="Article Title"
                    value={form.titleEn}
                    onChange={(e) => {
                      setForm({ ...form, titleEn: e.target.value });
                      if (!editingId && !form.slug) {
                        setForm(f => ({ ...f, titleEn: e.target.value, slug: generateSlug(e.target.value) }));
                      }
                    }}
                  />
                </div>
                <div>
                  <Label>Excerpt (English)</Label>
                  <Textarea
                    data-testid="input-blog-excerpt-en"
                    placeholder="Brief summary of the article..."
                    rows={2}
                    value={form.excerptEn}
                    onChange={(e) => setForm({ ...form, excerptEn: e.target.value })}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Content (English) — HTML supported</Label>
                    <label className="cursor-pointer" title="Upload .html file">
                      <input
                        type="file"
                        accept=".html,.htm"
                        className="hidden"
                        data-testid="upload-html-en"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const raw = ev.target?.result as string;
                            const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                            const content = bodyMatch ? bodyMatch[1].trim() : raw;
                            setForm((f) => ({ ...f, contentEn: content }));
                            toast({ title: "HTML loaded", description: `${file.name} content loaded into editor.` });
                          };
                          reader.readAsText(file);
                          e.target.value = "";
                        }}
                      />
                      <span className="inline-flex items-center gap-1 text-xs text-brand-gold border border-brand-gold/40 rounded px-2 py-1 hover:bg-brand-gold/10 transition-colors">
                        <Upload className="w-3 h-3" /> Upload .html
                      </span>
                    </label>
                  </div>
                  <Textarea
                    data-testid="input-blog-content-en"
                    placeholder="<h2>Introduction</h2><p>Write your article content here...</p>"
                    rows={18}
                    className="font-mono text-sm"
                    value={form.contentEn}
                    onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4" dir="rtl">
                <div>
                  <Label>Title (Arabic)</Label>
                  <Input
                    data-testid="input-blog-title-ar"
                    placeholder="عنوان المقال"
                    value={form.titleAr}
                    onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Excerpt (Arabic)</Label>
                  <Textarea
                    data-testid="input-blog-excerpt-ar"
                    placeholder="ملخص قصير للمقال..."
                    rows={2}
                    value={form.excerptAr}
                    onChange={(e) => setForm({ ...form, excerptAr: e.target.value })}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Content (Arabic) — HTML supported</Label>
                    <label className="cursor-pointer" title="رفع ملف HTML">
                      <input
                        type="file"
                        accept=".html,.htm"
                        className="hidden"
                        data-testid="upload-html-ar"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const raw = ev.target?.result as string;
                            const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                            const content = bodyMatch ? bodyMatch[1].trim() : raw;
                            setForm((f) => ({ ...f, contentAr: content }));
                            toast({ title: "تم تحميل HTML", description: `تم تحميل محتوى ${file.name} في المحرر.` });
                          };
                          reader.readAsText(file);
                          e.target.value = "";
                        }}
                      />
                      <span className="inline-flex items-center gap-1 text-xs text-brand-gold border border-brand-gold/40 rounded px-2 py-1 hover:bg-brand-gold/10 transition-colors">
                        <Upload className="w-3 h-3" /> رفع .html
                      </span>
                    </label>
                  </div>
                  <Textarea
                    data-testid="input-blog-content-ar"
                    placeholder="<h2>المقدمة</h2><p>اكتب محتوى المقال هنا...</p>"
                    rows={18}
                    className="font-mono text-sm"
                    value={form.contentAr}
                    onChange={(e) => setForm({ ...form, contentAr: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-semibold text-brand-blue mb-3">Article Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Featured Image URL</Label>
                  <Input
                    data-testid="input-blog-image"
                    placeholder="/uploads/my-image.jpg"
                    value={form.featuredImage}
                    onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Linked Hotel</Label>
                  <Select value={form.hotelSlug} onValueChange={(v) => setForm({ ...form, hotelSlug: v })}>
                    <SelectTrigger data-testid="select-blog-hotel">
                      <SelectValue placeholder="None (General)" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotelOptions.map(opt => (
                        <SelectItem key={opt.value || "none"} value={opt.value || "none"}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-brand-blue mb-3">SEO Settings</h4>
              <div className="space-y-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    data-testid="input-blog-meta-title"
                    placeholder="SEO title for search engines"
                    value={form.metaTitle}
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.metaTitle.length}/60 characters</p>
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    data-testid="input-blog-meta-desc"
                    placeholder="SEO description for search engines"
                    rows={2}
                    value={form.metaDescription}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.metaDescription.length}/160 characters</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                data-testid="button-save-blog"
                className="bg-brand-blue hover:bg-brand-blue/90"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Update Article" : "Create Article"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this article?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete-blog"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}
