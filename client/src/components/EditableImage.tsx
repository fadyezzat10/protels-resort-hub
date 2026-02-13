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

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedKey(imgKey);
      fileRef.current?.click();
    }
  }, [isEditMode, imgKey, setSelectedKey]);

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
    return <img src={currentSrc} alt={alt} className={className} {...rest} />;
  }

  return (
    <div
      className="relative group cursor-pointer"
      onClick={handleClick}
      data-edit-key={imgKey}
      style={{ position: "relative" }}
    >
      <img src={currentSrc} alt={alt} className={className} {...rest} />
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        style={{ backgroundColor: "rgba(59, 130, 246, 0.35)", zIndex: 50 }}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 bg-black/60 px-6 py-4 rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span className="text-sm font-medium text-white">جاري الرفع...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 bg-black/60 px-6 py-4 rounded-lg">
            <Camera className="w-10 h-10 text-white" />
            <span className="text-sm font-bold text-white">اضغط لتغيير الصورة</span>
          </div>
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
