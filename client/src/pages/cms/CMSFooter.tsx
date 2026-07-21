import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const LANGS = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "ru", label: "Русский" },
  { code: "pl", label: "Polski" },
  { code: "cs", label: "Čeština" },
];

type QuickLink = { href: string; label: Record<string, string> };

export default function CMSFooter() {
  const { toast } = useToast();
  const [activeLang, setActiveLang] = useState("en");

  const [siteName, setSiteName] = useState("");
  const [description, setDescription] = useState<Record<string, string>>({});
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [connectTitle, setConnectTitle] = useState("Connect");
  const [copyright, setCopyright] = useState<Record<string, string>>({});
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({ facebook: "", instagram: "", linkedin: "" });

  const { data: settings } = useQuery({
    queryKey: ["/api/cms/settings"],
    queryFn: async () => {
      const res = await fetch("/api/cms/settings", { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
  });

  useEffect(() => {
    if (!settings) return;
    setSiteName(settings.site_name || "PROTELS Hotels & Resorts");
    setDescription(typeof settings.footer_description === "object" ? settings.footer_description : { en: settings.footer_description || "" });
    setAddress(settings.contact_address || "");
    setPhone(settings.contact_phone || "");
    setEmail(settings.contact_email || "");
    setConnectTitle(settings.footer_connect_title || "Connect");
    setCopyright(typeof settings.footer_copyright === "object" ? settings.footer_copyright : { en: settings.footer_copyright || "All Rights Reserved" });
    setQuickLinks(Array.isArray(settings.footer_quick_links) ? settings.footer_quick_links : []);
    if (settings.social_links && typeof settings.social_links === "object") setSocialLinks(settings.social_links);
  }, [settings]);

  const saveSetting = async (key: string, value: any) => {
    await apiRequest("POST", "/api/cms/settings", { key, value });
    queryClient.invalidateQueries({ queryKey: ["/api/cms/settings"] });
    queryClient.invalidateQueries({ queryKey: ["/api/public/settings"] });
  };

  const saveAll = async () => {
    try {
      await saveSetting("site_name", siteName);
      await saveSetting("footer_description", description);
      await saveSetting("contact_address", address);
      await saveSetting("contact_phone", phone);
      await saveSetting("contact_email", email);
      await saveSetting("footer_connect_title", connectTitle);
      await saveSetting("footer_copyright", copyright);
      await saveSetting("footer_quick_links", quickLinks);
      await saveSetting("social_links", socialLinks);
      toast({ title: "✅ Footer saved successfully" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const addQuickLink = () => {
    setQuickLinks(prev => [...prev, { href: "/", label: Object.fromEntries(LANGS.map(l => [l.code, "New Link"])) }]);
  };

  const updateQLHref = (idx: number, val: string) =>
    setQuickLinks(prev => prev.map((l, i) => i === idx ? { ...l, href: val } : l));

  const updateQLLabel = (idx: number, lang: string, val: string) =>
    setQuickLinks(prev => prev.map((l, i) => i === idx ? { ...l, label: { ...l.label, [lang]: val } } : l));

  const removeQL = (idx: number) =>
    setQuickLinks(prev => prev.filter((_, i) => i !== idx));

  return (
    <CMSLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-brand-blue">Footer Manager</h1>
            <p className="text-gray-500 text-sm mt-1">إدارة محتوى الفوتر بالكامل</p>
          </div>
          <Button onClick={saveAll} className="bg-brand-blue hover:bg-brand-blue/90 text-white">
            <Save className="w-4 h-4 mr-2" />Save Footer
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {LANGS.map(l => (
            <button key={l.code} onClick={() => setActiveLang(l.code)}
              className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${activeLang === l.code ? "bg-brand-blue text-white border-brand-blue" : "bg-white text-gray-600 border-gray-200 hover:border-brand-blue"}`}>
              {l.code.toUpperCase()}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Brand & Description</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1">Site Name</label>
              <Input value={siteName} onChange={e => setSiteName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1">
                Footer Description ({activeLang.toUpperCase()})
              </label>
              <Textarea
                value={description[activeLang] || ""}
                onChange={e => setDescription(prev => ({ ...prev, [activeLang]: e.target.value }))}
                rows={3}
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Contact Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1">Address</label>
              <Input value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1">Phone</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1">Email</label>
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Social Links</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {["facebook", "instagram", "linkedin"].map(key => (
              <div key={key}>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1 capitalize">{key}</label>
                <Input value={socialLinks[key] || ""} onChange={e => setSocialLinks(prev => ({ ...prev, [key]: e.target.value }))} placeholder={`https://${key}.com/...`} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Quick Links Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1">Section Title</label>
              <Input value={connectTitle} onChange={e => setConnectTitle(e.target.value)} placeholder="Connect" />
            </div>

            <div className="space-y-3">
              {quickLinks.map((link, idx) => (
                <div key={idx} className="border border-gray-200 rounded p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input value={link.href} onChange={e => updateQLHref(idx, e.target.value)} placeholder="/url" className="font-mono text-sm flex-1" />
                    <button onClick={() => removeQL(idx)} className="p-1.5 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGS.map(l => (
                      <div key={l.code} className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-400 w-6">{l.code.toUpperCase()}</span>
                        <Input value={link.label?.[l.code] || ""} onChange={e => updateQLLabel(idx, l.code, e.target.value)}
                          className="h-7 text-xs" dir={l.code === "ar" ? "rtl" : "ltr"} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={addQuickLink} variant="outline" className="w-full border-dashed border-2">
              <Plus className="w-4 h-4 mr-2" />Add Quick Link
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Copyright Text ({activeLang.toUpperCase()})</CardTitle></CardHeader>
          <CardContent>
            <Input
              value={copyright[activeLang] || ""}
              onChange={e => setCopyright(prev => ({ ...prev, [activeLang]: e.target.value }))}
              placeholder="All Rights Reserved"
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveAll} className="bg-brand-blue hover:bg-brand-blue/90 text-white px-8">
            <Save className="w-4 h-4 mr-2" />Save Footer
          </Button>
        </div>
      </div>
    </CMSLayout>
  );
}
