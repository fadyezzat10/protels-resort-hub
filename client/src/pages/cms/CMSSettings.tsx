import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Save, Globe, Mail, Phone, Share2, Tag, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function CMSSettings() {
  const { toast } = useToast();

  const [gtmId, setGtmId] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
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
      const social = findSetting("social_links");
      if (social && typeof social === "object") {
        setSocialLinks({
          facebook: social.facebook || "",
          instagram: social.instagram || "",
          twitter: social.twitter || "",
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
                  <Input
                    data-testid="input-setting-site-name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Your website name"
                  />
                  <Button
                    data-testid="button-save-site-name"
                    size="sm"
                    onClick={() => saveSetting("site_name", siteName)}
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
                <Tag className="w-5 h-5 text-brand-blue" /> Google Tag Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium mb-1 block">GTM Container ID</label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-setting-gtm-id"
                    value={gtmId}
                    onChange={(e) => setGtmId(e.target.value)}
                    placeholder="GTM-XXXXXXX"
                  />
                  <Button
                    data-testid="button-save-gtm-id"
                    size="sm"
                    onClick={() => saveSetting("gtm_id", gtmId)}
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
                <Image className="w-5 h-5 text-brand-blue" /> Favicon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium mb-1 block">Favicon URL</label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-setting-favicon-url"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                  <Button
                    data-testid="button-save-favicon-url"
                    size="sm"
                    onClick={() => saveSetting("favicon_url", faviconUrl)}
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
                <Mail className="w-5 h-5 text-brand-blue" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Contact Email</label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-setting-contact-email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="info@example.com"
                  />
                  <Button
                    data-testid="button-save-contact-email"
                    size="sm"
                    onClick={() => saveSetting("contact_email", contactEmail)}
                    disabled={saveMutation.isPending}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Contact Phone</label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-setting-contact-phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                  />
                  <Button
                    data-testid="button-save-contact-phone"
                    size="sm"
                    onClick={() => saveSetting("contact_phone", contactPhone)}
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
                <Share2 className="w-5 h-5 text-brand-blue" /> Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Facebook</label>
                <Input
                  data-testid="input-setting-social-facebook"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Instagram</label>
                <Input
                  data-testid="input-setting-social-instagram"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Twitter</label>
                <Input
                  data-testid="input-setting-social-twitter"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">LinkedIn</label>
                <Input
                  data-testid="input-setting-social-linkedin"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <Button
                data-testid="button-save-social-links"
                onClick={() => saveSetting("social_links", socialLinks)}
                disabled={saveMutation.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" /> Save Social Links
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </CMSLayout>
  );
}
