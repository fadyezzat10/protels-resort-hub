import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Save, Upload, FileText, Image, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function CMSCompanyProfile() {
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [status, setStatus] = useState("inactive");
  const [uploading, setUploading] = useState(false);

  const { data: settings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cms/settings"],
  });

  useEffect(() => {
    if (settings && settings.length > 0) {
      const findSetting = (key: string) => {
        const s = settings.find((s: any) => s.key === key);
        return s?.value ?? "";
      };
      setTitle(findSetting("company_profile_title"));
      setCoverImage(findSetting("company_profile_cover"));
      setPdfUrl(findSetting("company_profile_pdf"));
      setStatus(findSetting("company_profile_status") || "inactive");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      await apiRequest("PUT", `/api/cms/settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/settings"] });
      toast({ title: "Setting saved successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "Error", description: "Only PDF files are allowed", variant: "destructive" });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "Error", description: "File size must be less than 50MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cms/company-profile/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setPdfUrl(data.url);
      queryClient.invalidateQueries({ queryKey: ["/api/cms/settings"] });
      toast({ title: "PDF uploaded successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const toggleStatus = () => {
    const newStatus = status === "active" ? "inactive" : "active";
    setStatus(newStatus);
    saveMutation.mutate({ key: "company_profile_status", value: newStatus });
  };

  return (
    <CMSLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-serif text-brand-blue mb-2">Company Profile</h2>
        <p className="text-gray-500">Manage the Company Profile flipbook page</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-lg">
                  {status === "active" ? (
                    <ToggleRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                  Status
                </span>
                <Button
                  data-testid="button-toggle-company-profile-status"
                  variant={status === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={toggleStatus}
                  disabled={saveMutation.isPending}
                  className={status === "active" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {status === "active" ? "Active" : "Inactive"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {status === "active"
                  ? "The Company Profile page is visible on the website."
                  : "The Company Profile page is hidden from the website."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-brand-blue" /> Profile Title
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  data-testid="input-company-profile-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Company Profile 2026"
                />
                <Button
                  data-testid="button-save-company-profile-title"
                  size="sm"
                  onClick={() => saveMutation.mutate({ key: "company_profile_title", value: title })}
                  disabled={saveMutation.isPending}
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="w-5 h-5 text-brand-blue" /> PDF File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Upload PDF (max 50MB)</label>
                <input
                  data-testid="input-company-profile-pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-brand-blue/90 file:cursor-pointer"
                />
              </div>
              {pdfUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">PDF uploaded</p>
                        <p className="text-xs text-green-600 break-all">{pdfUrl}</p>
                      </div>
                    </div>
                    <Button
                      data-testid="button-remove-company-profile-pdf"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPdfUrl("");
                        saveMutation.mutate({ key: "company_profile_pdf", value: "" });
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              )}
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-brand-blue">
                  <div className="animate-spin w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full" />
                  Uploading PDF...
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-1 block">Or paste PDF URL</label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-company-profile-pdf-url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://example.com/company-profile.pdf"
                  />
                  <Button
                    data-testid="button-save-company-profile-pdf-url"
                    size="sm"
                    onClick={() => saveMutation.mutate({ key: "company_profile_pdf", value: pdfUrl })}
                    disabled={saveMutation.isPending}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="w-5 h-5 text-brand-blue" /> Cover Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Cover Image URL</label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-company-profile-cover"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                  />
                  <Button
                    data-testid="button-save-company-profile-cover"
                    size="sm"
                    onClick={() => saveMutation.mutate({ key: "company_profile_cover", value: coverImage })}
                    disabled={saveMutation.isPending}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Upload image in Media Library first, then paste URL here.</p>
              </div>
              {coverImage && (
                <img
                  data-testid="img-preview-company-profile-cover"
                  src={coverImage}
                  alt="Cover preview"
                  className="mt-2 max-h-48 object-contain bg-gray-100 p-2 rounded"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </CMSLayout>
  );
}
