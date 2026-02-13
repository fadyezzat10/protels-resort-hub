import { useState, useEffect, useRef } from "react";
import { useEditMode } from "@/lib/editMode";
import {
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Palette, Type, Save, X, Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px", "64px"];
const FONT_FAMILIES = [
  "inherit",
  "Cormorant Garamond, serif",
  "Montserrat, sans-serif",
  "Inter, sans-serif",
  "Playfair Display, serif",
  "Lato, sans-serif",
  "Georgia, serif",
];

export default function FloatingEditToolbar() {
  const { isEditMode, selectedKey, pageContent, updateContent, saveChanges, hasPendingChanges, isSaving } = useEditMode();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  if (!isEditMode || !selectedKey) return null;

  const isImage = selectedKey.startsWith("img:");
  const styleKey = `style:${selectedKey}`;
  let currentStyle: Record<string, string> = {};
  try {
    if (pageContent[styleKey]) currentStyle = JSON.parse(pageContent[styleKey]);
  } catch {}

  const updateStyle = (prop: string, value: string) => {
    const newStyle = { ...currentStyle, [prop]: value };
    updateContent(styleKey, JSON.stringify(newStyle));
  };

  if (isImage) {
    return (
      <div
        ref={toolbarRef}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] bg-white border border-gray-200 shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3"
        data-testid="floating-edit-toolbar"
      >
        <span className="text-xs font-medium text-gray-500 mr-2">Image Style</span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">W</label>
          <Input
            data-testid="input-img-width"
            className="w-20 h-7 text-xs"
            value={currentStyle.maxWidth || ""}
            onChange={(e) => updateStyle("maxWidth", e.target.value)}
            placeholder="auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">H</label>
          <Input
            data-testid="input-img-height"
            className="w-20 h-7 text-xs"
            value={currentStyle.height || ""}
            onChange={(e) => updateStyle("height", e.target.value)}
            placeholder="auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Radius</label>
          <Input
            data-testid="input-img-radius"
            className="w-16 h-7 text-xs"
            value={currentStyle.borderRadius || ""}
            onChange={(e) => updateStyle("borderRadius", e.target.value)}
            placeholder="0"
          />
        </div>
        <select
          data-testid="select-img-fit"
          className="h-7 text-xs border rounded px-1"
          value={currentStyle.objectFit || "cover"}
          onChange={(e) => updateStyle("objectFit", e.target.value)}
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
          <option value="none">None</option>
        </select>
        {hasPendingChanges && (
          <Button data-testid="button-save-inline" size="sm" className="h-7 text-xs" onClick={saveChanges} disabled={isSaving}>
            <Save className="w-3 h-3 mr-1" /> Save
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={toolbarRef}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] bg-white border border-gray-200 shadow-2xl rounded-xl px-3 py-2 flex items-center gap-1 flex-wrap max-w-[90vw]"
      data-testid="floating-edit-toolbar"
    >
      <select
        data-testid="select-font-family"
        className="h-7 text-xs border rounded px-1 max-w-[130px]"
        value={currentStyle.fontFamily || "inherit"}
        onChange={(e) => updateStyle("fontFamily", e.target.value)}
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f}>{f === "inherit" ? "Default" : f.split(",")[0]}</option>
        ))}
      </select>

      <select
        data-testid="select-font-size"
        className="h-7 text-xs border rounded px-1 w-16"
        value={currentStyle.fontSize || ""}
        onChange={(e) => updateStyle("fontSize", e.target.value)}
      >
        <option value="">Size</option>
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <button
        data-testid="button-bold"
        className={cn("p-1 rounded hover:bg-gray-100", currentStyle.fontWeight === "bold" && "bg-blue-100 text-blue-600")}
        onClick={() => updateStyle("fontWeight", currentStyle.fontWeight === "bold" ? "normal" : "bold")}
      >
        <Bold className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <button
        data-testid="button-align-left"
        className={cn("p-1 rounded hover:bg-gray-100", currentStyle.textAlign === "left" && "bg-blue-100")}
        onClick={() => updateStyle("textAlign", "left")}
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        data-testid="button-align-center"
        className={cn("p-1 rounded hover:bg-gray-100", (!currentStyle.textAlign || currentStyle.textAlign === "center") && "bg-blue-100")}
        onClick={() => updateStyle("textAlign", "center")}
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        data-testid="button-align-right"
        className={cn("p-1 rounded hover:bg-gray-100", currentStyle.textAlign === "right" && "bg-blue-100")}
        onClick={() => updateStyle("textAlign", "right")}
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <div className="relative">
        <button
          data-testid="button-text-color"
          className="p-1 rounded hover:bg-gray-100 flex items-center gap-1"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          <Palette className="w-4 h-4" />
          <div className="w-4 h-4 rounded border" style={{ backgroundColor: currentStyle.color || "#000" }} />
        </button>
        {showColorPicker && (
          <div className="absolute bottom-full mb-2 left-0 bg-white border shadow-lg rounded-lg p-3 z-[10000]">
            <input
              data-testid="input-text-color"
              type="color"
              value={currentStyle.color || "#000000"}
              onChange={(e) => updateStyle("color", e.target.value)}
              className="w-8 h-8 cursor-pointer"
            />
            <Input
              data-testid="input-text-color-hex"
              className="w-24 h-7 text-xs mt-1"
              value={currentStyle.color || ""}
              onChange={(e) => updateStyle("color", e.target.value)}
              placeholder="#000000"
            />
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <div className="flex items-center gap-1">
        <label className="text-[10px] text-gray-500">Spacing</label>
        <Input
          data-testid="input-letter-spacing"
          className="w-14 h-7 text-xs"
          value={currentStyle.letterSpacing || ""}
          onChange={(e) => updateStyle("letterSpacing", e.target.value)}
          placeholder="0"
        />
      </div>

      {hasPendingChanges && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <Button data-testid="button-save-inline" size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700" onClick={saveChanges} disabled={isSaving}>
            <Save className="w-3 h-3 mr-1" /> Save
          </Button>
        </>
      )}
    </div>
  );
}
