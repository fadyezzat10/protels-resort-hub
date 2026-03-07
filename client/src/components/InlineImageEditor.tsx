import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Loader2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Contrast,
  Droplets,
  Maximize2,
  Scissors,
  Paintbrush,
  Type,
  Stamp,
  Sparkles,
  Save,
  X,
  Undo2,
  Palette,
  Download,
} from "lucide-react";

interface Operation {
  type: string;
  [key: string]: any;
}

interface InlineImageEditorProps {
  url: string;
  width: number | null;
  height: number | null;
  format: string;
  onClose: () => void;
}

type ToolSection = "transform" | "adjust" | "filters" | "draw" | "text" | "watermark";

const FILTER_PRESETS = [
  { id: "none", label: "Original", ops: [] },
  { id: "grayscale", label: "B&W", ops: [{ type: "grayscale" }] },
  { id: "sepia", label: "Sepia", ops: [{ type: "sepia" }] },
  { id: "vintage", label: "Vintage", ops: [{ type: "vintage" }] },
  { id: "warm", label: "Warm", ops: [{ type: "warm" }] },
  { id: "cool", label: "Cool", ops: [{ type: "cool" }] },
  { id: "sharp", label: "Sharpen", ops: [{ type: "sharpen", sigma: 2 }] },
  { id: "blur-light", label: "Soft Blur", ops: [{ type: "blur", sigma: 2 }] },
];

