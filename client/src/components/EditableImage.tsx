import { useRef, useCallback, useState } from "react";
import { useEditMode } from "@/lib/editMode";
import { cn } from "@/lib/utils";
import { Camera, Upload, Loader2 } from "lucide-react";

interface EditableImageProps {
  contentKey: string;
  defaultSrc: string;
  alt?: string;
  className?: string;
  [key: string]: any;
}

export default function EditableImage({
  contentKey,
  defaultSrc,
  alt = "",
  className,
  ...rest
}: EditableImageProps) {
  const { isEditMode, pageContent, updateContent, selectedKey, setSelectedKey, uploadImage } = useEditMode();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const imgKey = `img:${contentKey}`;
  const currentSrc = pageContent[imgKey] ?? defaultSrc;

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
      className={cn(
        "relative group cursor-pointer transition-all duration-200",
        !isSelected && "hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400/60",
        isSelected && "outline outline-2 outline-blue-500 outline-offset-2"
      )}
      onClick={handleClick}
      data-edit-key={imgKey}
    >
      <img src={currentSrc} alt={alt} className={className} {...rest} />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-medium">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-white">
            <Camera className="w-8 h-8" />
            <span className="text-sm font-medium">Click to replace</span>
          </div>
        )}
      </div>
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
