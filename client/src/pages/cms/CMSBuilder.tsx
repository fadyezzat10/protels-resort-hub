import { useState, useEffect, useCallback, useMemo, useRef, Component, type ErrorInfo, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  GripVertical,
  Upload,
  History,
  ChevronDown,
  X,
  Undo2,
  Monitor,
  Pencil,
  ExternalLink,
  ImagePlus,
  ImageMinus,
  Layers,
  MoveUp,
  MoveDown,
  ArrowUpDown,
  Palette,
  Maximize2,
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
  FONT_FAMILIES,
  FONT_WEIGHTS,
  TEXT_ALIGNMENTS,
} from "@/lib/builderTypes";
import SectionRenderer from "@/components/builder/SectionRenderer";

class BuilderErrorBoundary extends Component<
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
    console.error("[CMSBuilder] Render error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800 mb-2">حدث خطأ في المحرر</h2>
            <p className="text-sm text-gray-500 mb-4">
              {this.state.error?.message || "An unexpected error occurred in the builder."}
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

function SortableSectionItem({
  section,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDuplicate,
  onDelete,
}: {
  section: BuilderSection;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`section-item-${section.id}`}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm",
        isSelected ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200 hover:bg-gray-50",
        section.hidden && "opacity-50"
      )}
      onClick={onSelect}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="mr-1">{SECTION_TYPE_ICONS[section.type]}</span>
      <span className="flex-1 truncate font-medium">{section.label}</span>
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={onToggleVisibility} className="p-1 hover:bg-gray-200 rounded" title={section.hidden ? "Show" : "Hide"}>
          {section.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onDuplicate} className="p-1 hover:bg-gray-200 rounded" title="Duplicate">
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1 hover:bg-red-100 rounded text-red-500" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function CMSBuilder() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [sections, setSections] = useState<BuilderSection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [pageId, setPageId] = useState<number | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug] = useState(params.slug || "");
  const [hasChanges, setHasChanges] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");

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
          console.error("[CMSBuilder] Failed to load builder data, status:", res.status);
          return { builderDraft: { sections: [] } };
        }
        return res.json();
      } catch (err) {
        console.error("[CMSBuilder] Error fetching builder data:", err);
        return { builderDraft: { sections: [] } };
      }
    },
    enabled: !!pageId,
  });

  const isLoading = !pagesData || (!!pageId && isBuilderLoading);

  const { data: versions = [] } = useQuery<any[]>({
    queryKey: ["/api/cms/pages", pageId, "versions"],
    queryFn: async () => {
      if (!pageId) return [];
      const res = await fetch(`/api/cms/pages/${pageId}/versions`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!pageId && showVersions,
  });

  useEffect(() => {
    try {
      const rawSections = builderData?.builderDraft?.sections;
      if (Array.isArray(rawSections)) {
        setSections(rawSections.map(safeSection));
      } else if (builderData && !rawSections) {
        console.warn("[CMSBuilder] builderData exists but no sections found, initializing empty");
        setSections([]);
      }
    } catch (err) {
      console.error("[CMSBuilder] Error processing builder data:", err);
      setSections([]);
    }
  }, [builderData]);

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
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages", pageId, "versions"] });
      toast({ title: "Published successfully" });
    },
    onError: (err: Error) => toast({ title: "Error publishing", description: err.message, variant: "destructive" }),
  });

  const restoreMutation = useMutation({
    mutationFn: async (versionId: number) => {
      const res = await apiRequest("POST", `/api/cms/pages/${pageId}/versions/${versionId}/restore`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages", pageId, "builder"] });
      setShowVersions(false);
      toast({ title: "Version restored" });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateSections = useCallback((newSections: BuilderSection[]) => {
    setSections(newSections);
    setHasChanges(true);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newItems;
      });
    }
  }, []);

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
    const original = sections[idx];
    const clone: BuilderSection = {
      ...JSON.parse(JSON.stringify(original)),
      id: Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
      label: original.label + " (copy)",
    };
    const newSections = [...sections];
    newSections.splice(idx + 1, 0, clone);
    updateSections(newSections);
    setSelectedId(clone.id);
  }, [sections, updateSections]);

  const toggleVisibility = useCallback((id: string) => {
    updateSections(sections.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s)));
  }, [sections, updateSections]);

  const updateSection = useCallback((id: string, updates: Partial<BuilderSection>) => {
    updateSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, [sections, updateSections]);

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

  const getPreviewUrl = useCallback((slug: string) => {
    const SLUG_ROUTE_MAP: Record<string, string> = {
      home: "/",
      about: "/about",
      hotels: "/hotels",
      gallery: "/gallery",
      contact: "/contact",
      careers: "/careers",
      "company-profile": "/company-profile",
    };
    return SLUG_ROUTE_MAP[slug] || `/${slug}`;
  }, []);

  const uploadImageRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
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
    } finally {
      setUploadingImage(false);
    }
  }, []);

  const handleBgImageUpload = useCallback(async (sectionId: string, file: File) => {
    try {
      const url = await uploadImage(file);
      updateSectionStyles(sectionId, "backgroundImage", url);
      toast({ title: "تم رفع الصورة بنجاح" });
    } catch {
      toast({ title: "فشل رفع الصورة", variant: "destructive" });
    }
  }, [uploadImage, updateSectionStyles, toast]);

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedId),
    [sections, selectedId]
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">جاري تحميل المحرر...</p>
        </div>
      </div>
    );
  }

  if (pagesData && !pageId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
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
    <BuilderErrorBoundary onReset={() => setSections([])}>
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-brand-blue text-white flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => setLocation("/controlpanal/pages")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="h-6 w-px bg-white/20" />
          <span className="text-sm font-medium">{pageTitle}</span>
          {hasChanges && <span className="text-xs text-yellow-300 ml-2">● Unsaved</span>}
          <div className="h-6 w-px bg-white/20" />
          <div className="flex items-center bg-white/10 rounded-lg p-0.5">
            <button
              data-testid="button-preview-mode"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                viewMode === "preview" ? "bg-white text-brand-blue" : "text-white/70 hover:text-white"
              )}
              onClick={() => setViewMode("preview")}
            >
              <Monitor className="w-3.5 h-3.5" /> معاينة
            </button>
            <button
              data-testid="button-edit-mode"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                viewMode === "edit" ? "bg-white text-brand-blue" : "text-white/70 hover:text-white"
              )}
              onClick={() => setViewMode("edit")}
            >
              <Pencil className="w-3.5 h-3.5" /> تعديل
            </button>
          </div>
          {pageSlug && (
            <a
              href={getPreviewUrl(pageSlug)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-white/70 hover:text-white text-xs ml-1"
              title="Open page in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => setShowVersions(!showVersions)}
          >
            <History className="w-4 h-4 mr-1" /> Versions
          </Button>
          <Button
            data-testid="button-save-draft"
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => saveMutation.mutate(sections)}
            disabled={saveMutation.isPending || !hasChanges}
          >
            <Save className="w-4 h-4 mr-1" /> Save Draft
          </Button>
          <Button
            data-testid="button-publish"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              if (hasChanges) {
                saveMutation.mutate(sections, {
                  onSuccess: () => publishMutation.mutate(),
                });
              } else {
                publishMutation.mutate();
              }
            }}
            disabled={publishMutation.isPending}
          >
            <Upload className="w-4 h-4 mr-1" /> Publish
          </Button>
        </div>
      </div>

      {/* Version History Dropdown */}
      {showVersions && (
        <div className="absolute top-14 right-4 w-80 bg-white shadow-xl rounded-lg border z-50 max-h-80 overflow-auto">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold">Version History</h3>
            <button onClick={() => setShowVersions(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          {versions.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No versions yet. Publish to create one.</p>
          ) : (
            versions.map((v: any) => (
              <div key={v.id} className="px-3 py-2 border-b hover:bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Version {v.versionNumber}</p>
                  <p className="text-xs text-gray-400">{new Date(v.createdAt).toLocaleString()}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restoreMutation.mutate(v.id)}
                  disabled={restoreMutation.isPending}
                >
                  <Undo2 className="w-3 h-3 mr-1" /> Restore
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === "preview" ? (
          /* PREVIEW MODE: Full page iframe */
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 bg-gray-200 p-4">
              <div className="h-full max-w-[1400px] mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
                {pageSlug ? (
                  <iframe
                    src={getPreviewUrl(pageSlug)}
                    className="w-full h-full border-0"
                    title={`Preview: ${pageTitle}`}
                    key={pageSlug}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white border-t px-4 py-2 flex items-center justify-center gap-4 text-sm text-gray-500 shrink-0">
              <span>هذه معاينة مباشرة للصفحة كما يراها الزوار.</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewMode("edit")}
                className="text-xs"
              >
                <Pencil className="w-3.5 h-3.5 mr-1" /> التبديل لوضع التعديل
              </Button>
              <a
                href={getPreviewUrl(pageSlug)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-xs flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> فتح في تبويب جديد
              </a>
            </div>
          </div>
        ) : (
          /* EDIT MODE: 3-Pane Layout */
          <>
            {/* LEFT: Sections List */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">الأقسام</h3>
                <div className="relative">
                  <Button
                    data-testid="button-add-section"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddMenu(!showAddMenu)}
                  >
                    <Plus className="w-4 h-4 mr-1" /> إضافة
                  </Button>
                  {showAddMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-50 py-1">
                      {(Object.keys(SECTION_TYPE_LABELS) as SectionType[]).map((type) => (
                        <button
                          key={type}
                          data-testid={`add-section-${type}`}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => addSection(type)}
                        >
                          <span>{SECTION_TYPE_ICONS[type]}</span>
                          {SECTION_TYPE_LABELS[type]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2 space-y-1">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    {sections.map((section) => (
                      <SortableSectionItem
                        key={section.id}
                        section={section}
                        isSelected={selectedId === section.id}
                        onSelect={() => setSelectedId(section.id)}
                        onToggleVisibility={() => toggleVisibility(section.id)}
                        onDuplicate={() => duplicateSection(section.id)}
                        onDelete={() => deleteSection(section.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {sections.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    لا توجد أقسام بعد.<br />اضغط "إضافة" لبدء البناء.
                  </div>
                )}
              </div>
            </div>

            {/* CENTER: Canvas Preview */}
            <div className="flex-1 overflow-auto bg-gray-200 p-6">
              <div className="max-w-[1200px] mx-auto bg-white shadow-xl rounded-lg overflow-hidden min-h-[600px]">
                {/* Mini Navbar */}
                <div style={{ background: "linear-gradient(135deg, #0c1c2c 0%, #1a2d42 100%)", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,169,110,0.3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid #c9a96e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif", fontSize: "14px", fontWeight: 700 }}>P</span>
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", fontWeight: 700, letterSpacing: "2px", lineHeight: 1 }}>PROTELS</div>
                      <div style={{ color: "rgba(201,169,110,0.7)", fontSize: "6px", letterSpacing: "1.5px", fontFamily: "Montserrat, sans-serif" }}>HOTELS & RESORTS</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    {["HOME", "HOTELS", "ABOUT US", "CAREERS", "CONTACT"].map(item => (
                      <span key={item} style={{ color: "rgba(255,255,255,0.7)", fontSize: "9px", fontFamily: "Montserrat, sans-serif", letterSpacing: "0.5px", fontWeight: 500 }}>{item}</span>
                    ))}
                    <span style={{ background: "transparent", border: "1px solid #c9a96e", color: "#c9a96e", padding: "4px 12px", borderRadius: "2px", fontSize: "8px", fontFamily: "Montserrat, sans-serif", letterSpacing: "0.5px", fontWeight: 600 }}>BOOK NOW</span>
                  </div>
                </div>

                {sections.length === 0 ? (
                  <div className="flex items-center justify-center h-[500px] text-gray-400">
                    <div className="text-center">
                      <p className="text-lg mb-2">صفحة فارغة</p>
                      <p className="text-sm">أضف أقسام من اللوحة اليسرى لبدء البناء</p>
                    </div>
                  </div>
                ) : (
                  sections.map((section) => (
                    <div
                      key={section.id}
                      data-testid={`canvas-section-${section.id}`}
                      className={cn(
                        "relative group transition-all cursor-pointer",
                        section.hidden && "opacity-30",
                        selectedId === section.id && "ring-2 ring-blue-500 ring-inset"
                      )}
                      onClick={() => setSelectedId(section.id)}
                    >
                      {/* Section label badge */}
                      <div className={cn(
                        "absolute top-2 left-2 text-white text-xs px-2 py-1 rounded z-20 font-medium shadow-sm transition-opacity",
                        selectedId === section.id ? "bg-blue-500 opacity-100" : "bg-gray-600 opacity-0 group-hover:opacity-100"
                      )}>
                        {section.label}
                      </div>

                      {/* Floating toolbar */}
                      <div className={cn(
                        "absolute top-2 right-2 z-20 flex items-center gap-1 bg-white/95 backdrop-blur shadow-lg rounded-lg px-1 py-0.5 transition-opacity border border-gray-200",
                        selectedId === section.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        <label className="p-1.5 hover:bg-blue-50 rounded cursor-pointer transition-colors" title="Upload Background">
                          <ImagePlus className="w-3.5 h-3.5 text-blue-600" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) await handleBgImageUpload(section.id, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {section.styles.backgroundImage && (
                          <button
                            className="p-1.5 hover:bg-red-50 rounded transition-colors"
                            title="Remove Background"
                            onClick={(e) => { e.stopPropagation(); updateSectionStyles(section.id, "backgroundImage", ""); }}
                          >
                            <ImageMinus className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        )}
                        <div className="w-px h-5 bg-gray-200" />
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Move Up"
                          onClick={(e) => {
                            e.stopPropagation();
                            const idx = sections.findIndex(s => s.id === section.id);
                            if (idx > 0) updateSections(arrayMove([...sections], idx, idx - 1));
                          }}
                        >
                          <MoveUp className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Move Down"
                          onClick={(e) => {
                            e.stopPropagation();
                            const idx = sections.findIndex(s => s.id === section.id);
                            if (idx < sections.length - 1) updateSections(arrayMove([...sections], idx, idx + 1));
                          }}
                        >
                          <MoveDown className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <div className="w-px h-5 bg-gray-200" />
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title={section.hidden ? "Show" : "Hide"}
                          onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id); }}
                        >
                          {section.hidden ? <EyeOff className="w-3.5 h-3.5 text-gray-500" /> : <Eye className="w-3.5 h-3.5 text-gray-500" />}
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Duplicate"
                          onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                          onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>

                      <SectionRenderer
                        section={section}
                        isEditing={selectedId === section.id}
                        onContentChange={(key, value) => updateSectionContent(section.id, key, value)}
                      />
                    </div>
                  ))
                )}

                {/* Mini Footer */}
                <div style={{ background: "#0c1c2c", padding: "32px 40px 20px", borderTop: "2px solid #c9a96e" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "24px" }}>
                    <div>
                      <div style={{ color: "#fff", fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 700, letterSpacing: "3px", marginBottom: "8px" }}>PROTELS</div>
                      <div style={{ color: "rgba(201,169,110,0.6)", fontSize: "7px", letterSpacing: "2px", fontFamily: "Montserrat, sans-serif", marginBottom: "12px" }}>HOTELS & RESORTS</div>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", maxWidth: "250px", lineHeight: 1.6, fontFamily: "Montserrat, sans-serif" }}>
                        Experience the pinnacle of coastal luxury across our exclusive portfolio of premium beach resorts.
                      </p>
                    </div>
                    <div>
                      <div style={{ color: "#c9a96e", fontSize: "10px", fontWeight: 600, marginBottom: "10px", letterSpacing: "1px", fontFamily: "Montserrat, sans-serif" }}>OUR RESORTS</div>
                      {["Crystal Beach Resort", "Beach Club & SPA", "La Plage Zanzibar", "Royal Bay Resort"].map(h => (
                        <div key={h} style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", marginBottom: "5px", fontFamily: "Montserrat, sans-serif" }}>{h}</div>
                      ))}
                    </div>
                    <div>
                      <div style={{ color: "#c9a96e", fontSize: "10px", fontWeight: 600, marginBottom: "10px", letterSpacing: "1px", fontFamily: "Montserrat, sans-serif" }}>CONTACT</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", marginBottom: "5px", fontFamily: "Montserrat, sans-serif" }}>info@protels.com</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", marginBottom: "5px", fontFamily: "Montserrat, sans-serif" }}>+20 123 456 7890</div>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px", textAlign: "center" }}>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "8px", fontFamily: "Montserrat, sans-serif" }}>
                      &copy; 2026 PROTELS Hotels & Resorts. All Rights Reserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* RIGHT: Settings Panel (only in edit mode) */}
        {viewMode === "edit" && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
          {selectedSection ? (
            <div className="flex-1 overflow-auto">
              {/* Section Header */}
              <div className="p-3 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-gray-800">إعدادات القسم</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{SECTION_TYPE_LABELS[selectedSection.type]}</span>
                </div>
                <Input
                  data-testid="input-section-label"
                  value={selectedSection.label}
                  onChange={(e) => updateSection(selectedSection.id, { label: e.target.value })}
                  className="h-8 text-sm mt-2"
                  placeholder="Section label"
                />
              </div>

              {/* Content Fields */}
              <details open className="border-b">
                <summary className="px-3 py-2.5 text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-50 select-none flex items-center gap-1">
                  <ChevronDown className="w-3 h-3" /> المحتوى
                </summary>
                <div className="px-3 pb-3 space-y-3">
                  {Object.entries(selectedSection.content).map(([key, value]: [string, any]) => {
                    if (Array.isArray(value)) return null;
                    if (typeof value === "boolean") {
                      return (
                        <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateSectionContent(selectedSection.id, key, e.target.checked)}
                            className="rounded"
                          />
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (s: string) => s.toUpperCase())}
                        </label>
                      );
                    }
                    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s: string) => s.toUpperCase());
                    const isLong = typeof value === "string" && (key === "body" || key === "text" || value.length > 60);
                    return (
                      <div key={key}>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
                        {isLong ? (
                          <textarea
                            data-testid={`input-content-${key}`}
                            value={value as string}
                            onChange={(e) => updateSectionContent(selectedSection.id, key, e.target.value)}
                            className="w-full border rounded-md px-2.5 py-1.5 text-sm min-h-[80px] resize-y focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                          />
                        ) : (
                          <Input
                            data-testid={`input-content-${key}`}
                            value={value as string}
                            onChange={(e) => updateSectionContent(selectedSection.id, key, e.target.value)}
                            className="h-8 text-sm"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </details>

              {/* Background Controls */}
              <details open className="border-b">
                <summary className="px-3 py-2.5 text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-50 select-none flex items-center gap-1">
                  <ChevronDown className="w-3 h-3" /> الخلفية
                </summary>
                <div className="px-3 pb-3 space-y-3">
                  {/* Background Image */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">صورة الخلفية</label>
                    {selectedSection.styles.backgroundImage ? (
                      <div className="space-y-2">
                        <div className="relative rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={selectedSection.styles.backgroundImage}
                            alt="Background"
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                            <label className="bg-white/90 text-gray-700 text-xs px-3 py-1.5 rounded-md cursor-pointer hover:bg-white font-medium shadow-sm">
                              استبدال
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) await handleBgImageUpload(selectedSection.id, file);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            <button
                              className="bg-red-500/90 text-white text-xs px-3 py-1.5 rounded-md hover:bg-red-600 font-medium shadow-sm"
                              onClick={() => updateSectionStyles(selectedSection.id, "backgroundImage", "")}
                            >
                              إزالة
                            </button>
                          </div>
                        </div>
                        <Input
                          value={selectedSection.styles.backgroundImage}
                          onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundImage", e.target.value)}
                          className="h-7 text-xs"
                          placeholder="Image URL"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                          <ImagePlus className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">رفع صورة خلفية</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) await handleBgImageUpload(selectedSection.id, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <Input
                          value={selectedSection.styles.backgroundImage || ""}
                          onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundImage", e.target.value)}
                          className="h-7 text-xs"
                          placeholder="أو الصق رابط الصورة..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Background Size & Position (only when image exists) */}
                  {selectedSection.styles.backgroundImage && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">الحجم</label>
                        <select
                          value={selectedSection.styles.backgroundSize || "cover"}
                          onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundSize", e.target.value)}
                          className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                        >
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                          <option value="auto">Auto</option>
                          <option value="100% 100%">Stretch</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">الموضع</label>
                        <select
                          value={selectedSection.styles.backgroundPosition || "center"}
                          onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundPosition", e.target.value)}
                          className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                        >
                          <option value="center">Center</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                          <option value="top left">Top Left</option>
                          <option value="top right">Top Right</option>
                          <option value="bottom left">Bottom Left</option>
                          <option value="bottom right">Bottom Right</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Background Color */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">لون الخلفية</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedSection.styles.backgroundColor || "#ffffff"}
                        onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundColor", e.target.value)}
                        className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                      />
                      <Input
                        value={selectedSection.styles.backgroundColor || "#ffffff"}
                        onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundColor", e.target.value)}
                        className="h-8 text-sm flex-1 font-mono"
                      />
                    </div>
                  </div>

                  {/* Overlay Controls */}
                  <div className="bg-gray-50 rounded-lg p-2.5 space-y-2">
                    <label className="text-xs font-bold text-gray-600 block">طبقة التعتيم (Overlay)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedSection.styles.overlayColor || "#000000"}
                        onChange={(e) => updateSectionStyles(selectedSection.id, "overlayColor", e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
                      />
                      <Input
                        value={selectedSection.styles.overlayColor || "#000000"}
                        onChange={(e) => updateSectionStyles(selectedSection.id, "overlayColor", e.target.value)}
                        className="h-7 text-xs flex-1 font-mono"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">الشفافية</span>
                        <span className="text-xs font-bold text-gray-700">{Math.round((selectedSection.styles.backgroundOverlay || 0) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={selectedSection.styles.backgroundOverlay || 0}
                        onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundOverlay", parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>

                  {/* Gradient */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">تدرج لوني</label>
                    <Input
                      value={selectedSection.styles.backgroundGradient || ""}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundGradient", e.target.value)}
                      className="h-8 text-xs font-mono"
                      placeholder="linear-gradient(135deg, #0c1c2c, #1a3a5c)"
                    />
                    {selectedSection.styles.backgroundGradient && (
                      <div className="mt-1.5 h-6 rounded border" style={{ background: selectedSection.styles.backgroundGradient }} />
                    )}
                  </div>
                </div>
              </details>

              {/* Dimensions */}
              <details className="border-b">
                <summary className="px-3 py-2.5 text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-50 select-none flex items-center gap-1">
                  <ChevronDown className="w-3 h-3" /> الأبعاد
                </summary>
                <div className="px-3 pb-3 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">الحد الأدنى للارتفاع</label>
                    <div className="flex gap-1">
                      {["auto", "300px", "400px", "500px", "600px", "100vh"].map(v => (
                        <button
                          key={v}
                          onClick={() => updateSectionStyles(selectedSection.id, "minHeight", v === "auto" ? "" : v)}
                          className={cn(
                            "flex-1 text-xs py-1.5 rounded border transition-colors",
                            (selectedSection.styles.minHeight || "") === (v === "auto" ? "" : v)
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {v === "100vh" ? "Full" : v === "auto" ? "Auto" : v.replace("px", "")}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={selectedSection.styles.minHeight || ""}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "minHeight", e.target.value)}
                      className="h-7 text-xs mt-1.5"
                      placeholder="Custom: e.g. 450px"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">الحد الأقصى للعرض</label>
                    <Input
                      value={selectedSection.styles.maxWidth || ""}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "maxWidth", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="1200px"
                    />
                  </div>
                </div>
              </details>

              {/* Spacing */}
              <details className="border-b">
                <summary className="px-3 py-2.5 text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-50 select-none flex items-center gap-1">
                  <ChevronDown className="w-3 h-3" /> المسافات
                </summary>
                <div className="px-3 pb-3 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Padding</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"] as const).map(prop => (
                        <div key={prop}>
                          <label className="text-[10px] text-gray-500 mb-0.5 block">{prop.replace("padding", "").toLowerCase()}</label>
                          <Input
                            value={(selectedSection.styles as any)[prop] || ""}
                            onChange={(e) => updateSectionStyles(selectedSection.id, prop, e.target.value)}
                            className="h-7 text-xs"
                            placeholder="60px"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Margin</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["marginTop", "marginBottom"] as const).map(prop => (
                        <div key={prop}>
                          <label className="text-[10px] text-gray-500 mb-0.5 block">{prop.replace("margin", "").toLowerCase()}</label>
                          <Input
                            value={(selectedSection.styles as any)[prop] || ""}
                            onChange={(e) => updateSectionStyles(selectedSection.id, prop, e.target.value)}
                            className="h-7 text-xs"
                            placeholder="0px"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </details>

              {/* Layout */}
              <details className="border-b">
                <summary className="px-3 py-2.5 text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-50 select-none flex items-center gap-1">
                  <ChevronDown className="w-3 h-3" /> التخطيط
                </summary>
                <div className="px-3 pb-3 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">محاذاة النص</label>
                    <div className="flex gap-1">
                      {[
                        { value: "left", label: "يسار" },
                        { value: "center", label: "وسط" },
                        { value: "right", label: "يمين" },
                      ].map(a => (
                        <button
                          key={a.value}
                          onClick={() => updateSectionStyles(selectedSection.id, "textAlign", a.value)}
                          className={cn(
                            "flex-1 text-xs py-1.5 rounded border transition-colors",
                            selectedSection.styles.textAlign === a.value
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">حواف مستديرة</label>
                    <Input
                      value={selectedSection.styles.borderRadius || ""}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "borderRadius", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="0px"
                    />
                  </div>
                </div>
              </details>

              {/* Quick Actions */}
              <div className="p-3 space-y-2">
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">إجراءات سريعة</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => duplicateSection(selectedSection.id)}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" /> نسخ
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => toggleVisibility(selectedSection.id)}
                  >
                    {selectedSection.hidden ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                    {selectedSection.hidden ? "إظهار" : "إخفاء"}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 w-full text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                  onClick={() => deleteSection(selectedSection.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> حذف القسم
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-6">
              <div>
                <Layers className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>اختر قسم لتعديل إعداداته</p>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
    </BuilderErrorBoundary>
  );
}
