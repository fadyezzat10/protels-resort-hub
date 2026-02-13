import { useState, useCallback } from "react";
import { useEditMode } from "@/lib/editMode";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Eye,
  Save,
  X,
  Loader2,
  Check,
  PanelRightOpen,
  PanelRightClose,
  Type,
  ImageIcon,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Cormorant Garamond", value: "'Cormorant Garamond', serif" },
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Lato", value: "'Lato', sans-serif" },
  { label: "Poppins", value: "'Poppins', sans-serif" },
  { label: "Cairo", value: "'Cairo', sans-serif" },
  { label: "Tajawal", value: "'Tajawal', sans-serif" },
];

const FONT_SIZES = [
  "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "40px", "48px", "56px", "64px", "72px", "80px", "96px",
];

const FONT_WEIGHTS = [
  { label: "عادي", value: "normal" },
  { label: "متوسط", value: "500" },
  { label: "سميك", value: "600" },
  { label: "عريض", value: "bold" },
  { label: "أعرض", value: "800" },
];

const TEXT_ALIGNS = [
  { label: "يسار", value: "left" },
  { label: "وسط", value: "center" },
  { label: "يمين", value: "right" },
];

export default function AdminToolbar() {
  const {
    isAdmin,
    isEditMode,
    toggleEditMode,
    hasPendingChanges,
    saveChanges,
    isSaving,
    pendingChanges,
    selectedKey,
    setSelectedKey,
    pageContent,
    updateContent,
  } = useEditMode();
  const { toast } = useToast();
  const [showPanel, setShowPanel] = useState(true);

  if (!isAdmin) return null;

  const handleSave = async () => {
    saveChanges();
    toast({ title: "تم الحفظ!", description: "التغييرات اتحفظت ونشرت بنجاح على الموقع." });
  };

  const changedKeys = Object.keys(pendingChanges);

  const isTextKey = selectedKey && !selectedKey.startsWith("img:");
  const isImageKey = selectedKey && selectedKey.startsWith("img:");

  const styleKey = selectedKey ? `style:${selectedKey}` : null;
  let currentStyle: Record<string, string> = {};
  try { if (styleKey && pageContent[styleKey]) currentStyle = JSON.parse(pageContent[styleKey]); } catch { }

  const updateStyle = useCallback((prop: string, value: string) => {
    if (!styleKey) return;
    let existing: Record<string, string> = {};
    try { if (pageContent[styleKey]) existing = JSON.parse(pageContent[styleKey]); } catch { }
    const updated = { ...existing, [prop]: value };
    if (!value) delete updated[prop];
    updateContent(styleKey, JSON.stringify(updated));
  }, [styleKey, pageContent, updateContent]);

  return (
    <>
      {!isEditMode ? (
        <button
          onClick={toggleEditMode}
          className="fixed bottom-6 right-6 z-[9999] bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl transition-all hover:scale-110"
          title="تفعيل وضع التعديل"
          data-testid="button-toggle-edit-mode"
        >
          <Pencil className="w-6 h-6" />
        </button>
      ) : (
        <>
          {/* Top Toolbar */}
          <div className="fixed top-0 left-0 right-0 z-[9998] bg-blue-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Pencil className="w-4 h-4" />
              <span className="font-medium text-sm">وضع التعديل</span>
              {hasPendingChanges && (
                <span className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                  {changedKeys.length} تغيير
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setShowPanel(!showPanel)}
                data-testid="button-toggle-panel"
              >
                {showPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              </Button>

              <Button
                size="sm"
                className={cn(
                  "font-bold text-sm px-6",
                  hasPendingChanges
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-lg"
                    : "bg-white/20 text-white/60 cursor-not-allowed"
                )}
                onClick={handleSave}
                disabled={isSaving || !hasPendingChanges}
                data-testid="button-save-changes"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    حفظ ونشر
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={toggleEditMode}
                data-testid="button-exit-edit-mode"
              >
                <X className="w-4 h-4 mr-1" />
                خروج
              </Button>
            </div>
          </div>

          <div className="h-10" />

          {/* Side Panel */}
          {showPanel && (
            <div className="fixed top-10 right-0 bottom-0 w-80 bg-white shadow-2xl z-[9997] border-l border-gray-200 overflow-y-auto" dir="rtl">
              {/* Panel Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold text-sm text-gray-900">لوحة التحكم</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedKey ? "عنصر محدد - عدّل الخصائص" : "اضغط على أي نص أو صورة للتعديل"}
                </p>
              </div>

              {/* Text Style Controls */}
              {isTextKey && selectedKey && (
                <div className="p-4 space-y-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Type className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-sm text-gray-800">تنسيق النص</h4>
                  </div>

                  {/* Font Family */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">نوع الخط</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={currentStyle.fontFamily || ""}
                      onChange={(e) => updateStyle("fontFamily", e.target.value)}
                    >
                      {FONT_FAMILIES.map((f) => (
                        <option key={f.value} value={f.value} style={{ fontFamily: f.value || undefined }}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">حجم الخط</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={currentStyle.fontSize || ""}
                      onChange={(e) => updateStyle("fontSize", e.target.value)}
                    >
                      <option value="">افتراضي</option>
                      {FONT_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Font Weight */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">سُمك الخط</label>
                    <div className="flex flex-wrap gap-1.5">
                      {FONT_WEIGHTS.map((w) => (
                        <button
                          key={w.value}
                          className={cn(
                            "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                            currentStyle.fontWeight === w.value
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          )}
                          onClick={() => updateStyle("fontWeight", currentStyle.fontWeight === w.value ? "" : w.value)}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Align */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">محاذاة النص</label>
                    <div className="flex gap-1.5">
                      {TEXT_ALIGNS.map((a) => (
                        <button
                          key={a.value}
                          className={cn(
                            "flex-1 px-3 py-1.5 text-xs rounded-lg border transition-colors",
                            currentStyle.textAlign === a.value
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          )}
                          onClick={() => updateStyle("textAlign", currentStyle.textAlign === a.value ? "" : a.value)}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">لون النص</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentStyle.color || "#000000"}
                        onChange={(e) => updateStyle("color", e.target.value)}
                        className="w-10 h-10 rounded-lg border cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={currentStyle.color || ""}
                        onChange={(e) => updateStyle("color", e.target.value)}
                        placeholder="افتراضي"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                        dir="ltr"
                      />
                      {currentStyle.color && (
                        <button
                          className="text-xs text-red-500 hover:text-red-700"
                          onClick={() => updateStyle("color", "")}
                        >
                          مسح
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Letter Spacing */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">تباعد الحروف</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                      value={currentStyle.letterSpacing || ""}
                      onChange={(e) => updateStyle("letterSpacing", e.target.value)}
                    >
                      <option value="">افتراضي</option>
                      <option value="0px">0px</option>
                      <option value="0.5px">0.5px</option>
                      <option value="1px">1px</option>
                      <option value="2px">2px</option>
                      <option value="3px">3px</option>
                      <option value="5px">5px</option>
                      <option value="0.1em">0.1em</option>
                      <option value="0.2em">0.2em</option>
                      <option value="0.3em">0.3em</option>
                    </select>
                  </div>

                  {/* Text Value */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">محتوى النص</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[80px] resize-y focus:ring-2 focus:ring-blue-500"
                      value={pageContent[selectedKey] ?? ""}
                      onChange={(e) => updateContent(selectedKey, e.target.value)}
                      dir="auto"
                    />
                  </div>
                </div>
              )}

              {/* Image Controls */}
              {isImageKey && selectedKey && (
                <div className="p-4 space-y-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-sm text-gray-800">إعدادات الصورة</h4>
                  </div>

                  {pageContent[selectedKey] && (
                    <img
                      src={pageContent[selectedKey]}
                      alt="معاينة"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  )}

                  {/* Max Width */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">العرض الأقصى</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                      value={currentStyle.maxWidth || ""}
                      onChange={(e) => updateStyle("maxWidth", e.target.value)}
                    >
                      <option value="">افتراضي (100%)</option>
                      <option value="200px">200px</option>
                      <option value="300px">300px</option>
                      <option value="400px">400px</option>
                      <option value="500px">500px</option>
                      <option value="600px">600px</option>
                      <option value="800px">800px</option>
                      <option value="50%">50%</option>
                      <option value="75%">75%</option>
                      <option value="100%">100%</option>
                    </select>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">الارتفاع</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                      value={currentStyle.height || ""}
                      onChange={(e) => updateStyle("height", e.target.value)}
                    >
                      <option value="">افتراضي</option>
                      <option value="150px">150px</option>
                      <option value="200px">200px</option>
                      <option value="250px">250px</option>
                      <option value="300px">300px</option>
                      <option value="400px">400px</option>
                      <option value="500px">500px</option>
                      <option value="auto">تلقائي</option>
                    </select>
                  </div>

                  {/* Object Fit */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">طريقة العرض</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "تغطية", value: "cover" },
                        { label: "احتواء", value: "contain" },
                        { label: "ملء", value: "fill" },
                      ].map((f) => (
                        <button
                          key={f.value}
                          className={cn(
                            "flex-1 px-3 py-1.5 text-xs rounded-lg border transition-colors",
                            currentStyle.objectFit === f.value
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          )}
                          onClick={() => updateStyle("objectFit", currentStyle.objectFit === f.value ? "" : f.value)}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Radius */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">زوايا مستديرة</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                      value={currentStyle.borderRadius || ""}
                      onChange={(e) => updateStyle("borderRadius", e.target.value)}
                    >
                      <option value="">بدون</option>
                      <option value="4px">صغير (4px)</option>
                      <option value="8px">متوسط (8px)</option>
                      <option value="16px">كبير (16px)</option>
                      <option value="24px">أكبر (24px)</option>
                      <option value="50%">دائري</option>
                    </select>
                  </div>

                  <p className="text-xs text-gray-400">اضغط على الصورة في الصفحة لتغييرها</p>
                </div>
              )}

              {/* Pending Changes */}
              {changedKeys.length > 0 && (
                <div className="p-4 border-b border-gray-200">
                  <label className="text-xs font-bold text-gray-700 mb-2 block">
                    التغييرات المعلقة ({changedKeys.length})
                  </label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {changedKeys.map((key) => (
                      <div key={key} className="bg-yellow-50 rounded-lg p-2 text-xs border border-yellow-200">
                        <p className="font-mono text-yellow-800 break-all text-[10px]">{key}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-3 bg-green-500 hover:bg-green-600 font-bold"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    حفظ ونشر على الموقع
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {changedKeys.length === 0 && !selectedKey && (
                <div className="p-8 text-center text-gray-400">
                  <Eye className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">اضغط على أي نص أو صورة في الصفحة لبدء التعديل</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
