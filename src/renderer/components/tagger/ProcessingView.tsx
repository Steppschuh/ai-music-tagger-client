import { Sparkles } from "lucide-react";
import type { QueuedFile } from "@/types/tagger";
import type { QueuedFile } from "@/types/tagger";

interface ProcessingViewProps {
  currentFileName: string;
  percentage: number;
  estimatedTime: string;
  lastInsight: string | null;
  files: QueuedFile[];
  onStop: () => void;
}

export function ProcessingView({
  currentFileName,
  estimatedTime,
  lastInsight,
  files,
}: ProcessingViewProps) {
  const isWritingTags = files.some((f) => f.status === "writing-tags");


  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Current file */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          {isWritingTags ? "Writing tags" : "Analyzing"}
        </p>
        <p className="animate-shimmer mt-1 text-sm font-semibold">
          {currentFileName || "Preparing..."}
        </p>
      </div>

      {/* Time remaining */}
      <div className="text-center text-xs text-muted-foreground mt-2">
        <span>{estimatedTime} remaining</span>
      </div>

      {/* Magic Insight */}
      {lastInsight && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Magic Insight
            </span>
          </div>
          <p className="text-xs text-foreground/80">{lastInsight}</p>
        </div>
      )}
    </div>
  );
}
