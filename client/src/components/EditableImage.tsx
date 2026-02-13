import { useRef, useCallback, useState } from "react";
import { useEditMode } from "@/lib/editMode";
import { cn } from "@/lib/utils";
import { Camera, Loader2 } from "lucide-react";

interface EditableImageProps {
  contentKey: string;
  defaultSrc?: string;
  src?: string;
  alt?: string;
  className?: string;
  [key: string]: any;
}

export default function EditableImage({
  contentKey,
  defaultSrc,
  src,
  alt = "",
  className,
  ...rest
}: EditableImageProps) {
  const { isEditMode, pageContent, updateContent, selectedKey, setSelectedKey, uploadImage } = useEditMode();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const imgKey = contentKey.startsWith("img:") ? contentKey : `img:${contentKey}`;
  const fallbackSrc = defaultSrc || src || "";
  const currentSrc = pageContent[imgKey] ?? fallbackSrc;

  const styleKey = `style:${imgKey}`;
  let savedStyle: Record<string, string> = {};
  try { if (pageContent[styleKey]) savedStyle = JSON.parse(pageContent[styleKey]); } catch { }

  const sizeStyle: React.CSSProperties = {};
  if (savedStyle.width) sizeStyle.width = savedStyle.width;
  if (savedStyle.height) sizeStyle.height = savedStyle.height;
  if (savedStyle.maxWidth) sizeStyle.maxWidth = savedStyle.maxWidth;
  if (savedStyle.objectFit) sizeStyle.objectFit = savedStyle.objectFit as any;
  if (savedStyle.borderRadius) sizeStyle.borderRadius = savedStyle.borderRadius;

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedKey(imgKey);
    }
  }, [isEditMode, imgKey, setSelectedKey]);

  const handleUploadClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      updateContent(imgKey, url);
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [imgKey, updateContent, uploadImage]);

  const isSelected = selectedKey === imgKey;

  if (!isEditMode) {
    return <img src={currentSrc} alt={alt} className={className} style={sizeStyle} {...rest} />;
  }

  return (
    <div
      className="relative group cursor-pointer"
      onClick={handleClick}
      data-edit-key={imgKey}
      style={{ position: "relative" }}
    >
      <img src={currentSrc} alt={alt} className={className} style={sizeStyle} {...rest} />
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        style={{ backgroundColor: "rgba(59, 130, 246, 0.2)", zIndex: 50, pointerEvents: "none" }}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 bg-black/60 px-6 py-4 rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span className="text-sm font-medium text-white">جاري الرفع...</span>
          </div>
        ) : (
          <button
            onClick={handleUploadClick}
            className="flex flex-col items-center gap-2 bg-black/60 hover:bg-black/80 px-6 py-4 rounded-lg cursor-pointer transition-colors"
            style={{ pointerEvents: "auto" }}
          >
            <Camera className="w-10 h-10 text-white" />
            <span className="text-sm font-bold text-white">تغيير الصورة</span>
          </button>
        )}
      </div>
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none" style={{ outline: "3px solid #3b82f6", outlineOffset: "-3px", zIndex: 51 }} />
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
