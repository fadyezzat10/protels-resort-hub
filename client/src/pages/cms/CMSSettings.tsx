import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Save, Globe, Mail, Phone, Share2, Tag, Image, Layout, Link2, MapPin, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
  const [footerDescEn, setFooterDescEn] = useState("");
  const [footerDescAr, setFooterDescAr] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
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

  const saveSetting = (key: string, value: any) => {
    saveMutation.mutate({ key, value });
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
                <Tag className="w-5 h-5 text-brand-blue" /> Google Tag Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium mb-1 block">GTM Container ID</label>
                <div className="flex gap-2">
                  <Input data-testid="input-setting-gtm-id" value={gtmId} onChange={(e) => setGtmId(e.target.value)} placeholder="GTM-XXXXXXX" />
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
