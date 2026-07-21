import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Save, Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const DEFAULT_NAV = [
  { href: "/", label: "nav.home", customLabel: { en: "Home", ar: "الرئيسية", fr: "Accueil", de: "Startseite", es: "Inicio", ru: "Главная", pl: "Strona główna", cs: "Domů" }, visible: true, order: 1 },
  { href: "/hotels", label: "nav.hotels", customLabel: { en: "Hotels & Resorts", ar: "الفنادق والمنتجعات", fr: "Hôtels & Resorts", de: "Hotels & Resorts", es: "Hoteles & Resorts", ru: "Отели и Курорты", pl: "Hotele i Kurorty", cs: "Hotely a Resorty" }, visible: true, order: 2 },
  { href: "/about", label: "nav.about", customLabel: { en: "About Us", ar: "من نحن", fr: "À propos", de: "Über uns", es: "Sobre nosotros", ru: "О нас", pl: "O nas", cs: "O nás" }, visible: true, order: 3 },
  { href: "/careers", label: "nav.careers", customLabel: { en: "Careers", ar: "الوظائف", fr: "Carrières", de: "Karriere", es: "Empleos", ru: "Карьера", pl: "Kariera", cs: "Kariéra" }, visible: true, order: 4 },
  { href: "/contact", label: "nav.contact", customLabel: { en: "Contact", ar: "تواصل معنا", fr: "Contact", de: "Kontakt", es: "Contacto", ru: "Контакты", pl: "Kontakt", cs: "Kontakt" }, visible: true, order: 5 },
  { href: "/gallery", label: "nav.gallery", customLabel: { en: "Gallery", ar: "معرض الصور", fr: "Galerie", de: "Galerie", es: "Galería", ru: "Галерея", pl: "Galeria", cs: "Galerie" }, visible: true, order: 6 },
  { href: "/company-profile", label: "nav.companyProfile", customLabel: { en: "Company Profile", ar: "ملف الشركة", fr: "Profil de l'entreprise", de: "Firmenprofil", es: "Perfil de empresa", ru: "Профиль компании", pl: "Profil firmy", cs: "Profil společnosti" }, visible: true, order: 7 },
];

type NavItem = {
  href: string;
  label: string;
  customLabel: Record<string, string>;
  visible: boolean;
  order: number;
};

export default function CMSNavigation() {
  const { toast } = useToast();
  const [items, setItems] = useState<NavItem[]>([]);
  const [activeLang, setActiveLang] = useState("en");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const { data: settings } = useQuery({
    queryKey: ["/api/cms/settings"],
    queryFn: async () => {
      const res = await fetch("/api/cms/settings", { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
  });

  useEffect(() => {
    if (settings) {
      const raw = settings.header_nav_config;
      if (Array.isArray(raw) && raw.length > 0) {
        const loaded = raw.map((item: any, i: number) => ({
          href: item.href || "/",
          label: item.label || "nav.home",
          customLabel: item.customLabel || { en: item.label || "" },
          visible: item.visible !== false,
          order: item.order ?? i + 1,
        }));
        setItems(loaded.sort((a, b) => a.order - b.order));
      } else {
        setItems(DEFAULT_NAV);
      }
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (newItems: NavItem[]) => {
      const ordered = newItems.map((item, i) => ({ ...item, order: i + 1 }));
      await apiRequest("POST", "/api/cms/settings", { key: "header_nav_config", value: ordered });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/settings"] });
      toast({ title: "✅ Navigation saved successfully" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateItem = (idx: number, field: string, val: any) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const updateLabel = (idx: number, lang: string, val: string) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, customLabel: { ...item.customLabel, [lang]: val } } : item
    ));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setItems(prev => { const arr = [...prev]; [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; return arr; });
  };

  const moveDown = (idx: number) => {
    if (idx === items.length - 1) return;
    setItems(prev => { const arr = [...prev]; [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]; return arr; });
  };

  const addItem = () => {
    const newItem: NavItem = {
      href: "/new-page",
      label: "custom",
      customLabel: Object.fromEntries(LANGS.map(l => [l.code, "New Page"])),
      visible: true,
      order: items.length + 1,
    };
    setItems(prev => [...prev, newItem]);
    setExpandedIdx(items.length);
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
    setExpandedIdx(null);
  };

  return (
    <CMSLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-brand-blue">Navigation Menu</h1>
            <p className="text-gray-500 text-sm mt-1">إدارة روابط وترتيب قائمة التنقل</p>
          </div>
          <Button
            onClick={() => saveMutation.mutate(items)}
            disabled={saveMutation.isPending}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Navigation"}
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => setActiveLang(l.code)}
              className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${activeLang === l.code ? "bg-brand-blue text-white border-brand-blue" : "bg-white text-gray-600 border-gray-200 hover:border-brand-blue"}`}
            >
              {l.code.toUpperCase()} — {l.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <Card key={idx} className={`border transition-all ${!item.visible ? "opacity-50" : ""}`}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-gray-400 hover:text-brand-blue disabled:opacity-20">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => moveDown(idx)} disabled={idx === items.length - 1} className="text-gray-400 hover:text-brand-blue disabled:opacity-20">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <GripVertical className="w-4 h-4 text-gray-300" />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-brand-blue truncate">
                      {item.customLabel?.[activeLang] || item.customLabel?.en || item.label}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">{item.href}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateItem(idx, "visible", !item.visible)}
                      className={`p-1.5 rounded transition-colors ${item.visible ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                      title={item.visible ? "Hide from nav" : "Show in nav"}
                    >
                      {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                      className="text-xs px-3 py-1 rounded border border-gray-200 hover:border-brand-blue text-gray-600 hover:text-brand-blue"
                    >
                      {expandedIdx === idx ? "Close" : "Edit"}
                    </button>
                    <button
                      onClick={() => removeItem(idx)}
                      className="p-1.5 rounded text-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              {expandedIdx === idx && (
                <CardContent className="pt-0 pb-4 px-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1">Link URL</label>
                      <Input
                        value={item.href}
                        onChange={e => updateItem(idx, "href", e.target.value)}
                        placeholder="/page-url"
                        className="font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-2">
                        Labels (per language)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {LANGS.map(l => (
                          <div key={l.code} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 w-6 shrink-0">{l.code.toUpperCase()}</span>
                            <Input
                              value={item.customLabel?.[l.code] || ""}
                              onChange={e => updateLabel(idx, l.code, e.target.value)}
                              placeholder={l.label}
                              className="text-sm h-8"
                              dir={l.code === "ar" ? "rtl" : "ltr"}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <Button
          onClick={addItem}
          variant="outline"
          className="w-full border-dashed border-2 border-gray-300 hover:border-brand-blue hover:text-brand-blue h-12"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Nav Item
        </Button>

        <div className="flex justify-end">
          <Button
            onClick={() => saveMutation.mutate(items)}
            disabled={saveMutation.isPending}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Navigation"}
          </Button>
        </div>
      </div>
    </CMSLayout>
  );
}
