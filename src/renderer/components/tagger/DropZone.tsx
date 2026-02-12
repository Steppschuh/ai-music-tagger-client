import { useCallback, useState } from "react";
import { Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPORTED_FORMATS } from "@/types/tagger";
import { selectFiles, selectDirectory } from "@/services/taggerService";

interface DropZoneProps {
  onFilesAdded: (paths: string[]) => number;
}

export function DropZone({ onFilesAdded }: DropZoneProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectFiles = useCallback(async () => {
    if (!window.api) return;
    setIsLoading(true);
    try {
      const paths = await selectFiles();
      if (paths.length > 0) {
        onFilesAdded(paths);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onFilesAdded]);

  const handleSelectFolder = useCallback(async () => {
    if (!window.api) return;
    setIsLoading(true);
    try {
      const paths = await selectDirectory();
      if (paths.length > 0) {
        onFilesAdded(paths);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onFilesAdded]);

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-muted-foreground/40">
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
