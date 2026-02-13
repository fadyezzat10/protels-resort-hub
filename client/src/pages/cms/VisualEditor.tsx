import { useState, useEffect, useCallback, useMemo, useRef, Component, type ErrorInfo, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Upload,
  Eye,
  EyeOff,
  GripVertical,
  MoveUp,
  MoveDown,
  ImagePlus,
  ImageMinus,
  Settings,
  X,
  ChevronDown,
  Undo2,
  History,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type BuilderSection,
  type SectionType,
  SECTION_TYPE_LABELS,
  SECTION_TYPE_ICONS,
  createDefaultSection,
} from "@/lib/builderTypes";

class VisualEditorErrorBoundary extends Component<
  { children: ReactNode; onReset?: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; onReset?: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[VisualEditor] Render error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800 mb-2">حدث خطأ في المحرر المرئي</h2>
            <p className="text-sm text-gray-500 mb-4">
              {this.state.error?.message || "An unexpected error occurred in the visual editor."}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onReset?.();
                }}
              >
                إعادة المحاولة
              </button>
              <a
                href="/controlpanal/pages"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              >
                العودة للصفحات
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function safeSection(section: any): BuilderSection {
  return {
    id: section?.id || Math.random().toString(36).substring(2, 10),
    type: section?.type || "custom",
    label: section?.label || "Section",
    hidden: !!section?.hidden,
    content: section?.content || {},
    styles: section?.styles || { paddingTop: "60px", paddingBottom: "60px", backgroundColor: "#ffffff" },
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  if (c.length < 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function VisualSection({
  section,
  isSelected,
  onSelect,
  onContentChange,
  onStyleChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onImageUpload,
  isFirst,
  isLast,
}: {
  section: BuilderSection;
  isSelected: boolean;
  onSelect: () => void;
  onContentChange: (key: string, value: any) => void;
  onStyleChange: (key: string, value: any) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onImageUpload: (file: File) => Promise<string>;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [showSettings, setShowSettings] = useState(false);
  const s = section.styles;
  const c = section.content;
  const isDark = s.backgroundColor
    ? (() => {
        const hex = s.backgroundColor.replace("#", "");
        if (hex.length < 6) return false;
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return (r * 299 + g * 587 + b * 114) / 1000 < 128;
      })()
    : false;
  const hasImage = !!s.backgroundImage;
  const textColor = isDark || hasImage ? "text-white" : "text-brand-blue";
  const subColor = isDark || hasImage ? "text-white/80" : "text-gray-600";

  const handleInlineEdit = (key: string) => (e: React.FocusEvent<HTMLElement>) => {
    const newText = e.currentTarget.innerText;
    if (newText !== c[key]) {
      onContentChange(key, newText);
    }
  };

  const handleImageClick = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = await onImageUpload(file);
        onStyleChange("backgroundImage", url);
      }
    };
    input.click();
  };

  const handleContentImageClick = async (key: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = await onImageUpload(file);
        onContentChange(key, url);
      }
    };
    input.click();
  };

  const sectionStyle: React.CSSProperties = {};
  if (s.backgroundImage) {
    sectionStyle.backgroundImage = `url(${s.backgroundImage})`;
    sectionStyle.backgroundSize = s.backgroundSize || "cover";
    sectionStyle.backgroundPosition = s.backgroundPosition || "center";
  }
  if (s.backgroundGradient) {
    sectionStyle.background = s.backgroundGradient;
  } else if (s.backgroundColor) {
    sectionStyle.backgroundColor = s.backgroundColor;
  }
  if (s.minHeight) sectionStyle.minHeight = s.minHeight;
  if (s.borderRadius) sectionStyle.borderRadius = s.borderRadius;

  const renderHero = () => (
    <section
      className="relative w-full overflow-hidden"
      style={{ ...sectionStyle, minHeight: s.minHeight || "80vh" }}
    >
      {hasImage && (
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundColor: hexToRgba(s.overlayColor || "#000000", s.backgroundOverlay || 0.3),
          }}
        />
      )}
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40 z-10" />
      )}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6 py-32">
        <div className="max-w-5xl mx-auto">
          {c.subtitle && (
            <span
              className="text-white/80 text-sm md:text-base tracking-[0.3em] uppercase font-light mb-8 block"
              contentEditable
              suppressContentEditableWarning
              onBlur={handleInlineEdit("subtitle")}
            >
              {c.subtitle}
            </span>
          )}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-tight outline-none"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInlineEdit("title")}
          >
            {c.title || "Section Title"}
          </h1>
          {c.buttonText && (
            <span
              className="inline-block bg-brand-gold/90 hover:bg-brand-gold text-white px-10 py-4 text-sm uppercase tracking-widest font-medium cursor-text"
              contentEditable
              suppressContentEditableWarning
              onBlur={handleInlineEdit("buttonText")}
            >
              {c.buttonText}
            </span>
          )}
        </div>
      </div>
    </section>
  );

  const renderTextBlock = () => (
    <section
      className={cn("py-24 px-6 md:px-12 relative overflow-hidden")}
      style={sectionStyle}
    >
      {hasImage && s.backgroundOverlay && (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: hexToRgba(s.overlayColor || "#000000", s.backgroundOverlay) }} />
      )}
      <div className="max-w-5xl mx-auto text-center relative z-10">
        {c.heading && (
          <h2
            className={cn("text-3xl md:text-5xl font-serif mb-8 leading-tight outline-none", textColor)}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInlineEdit("heading")}
          >
            {c.heading}
          </h2>
        )}
        <div className="w-24 h-1 bg-brand-gold mx-auto mb-10" />
        {c.body && (
          <p
            className={cn("text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-light outline-none", subColor)}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInlineEdit("body")}
          >
            {c.body}
          </p>
        )}
      </div>
    </section>
  );

  const renderImageText = () => {
    const imgLeft = c.imagePosition !== "right";
    return (
      <section className="py-24 relative overflow-hidden" style={sectionStyle}>
        {hasImage && s.backgroundOverlay && (
          <div className="absolute inset-0 z-0" style={{ backgroundColor: hexToRgba(s.overlayColor || "#000000", s.backgroundOverlay) }} />
        )}
        <div className="container-padding relative z-10">
          <div className={cn("flex flex-col gap-12 lg:gap-20 items-center", imgLeft ? "lg:flex-row" : "lg:flex-row-reverse")}>
            <div className="w-full lg:w-1/2 overflow-hidden shadow-xl rounded-sm">
              <div
                className="aspect-[4/3] relative group overflow-hidden cursor-pointer"
                onClick={() => handleContentImageClick("image")}
              >
                {c.image ? (
                  <img src={c.image} alt={c.imageAlt || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <ImagePlus className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white/90 text-gray-700 text-xs px-4 py-2 rounded-lg font-medium">Click to replace</span>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              {c.heading && (
                <h2
                  className={cn("text-3xl md:text-4xl font-serif mb-6 outline-none", textColor)}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={handleInlineEdit("heading")}
                >
                  {c.heading}
                </h2>
              )}
              {c.body && (
                <p
                  className={cn("text-lg leading-relaxed font-light outline-none", subColor)}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={handleInlineEdit("body")}
                >
                  {c.body}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderGallery = () => {
    const cols = c.columns || 3;
    return (
      <section className="py-24 relative overflow-hidden" style={sectionStyle}>
        <div className="container-padding relative z-10">
          {c.heading && (
            <h2
              className={cn("text-4xl md:text-5xl font-serif text-center mb-16 outline-none", textColor)}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleInlineEdit("heading")}
            >
              {c.heading}
            </h2>
          )}
          <div className={cn("grid gap-4", cols === 2 && "grid-cols-2", cols === 3 && "grid-cols-2 md:grid-cols-3", cols === 4 && "grid-cols-2 md:grid-cols-4")}>
            {(c.images || []).map((img: any, i: number) => (
              <div key={i} className="aspect-[4/3] overflow-hidden rounded-sm shadow-lg">
                <img src={typeof img === "string" ? img : img.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
            {(!c.images || c.images.length === 0) && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <ImagePlus className="w-12 h-12 mx-auto mb-3" />
                <p>Add images in section settings</p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderCTA = () => (
    <section
      className="relative py-24 overflow-hidden"
      style={{ ...sectionStyle, backgroundColor: s.backgroundColor || "#0c1c2c" }}
    >
      {hasImage && (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: hexToRgba(s.overlayColor || "#000000", s.backgroundOverlay || 0.4) }} />
      )}
      <div className="container-padding text-center relative z-10">
        {c.heading && (
          <h2
            className="text-3xl md:text-5xl font-serif text-white mb-8 outline-none"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInlineEdit("heading")}
          >
            {c.heading}
          </h2>
        )}
        {c.body && (
          <p
            className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed outline-none"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInlineEdit("body")}
          >
            {c.body}
          </p>
        )}
        {c.buttonText && (
          <span
            className="inline-block bg-brand-gold hover:bg-brand-gold/90 text-white px-10 py-4 text-sm uppercase tracking-widest font-medium cursor-text"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInlineEdit("buttonText")}
          >
            {c.buttonText}
          </span>
        )}
      </div>
    </section>
  );

  const renderRooms = () => (
    <section className="py-24 relative overflow-hidden" style={sectionStyle}>
      <div className="container-padding relative z-10">
        {c.heading && (
          <h2
            className={cn("text-4xl md:text-5xl font-serif text-center mb-16 outline-none", textColor)}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInlineEdit("heading")}
          >
            {c.heading}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(c.rooms || []).map((room: any, i: number) => (
            <div key={i} className="group overflow-hidden shadow-lg bg-white">
              <div className="aspect-[4/3] overflow-hidden">
                {room.image ? (
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <ImagePlus className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl text-brand-blue mb-2">{room.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{room.description}</p>
                {room.price && <p className="mt-3 font-medium text-brand-gold">{room.price}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderTestimonials = () => (
    <section className="py-24 bg-gray-50 relative overflow-hidden" style={sectionStyle}>
      <div className="container-padding relative z-10">
        {c.heading && (
          <h2
            className={cn("text-4xl md:text-5xl font-serif text-center mb-16 outline-none", textColor)}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInlineEdit("heading")}
          >
            {c.heading}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(c.testimonials || []).map((t: any, i: number) => (
            <div key={i} className="bg-white p-8 shadow-sm border-t-2 border-brand-gold">
              <div className="text-brand-gold mb-4">{"★".repeat(t.rating || 5)}</div>
              <p className="text-gray-600 italic mb-4 leading-relaxed">"{t.text}"</p>
              <p className="font-serif text-brand-blue font-medium">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderContact = () => (
    <section className="py-24 relative overflow-hidden" style={sectionStyle}>
      <div className="container-padding relative z-10">
        {c.heading && (
          <h2
            className={cn("text-4xl md:text-5xl font-serif mb-12 outline-none", textColor)}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInlineEdit("heading")}
          >
            {c.heading}
          </h2>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            {c.email && <p className={cn("text-lg", subColor)}><strong>Email:</strong> {c.email}</p>}
            {c.phone && <p className={cn("text-lg", subColor)}><strong>Phone:</strong> {c.phone}</p>}
            {c.address && <p className={cn("text-lg", subColor)}><strong>Address:</strong> {c.address}</p>}
          </div>
          {c.showForm && (
            <div className="space-y-4">
              <input placeholder="Your Name" className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-brand-gold/50 outline-none" />
              <input placeholder="Your Email" className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-brand-gold/50 outline-none" />
              <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-brand-gold/50 outline-none resize-y" />
              <button className="bg-brand-gold text-white px-8 py-3 text-sm uppercase tracking-widest font-medium hover:bg-brand-gold/90 transition-colors">
                Send Message
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderCustom = () => (
    <section className="py-24 relative overflow-hidden" style={sectionStyle}>
      {hasImage && s.backgroundOverlay && (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: hexToRgba(s.overlayColor || "#000000", s.backgroundOverlay) }} />
      )}
      <div className="container-padding relative z-10">
        {c.heading && (
          <h2
            className={cn("text-3xl md:text-5xl font-serif mb-8 outline-none", textColor)}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInlineEdit("heading")}
          >
            {c.heading}
          </h2>
        )}
        {c.body && (
          <p
            className={cn("text-lg leading-relaxed font-light outline-none", subColor)}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInlineEdit("body")}
          >
            {c.body}
          </p>
        )}
      </div>
    </section>
  );

  const RENDERERS: Record<string, () => React.ReactElement> = {
    hero: renderHero,
    text_block: renderTextBlock,
    image_text: renderImageText,
    gallery: renderGallery,
    cta: renderCTA,
    rooms: renderRooms,
    testimonials: renderTestimonials,
    contact: renderContact,
    custom: renderCustom,
  };

  const render = RENDERERS[section.type] || renderCustom;

  return (
    <div
      className={cn(
        "relative group",
        section.hidden && "opacity-30",
        isSelected && "ring-2 ring-blue-500 ring-inset z-10"
      )}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[contenteditable]")) {
          onSelect();
        }
      }}
    >
      {/* Hover/Selected Floating Toolbar */}
      <div
        className={cn(
          "absolute top-4 right-4 z-30 flex items-center gap-1 bg-white/95 backdrop-blur-sm shadow-xl rounded-xl px-2 py-1.5 transition-all border border-gray-200",
          isSelected ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs font-medium text-gray-600 px-2 border-r border-gray-200 mr-1">
          {SECTION_TYPE_ICONS[section.type]} {section.label}
        </span>

        <label className="p-1.5 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors" title="Upload Background">
          <ImagePlus className="w-4 h-4 text-blue-600" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = await onImageUpload(file);
                onStyleChange("backgroundImage", url);
              }
              e.target.value = "";
            }}
          />
        </label>
        {hasImage && (
          <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Remove Background" onClick={() => onStyleChange("backgroundImage", "")}>
            <ImageMinus className="w-4 h-4 text-red-500" />
          </button>
        )}
        <div className="w-px h-6 bg-gray-200 mx-0.5" />
        {!isFirst && (
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Move Up" onClick={onMoveUp}>
            <MoveUp className="w-4 h-4 text-gray-600" />
          </button>
        )}
        {!isLast && (
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Move Down" onClick={onMoveDown}>
            <MoveDown className="w-4 h-4 text-gray-600" />
          </button>
        )}
        <div className="w-px h-6 bg-gray-200 mx-0.5" />
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Settings" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title={section.hidden ? "Show" : "Hide"} onClick={onToggleVisibility}>
          {section.hidden ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Duplicate" onClick={onDuplicate}>
          <Copy className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete" onClick={onDelete}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* Section Settings Popup */}
      {showSettings && isSelected && (
        <div
          className="absolute top-16 right-4 z-40 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
            <h3 className="text-sm font-bold text-gray-800">Section Settings</h3>
            <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-200 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-auto p-4 space-y-4">
            {/* Background Color */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={s.backgroundColor || "#ffffff"}
                  onChange={(e) => onStyleChange("backgroundColor", e.target.value)}
                  className="w-9 h-9 rounded-lg border cursor-pointer p-0.5"
                />
                <Input
                  value={s.backgroundColor || "#ffffff"}
                  onChange={(e) => onStyleChange("backgroundColor", e.target.value)}
                  className="h-8 text-sm flex-1 font-mono"
                />
              </div>
            </div>

            {/* Background Image URL */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Background Image URL</label>
              <Input
                value={s.backgroundImage || ""}
                onChange={(e) => onStyleChange("backgroundImage", e.target.value)}
                className="h-8 text-xs"
                placeholder="https://... or upload via toolbar"
              />
            </div>

            {/* Overlay */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <label className="text-xs font-bold text-gray-600 block">Overlay</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={s.overlayColor || "#000000"}
                  onChange={(e) => onStyleChange("overlayColor", e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer p-0.5"
                />
                <Input
                  value={s.overlayColor || "#000000"}
                  onChange={(e) => onStyleChange("overlayColor", e.target.value)}
                  className="h-7 text-xs flex-1 font-mono"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Opacity</span>
                <span className="text-xs font-bold">{Math.round((s.backgroundOverlay || 0) * 100)}%</span>
              </div>
              <input
                type="range" min="0" max="1" step="0.05"
                value={s.backgroundOverlay || 0}
                onChange={(e) => onStyleChange("backgroundOverlay", parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Min Height */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Min Height</label>
              <div className="flex gap-1 mb-1.5">
                {["auto", "400px", "600px", "80vh", "100vh"].map(v => (
                  <button
                    key={v}
                    onClick={() => onStyleChange("minHeight", v === "auto" ? "" : v)}
                    className={cn(
                      "flex-1 text-[10px] py-1.5 rounded border transition-colors",
                      (s.minHeight || "") === (v === "auto" ? "" : v) ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {v === "auto" ? "Auto" : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Gradient</label>
              <Input
                value={s.backgroundGradient || ""}
                onChange={(e) => onStyleChange("backgroundGradient", e.target.value)}
                className="h-8 text-xs font-mono"
                placeholder="linear-gradient(...)"
              />
            </div>

            {/* Padding */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Padding</label>
              <div className="grid grid-cols-2 gap-2">
                {(["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"] as const).map(p => (
                  <div key={p}>
                    <label className="text-[10px] text-gray-500">{p.replace("padding", "").toLowerCase()}</label>
                    <Input
                      value={(s as any)[p] || ""}
                      onChange={(e) => onStyleChange(p, e.target.value)}
                      className="h-7 text-xs"
                      placeholder="60px"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Text Align */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Text Alignment</label>
              <div className="flex gap-1">
                {["left", "center", "right"].map(a => (
                  <button
                    key={a}
                    onClick={() => onStyleChange("textAlign", a)}
                    className={cn(
                      "flex-1 text-xs py-1.5 rounded border transition-colors capitalize",
                      s.textAlign === a ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render the actual section */}
      {render()}
    </div>
  );
}

export default function VisualEditor() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [sections, setSections] = useState<BuilderSection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [pageId, setPageId] = useState<number | null>(null);
  const [pageTitle, setPageTitle] = useState(params.slug || "");
  const pageSlug = params.slug || "";

  const { data: pagesData } = useQuery<any[]>({
    queryKey: ["/api/cms/pages"],
    queryFn: async () => {
      const res = await fetch("/api/cms/pages", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    retry: 1,
  });

  useEffect(() => {
    if (pagesData && params.slug) {
      const page = pagesData.find((p: any) => p.slug === params.slug);
      if (page) {
        setPageId(page.id);
        setPageTitle(page.title?.en || page.slug);
      }
    }
  }, [pagesData, params.slug]);

  const { data: builderData, isLoading: isBuilderLoading } = useQuery({
    queryKey: ["/api/cms/pages", pageId, "builder"],
    queryFn: async () => {
      if (!pageId) return null;
      try {
        const res = await fetch(`/api/cms/pages/${pageId}/builder`, { credentials: "include" });
        if (!res.ok) {
          console.error("[VisualEditor] Failed to load builder data, status:", res.status);
          return { builderDraft: { sections: [] } };
        }
        return res.json();
      } catch (err) {
        console.error("[VisualEditor] Error fetching builder data:", err);
        return { builderDraft: { sections: [] } };
      }
    },
    enabled: !!pageId,
  });

  const isLoading = !pagesData || (!!pageId && isBuilderLoading);

  useEffect(() => {
    try {
      const rawSections = builderData?.builderDraft?.sections;
      if (Array.isArray(rawSections)) {
        setSections(rawSections.map(safeSection));
      } else if (builderData && !rawSections) {
        console.warn("[VisualEditor] builderData exists but no sections found, initializing empty");
        setSections([]);
      }
    } catch (err) {
      console.error("[VisualEditor] Error processing builder data:", err);
      setSections([]);
    }
  }, [builderData]);

  const updateSections = useCallback((newSections: BuilderSection[]) => {
    setSections(newSections);
    setHasChanges(true);
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/cms/media", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  }, []);

  const updateSectionContent = useCallback((id: string, key: string, value: any) => {
    updateSections(
      sections.map((s) =>
        s.id === id ? { ...s, content: { ...s.content, [key]: value } } : s
      )
    );
  }, [sections, updateSections]);

  const updateSectionStyles = useCallback((id: string, key: string, value: any) => {
    updateSections(
      sections.map((s) =>
        s.id === id ? { ...s, styles: { ...s.styles, [key]: value } } : s
      )
    );
  }, [sections, updateSections]);

  const addSection = useCallback((type: SectionType) => {
    const newSection = createDefaultSection(type);
    updateSections([...sections, newSection]);
    setSelectedId(newSection.id);
    setShowAddMenu(false);
  }, [sections, updateSections]);

  const deleteSection = useCallback((id: string) => {
    updateSections(sections.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [sections, selectedId, updateSections]);

  const duplicateSection = useCallback((id: string) => {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const clone = { ...sections[idx], id: Math.random().toString(36).substring(2, 10) + Date.now().toString(36) };
    const newSections = [...sections];
    newSections.splice(idx + 1, 0, clone);
    updateSections(newSections);
    setSelectedId(clone.id);
  }, [sections, updateSections]);

  const toggleVisibility = useCallback((id: string) => {
    updateSections(sections.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s)));
  }, [sections, updateSections]);

  const moveSection = useCallback((id: string, direction: "up" | "down") => {
    const idx = sections.findIndex((s) => s.id === id);
    if (direction === "up" && idx > 0) {
      const newSections = [...sections];
      [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
      updateSections(newSections);
    } else if (direction === "down" && idx < sections.length - 1) {
      const newSections = [...sections];
      [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
      updateSections(newSections);
    }
  }, [sections, updateSections]);

  const saveMutation = useMutation({
    mutationFn: async (secs: BuilderSection[]) => {
      await apiRequest("PUT", `/api/cms/pages/${pageId}/builder`, { sections: secs });
    },
    onSuccess: () => {
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages", pageId, "builder"] });
      toast({ title: "Draft saved" });
    },
    onError: (err: Error) => toast({ title: "Error saving", description: err.message, variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/cms/pages/${pageId}/builder/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({ title: "Published successfully!" });
    },
    onError: (err: Error) => toast({ title: "Error publishing", description: err.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">جاري تحميل المحرر المرئي...</p>
        </div>
      </div>
    );
  }

  if (pagesData && !pageId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">الصفحة غير موجودة</h2>
          <p className="text-sm text-gray-500 mb-4">
            لم يتم العثور على صفحة بالمعرف "{params.slug}" في النظام.
          </p>
          <a
            href="/controlpanal/pages"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            العودة للصفحات
          </a>
        </div>
      </div>
    );
  }

  return (
    <VisualEditorErrorBoundary onReset={() => setSections([])}>
    <div className="min-h-screen bg-brand-white font-sans selection:bg-brand-gold/30">
      {/* Floating Editor Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setLocation("/controlpanal/pages")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <span className="text-sm font-serif font-bold text-brand-blue">{pageTitle}</span>
            {hasChanges && <span className="w-2 h-2 bg-orange-400 rounded-full" title="Unsaved changes" />}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setShowAddMenu(!showAddMenu)}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Section
              </Button>
              {showAddMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border rounded-xl shadow-xl z-50 py-2 max-h-96 overflow-auto">
                  {(Object.keys(SECTION_TYPE_LABELS) as SectionType[]).map((type) => (
                    <button
                      key={type}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      onClick={() => addSection(type)}
                    >
                      <span className="text-lg">{SECTION_TYPE_ICONS[type]}</span>
                      <span>{SECTION_TYPE_LABELS[type]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-300" />

            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => saveMutation.mutate(sections)}
              disabled={!hasChanges || saveMutation.isPending || !pageId}
            >
              <Save className="w-4 h-4 mr-1" />
              {saveMutation.isPending ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              size="sm"
              className="text-xs bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                if (hasChanges) saveMutation.mutate(sections);
                publishMutation.mutate();
              }}
              disabled={publishMutation.isPending || !pageId}
            >
              <Upload className="w-4 h-4 mr-1" />
              {publishMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer for fixed toolbar */}
      <div className="h-12" />

      {/* Self-contained Mini Navbar (no dependency on frontend components) */}
      <div style={{ background: "linear-gradient(135deg, #0c1c2c 0%, #1a2d42 100%)", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid rgba(201,169,110,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid #c9a96e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 700 }}>P</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", fontWeight: 700, letterSpacing: "3px", lineHeight: 1 }}>PROTELS</div>
            <div style={{ color: "rgba(201,169,110,0.7)", fontSize: "7px", letterSpacing: "2px", fontFamily: "Montserrat, sans-serif" }}>HOTELS & RESORTS</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {["HOME", "HOTELS", "ABOUT US", "CAREERS", "CONTACT"].map(item => (
            <span key={item} style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontFamily: "Montserrat, sans-serif", letterSpacing: "1px", fontWeight: 500 }}>{item}</span>
          ))}
          <span style={{ background: "transparent", border: "1px solid #c9a96e", color: "#c9a96e", padding: "6px 16px", borderRadius: "2px", fontSize: "9px", fontFamily: "Montserrat, sans-serif", letterSpacing: "1px", fontWeight: 600 }}>BOOK NOW</span>
        </div>
      </div>

      {/* Page Sections */}
      <div onClick={() => setSelectedId(null)}>
        {sections.length === 0 ? (
          <div className="flex items-center justify-center py-48 text-gray-400 bg-gray-50">
            <div className="text-center">
              <Plus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-serif text-gray-500 mb-2">Empty Page – Click Add to start building</p>
              <p className="text-sm mb-6">اضغط "Add Section" أعلاه لبدء بناء الصفحة</p>
              <Button variant="outline" onClick={() => setShowAddMenu(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add Your First Section
              </Button>
            </div>
          </div>
        ) : (
          sections.map((section, idx) => (
            <VisualSection
              key={section.id}
              section={section}
              isSelected={selectedId === section.id}
              onSelect={() => setSelectedId(section.id)}
              onContentChange={(key, value) => updateSectionContent(section.id, key, value)}
              onStyleChange={(key, value) => updateSectionStyles(section.id, key, value)}
              onDelete={() => deleteSection(section.id)}
              onDuplicate={() => duplicateSection(section.id)}
              onMoveUp={() => moveSection(section.id, "up")}
              onMoveDown={() => moveSection(section.id, "down")}
              onToggleVisibility={() => toggleVisibility(section.id)}
              onImageUpload={uploadImage}
              isFirst={idx === 0}
              isLast={idx === sections.length - 1}
            />
          ))
        )}
      </div>

      {/* Self-contained Mini Footer (no dependency on frontend components) */}
      <div style={{ background: "#0c1c2c", padding: "40px 48px 24px", borderTop: "2px solid #c9a96e" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div style={{ color: "#fff", fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 700, letterSpacing: "3px", marginBottom: "8px" }}>PROTELS</div>
            <div style={{ color: "rgba(201,169,110,0.6)", fontSize: "8px", letterSpacing: "2px", fontFamily: "Montserrat, sans-serif", marginBottom: "16px" }}>HOTELS & RESORTS</div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", maxWidth: "280px", lineHeight: 1.7, fontFamily: "Montserrat, sans-serif" }}>
              Experience the pinnacle of coastal luxury across our exclusive portfolio of premium beach resorts.
            </p>
          </div>
          <div>
            <div style={{ color: "#c9a96e", fontSize: "11px", fontWeight: 600, marginBottom: "12px", letterSpacing: "1px", fontFamily: "Montserrat, sans-serif" }}>OUR RESORTS</div>
            {["Crystal Beach Resort", "Beach Club & SPA", "La Plage Zanzibar", "Royal Bay Resort"].map(h => (
              <div key={h} style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", marginBottom: "6px", fontFamily: "Montserrat, sans-serif" }}>{h}</div>
            ))}
          </div>
          <div>
            <div style={{ color: "#c9a96e", fontSize: "11px", fontWeight: 600, marginBottom: "12px", letterSpacing: "1px", fontFamily: "Montserrat, sans-serif" }}>CONTACT</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", marginBottom: "6px", fontFamily: "Montserrat, sans-serif" }}>info@protels.com</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", marginBottom: "6px", fontFamily: "Montserrat, sans-serif" }}>+20 123 456 7890</div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", fontFamily: "Montserrat, sans-serif" }}>
            &copy; 2026 PROTELS Hotels & Resorts. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Click outside to close add menu */}
      {showAddMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
      )}
    </div>
    </VisualEditorErrorBoundary>
  );
}
