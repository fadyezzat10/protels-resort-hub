import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";

interface EditModeContextType {
  isAdmin: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  pageContent: Record<string, string>;
  pendingChanges: Record<string, string>;
  updateContent: (key: string, value: string) => void;
  saveChanges: () => void;
  isSaving: boolean;
  hasPendingChanges: boolean;
  selectedKey: string | null;
  setSelectedKey: (key: string | null) => void;
  uploadImage: (file: File) => Promise<string>;
  language: string;
}

const EditModeContext = createContext<EditModeContextType>({
  isAdmin: false,
  isEditMode: false,
  toggleEditMode: () => {},
  pageContent: {},
  pendingChanges: {},
  updateContent: () => {},
  saveChanges: () => {},
  isSaving: false,
  hasPendingChanges: false,
  selectedKey: null,
  setSelectedKey: () => {},
  uploadImage: async () => "",
  language: "en",
});

export function useEditMode() {
  return useContext(EditModeContext);
}

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { language } = useI18n();
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const basePath = location === "/" ? "/" : location.replace(/\/$/, "");
  const pagePath = `${basePath}__${language}`;

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
    staleTime: 60000,
  });

  const isAdmin = !!user;

  const { data: pageContent = {} } = useQuery({
    queryKey: ["/api/public/page-content", pagePath],
    queryFn: async () => {
      const res = await fetch(`/api/public/page-content/${encodeURIComponent(pagePath)}`);
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 10000,
  });

  useEffect(() => {
    setPendingChanges({});
    setSelectedKey(null);
  }, [pagePath]);

  useEffect(() => {
    if (!isEditMode) {
      setSelectedKey(null);
    }
  }, [isEditMode]);

  const saveMutation = useMutation({
    mutationFn: async (items: Array<{ pagePath: string; contentKey: string; contentType: string; value: string }>) => {
      await apiRequest("PUT", "/api/cms/page-contents/batch", { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public/page-content", pagePath] });
      setPendingChanges({});
    },
  });

  const updateContent = useCallback((key: string, value: string) => {
    setPendingChanges(prev => ({ ...prev, [key]: value }));
  }, []);

  const saveChanges = useCallback(() => {
    const items = Object.entries(pendingChanges).map(([contentKey, value]) => ({
      pagePath,
      contentKey,
      contentType: contentKey.startsWith("style:") ? "style" : contentKey.startsWith("img:") ? "image" : "text",
      value,
    }));
    if (items.length > 0) {
      saveMutation.mutate(items);
    }
  }, [pendingChanges, pagePath, saveMutation]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/cms/media", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  const isAdminPage = basePath.startsWith("/controlpanal") || basePath.startsWith("/admin");
  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <EditModeContext.Provider
      value={{
        isAdmin,
        isEditMode,
        toggleEditMode,
        pageContent: { ...pageContent, ...pendingChanges },
        pendingChanges,
        updateContent,
        saveChanges,
        isSaving: saveMutation.isPending,
        hasPendingChanges,
        selectedKey,
        setSelectedKey,
        uploadImage,
        language,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}
