import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Save, Palette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const defaults = {
  primaryColor: "hsl(215 45% 15%)",
  secondaryColor: "hsl(38 45% 75%)",
  backgroundColor: "hsl(40 20% 98%)",
  textColor: "hsl(215 45% 15%)",
  buttonBgColor: "hsl(215 45% 15%)",
  buttonTextColor: "hsl(0 0% 100%)",
  headingFont: "Cormorant Garamond",
  bodyFont: "Montserrat",
  logoMaxWidth: 120,
  logoMaxHeight: 50,
};

function hslToHex(hsl: string): string {
  try {
    const match = hsl.match(/hsl\(?\s*(\d+)\s+(\d+)%\s+(\d+)%\s*\)?/);
    if (!match) return "#000000";
    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch {
    return "#000000";
  }
}

function hexToHsl(hex: string): string {
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "hsl(0 0% 0%)";
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
  } catch {
    return "hsl(0 0% 0%)";
  }
}

export default function CMSTheme() {
  const { toast } = useToast();
  const [theme, setTheme] = useState({ ...defaults });

  const { data: settings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cms/settings"],
  });

  useEffect(() => {
    if (settings && settings.length > 0) {
      const themeSetting = settings.find((s: any) => s.key === "theme");
      if (themeSetting?.value && typeof themeSetting.value === "object") {
        setTheme({ ...defaults, ...themeSetting.value });
      }
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (value: any) => {
      await apiRequest("PUT", "/api/cms/settings/theme", { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/settings"] });
      toast({ title: "Theme settings saved successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateColor = (key: string, hex: string) => {
    setTheme((prev) => ({ ...prev, [key]: hexToHsl(hex) }));
  };

  const updateHslText = (key: string, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const colorField = (label: string, key: string) => (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          data-testid={`color-picker-${key}`}
          type="color"
          value={hslToHex((theme as any)[key])}
          onChange={(e) => updateColor(key, e.target.value)}
          className="w-12 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
        />
        <Input
          data-testid={`input-theme-${key}`}
          value={(theme as any)[key]}
          onChange={(e) => updateHslText(key, e.target.value)}
          placeholder="hsl(0 0% 0%)"
          className="flex-1"
        />
      </div>
    </div>
  );

  return (
    <CMSLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-serif text-brand-blue mb-2">Theme & Design</h2>
        <p className="text-gray-500">Customize colors, fonts, and branding</p>
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
                <Palette className="w-5 h-5 text-brand-blue" /> Color Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {colorField("Primary Color", "primaryColor")}
              {colorField("Secondary / Gold Color", "secondaryColor")}
              {colorField("Background Color", "backgroundColor")}
              {colorField("Text Color", "textColor")}
              {colorField("Button Background Color", "buttonBgColor")}
              {colorField("Button Text Color", "buttonTextColor")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5 text-brand-blue" /> Font Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Heading Font (Google Font name)</label>
                <Input
                  data-testid="input-theme-headingFont"
                  value={theme.headingFont}
                  onChange={(e) => setTheme((prev) => ({ ...prev, headingFont: e.target.value }))}
                  placeholder="Cormorant Garamond"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Body Font (Google Font name)</label>
                <Input
                  data-testid="input-theme-bodyFont"
                  value={theme.bodyFont}
                  onChange={(e) => setTheme((prev) => ({ ...prev, bodyFont: e.target.value }))}
                  placeholder="Montserrat"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5 text-brand-blue" /> Logo Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Logo Max Width: {theme.logoMaxWidth}px</label>
                <div className="flex gap-4 items-center">
                  <Slider
                    data-testid="slider-theme-logoMaxWidth"
                    value={[theme.logoMaxWidth]}
                    onValueChange={([v]) => setTheme((prev) => ({ ...prev, logoMaxWidth: v }))}
                    min={40}
                    max={400}
                    step={5}
                    className="flex-1"
                  />
                  <Input
                    data-testid="input-theme-logoMaxWidth"
                    type="number"
                    value={theme.logoMaxWidth}
                    onChange={(e) => setTheme((prev) => ({ ...prev, logoMaxWidth: Number(e.target.value) || 120 }))}
                    className="w-20"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Logo Max Height: {theme.logoMaxHeight}px</label>
                <div className="flex gap-4 items-center">
                  <Slider
                    data-testid="slider-theme-logoMaxHeight"
                    value={[theme.logoMaxHeight]}
                    onValueChange={([v]) => setTheme((prev) => ({ ...prev, logoMaxHeight: v }))}
                    min={20}
                    max={200}
                    step={5}
                    className="flex-1"
                  />
                  <Input
                    data-testid="input-theme-logoMaxHeight"
                    type="number"
                    value={theme.logoMaxHeight}
                    onChange={(e) => setTheme((prev) => ({ ...prev, logoMaxHeight: Number(e.target.value) || 50 }))}
                    className="w-20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5 text-brand-blue" /> Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                data-testid="theme-preview"
                className="rounded-lg border p-6 space-y-4"
                style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
              >
                <h3
                  style={{
                    fontFamily: `'${theme.headingFont}', serif`,
                    color: theme.primaryColor,
                    fontSize: "1.5rem",
                    fontWeight: 600,
                  }}
                >
                  Sample Heading Text
                </h3>
                <p style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, fontSize: "0.95rem", lineHeight: 1.6 }}>
                  This is a preview of how your theme settings will look on the website. The colors, fonts, and styling shown here represent your current selections.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    style={{
                      backgroundColor: theme.buttonBgColor,
                      color: theme.buttonTextColor,
                      padding: "8px 20px",
                      borderRadius: "6px",
                      fontFamily: `'${theme.bodyFont}', sans-serif`,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      border: "none",
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    style={{
                      backgroundColor: "transparent",
                      color: theme.secondaryColor,
                      padding: "8px 20px",
                      borderRadius: "6px",
                      fontFamily: `'${theme.bodyFont}', sans-serif`,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      border: `2px solid ${theme.secondaryColor}`,
                    }}
                  >
                    Secondary Button
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <div
                    className="w-12 h-12 rounded"
                    style={{ backgroundColor: theme.primaryColor }}
                    title="Primary"
                  />
                  <div
                    className="w-12 h-12 rounded"
                    style={{ backgroundColor: theme.secondaryColor }}
                    title="Secondary"
                  />
                  <div
                    className="w-12 h-12 rounded border"
                    style={{ backgroundColor: theme.backgroundColor }}
                    title="Background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              data-testid="button-save-theme"
              onClick={() => saveMutation.mutate(theme)}
              disabled={saveMutation.isPending}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" /> Save All Theme Settings
            </Button>
            <Button
              data-testid="button-reset-theme"
              variant="outline"
              onClick={() => setTheme({ ...defaults })}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reset to Defaults
            </Button>
          </div>
        </div>
      )}
    </CMSLayout>
  );
}
