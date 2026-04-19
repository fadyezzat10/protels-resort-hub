import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CMSLayout from "./CMSLayout";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlotConfig {
  key: string;
  label: string;
  description: string;
  width: number;
  height: number;
  currentImage?: string;
}

interface UploadState {
  status: "idle" | "uploading" | "success" | "error";
  message?: string;
  preview?: string;
}

function HeroSlotCard({ slot, onUploaded }: { slot: SlotConfig; onUploaded: (url: string, key: string) => void }) {
  const [drag, setDrag] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentImg = uploadState.preview || slot.currentImage;

  const upload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setUploadState({ status: "error", message: "File size exceeds 2MB. Please compress your image." });
      return;
    }
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadState({ status: "error", message: "Only JPG, PNG, and WebP files are accepted." });
      return;
    }

    setUploadState({ status: "uploading" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slot", slot.key);

    try {
      const res = await fetch("/api/cms/hero-upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setUploadState({
        status: "success",
        message: `Uploaded & optimized to WebP (${Math.round(data.size / 1024)}KB)`,
        preview: data.url,
      });
      onUploaded(data.url, slot.key);
    } catch (e: any) {
      setUploadState({ status: "error", message: e.message });
    }
  };

  const handleFile = (file: File | undefined) => {
    if (file) upload(file);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{slot.label}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{slot.description}</p>
        </div>
        <div className="flex-shrink-0 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 text-center">
          <div className="text-xs font-bold text-blue-700">{slot.width} × {slot.height}</div>
          <div className="text-[10px] text-blue-500">px recommended</div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="relative aspect-[16/6] rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200">
          {currentImg ? (
            <img src={currentImg} alt={slot.label} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ImageIcon className="w-10 h-10 mb-2" />
              <span className="text-sm">No image set</span>
            </div>
          )}
          {uploadState.status === "uploading" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-sm">Uploading & optimizing…</span>
              </div>
            </div>
          )}
        </div>

        <div
          data-testid={`drop-zone-${slot.key}`}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
            drag ? "border-brand-gold bg-brand-gold/5" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">Drop image here or <span className="text-brand-gold underline">browse</span></p>
          <p className="text-xs text-gray-400 mt-1">WebP preferred · JPG / PNG accepted · Max 2MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            data-testid={`input-file-${slot.key}`}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {uploadState.status === "success" && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Upload successful!</p>
              <p className="text-xs text-green-600">{uploadState.message}</p>
            </div>
          </div>
        )}

        {uploadState.status === "error" && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{uploadState.message}</p>
          </div>
        )}

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3">
          <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Images are automatically resized to <strong>{slot.width}×{slot.height}px</strong> and converted to WebP for best performance.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CMSHeroImages() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/cms/settings"],
    queryFn: async () => {
      const res = await fetch("/api/cms/settings", { credentials: "include" });
      if (!res.ok) return {};
      const arr = await res.json();
      const obj: any = {};
      arr.forEach((s: any) => { obj[s.key] = s.value; });
      return obj;
    },
  });

  const { data: hotels = [] } = useQuery<any[]>({
    queryKey: ["/api/cms/hotels"],
    queryFn: async () => {
      const res = await fetch("/api/cms/hotels", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const homepageImages: string[] = settings?.hero_images || [];

  const homepageSlot: SlotConfig = {
    key: "homepage",
    label: "Homepage Hero / Banner",
    description: "Main slideshow shown at the top of the homepage",
    width: 1920,
    height: 1080,
    currentImage: homepageImages[0],
  };

  const hotelSlots: SlotConfig[] = hotels.map((h: any) => ({
    key: `hotel-${h.slug}`,
    label: `${h.name} — Hero Image`,
    description: `Card & hero banner shown on Hotels page and ${h.name} detail page`,
    width: 1920,
    height: 600,
    currentImage: h.image,
  }));

  const handleUploaded = (_url: string, _key: string) => {
    queryClient.invalidateQueries({ queryKey: ["/api/cms/settings"] });
    queryClient.invalidateQueries({ queryKey: ["/api/cms/hotels"] });
    queryClient.invalidateQueries({ queryKey: ["/api/public/hotels"] });
  };

  return (
    <CMSLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-serif text-brand-blue font-bold">Hero Images</h1>
          <p className="text-gray-500 mt-1 text-sm">Upload and manage hero banner images for each section of the website.</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 space-y-1">
            <p className="font-semibold">Image Requirements</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-600">
              <li>Format: WebP (preferred) · JPG · PNG accepted</li>
              <li>Max file size: 2MB per upload</li>
              <li>Images are auto-compressed &amp; converted to WebP after upload</li>
              <li>Each section shows its recommended dimensions</li>
            </ul>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Homepage</h2>
          <HeroSlotCard slot={homepageSlot} onUploaded={handleUploaded} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Hotel Pages</h2>
          <div className="grid grid-cols-1 gap-6">
            {hotelSlots.map((slot) => (
              <HeroSlotCard key={slot.key} slot={slot} onUploaded={handleUploaded} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Room Pages</h2>
          <HeroSlotCard
            slot={{ key: "room", label: "Room Page Hero", description: "Banner shown at the top of room detail pages", width: 1200, height: 800 }}
            onUploaded={handleUploaded}
          />
        </section>
      </div>
    </CMSLayout>
  );
}
