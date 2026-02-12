import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { QueuedFile, FileStatus } from "@/types/tagger";

interface FileQueueListProps {
  files: QueuedFile[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

const STATUS_STYLES: Record<FileStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  analyzing: "bg-primary/20 text-primary",
  completed: "bg-success/20 text-success",
  error: "bg-destructive/20 text-destructive",
};

const STATUS_LABELS: Record<FileStatus, string> = {
  pending: "Pending",
  analyzing: "Analyzing",
  completed: "Completed",
  error: "Error",
};

export function FileQueueList({ files, onRemove, disabled }: FileQueueListProps) {
  if (files.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {files.length} file{files.length !== 1 ? "s" : ""} queued
        </span>
      </div>
      <ScrollArea className="max-h-48">
        <div className="space-y-1">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2"
            >
              <span className="mr-2 truncate text-xs text-foreground">
                {file.name}
              </span>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${STATUS_STYLES[file.status]}`}
                >
                  {STATUS_LABELS[file.status]}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(file.id)}
                  disabled={disabled || file.status === "analyzing"}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
