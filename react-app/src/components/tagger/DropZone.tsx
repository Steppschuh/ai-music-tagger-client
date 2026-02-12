import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPORTED_FORMATS } from "@/types/tagger";

interface DropZoneProps {
  onFilesAdded: (files: FileList | File[]) => number;
}

export function DropZone({ onFilesAdded }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        onFilesAdded(e.dataTransfer.files);
      }
    },
    [onFilesAdded]
  );

  const handleSelectFiles = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesAdded(e.target.files);
        e.target.value = "";
      }
    },
    [onFilesAdded]
  );

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/40"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Upload className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mb-1 text-sm font-medium text-foreground">
        Drop files or folders here
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Supported: {SUPPORTED_FORMATS.map((f) => f.replace(".", "").toUpperCase()).join(", ")}
      </p>
      <Button variant="secondary" size="sm" onClick={handleSelectFiles}>
        Select Files
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={SUPPORTED_FORMATS.join(",")}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
