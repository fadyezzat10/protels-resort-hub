import CMSLayout from "./CMSLayout";
import { useCMSStore, Page } from "@/lib/cms-store";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Search, ExternalLink } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function CMSPages() {
  const { pages, addPage, updatePage, deletePage } = useCMSStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Empty state
  const emptyPage: Page = {
    id: "",
    title: "",
    slug: "",
    content: "",
    status: 'draft',
    lastUpdatedBy: 'Fezzat',
    lastUpdatedAt: new Date().toISOString(),
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      robots: "index, follow"
    }
  };

  const [formData, setFormData] = useState<Page>(emptyPage);

  const handleEdit = (page: Page) => {
    setEditingId(page.id);
    setFormData(page);
  };

  const handleCreate = () => {
    setEditingId("new");
    setFormData({ ...emptyPage, id: `page-${Date.now()}` });
  };

  const handleSave = () => {
    const pageData = {
      ...formData,
      lastUpdatedAt: new Date().toISOString()
    };
    
    if (editingId === "new") {
      addPage(pageData);
    } else if (editingId) {
      updatePage(editingId, pageData);
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) deletePage(id);
  };

  const handleChange = (field: keyof Page, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSeoChange = (field: keyof Page['seo'], value: any) => {
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo!, [field]: value }
    }));
  };

  if (editingId) {
    return (
      <CMSLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{editingId === "new" ? "New Page" : "Edit Page"}</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-brand-blue text-white">Save Page</Button>
            </div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader><CardTitle>Page Content</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Page Title</Label>
                  <Input value={formData.title} onChange={e => handleChange("title", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Slug (URL)</Label>
                  <Input value={formData.slug} onChange={e => handleChange("slug", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Content (HTML)</Label>
                  <Textarea className="min-h-[300px] font-mono" value={formData.content} onChange={e => handleChange("content", e.target.value)} />
                  <p className="text-xs text-gray-500">Supports basic HTML tags.</p>
                </div>
                <div className="grid gap-2">
                   <Label>Status</Label>
                   <select 
                     className="w-full border rounded-md p-2"
                     value={formData.status}
                     onChange={e => handleChange("status", e.target.value)}
                   >
                     <option value="draft">Draft</option>
                     <option value="published">Published</option>
                   </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Meta Title</Label>
                  <Input value={formData.seo?.metaTitle} onChange={e => handleSeoChange("metaTitle", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Meta Description</Label>
                  <Textarea value={formData.seo?.metaDescription} onChange={e => handleSeoChange("metaDescription", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Pages</h2>
          <p className="text-gray-500 mt-1">Manage static pages</p>
        </div>
        <Button onClick={handleCreate} className="bg-brand-blue text-white gap-2">
          <Plus className="w-4 h-4" /> Create Page
        </Button>
      </div>

      <div className="grid gap-4">
        {pages.map(page => (
          <div key={page.id} className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                 <h3 className="font-bold text-gray-900">{page.title}</h3>
                 <span className={`text-[10px] px-2 py-0.5 rounded-full ${page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                   {page.status}
                 </span>
              </div>
              <a href={page.slug} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                {page.slug} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => handleEdit(page)}>
                <Edit className="w-4 h-4 text-blue-600" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(page.id)}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CMSLayout>
  );
}
