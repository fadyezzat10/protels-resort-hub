import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { getYouTubeId } from "@/pages/Home";
import { Save, Globe, Mail, Phone, Share2, Tag, Image, Layout, Link2, MapPin, Type, Menu, Eye, EyeOff, ChevronUp, ChevronDown, Columns, Upload, Loader2, X, ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const PAGE_HEROES = [
  { key: "page_hero_home", label: "Home Page (Slider)", isSlider: true },
  { key: "page_hero_hotels", label: "Hotels & Resorts Page", isSlider: false },
  { key: "page_hero_about", label: "About Us Page", isSlider: false },
  { key: "page_hero_contact", label: "Contact Page", isSlider: false },
  { key: "page_hero_gallery", label: "Gallery Page", isSlider: false },
];

function HeroImageUploader({ settingKey, label, currentValue, isSlider, onSave, isPending }: {
  settingKey: string;
  label: string;
  currentValue: string | string[];
  isSlider: boolean;
  onSave: (key: string, value: any) => Promise<void>;
  isPending: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const images: string[] = isSlider
    ? (Array.isArray(currentValue) ? currentValue : [])
    : (typeof currentValue === "string" && currentValue ? [currentValue] : []);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await fetch("/api/cms/media", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Upload failed");
        }
        const data = await res.json();
        uploaded.push(data.url);
      }
      const newValue = isSlider ? [...images, ...uploaded] : uploaded[0];
      await onSave(settingKey, newValue);
      toast({ title: "Hero image saved successfully" });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Upload failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [images, isSlider, settingKey, onSave, toast]);

  const removeImage = useCallback(async (idx: number) => {
    try {
      if (isSlider) {
        const updated = images.filter((_, i) => i !== idx);
        await onSave(settingKey, updated);
      } else {
        await onSave(settingKey, "");
      }
      toast({ title: "Image removed" });
    } catch (err: any) {
      toast({ title: "Failed to remove image", variant: "destructive" });
    }
  }, [images, isSlider, settingKey, onSave, toast]);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{label}</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || isPending}
          className="gap-2"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading & Saving..." : (isSlider ? "Add Images" : "Upload Image")}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={isSlider}
          className="hidden"
          onChange={handleUpload}
        />
      </div>
      {images.length > 0 ? (
        <div className={`grid ${isSlider ? "grid-cols-3 md:grid-cols-5" : "grid-cols-1"} gap-2`}>
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img
                src={img}
                alt={`Hero ${idx + 1}`}
                className={`rounded border object-cover w-full ${isSlider ? "h-20" : "h-32 max-w-xs"}`}
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-20 bg-gray-50 rounded border border-dashed text-gray-400 text-sm">
          <ImageIcon className="w-5 h-5 mr-2" /> No image set — using default
        </div>
      )}
    </div>
  );
}

