import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const [showPanel, setShowPanel] = useState(false);

  if (!isAdmin) return null;

  const handleSave = async () => {
    saveChanges();
    toast({ title: "Saved!", description: "Changes published successfully." });
  };

  const changedKeys = Object.keys(pendingChanges);

  return (
    <>
      {!isEditMode ? (
        <button
          onClick={toggleEditMode}
          className="fixed bottom-6 right-6 z-[9999] bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl transition-all hover:scale-110"
          title="Enable Edit Mode"
          data-testid="button-toggle-edit-mode"
        >
          <Pencil className="w-6 h-6" />
        </button>
      ) : (
        <>
          <div className="fixed top-0 left-0 right-0 z-[9998] bg-blue-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Pencil className="w-4 h-4" />
              <span className="font-medium text-sm">Edit Mode</span>
              {hasPendingChanges && (
                <span className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-medium">
                  {changedKeys.length} unsaved {changedKeys.length === 1 ? "change" : "changes"}
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
              {hasPendingChanges && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleSave}
                  disabled={isSaving}
                  data-testid="button-save-changes"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  Save
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={toggleEditMode}
                data-testid="button-exit-edit-mode"
              >
                <X className="w-4 h-4 mr-1" />
                Exit
              </Button>
            </div>
          </div>

          <div className="h-10" />

          {showPanel && (
            <div className="fixed top-10 right-0 bottom-0 w-80 bg-white shadow-2xl z-[9997] border-l border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-sm text-gray-900">Content Panel</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedKey ? `Editing: ${selectedKey}` : "Click any text or image on the page to edit"}
                </p>
              </div>

              {selectedKey && (
                <div className="p-4 border-b border-gray-200">
                  <label className="text-xs font-medium text-gray-600 mb-2 block">
                    Selected Element
                  </label>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-800 font-mono break-all">{selectedKey}</p>
                  </div>
                  {selectedKey.startsWith("img:") ? (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500">Click the image on the page to replace it</p>
                      {pageContent[selectedKey] && (
                        <img
                          src={pageContent[selectedKey]}
                          alt="Preview"
                          className="mt-2 w-full h-32 object-cover rounded border"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="mt-3">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Value</label>
                      <textarea
                        className="w-full border rounded-lg p-2 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={pageContent[selectedKey] ?? ""}
                        onChange={(e) => updateContent(selectedKey, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {changedKeys.length > 0 && (
                <div className="p-4">
                  <label className="text-xs font-medium text-gray-600 mb-2 block">
                    Pending Changes ({changedKeys.length})
                  </label>
                  <div className="space-y-2">
                    {changedKeys.map((key) => (
                      <div key={key} className="bg-yellow-50 rounded p-2 text-xs">
                        <p className="font-mono text-yellow-800 break-all">{key}</p>
                        <p className="text-gray-600 mt-1 truncate">{pendingChanges[key]}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-3"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-1" />
                    )}
                    Save All Changes
                  </Button>
                </div>
              )}

              {changedKeys.length === 0 && !selectedKey && (
                <div className="p-8 text-center text-gray-400">
                  <Eye className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Click on any text or image on the page to start editing</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