export default function InlineImageEditor({ url, width, height, format, onClose }: InlineImageEditorProps) {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [activeSection, setActiveSection] = useState<ToolSection>("transform");
  const [previewUrl, setPreviewUrl] = useState<string>(url);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [outputFormat, setOutputFormat] = useState<string>("webp");
  const [quality, setQuality] = useState(85);

  const [resizeW, setResizeW] = useState(width?.toString() || "");
  const [resizeH, setResizeH] = useState(height?.toString() || "");
  const [keepAspect, setKeepAspect] = useState(true);
  const aspectRatio = width && height ? width / height : 1;

  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [activeFilter, setActiveFilter] = useState("none");

  const [textContent, setTextContent] = useState("");
  const [textSize, setTextSize] = useState(48);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textPosition, setTextPosition] = useState<"center" | "top" | "bottom">("center");

  const [wmText, setWmText] = useState("PROTELS");
  const [wmSize, setWmSize] = useState(24);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#ff0000");
  const [drawWidth, setDrawWidth] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<{ paths: { x: number; y: number }[][] }>({ paths: [] });
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  const { toast } = useToast();

  const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPreview = useCallback(async (ops: Operation[]) => {
    if (ops.length === 0) {
      setPreviewUrl(url);
      return;
    }
    setIsLoadingPreview(true);
    try {
      const res = await fetch("/api/cms/image-edit-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url, operations: ops }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewUrl(data.previewDataUrl);
      }
    } catch {}
    setIsLoadingPreview(false);
  }, [url]);

  const requestPreview = useCallback((ops: Operation[]) => {
    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    previewDebounceRef.current = setTimeout(() => fetchPreview(ops), 400);
  }, [fetchPreview]);

  const addOperation = (op: Operation) => {
    const newOps = [...operations, op];
    setOperations(newOps);
    requestPreview(newOps);
  };

  const resetAll = () => {
    setOperations([]);
    setPreviewUrl(url);
    setBrightness(1);
    setContrast(1);
    setSaturation(1);
    setActiveFilter("none");
    setResizeW(width?.toString() || "");
    setResizeH(height?.toString() || "");
    drawingRef.current = { paths: [] };
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const applyAdjustments = () => {
    const ops: Operation[] = [];
    if (brightness !== 1) ops.push({ type: "brightness", value: brightness });
    if (contrast !== 1) ops.push({ type: "contrast", value: contrast });
    if (saturation !== 1) ops.push({ type: "saturation", value: saturation });
    if (ops.length === 0) return;
    const newOps = [...operations, ...ops];
    setOperations(newOps);
    requestPreview(newOps);
    setBrightness(1);
    setContrast(1);
    setSaturation(1);
    toast({ title: "Adjustments applied" });
  };

  const applyFilter = (filterId: string) => {
    setActiveFilter(filterId);
    const preset = FILTER_PRESETS.find(f => f.id === filterId);
    if (!preset || preset.ops.length === 0) {
      setOperations(operations.filter(o => !["grayscale", "sepia", "vintage", "warm", "cool", "sharpen", "blur"].includes(o.type)));
      requestPreview(operations.filter(o => !["grayscale", "sepia", "vintage", "warm", "cool", "sharpen", "blur"].includes(o.type)));
      return;
    }
    const cleaned = operations.filter(o => !["grayscale", "sepia", "vintage", "warm", "cool", "sharpen", "blur"].includes(o.type));
    const newOps = [...cleaned, ...preset.ops];
    setOperations(newOps);
    requestPreview(newOps);
  };

  const applyResize = () => {
    const w = parseInt(resizeW);
    const h = parseInt(resizeH);
    if (!w && !h) return;
    addOperation({ type: "resize", width: w || undefined, height: h || undefined });
    toast({ title: "Resize applied" });
  };

  const addText = () => {
    if (!textContent.trim()) return;
    const yMap = { top: 40, center: "center", bottom: "bottom" };
    addOperation({
      type: "text",
      text: textContent,
      fontSize: textSize,
      color: textColor,
      x: "center",
      y: yMap[textPosition],
    });
    setTextContent("");
    toast({ title: "Text added" });
  };

  const addWatermark = () => {
    if (!wmText.trim()) return;
    addOperation({ type: "watermark", text: wmText, fontSize: wmSize });
    toast({ title: "Watermark added" });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    currentPathRef.current = [{ x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }];
    canvas.addEventListener("mousemove", handleCanvasMouseMove as any);
    canvas.addEventListener("mouseup", handleCanvasMouseUp as any);
  };

  const handleCanvasMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const pt = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    const prev = currentPathRef.current[currentPathRef.current.length - 1];
    if (prev) {
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    currentPathRef.current.push(pt);
  }, [drawColor, drawWidth]);

  const handleCanvasMouseUp = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.removeEventListener("mousemove", handleCanvasMouseMove as any);
    canvas.removeEventListener("mouseup", handleCanvasMouseUp as any);
    if (currentPathRef.current.length > 1) {
      drawingRef.current.paths.push([...currentPathRef.current]);
    }
    currentPathRef.current = [];
  }, [handleCanvasMouseMove]);

  const buildDrawingSvg = (): string | null => {
    const paths = drawingRef.current.paths;
    if (paths.length === 0) return null;
    const canvas = canvasRef.current;
    const w = canvas?.width || (width || 800);
    const h = canvas?.height || (height || 600);
    let svgPaths = "";
    for (const pts of paths) {
      if (pts.length < 2) continue;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        d += ` L ${pts[i].x} ${pts[i].y}`;
      }
      svgPaths += `<path d="${d}" stroke="${drawColor}" stroke-width="${drawWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${svgPaths}</svg>`;
  };

  useEffect(() => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = width || 800;
    canvas.height = height || 600;
  }, [isDrawing, width, height]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let allOps = [...operations];
      const svg = buildDrawingSvg();
      if (svg) {
        allOps.push({ type: "drawOverlay", svgData: svg });
      }
      const res = await fetch("/api/cms/image-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url, operations: allOps, outputFormat, quality }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Image saved!",
        description: `${result.originalSize} KB → ${result.newSize} KB (${result.savings > 0 ? result.savings + "% smaller" : "saved"})`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/performance-analysis"] });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const tools: { key: ToolSection; label: string; icon: React.ReactNode }[] = [
    { key: "transform", label: "Transform", icon: <Maximize2 className="w-3.5 h-3.5" /> },
    { key: "adjust", label: "Adjust", icon: <Sun className="w-3.5 h-3.5" /> },
    { key: "filters", label: "Filters", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: "draw", label: "Draw", icon: <Paintbrush className="w-3.5 h-3.5" /> },
    { key: "text", label: "Text", icon: <Type className="w-3.5 h-3.5" /> },
    { key: "watermark", label: "Watermark", icon: <Stamp className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="bg-white border-t border-b border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paintbrush className="w-4 h-4 text-brand-gold" />
          <span className="text-sm font-semibold text-gray-800">Image Editor</span>
          <span className="text-xs text-gray-400 font-mono">{url.split("/").pop()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={resetAll} className="text-xs h-7">
            <Undo2 className="w-3 h-3 mr-1" /> Reset
          </Button>
          <Button
            data-testid="button-save-edit"
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="text-xs h-7 bg-brand-gold hover:bg-brand-gold/90 text-white"
          >
            {saveMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
            Save Changes
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-7 px-2">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative w-[320px] h-[220px] bg-gray-100 rounded-lg overflow-hidden border flex-shrink-0 flex items-center justify-center">
          {isLoadingPreview && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            key={previewUrl}
          />
          {isDrawing && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onMouseDown={handleCanvasMouseDown}
              style={{ touchAction: "none" }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex gap-1 mb-3 flex-wrap">
            {tools.map(t => (
              <button
                key={t.key}
                data-testid={`tool-${t.key}`}
                onClick={() => { setActiveSection(t.key); if (t.key !== "draw") setIsDrawing(false); }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all",
                  activeSection === t.key ? "bg-brand-blue text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
            {activeSection === "transform" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 w-14">Resize:</span>
                  <Input
                    data-testid="input-resize-w"
                    type="number"
                    value={resizeW}
                    onChange={e => {
                      setResizeW(e.target.value);
                      if (keepAspect && e.target.value) setResizeH(Math.round(parseInt(e.target.value) / aspectRatio).toString());
                    }}
                    placeholder="Width"
                    className="w-20 h-7 text-xs"
                  />
                  <span className="text-gray-400">×</span>
                  <Input
                    data-testid="input-resize-h"
                    type="number"
                    value={resizeH}
                    onChange={e => {
                      setResizeH(e.target.value);
                      if (keepAspect && e.target.value) setResizeW(Math.round(parseInt(e.target.value) * aspectRatio).toString());
                    }}
                    placeholder="Height"
                    className="w-20 h-7 text-xs"
                  />
                  <label className="flex items-center gap-1 text-xs text-gray-500">
                    <input type="checkbox" checked={keepAspect} onChange={e => setKeepAspect(e.target.checked)} className="rounded" />
                    Lock
                  </label>
                  <Button size="sm" variant="outline" onClick={applyResize} className="text-xs h-7">Apply</Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 w-14">Rotate:</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addOperation({ type: "rotate", angle: -90 })}>
                    <RotateCcw className="w-3 h-3 mr-1" /> -90°
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addOperation({ type: "rotate", angle: 90 })}>
                    <RotateCw className="w-3 h-3 mr-1" /> +90°
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addOperation({ type: "rotate", angle: 180 })}>
                    180°
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-14">Flip:</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addOperation({ type: "flop" })}>
                    <FlipHorizontal className="w-3 h-3 mr-1" /> Horizontal
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addOperation({ type: "flip" })}>
                    <FlipVertical className="w-3 h-3 mr-1" /> Vertical
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 w-14">Format:</span>
                  {["webp", "jpeg", "png"].map(f => (
                    <button
                      key={f}
                      onClick={() => setOutputFormat(f)}
                      className={cn("text-xs px-2.5 py-1 rounded border font-medium uppercase", outputFormat === f ? "bg-brand-gold text-white border-brand-gold" : "bg-gray-50 text-gray-600 border-gray-200")}
                    >
                      {f}
                    </button>
                  ))}
                  <span className="text-xs text-gray-400 ml-2">Quality:</span>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={e => setQuality(parseInt(e.target.value))}
                    className="w-20 h-1 accent-brand-gold"
                  />
                  <span className="text-xs text-gray-500 w-8">{quality}%</span>
                </div>
              </div>
            )}

            {activeSection === "adjust" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 w-16">Brightness</span>
                  <input type="range" min={0.2} max={2} step={0.05} value={brightness} onChange={e => setBrightness(parseFloat(e.target.value))} className="flex-1 h-1 accent-brand-gold" />
                  <span className="text-xs text-gray-500 w-10 text-right">{(brightness * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Contrast className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 w-16">Contrast</span>
                  <input type="range" min={0.2} max={3} step={0.05} value={contrast} onChange={e => setContrast(parseFloat(e.target.value))} className="flex-1 h-1 accent-brand-gold" />
                  <span className="text-xs text-gray-500 w-10 text-right">{(contrast * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 w-16">Saturation</span>
                  <input type="range" min={0} max={3} step={0.05} value={saturation} onChange={e => setSaturation(parseFloat(e.target.value))} className="flex-1 h-1 accent-brand-gold" />
                  <span className="text-xs text-gray-500 w-10 text-right">{(saturation * 100).toFixed(0)}%</span>
                </div>
                <Button size="sm" variant="outline" onClick={applyAdjustments} className="text-xs h-7" disabled={brightness === 1 && contrast === 1 && saturation === 1}>
                  Apply Adjustments
                </Button>
              </div>
            )}

            {activeSection === "filters" && (
              <div className="grid grid-cols-4 gap-2">
                {FILTER_PRESETS.map(f => (
                  <button
                    key={f.id}
                    data-testid={`filter-${f.id}`}
                    onClick={() => applyFilter(f.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all",
                      activeFilter === f.id ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                      <img src={url} alt="" className={cn(
                        "w-full h-full object-cover",
                        f.id === "grayscale" && "grayscale",
                        f.id === "sepia" && "sepia",
                        f.id === "warm" && "brightness-105 saturate-150 hue-rotate-15",
                        f.id === "cool" && "brightness-100 saturate-90 hue-rotate-180",
                        f.id === "vintage" && "sepia brightness-90 contrast-110",
                        f.id === "blur-light" && "blur-[1px]",
                      )} loading="lazy" />
                    </div>
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {activeSection === "draw" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant={isDrawing ? "default" : "outline"}
                    onClick={() => setIsDrawing(!isDrawing)}
                    className={cn("text-xs h-7", isDrawing && "bg-red-500 hover:bg-red-600")}
                  >
                    <Paintbrush className="w-3 h-3 mr-1" />
                    {isDrawing ? "Drawing Mode ON" : "Start Drawing"}
                  </Button>
                  {isDrawing && <span className="text-xs text-red-500 animate-pulse">Draw on the preview</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Color:</span>
                  <div className="flex gap-1">
                    {["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#ffffff", "#000000"].map(c => (
                      <button
                        key={c}
                        onClick={() => setDrawColor(c)}
                        className={cn("w-6 h-6 rounded-full border-2", drawColor === c ? "border-brand-gold scale-110" : "border-gray-300")}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input type="color" value={drawColor} onChange={e => setDrawColor(e.target.value)} className="w-6 h-6 cursor-pointer" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Size:</span>
                  <input type="range" min={1} max={20} value={drawWidth} onChange={e => setDrawWidth(parseInt(e.target.value))} className="w-32 h-1 accent-brand-gold" />
                  <span className="text-xs text-gray-500">{drawWidth}px</span>
                </div>
              </div>
            )}

            {activeSection === "text" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    data-testid="input-text-content"
                    value={textContent}
                    onChange={e => setTextContent(e.target.value)}
                    placeholder="Enter text..."
                    className="flex-1 h-7 text-xs"
                  />
                  <Button size="sm" variant="outline" onClick={addText} className="text-xs h-7" disabled={!textContent.trim()}>
                    Add Text
                  </Button>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Size:</span>
                    <input type="range" min={12} max={120} value={textSize} onChange={e => setTextSize(parseInt(e.target.value))} className="w-20 h-1 accent-brand-gold" />
                    <span className="text-xs text-gray-500">{textSize}px</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Color:</span>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-6 h-6 cursor-pointer rounded" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Position:</span>
                    {(["top", "center", "bottom"] as const).map(pos => (
                      <button
                        key={pos}
                        onClick={() => setTextPosition(pos)}
                        className={cn("text-xs px-2 py-0.5 rounded border capitalize", textPosition === pos ? "bg-brand-gold text-white border-brand-gold" : "bg-gray-50 text-gray-600 border-gray-200")}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "watermark" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    data-testid="input-watermark"
                    value={wmText}
                    onChange={e => setWmText(e.target.value)}
                    placeholder="Watermark text..."
                    className="w-40 h-7 text-xs"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Size:</span>
                    <input type="range" min={12} max={72} value={wmSize} onChange={e => setWmSize(parseInt(e.target.value))} className="w-20 h-1 accent-brand-gold" />
                    <span className="text-xs text-gray-500">{wmSize}px</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={addWatermark} className="text-xs h-7" disabled={!wmText.trim()}>
                    <Stamp className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>
                <p className="text-[11px] text-gray-400">Watermark will appear at the bottom-right corner with transparency.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {operations.length > 0 && (
        <div className="mt-3 pt-2 border-t flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Applied:</span>
          {operations.map((op, i) => (
            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{op.type}</span>
          ))}
        </div>
      )}
    </div>
  );
}
