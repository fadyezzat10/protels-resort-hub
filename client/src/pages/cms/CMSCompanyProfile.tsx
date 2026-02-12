import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Save, Upload, FileText, Image, ToggleLeft, ToggleRight, Trash2, Type } from "lucide-react";
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

  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroTitleSizeDesktop, setHeroTitleSizeDesktop] = useState("48px");
  const [heroTitleSizeMobile, setHeroTitleSizeMobile] = useState("30px");
  const [heroLetterSpacing, setHeroLetterSpacing] = useState("0.1em");
  const [heroFontFamily, setHeroFontFamily] = useState("Cormorant Garamond");
  const [heroFontWeight, setHeroFontWeight] = useState("700");
  const [heroTextTransform, setHeroTextTransform] = useState("uppercase");
  const [customFontUrl, setCustomFontUrl] = useState("");
  const [customFontName, setCustomFontName] = useState("");
  const [fontUploading, setFontUploading] = useState(false);

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
      setHeroSubtitle(findSetting("company_profile_hero_subtitle"));
      setHeroTitleSizeDesktop(findSetting("company_profile_hero_title_size_desktop") || "48px");
      setHeroTitleSizeMobile(findSetting("company_profile_hero_title_size_mobile") || "30px");
      setHeroLetterSpacing(findSetting("company_profile_hero_letter_spacing") || "0.1em");
      setHeroFontFamily(findSetting("company_profile_hero_font_family") || "");
      setHeroFontWeight(findSetting("company_profile_hero_font_weight") || "700");
      setHeroTextTransform(findSetting("company_profile_hero_text_transform") || "uppercase");
      setCustomFontUrl(findSetting("company_profile_custom_font_url"));
      setCustomFontName(findSetting("company_profile_custom_font_name"));
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
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(errData.message || "Upload failed");
      }
      const data = await res.json();
      setPdfUrl(data.url);
      queryClient.invalidateQueries({ queryKey: ["/api/cms/settings"] });
      toast({ title: "PDF uploaded and saved successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["ttf", "woff", "woff2"].includes(ext || "")) {
      toast({ title: "Error", description: "Only .ttf, .woff, .woff2 files are allowed", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Font file must be less than 5MB", variant: "destructive" });
      return;
    }

    setFontUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const nameFromFile = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      formData.append("fontName", nameFromFile);
      const res = await fetch("/api/cms/company-profile/upload-font", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(errData.message || "Upload failed");
      }
      const data = await res.json();
      setCustomFontUrl(data.url);
      setCustomFontName(data.fontName);
      setHeroFontFamily(data.fontName);
      queryClient.invalidateQueries({ queryKey: ["/api/cms/settings"] });
      toast({ title: "Font uploaded successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setFontUploading(false);
    }
  };

  const removeCustomFont = () => {
    setCustomFontUrl("");
    setCustomFontName("");
    setHeroFontFamily("Cormorant Garamond");
    saveMutation.mutate({ key: "company_profile_custom_font_url", value: "" });
    saveMutation.mutate({ key: "company_profile_custom_font_name", value: "" });
    saveMutation.mutate({ key: "company_profile_hero_font_family", value: "Cormorant Garamond" });
  };

  const toggleStatus = () => {
    const newStatus = status === "active" ? "inactive" : "active";
    setStatus(newStatus);
    saveMutation.mutate({ key: "company_profile_status", value: newStatus });
  };

  const saveAll = async () => {
    try {
      await apiRequest("PUT", "/api/cms/settings/company_profile_title", { value: title });
      await apiRequest("PUT", "/api/cms/settings/company_profile_pdf", { value: pdfUrl });
      await apiRequest("PUT", "/api/cms/settings/company_profile_cover", { value: coverImage });
      await apiRequest("PUT", "/api/cms/settings/company_profile_hero_subtitle", { value: heroSubtitle });
      await apiRequest("PUT", "/api/cms/settings/company_profile_hero_title_size_desktop", { value: heroTitleSizeDesktop });
      await apiRequest("PUT", "/api/cms/settings/company_profile_hero_title_size_mobile", { value: heroTitleSizeMobile });
      await apiRequest("PUT", "/api/cms/settings/company_profile_hero_letter_spacing", { value: heroLetterSpacing });
      await apiRequest("PUT", "/api/cms/settings/company_profile_hero_font_family", { value: heroFontFamily });
      await apiRequest("PUT", "/api/cms/settings/company_profile_hero_font_weight", { value: heroFontWeight });
      await apiRequest("PUT", "/api/cms/settings/company_profile_hero_text_transform", { value: heroTextTransform });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/settings"] });
      toast({ title: "All settings saved successfully" });
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    }
  };

  const previewFontFamily = heroFontFamily
    ? (customFontName && heroFontFamily === customFontName
        ? `'${customFontName}', serif`
        : `'${heroFontFamily}', serif`)
    : "inherit";

  return (
    <CMSLayout>
      {customFontUrl && customFontName && (
        <style>{`@font-face { font-family: '${customFontName}'; src: url('${customFontUrl}'); font-display: swap; }`}</style>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">Company Profile</h2>
          <p className="text-gray-500">Manage the Company Profile flipbook page</p>
        </div>
        <Button data-testid="button-save-all-company-profile" onClick={saveAll} disabled={saveMutation.isPending}>
          <Save className="w-4 h-4 mr-2" /> Save All
        </Button>
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
                <Type className="w-5 h-5 text-brand-blue" /> Company Profile Typography Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-1 block">Hero Subtitle</label>
                <Input
                  data-testid="input-company-profile-hero-subtitle"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Discover our vision, values, and premium resorts..."
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty to use the default subtitle.</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Custom Font Upload</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Upload Font File (.ttf, .woff, .woff2)</label>
                    <input
                      data-testid="input-company-profile-font-upload"
                      type="file"
                      accept=".ttf,.woff,.woff2"
                      onChange={handleFontUpload}
                      disabled={fontUploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-brand-blue/90 file:cursor-pointer"
                    />
                  </div>
                  {fontUploading && (
                    <div className="flex items-center gap-2 text-sm text-brand-blue">
                      <div className="animate-spin w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full" />
                      Uploading font...
                    </div>
                  )}
                  {customFontUrl && customFontName && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Custom font active: {customFontName}</p>
                          <p className="text-xs text-blue-600 break-all">{customFontUrl}</p>
                        </div>
                        <Button
                          data-testid="button-remove-custom-font"
                          variant="ghost"
                          size="sm"
                          onClick={removeCustomFont}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Title Typography</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Font Family</label>
                    <select
                      data-testid="select-company-profile-hero-font-family"
                      value={heroFontFamily}
                      onChange={(e) => setHeroFontFamily(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="">Default (Site Font)</option>
                      {customFontName && (
                        <option value={customFontName}>{customFontName} (Custom)</option>
                      )}
                      <option value="Cormorant Garamond">Cormorant Garamond (Serif)</option>
                      <option value="Playfair Display">Playfair Display (Serif)</option>
                      <option value="Montserrat">Montserrat (Sans-serif)</option>
                      <option value="Georgia">Georgia (Serif)</option>
                      <option value="Times New Roman">Times New Roman (Serif)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Font Weight</label>
                    <select
                      data-testid="select-company-profile-hero-font-weight"
                      value={heroFontWeight}
                      onChange={(e) => setHeroFontWeight(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="300">Light (300)</option>
                      <option value="400">Normal (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-Bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra-Bold (800)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title Size – Desktop</label>
                    <Input
                      data-testid="input-company-profile-hero-title-size-desktop"
                      value={heroTitleSizeDesktop}
                      onChange={(e) => setHeroTitleSizeDesktop(e.target.value)}
                      placeholder="48px"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title Size – Mobile</label>
                    <Input
                      data-testid="input-company-profile-hero-title-size-mobile"
                      value={heroTitleSizeMobile}
                      onChange={(e) => setHeroTitleSizeMobile(e.target.value)}
                      placeholder="30px"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Letter Spacing</label>
                    <Input
                      data-testid="input-company-profile-hero-letter-spacing"
                      value={heroLetterSpacing}
                      onChange={(e) => setHeroLetterSpacing(e.target.value)}
                      placeholder="0.1em"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Text Transform</label>
                    <select
                      data-testid="select-company-profile-hero-text-transform"
                      value={heroTextTransform}
                      onChange={(e) => setHeroTextTransform(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="uppercase">UPPERCASE</option>
                      <option value="none">Normal</option>
                      <option value="capitalize">Capitalize</option>
                      <option value="lowercase">lowercase</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 mb-2">Live Preview:</p>
                <div className="bg-[hsl(215,45%,15%)] rounded-lg p-6 text-center">
                  <p
                    className="text-white drop-shadow-md"
                    style={{
                      fontFamily: previewFontFamily,
                      fontSize: heroTitleSizeDesktop,
                      letterSpacing: heroLetterSpacing,
                      fontWeight: Number(heroFontWeight) || 700,
                      textTransform: heroTextTransform as any,
                    }}
                  >
                    {title || "Company Profile"}
                  </p>
                </div>
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
