import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPORTED_FORMATS } from "@/types/tagger";
import { selectFiles, selectDirectory, expandPaths } from "@/services/taggerService";
import { toUserMessage } from "@/lib/errorMessages";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFilesAdded: (paths: string[]) => { added: number, skipped: number } | Promise<{ added: number, skipped: number }>;
}

export function DropZone({ onFilesAdded }: DropZoneProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectFiles = useCallback(async () => {
    if (!window.api) {
      toast.error("File selection is not available.");
      return;
    }
    setIsLoading(true);
    try {
      const paths = await selectFiles();
      if (paths.length > 0) {
        await onFilesAdded(paths);
      }
    } catch (err) {
      toast.error(`Failed to select files: ${toUserMessage(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [onFilesAdded]);

  const handleSelectFolder = useCallback(async () => {
    if (!window.api) {
      toast.error("Folder selection is not available.");
      return;
    }
    setIsLoading(true);
    try {
      const paths = await selectDirectory();
      if (paths.length > 0) {
        await onFilesAdded(paths);
      }
    } catch (err) {
      toast.error(`Failed to select folder: ${toUserMessage(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [onFilesAdded]);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const paths = files.map(f => window.api.getPathForFile(f));
    
    setIsLoading(true);
    try {
      const allAudioPaths = await expandPaths(paths);
      if (allAudioPaths.length > 0) {
        await onFilesAdded(allAudioPaths);
      } else {
        toast.info("No supported audio files found in selection.");
      }
    } catch (err) {
      toast.error(`Failed to process dropped files: ${toUserMessage(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [onFilesAdded]);

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all duration-200",
        isDragging 
          ? "border-primary bg-primary/5 scale-[1.02] shadow-md" 
          : "border-muted-foreground/25 hover:border-muted-foreground/40",
        isLoading && "pointer-events-none opacity-50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Upload className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mb-1 text-sm font-medium text-foreground">
        Select audio files or folder
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Supported: {SUPPORTED_FORMATS.map((f) => f.replace(".", "").toUpperCase()).join(", ")}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSelectFiles}
          disabled={isLoading}
        >
          Select Files
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSelectFolder}
          disabled={isLoading}
        >
          <FolderOpen className="mr-1.5 h-3 w-3" />
          Select Folder
        </Button>
      </div>
    </div>
  );
}