export default function CMSSettings() {
  const { toast } = useToast();

  const [gtmId, setGtmId] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [bookingLink, setBookingLink] = useState("");
  const [headerLogo, setHeaderLogo] = useState("");
  const [heroTitleEn, setHeroTitleEn] = useState("");
  const [heroTitleAr, setHeroTitleAr] = useState("");
  const [heroSubtitleEn, setHeroSubtitleEn] = useState("");
  const [heroSubtitleAr, setHeroSubtitleAr] = useState("");
  const [heroImagesText, setHeroImagesText] = useState("");
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [rbVideoUrl, setRbVideoUrl] = useState("");
  const [rbTitleEn, setRbTitleEn] = useState("");
  const [rbTitleAr, setRbTitleAr] = useState("");
  const [rbDescEn, setRbDescEn] = useState("");
  const [rbDescAr, setRbDescAr] = useState("");
  const [rbVisible, setRbVisible] = useState(true);
  const [rbUploadProgress, setRbUploadProgress] = useState<number | null>(null);
  const [pageHeroes, setPageHeroes] = useState<Record<string, any>>({});
  const [footerDescEn, setFooterDescEn] = useState("");
  const [footerDescAr, setFooterDescAr] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
  });

  const defaultNavItems = [
    { href: "/", label: "nav.home", displayLabel: "Home", visible: true, order: 1 },
    { href: "/hotels", label: "nav.hotels", displayLabel: "Hotels", visible: true, order: 2 },
    { href: "/about", label: "nav.about", displayLabel: "About", visible: true, order: 3 },
    { href: "/careers", label: "nav.careers", displayLabel: "Careers", visible: true, order: 4 },
    { href: "/contact", label: "nav.contact", displayLabel: "Contact", visible: true, order: 5 },
    { href: "/gallery", label: "nav.gallery", displayLabel: "Gallery", visible: true, order: 6 },
    { href: "/company-profile", label: "nav.companyProfile", displayLabel: "Company Profile", visible: true, order: 7 },
  ];
  const [headerNavConfig, setHeaderNavConfig] = useState(defaultNavItems);
  const [footerConfig, setFooterConfig] = useState({
    col1Title: "",
    col1Content: "",
    col2Title: "",
    col2Content: "",
    col3Title: "",
    col3Content: "",
  });

  const { data: settings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cms/settings"],
  });

  useEffect(() => {
    if (settings && settings.length > 0) {
      const findSetting = (key: string) => {
        const s = settings.find((s: any) => s.key === key);
        return s?.value ?? "";
      };
      setGtmId(findSetting("gtm_id"));
      setFaviconUrl(findSetting("favicon_url"));
      setSiteName(findSetting("site_name"));
      setContactEmail(findSetting("contact_email"));
      setContactPhone(findSetting("contact_phone"));
      setContactAddress(findSetting("contact_address"));
      setBookingLink(findSetting("booking_link"));
      setHeaderLogo(findSetting("header_logo"));

      const heroTitle = findSetting("hero_title");
      if (heroTitle && typeof heroTitle === "object") {
        setHeroTitleEn(heroTitle.en || "");
        setHeroTitleAr(heroTitle.ar || "");
      }
      const heroSubtitle = findSetting("hero_subtitle");
      if (heroSubtitle && typeof heroSubtitle === "object") {
        setHeroSubtitleEn(heroSubtitle.en || "");
        setHeroSubtitleAr(heroSubtitle.ar || "");
      }
      const heroImages = findSetting("hero_images");
      if (Array.isArray(heroImages)) {
        setHeroImagesText(heroImages.join("\n"));
      }
      setHeroVideoUrl(findSetting("hero_video") || "");

      setRbVideoUrl(findSetting("royal_bay_video_url") || "");
      const rbTitle = findSetting("royal_bay_video_title");
      if (rbTitle && typeof rbTitle === "object") {
        setRbTitleEn(rbTitle.en || "");
        setRbTitleAr(rbTitle.ar || "");
      }
      const rbDesc = findSetting("royal_bay_video_description");
      if (rbDesc && typeof rbDesc === "object") {
        setRbDescEn(rbDesc.en || "");
        setRbDescAr(rbDesc.ar || "");
      }
      const rbVis = findSetting("royal_bay_video_visible");
      setRbVisible(rbVis !== false);

      const footerDesc = findSetting("footer_description");
      if (footerDesc && typeof footerDesc === "object") {
        setFooterDescEn(footerDesc.en || "");
        setFooterDescAr(footerDesc.ar || "");
      }

      const social = findSetting("social_links");
      if (social && typeof social === "object") {
        setSocialLinks({
          facebook: social.facebook || "",
          instagram: social.instagram || "",
          linkedin: social.linkedin || "",
        });
      }

      const heroes: Record<string, any> = {};
      for (const ph of PAGE_HEROES) {
        const val = findSetting(ph.key);
        if (val) heroes[ph.key] = val;
      }
      const heroImagesVal = findSetting("hero_images");
      if (Array.isArray(heroImagesVal) && heroImagesVal.length > 0) {
        heroes["page_hero_home"] = heroImagesVal;
      }
      setPageHeroes(heroes);

      const navConfig = findSetting("header_nav_config");
      if (Array.isArray(navConfig) && navConfig.length > 0) {
        setHeaderNavConfig(navConfig);
      }

      const fConfig = findSetting("footer_config");
      if (fConfig && typeof fConfig === "object") {
        setFooterConfig({
          col1Title: fConfig.col1Title || "",
          col1Content: fConfig.col1Content || "",
          col2Title: fConfig.col2Title || "",
          col2Content: fConfig.col2Content || "",
          col3Title: fConfig.col3Title || "",
          col3Content: fConfig.col3Content || "",
        });
      }
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      await apiRequest("PUT", `/api/cms/settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/settings"] });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const saveSetting = (key: string, value: any) => {
    saveMutation.mutate({ key, value });
  };

  const saveSettingAsync = async (key: string, value: any) => {
    await saveMutation.mutateAsync({ key, value });
  };

  return (
    <CMSLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-serif text-brand-blue mb-2">Settings</h2>
        <p className="text-gray-500">Configure global website settings</p>
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
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5 text-brand-blue" /> Site Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Site Name</label>
                <div className="flex gap-2">
                  <Input data-testid="input-setting-site-name" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Your website name" />
                  <Button data-testid="button-save-site-name" size="sm" onClick={() => saveSetting("site_name", siteName)} disabled={saveMutation.isPending}><Save className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layout className="w-5 h-5 text-brand-blue" /> Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Hero Title (English)</label>
                <Input data-testid="input-setting-hero-title-en" value={heroTitleEn} onChange={(e) => setHeroTitleEn(e.target.value)} placeholder="Welcome to Our Resorts" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Hero Title (Arabic)</label>
                <Input data-testid="input-setting-hero-title-ar" dir="rtl" value={heroTitleAr} onChange={(e) => setHeroTitleAr(e.target.value)} placeholder="مرحباً بكم" />
              </div>
              <Button data-testid="button-save-hero-title" size="sm" onClick={() => saveSetting("hero_title", { en: heroTitleEn, ar: heroTitleAr })} disabled={saveMutation.isPending} className="w-full">
                <Save className="w-4 h-4 mr-2" /> Save Hero Title
              </Button>
              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-1 block">Hero Subtitle (English)</label>
                <Input data-testid="input-setting-hero-subtitle-en" value={heroSubtitleEn} onChange={(e) => setHeroSubtitleEn(e.target.value)} placeholder="Luxury Coastal Living" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Hero Subtitle (Arabic)</label>
                <Input data-testid="input-setting-hero-subtitle-ar" dir="rtl" value={heroSubtitleAr} onChange={(e) => setHeroSubtitleAr(e.target.value)} placeholder="حياة ساحلية فاخرة" />
              </div>
              <Button data-testid="button-save-hero-subtitle" size="sm" onClick={() => saveSetting("hero_subtitle", { en: heroSubtitleEn, ar: heroSubtitleAr })} disabled={saveMutation.isPending} className="w-full">
                <Save className="w-4 h-4 mr-2" /> Save Hero Subtitle
              </Button>
              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-1 block">Hero Slider Images (one URL per line)</label>
                <Textarea data-testid="textarea-setting-hero-images" value={heroImagesText} onChange={(e) => setHeroImagesText(e.target.value)} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" rows={5} />
                <p className="text-xs text-gray-400 mt-1">Leave empty to use default slider images. Upload images in Media Library first, then paste URLs here.</p>
              </div>
              <Button data-testid="button-save-hero-images" size="sm" onClick={() => {
                const images = heroImagesText.split("\n").map(s => s.trim()).filter(s => s.length > 0);
                saveSetting("hero_images", images);
              }} disabled={saveMutation.isPending} className="w-full">
                <Save className="w-4 h-4 mr-2" /> Save Hero Images
              </Button>
              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-1 block">Hero Background Video (MP4 URL)</label>
                <div className="flex gap-2">
                  <Input data-testid="input-setting-hero-video" value={heroVideoUrl} onChange={(e) => setHeroVideoUrl(e.target.value)} placeholder="https://example.com/hero-video.mp4" />
                  <Button data-testid="button-save-hero-video" size="sm" onClick={() => saveSetting("hero_video", heroVideoUrl)} disabled={saveMutation.isPending}><Save className="w-4 h-4" /></Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Optional: A background video plays behind the hero slider. Upload in Media Library first.</p>
                {heroVideoUrl && <video data-testid="video-preview-hero" src={heroVideoUrl} controls muted className="mt-2 w-full max-w-sm rounded border" />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="w-5 h-5 text-brand-blue" /> Royal Bay Video Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-gray-400">Manage the Royal Bay Resort video section shown on the Home page. Supports YouTube links and MP4 URLs.</p>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Show on Home page</label>
                <Button
                  size="sm"
                  variant={rbVisible ? "default" : "outline"}
                  onClick={() => {
                    const newVal = !rbVisible;
                    setRbVisible(newVal);
                    saveSetting("royal_bay_video_visible", newVal);
                  }}
                  disabled={saveMutation.isPending}
                  className="gap-1"
                >
                  {rbVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {rbVisible ? "Visible" : "Hidden"}
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Video URL (YouTube or MP4)</label>
                <div className="flex gap-2">
                  <Input value={rbVideoUrl} onChange={(e) => setRbVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4" />
                  <Button size="sm" onClick={() => saveSetting("royal_bay_video_url", rbVideoUrl)} disabled={saveMutation.isPending}><Save className="w-4 h-4" /></Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    disabled={rbUploadProgress !== null}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "video/*";
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file) return;
                        setRbUploadProgress(0);
                        try {
                          const urlRes = await fetch("/api/cms/video-upload-url", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ filename: file.name, contentType: file.type || "video/mp4" }),
                          });
                          if (!urlRes.ok) throw new Error("Failed to get upload URL");
                          const { uploadUrl, serveUrl } = await urlRes.json();

                          const xhr = new XMLHttpRequest();
                          xhr.open("PUT", uploadUrl);
                          xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
                          xhr.upload.onprogress = (ev) => {
                            if (ev.lengthComputable) {
                              setRbUploadProgress(Math.round((ev.loaded / ev.total) * 100));
                            }
                          };
                          xhr.onload = async () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                              setRbVideoUrl(serveUrl);
                              await saveSettingAsync("royal_bay_video_url", serveUrl);
                              toast({ title: "Video uploaded and saved!" });
                            } else {
                              toast({ title: "Upload failed", description: `Storage error (${xhr.status})`, variant: "destructive" });
                            }
                            setRbUploadProgress(null);
                          };
                          xhr.onerror = () => {
                            toast({ title: "Upload failed", description: "Network error", variant: "destructive" });
                            setRbUploadProgress(null);
                          };
                          xhr.send(file);
                        } catch (err: any) {
                          toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                          setRbUploadProgress(null);
                        }
                      };
                      input.click();
                    }}
                  >
                    {rbUploadProgress !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {rbUploadProgress !== null ? `Uploading... ${rbUploadProgress}%` : "Upload MP4 File"}
                  </Button>
                  <span className="text-xs text-gray-400 self-center">or paste a YouTube / MP4 link above</span>
                </div>
                {rbUploadProgress !== null && (
                  <div className="mt-2">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-brand-blue">{rbUploadProgress}%</span>
                      <span className="text-xs text-gray-400">{rbUploadProgress < 100 ? "Uploading..." : "Processing..."}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: `${rbUploadProgress}%`,
                          background: "linear-gradient(90deg, hsl(215 45% 15%), hsl(215 45% 35%))",
                        }}
                      />
                    </div>
                  </div>
                )}
                {rbVideoUrl && (() => {
                  const ytId = getYouTubeId(rbVideoUrl);
                  if (ytId) {
                    return (
                      <div className="mt-2 aspect-video max-w-sm rounded border overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}`}
                          className="w-full h-full"
                          allow="encrypted-media"
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                  return <video src={rbVideoUrl} controls muted className="mt-2 w-full max-w-sm rounded border" />;
                })()}
              </div>
              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-1 block">Title (English)</label>
                <Input value={rbTitleEn} onChange={(e) => setRbTitleEn(e.target.value)} placeholder="Protels Royal Bay Resort & Spa" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Title (Arabic)</label>
                <Input dir="rtl" value={rbTitleAr} onChange={(e) => setRbTitleAr(e.target.value)} placeholder="بروتيلز رويال باي ريزورت آند سبا" />
              </div>
              <Button size="sm" onClick={() => saveSetting("royal_bay_video_title", { en: rbTitleEn, ar: rbTitleAr })} disabled={saveMutation.isPending} className="w-full">
                <Save className="w-4 h-4 mr-2" /> Save Title
              </Button>
              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-1 block">Description (English)</label>
                <Textarea value={rbDescEn} onChange={(e) => setRbDescEn(e.target.value)} placeholder="Opening Summer 2026 in Hurghada, Egypt" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description (Arabic)</label>
                <Textarea dir="rtl" value={rbDescAr} onChange={(e) => setRbDescAr(e.target.value)} placeholder="الافتتاح صيف 2026 في الغردقة، مصر" rows={3} />
              </div>
              <Button size="sm" onClick={() => saveSetting("royal_bay_video_description", { en: rbDescEn, ar: rbDescAr })} disabled={saveMutation.isPending} className="w-full">
                <Save className="w-4 h-4 mr-2" /> Save Description
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="w-5 h-5 text-brand-blue" /> Page Hero Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-gray-400">Upload hero background images for each page. Changes apply immediately after save.</p>
              {PAGE_HEROES.map((ph) => (
                <HeroImageUploader
                  key={ph.key}
                  settingKey={ph.key}
                  label={ph.label}
                  currentValue={pageHeroes[ph.key] || (ph.isSlider ? [] : "")}
                  isSlider={ph.isSlider}
                  onSave={async (key, value) => {
                    const saveKey = key === "page_hero_home" ? "hero_images" : key;
                    await saveSettingAsync(saveKey, value);
                    setPageHeroes(prev => ({ ...prev, [key]: value }));
                  }}
                  isPending={saveMutation.isPending}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Link2 className="w-5 h-5 text-brand-blue" /> Booking & Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Booking Link URL</label>
                <div className="flex gap-2">
                  <Input data-testid="input-setting-booking-link" value={bookingLink} onChange={(e) => setBookingLink(e.target.value)} placeholder="https://booking-system.com/..." />
                  <Button data-testid="button-save-booking-link" size="sm" onClick={() => saveSetting("booking_link", bookingLink)} disabled={saveMutation.isPending}><Save className="w-4 h-4" /></Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">The URL for the "Book Now" button across the website</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Header Logo URL</label>
                <div className="flex gap-2">
                  <Input data-testid="input-setting-header-logo" value={headerLogo} onChange={(e) => setHeaderLogo(e.target.value)} placeholder="https://example.com/logo.png" />
                  <Button data-testid="button-save-header-logo" size="sm" onClick={() => saveSetting("header_logo", headerLogo)} disabled={saveMutation.isPending}><Save className="w-4 h-4" /></Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Leave empty to use the default logo. Upload in Media Library first.</p>
                {headerLogo && <img data-testid="img-preview-header-logo" src={headerLogo} alt="Logo preview" className="mt-2 h-16 object-contain bg-gray-100 p-2 rounded" />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Menu className="w-5 h-5 text-brand-blue" /> Header Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-gray-400">Reorder and toggle visibility of navigation menu items</p>
              <div className="space-y-2">
                {headerNavConfig
                  .sort((a, b) => a.order - b.order)
                  .map((item, idx) => (
                  <div key={item.label} data-testid={`nav-item-${item.label}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                    <span className="text-sm font-medium flex-1">{item.displayLabel || item.label}</span>
                    <span className="text-xs text-gray-400">{item.href}</span>
                    <Button
                      data-testid={`button-toggle-nav-${item.label}`}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        const updated = headerNavConfig.map(n =>
                          n.label === item.label ? { ...n, visible: !n.visible } : n
                        );
                        setHeaderNavConfig(updated);
                      }}
                    >
                      {item.visible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    </Button>
                    <Button
                      data-testid={`button-move-up-${item.label}`}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={idx === 0}
                      onClick={() => {
                        const sorted = [...headerNavConfig].sort((a, b) => a.order - b.order);
                        if (idx > 0) {
                          const temp = sorted[idx].order;
                          sorted[idx] = { ...sorted[idx], order: sorted[idx - 1].order };
                          sorted[idx - 1] = { ...sorted[idx - 1], order: temp };
                          setHeaderNavConfig(sorted);
                        }
                      }}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      data-testid={`button-move-down-${item.label}`}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={idx === headerNavConfig.length - 1}
                      onClick={() => {
                        const sorted = [...headerNavConfig].sort((a, b) => a.order - b.order);
                        if (idx < sorted.length - 1) {
                          const temp = sorted[idx].order;
                          sorted[idx] = { ...sorted[idx], order: sorted[idx + 1].order };
                          sorted[idx + 1] = { ...sorted[idx + 1], order: temp };
                          setHeaderNavConfig(sorted);
                        }
                      }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                data-testid="button-save-header-nav"
                onClick={() => saveSetting("header_nav_config", headerNavConfig)}
                disabled={saveMutation.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" /> Save Header Navigation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Columns className="w-5 h-5 text-brand-blue" /> Footer Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-gray-400">Configure footer column content</p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Column 1 Title</label>
                  <Input data-testid="input-footer-col1-title" value={footerConfig.col1Title} onChange={(e) => setFooterConfig({ ...footerConfig, col1Title: e.target.value })} placeholder="Quick Links" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Column 1 Content</label>
                  <Textarea data-testid="textarea-footer-col1-content" value={footerConfig.col1Content} onChange={(e) => setFooterConfig({ ...footerConfig, col1Content: e.target.value })} placeholder="Links or text (one per line)" rows={3} />
                </div>
                <div className="border-t pt-4">
                  <label className="text-sm font-medium mb-1 block">Column 2 Title</label>
                  <Input data-testid="input-footer-col2-title" value={footerConfig.col2Title} onChange={(e) => setFooterConfig({ ...footerConfig, col2Title: e.target.value })} placeholder="Our Hotels" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Column 2 Content</label>
                  <Textarea data-testid="textarea-footer-col2-content" value={footerConfig.col2Content} onChange={(e) => setFooterConfig({ ...footerConfig, col2Content: e.target.value })} placeholder="Links or text (one per line)" rows={3} />
                </div>
                <div className="border-t pt-4">
                  <label className="text-sm font-medium mb-1 block">Column 3 Title</label>
                  <Input data-testid="input-footer-col3-title" value={footerConfig.col3Title} onChange={(e) => setFooterConfig({ ...footerConfig, col3Title: e.target.value })} placeholder="Contact Info" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Column 3 Content</label>
                  <Textarea data-testid="textarea-footer-col3-content" value={footerConfig.col3Content} onChange={(e) => setFooterConfig({ ...footerConfig, col3Content: e.target.value })} placeholder="Address, phone, email" rows={3} />
                </div>
              </div>
              <Button
                data-testid="button-save-footer-config"
                onClick={() => saveSetting("footer_config", footerConfig)}
                disabled={saveMutation.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" /> Save Footer Configuration
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="w-5 h-5 text-brand-blue" /> Google Tag Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium mb-1 block">Google Tag ID</label>
                <p className="text-xs text-gray-400 mb-2">يدعم GTM-XXXXXXX أو G-XXXXXXX أو AW-XXXXXXX</p>
                <div className="flex gap-2">
                  <Input data-testid="input-setting-gtm-id" value={gtmId} onChange={(e) => setGtmId(e.target.value)} placeholder="GTM-XXXXXXX / G-XXXXXXX / AW-XXXXXXX" />
                  <Button data-testid="button-save-gtm-id" size="sm" onClick={() => saveSetting("gtm_id", gtmId)} disabled={saveMutation.isPending}><Save className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="w-5 h-5 text-brand-blue" /> Favicon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium mb-1 block">Favicon URL</label>
                <div className="flex gap-2">
                  <Input data-testid="input-setting-favicon-url" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} placeholder="https://example.com/favicon.ico" />
                  <Button data-testid="button-save-favicon-url" size="sm" onClick={() => saveSetting("favicon_url", faviconUrl)} disabled={saveMutation.isPending}><Save className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5 text-brand-blue" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Contact Email</label>
                <div className="flex gap-2">
                  <Input data-testid="input-setting-contact-email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="info@example.com" />
                  <Button data-testid="button-save-contact-email" size="sm" onClick={() => saveSetting("contact_email", contactEmail)} disabled={saveMutation.isPending}><Save className="w-4 h-4" /></Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Contact Phone</label>
                <div className="flex gap-2">
                  <Input data-testid="input-setting-contact-phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 234 567 890" />
                  <Button data-testid="button-save-contact-phone" size="sm" onClick={() => saveSetting("contact_phone", contactPhone)} disabled={saveMutation.isPending}><Save className="w-4 h-4" /></Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Address</label>
                <div className="flex gap-2">
                  <Input data-testid="input-setting-contact-address" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} placeholder="Marsa Alam, Red Sea, Egypt" />
                  <Button data-testid="button-save-contact-address" size="sm" onClick={() => saveSetting("contact_address", contactAddress)} disabled={saveMutation.isPending}><Save className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Type className="w-5 h-5 text-brand-blue" /> Footer Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Footer Text (English)</label>
                <Textarea data-testid="textarea-setting-footer-desc-en" value={footerDescEn} onChange={(e) => setFooterDescEn(e.target.value)} placeholder="Description shown in footer" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Footer Text (Arabic)</label>
                <Textarea data-testid="textarea-setting-footer-desc-ar" dir="rtl" value={footerDescAr} onChange={(e) => setFooterDescAr(e.target.value)} placeholder="وصف يظهر في الفوتر" rows={3} />
              </div>
              <Button data-testid="button-save-footer-description" onClick={() => saveSetting("footer_description", { en: footerDescEn, ar: footerDescAr })} disabled={saveMutation.isPending} className="w-full">
                <Save className="w-4 h-4 mr-2" /> Save Footer Description
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Share2 className="w-5 h-5 text-brand-blue" /> Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Facebook</label>
                <Input data-testid="input-setting-social-facebook" value={socialLinks.facebook} onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Instagram</label>
                <Input data-testid="input-setting-social-instagram" value={socialLinks.instagram} onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">LinkedIn</label>
                <Input data-testid="input-setting-social-linkedin" value={socialLinks.linkedin} onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })} placeholder="https://linkedin.com/..." />
              </div>
              <Button data-testid="button-save-social-links" onClick={() => saveSetting("social_links", socialLinks)} disabled={saveMutation.isPending} className="w-full">
                <Save className="w-4 h-4 mr-2" /> Save Social Links
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </CMSLayout>
  );
}
