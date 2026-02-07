import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Upload, Trash2, Copy, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function CMSMedia() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [altText, setAltText] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const { data: mediaItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cms/media"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", altText || file.name);
      const res = await fetch("/api/cms/media", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Upload failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/dashboard"] });
      setAltText("");
      toast({ title: "File uploaded successfully" });
    },
    onError: (err: Error) => toast({ title: "Upload failed", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cms/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/dashboard"] });
      setDeleteId(null);
      toast({ title: "File deleted successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => uploadMutation.mutate(file));
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL copied to clipboard" });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <CMSLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">Media Library</h2>
          <p className="text-gray-500">Manage uploaded files and images</p>
        </div>
      </div>

      <div
        data-testid="dropzone-media"
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-8 transition-colors ${
          dragActive
            ? "border-brand-blue bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
        <div className="flex items-center justify-center gap-4">
          <Input
            data-testid="input-media-alt"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Alt text (optional)"
            className="max-w-xs"
          />
          <Button
            data-testid="button-upload-media"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Browse Files"}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg aspect-square" />
          ))}
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Image className="w-12 h-12 mx-auto mb-4" />
          <p>No media files yet. Upload your first file above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((item: any) => (
            <div
              key={item.id}
              data-testid={`card-media-${item.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group"
            >
              <div className="aspect-square bg-gray-100 relative">
                {item.mimeType?.startsWith("image/") ? (
                  <img
                    src={item.url}
                    alt={item.alt || item.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    data-testid={`button-copy-url-${item.id}`}
                    size="sm"
                    variant="secondary"
                    onClick={() => copyUrl(item.url)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    data-testid={`button-delete-media-${item.id}`}
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate" title={item.originalName}>
                  {item.originalName}
                </p>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{formatSize(item.size)}</span>
                  <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete-media"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}
