import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [hasChanges, setHasChanges] = useState(false);

  const { data: pagesData } = useQuery<any[]>({
    queryKey: ["/api/cms/pages"],
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

  const { data: builderData, isLoading } = useQuery({
    queryKey: ["/api/cms/pages", pageId, "builder"],
    queryFn: async () => {
      if (!pageId) return null;
      const res = await fetch(`/api/cms/pages/${pageId}/builder`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load builder");
      return res.json();
    },
    enabled: !!pageId,
  });

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
    if (builderData?.builderDraft?.sections) {
      setSections(builderData.builderDraft.sections);
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

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedId),
    [sections, selectedId]
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
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

      {/* Main 3-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Sections List */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Sections</h3>
            <div className="relative">
              <Button
                data-testid="button-add-section"
                size="sm"
                variant="outline"
                onClick={() => setShowAddMenu(!showAddMenu)}
              >
                <Plus className="w-4 h-4 mr-1" /> Add
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
                No sections yet.<br />Click "Add" to start building.
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Canvas Preview */}
        <div className="flex-1 overflow-auto bg-gray-200 p-6">
          <div className="max-w-[1200px] mx-auto bg-white shadow-lg rounded-lg overflow-hidden min-h-[600px]">
            {sections.length === 0 ? (
              <div className="flex items-center justify-center h-[600px] text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">Empty Page</p>
                  <p className="text-sm">Add sections from the left panel to start building</p>
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
                  {selectedId === section.id && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
                      {section.label}
                    </div>
                  )}
                  <SectionRenderer
                    section={section}
                    isEditing={selectedId === section.id}
                    onContentChange={(key, value) => updateSectionContent(section.id, key, value)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Settings Panel */}
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
          {selectedSection ? (
            <div className="flex-1 overflow-auto">
              <div className="p-3 border-b">
                <h3 className="text-sm font-semibold text-gray-700">Section Settings</h3>
                <p className="text-xs text-gray-400">{SECTION_TYPE_LABELS[selectedSection.type]}</p>
              </div>

              {/* Label */}
              <div className="p-3 border-b">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Section Label</label>
                <Input
                  data-testid="input-section-label"
                  value={selectedSection.label}
                  onChange={(e) => updateSection(selectedSection.id, { label: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>

              {/* Content Fields */}
              <div className="p-3 border-b space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Content</h4>
                {Object.entries(selectedSection.content).map(([key, value]) => {
                  if (Array.isArray(value)) return null;
                  if (typeof value === "boolean") {
                    return (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateSectionContent(selectedSection.id, key, e.target.checked)}
                        />
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                      </label>
                    );
                  }
                  const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                  const isLong = typeof value === "string" && (key === "body" || key === "text" || value.length > 60);
                  return (
                    <div key={key}>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
                      {isLong ? (
                        <textarea
                          data-testid={`input-content-${key}`}
                          value={value as string}
                          onChange={(e) => updateSectionContent(selectedSection.id, key, e.target.value)}
                          className="w-full border rounded px-2 py-1.5 text-sm min-h-[80px] resize-y"
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

              {/* Style Fields */}
              <div className="p-3 border-b space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Background</h4>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedSection.styles.backgroundColor || "#ffffff"}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundColor", e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={selectedSection.styles.backgroundColor || "#ffffff"}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundColor", e.target.value)}
                      className="h-8 text-sm flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Background Image URL</label>
                  <Input
                    value={selectedSection.styles.backgroundImage || ""}
                    onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundImage", e.target.value)}
                    className="h-8 text-sm"
                    placeholder="https://..."
                  />
                </div>
                {selectedSection.styles.backgroundImage && (
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Overlay Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedSection.styles.backgroundOverlay || 0}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundOverlay", parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{(selectedSection.styles.backgroundOverlay || 0) * 100}%</span>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Gradient</label>
                  <Input
                    value={selectedSection.styles.backgroundGradient || ""}
                    onChange={(e) => updateSectionStyles(selectedSection.id, "backgroundGradient", e.target.value)}
                    className="h-8 text-sm"
                    placeholder="linear-gradient(to right, #000, #333)"
                  />
                </div>
              </div>

              <div className="p-3 border-b space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Spacing</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Padding Top</label>
                    <Input
                      value={selectedSection.styles.paddingTop || ""}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "paddingTop", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="60px"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Padding Bottom</label>
                    <Input
                      value={selectedSection.styles.paddingBottom || ""}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "paddingBottom", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="60px"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Padding Left</label>
                    <Input
                      value={selectedSection.styles.paddingLeft || ""}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "paddingLeft", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="16px"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Padding Right</label>
                    <Input
                      value={selectedSection.styles.paddingRight || ""}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "paddingRight", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="16px"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Margin Top</label>
                    <Input
                      value={selectedSection.styles.marginTop || ""}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "marginTop", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Margin Bottom</label>
                    <Input
                      value={selectedSection.styles.marginBottom || ""}
                      onChange={(e) => updateSectionStyles(selectedSection.id, "marginBottom", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Max Width</label>
                  <Input
                    value={selectedSection.styles.maxWidth || ""}
                    onChange={(e) => updateSectionStyles(selectedSection.id, "maxWidth", e.target.value)}
                    className="h-8 text-sm"
                    placeholder="1200px"
                  />
                </div>
              </div>

              <div className="p-3 space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Layout</h4>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Text Alignment</label>
                  <select
                    value={selectedSection.styles.textAlign || "left"}
                    onChange={(e) => updateSectionStyles(selectedSection.id, "textAlign", e.target.value)}
                    className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                  >
                    {TEXT_ALIGNMENTS.map((a) => (
                      <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Border Radius</label>
                  <Input
                    value={selectedSection.styles.borderRadius || ""}
                    onChange={(e) => updateSectionStyles(selectedSection.id, "borderRadius", e.target.value)}
                    className="h-8 text-sm"
                    placeholder="0px"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-6">
              Select a section to edit its settings
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
