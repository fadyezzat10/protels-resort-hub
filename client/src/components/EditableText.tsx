import { useRef, useCallback, useEffect, useState } from "react";
import { useEditMode } from "@/lib/editMode";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  contentKey: string;
  defaultValue: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export default function EditableText({
  contentKey,
  defaultValue,
  as: Tag = "span",
  className,
  children,
  ...rest
}: EditableTextProps) {
  const { isEditMode, pageContent, updateContent, selectedKey, setSelectedKey } = useEditMode();
  const ref = useRef<HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const currentValue = pageContent[contentKey] ?? defaultValue;
  const styleKey = `style:${contentKey}`;
  let savedStyle: Record<string, string> = {};
  try { if (pageContent[styleKey]) savedStyle = JSON.parse(pageContent[styleKey]); } catch { }

  const inlineStyle: React.CSSProperties = {};
  if (savedStyle.fontFamily) inlineStyle.fontFamily = savedStyle.fontFamily;
  if (savedStyle.fontSize) inlineStyle.fontSize = savedStyle.fontSize;
  if (savedStyle.fontWeight) inlineStyle.fontWeight = savedStyle.fontWeight;
  if (savedStyle.color) inlineStyle.color = savedStyle.color;
  if (savedStyle.textAlign) inlineStyle.textAlign = savedStyle.textAlign as any;
  if (savedStyle.letterSpacing) inlineStyle.letterSpacing = savedStyle.letterSpacing;
  if (savedStyle.lineHeight) inlineStyle.lineHeight = savedStyle.lineHeight;

  useEffect(() => {
    if (ref.current && !isEditing) {
      ref.current.innerText = currentValue;
    }
  }, [currentValue, isEditing]);

  const handleBlur = useCallback(() => {
    if (ref.current) {
      const newText = ref.current.innerText.trim();
      if (newText !== defaultValue && newText !== (pageContent[contentKey] || defaultValue)) {
        updateContent(contentKey, newText);
      }
    }
    setIsEditing(false);
  }, [contentKey, defaultValue, pageContent, updateContent]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedKey(contentKey);
      setIsEditing(true);
    }
  }, [isEditMode, contentKey, setSelectedKey]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      (e.target as HTMLElement).blur();
    }
  }, []);

  if (!isEditMode) {
    const Comp = Tag as any;
    return <Comp className={className} style={inlineStyle} {...rest}>{currentValue}</Comp>;
  }

  const isSelected = selectedKey === contentKey;
  const Comp = Tag as any;

  return (
    <Comp
      ref={ref}
      className={cn(
        className,
        "relative transition-all duration-200",
        isEditMode && "cursor-text",
        isEditMode && !isSelected && "hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400/60",
        isSelected && "outline outline-2 outline-blue-500 outline-offset-2"
      )}
      style={inlineStyle}
      contentEditable={isEditMode}
      suppressContentEditableWarning
      onClick={handleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-edit-key={contentKey}
      {...rest}
    >
      {currentValue}
    </Comp>
  );
}
