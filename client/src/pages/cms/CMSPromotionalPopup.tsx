import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, Megaphone, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PopupConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonUrl: string;
  secondaryButtonText: string;
  backgroundImage: string;
  discountBadge: string;
  delaySeconds: number;
  autoCloseSecs: number;
  showOnce: boolean;
  daysBeforeRepeat: number;
  overlayOpacity: number;
  primaryColor: string;
  accentColor: string;
}

const DEFAULT: PopupConfig = {
  enabled: false,
  title: "Exclusive Direct Booking Offer",
  subtitle: "Book Direct & Enjoy Exclusive Savings",
  description:
    "Book directly through our official website and enjoy exclusive discounts, the best available rates, flexible cancellation, and instant confirmation.",
  features: ["Best Price Guarantee", "Exclusive Discount", "Free Cancellation", "Instant Confirmation"],
  buttonText: "Book Now",
  buttonUrl: "/contact",
  secondaryButtonText: "Maybe Later",
  backgroundImage: "",
  discountBadge: "",
  delaySeconds: 4,
  autoCloseSecs: 0,
  showOnce: true,
  daysBeforeRepeat: 7,
  overlayOpacity: 0.6,
  primaryColor: "#c9a96e",
  accentColor: "#0f1929",
};

export default function CMSPromotionalPopup() {
  const { toast } = useToast();
  const [form, setForm] = useState<PopupConfig>(DEFAULT);

  const { data, isLoading } = useQuery<PopupConfig | null>({
    queryKey: ["/api/cms/promotional-popup"],
    queryFn: async () => {
      const res = await fetch("/api/cms/promotional-popup", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  useEffect(() => {
    if (data) setForm({ ...DEFAULT, ...data });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("PUT", "/api/cms/promotional-popup", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/promotional-popup"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/promotional-popup"] });
      toast({ title: "Saved", description: "Popup settings saved successfully." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save.", variant: "destructive" }),
  });

  const set = (key: keyof PopupConfig, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const addFeature = () => set("features", [...form.features, ""]);
  const updateFeature = (i: number, v: string) => {
    const arr = [...form.features];
    arr[i] = v;
    set("features", arr);
  };
  const removeFeature = (i: number) => set("features", form.features.filter((_, idx) => idx !== i));

  if (isLoading) return <CMSLayout><div className="p-8 text-center text-gray-400">Loading…</div></CMSLayout>;

  return (
    <CMSLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Megaphone className="w-6 h-6 text-brand-gold" />
            <div>
              <h1 className="text-2xl font-serif text-brand-blue">Promotional Popup</h1>
              <p className="text-sm text-gray-500">Manage the welcome offer shown to new visitors</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={form.enabled ? "default" : "secondary"} className={form.enabled ? "bg-green-100 text-green-700 border-green-200" : ""}>
              {form.enabled ? "Live" : "Disabled"}
            </Badge>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>

        {/* Enable toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-brand-blue">Enable Popup</p>
                <p className="text-sm text-gray-500">Show this popup to visitors on the homepage</p>
              </div>
              <Switch
                data-testid="toggle-popup-enabled"
                checked={form.enabled}
                onCheckedChange={(v) => set("enabled", v)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content */}
          <Card>
            <CardHeader><CardTitle className="text-base">Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input data-testid="input-popup-title" value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input data-testid="input-popup-subtitle" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea data-testid="input-popup-description" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <div>
                <Label>Discount Badge <span className="text-gray-400 text-xs">(optional, e.g. "Up to 20% OFF")</span></Label>
                <Input data-testid="input-popup-badge" value={form.discountBadge} onChange={(e) => set("discountBadge", e.target.value)} placeholder="Up to 20% OFF" />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Features</CardTitle>
                <Button variant="outline" size="sm" onClick={addFeature}><Plus className="w-3.5 h-3.5 mr-1" /> Add</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    data-testid={`input-popup-feature-${i}`}
                    value={f}
                    onChange={(e) => updateFeature(i, e.target.value)}
                    placeholder="Feature text"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {form.features.length === 0 && <p className="text-sm text-gray-400 text-center py-2">No features added</p>}
            </CardContent>
          </Card>

          {/* Buttons */}
          <Card>
            <CardHeader><CardTitle className="text-base">Buttons</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Primary Button Text</Label>
                <Input data-testid="input-popup-btn-text" value={form.buttonText} onChange={(e) => set("buttonText", e.target.value)} placeholder="Book Now" />
              </div>
              <div>
                <Label>Primary Button URL</Label>
                <Input data-testid="input-popup-btn-url" value={form.buttonUrl} onChange={(e) => set("buttonUrl", e.target.value)} placeholder="/contact" />
              </div>
              <div>
                <Label>Secondary Button Text</Label>
                <Input data-testid="input-popup-secondary-text" value={form.secondaryButtonText} onChange={(e) => set("secondaryButtonText", e.target.value)} placeholder="Maybe Later" />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Background Image URL <span className="text-gray-400 text-xs">(optional)</span></Label>
                <Input data-testid="input-popup-bg-image" value={form.backgroundImage} onChange={(e) => set("backgroundImage", e.target.value)} placeholder="https://... or /uploads/..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
                    <Input value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <Label>Button Text Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
                    <Input value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="font-mono text-sm" />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Overlay Opacity</Label>
                  <span className="text-sm text-gray-500">{Math.round(form.overlayOpacity * 100)}%</span>
                </div>
                <Slider
                  min={0} max={1} step={0.05}
                  value={[form.overlayOpacity]}
                  onValueChange={([v]) => set("overlayOpacity", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Timing */}
          <Card>
            <CardHeader><CardTitle className="text-base">Timing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Delay Before Showing (seconds)</Label>
                <Input
                  data-testid="input-popup-delay"
                  type="number" min={0} max={60}
                  value={form.delaySeconds}
                  onChange={(e) => set("delaySeconds", Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Auto Close After (seconds) <span className="text-gray-400 text-xs">— 0 = no auto close</span></Label>
                <Input
                  data-testid="input-popup-autoclose"
                  type="number" min={0}
                  value={form.autoCloseSecs}
                  onChange={(e) => set("autoCloseSecs", Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Frequency */}
          <Card>
            <CardHeader><CardTitle className="text-base">Frequency</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Show Once Per Visitor</p>
                  <p className="text-xs text-gray-500">Uses browser storage to remember the visitor</p>
                </div>
                <Switch
                  data-testid="toggle-popup-once"
                  checked={form.showOnce}
                  onCheckedChange={(v) => set("showOnce", v)}
                />
              </div>
              {form.showOnce && (
                <div>
                  <Label>Show Again After (days)</Label>
                  <Input
                    data-testid="input-popup-repeat-days"
                    type="number" min={1}
                    value={form.daysBeforeRepeat}
                    onChange={(e) => set("daysBeforeRepeat", Number(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <Card className="border-brand-gold/20 bg-brand-blue/5">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4 text-brand-gold" /> Live Preview</CardTitle></CardHeader>
          <CardContent>
            <div
              className="relative overflow-hidden rounded-xl p-6 md:p-8"
              style={{ background: "rgba(15,25,45,0.92)", backdropFilter: "blur(20px)", border: "1px solid rgba(201,169,110,0.2)" }}
            >
              {form.backgroundImage && (
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${form.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              )}
              <div className="relative">
                {form.discountBadge && (
                  <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${form.primaryColor}22`, color: form.primaryColor, border: `1px solid ${form.primaryColor}55` }}>
                      ★ {form.discountBadge}
                    </span>
                  </div>
                )}
                <h3 className="text-center text-xl font-serif font-light mb-1" style={{ color: form.primaryColor }}>{form.title || "Title"}</h3>
                {form.subtitle && <p className="text-center text-white/70 text-sm mb-3">{form.subtitle}</p>}
                <div className="flex items-center gap-2 mb-3"><div className="flex-1 h-px" style={{ background: `${form.primaryColor}33` }} /><div className="w-1 h-1 rounded-full" style={{ background: form.primaryColor }} /><div className="flex-1 h-px" style={{ background: `${form.primaryColor}33` }} /></div>
                {form.description && <p className="text-center text-white/60 text-xs mb-4 leading-relaxed">{form.description}</p>}
                {form.features.length > 0 && (
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-5">
                    {form.features.filter(Boolean).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-white/65">
                        <span className="w-3.5 h-3.5 flex-shrink-0" style={{ color: form.primaryColor }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 text-center py-2 px-4 rounded-lg text-xs font-medium" style={{ background: form.primaryColor, color: form.accentColor }}>
                    {form.buttonText || "Book Now"}
                  </div>
                  <div className="flex-1 text-center py-2 px-4 rounded-lg text-xs font-medium" style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)" }}>
                    {form.secondaryButtonText || "Maybe Later"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pb-6">
          <Button size="lg" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" /> Save All Settings
          </Button>
        </div>
      </div>
    </CMSLayout>
  );
}
