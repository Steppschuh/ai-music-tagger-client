import { useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Zap, Music2, Gauge, KeyRound, Palette, Layers, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { QueuedFile, SettingsState } from "@/types/tagger";
import type { AnalysisResult } from "../../../shared/types";
import { writeTagsFromAnalysis } from "@/services/taggerService";
import { toUserMessage } from "@/lib/errorMessages";

function tagStrategyToMergeStrategy(s: SettingsState["tagStrategy"]): string {
  const map: Record<SettingsState["tagStrategy"], string> = {
    keep: "keep-existing",
    merge: "combine",
    overwrite: "overwrite",
  };
  return map[s] ?? "keep-existing";
}

function getDisplayValues(analysis: AnalysisResult) {
  return {
    summary: analysis.summary,
  };
}

interface ResultsViewProps {
  files: QueuedFile[];
  onClear: () => void;
  settings?: SettingsState;
}

export function ResultsView({ files, onClear, settings }: ResultsViewProps) {
  const [writingId, setWritingId] = useState<string | null>(null);
  const mergeStrategy = settings ? tagStrategyToMergeStrategy(settings.tagStrategy) : "keep-existing";

  const handleWriteTags = async (file: QueuedFile) => {
    if (!file.result || !file.filePath) return;
    setWritingId(file.id);
    try {
      await writeTagsFromAnalysis(file.filePath, file.result, mergeStrategy);
      toast.success(`Tags written to ${file.name}`);
    } catch (err) {
      toast.error(`Failed to write tags to ${file.name}: ${toUserMessage(err)}`);
    } finally {
      setWritingId(null);
    }
  };
  const handleWriteAll = async () => {
    const validFiles = files.filter(f => f.status === "completed" && f.result && f.filePath);
    if (validFiles.length === 0) return;
    
    setWritingId("all");
    let successCount = 0;
    for (const file of validFiles) {
      try {
        if (file.filePath && file.result) {
          await writeTagsFromAnalysis(file.filePath, file.result, mergeStrategy);
          successCount++;
        }
      } catch (err) {
        toast.error(`Failed to write tags to ${file.name}: ${toUserMessage(err)}`);
      }
    }
    if (successCount > 0) {
      toast.success(`Successfully written tags to ${successCount} files`);
    }
    setWritingId(null);
  };

  const completed = files.filter((f) => f.status === "completed");
  const errors = files.filter((f) => f.status === "error");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-3 md:px-6 bg-card-header border-b border-border shrink-0">
        <div>
          <p className="text-sm font-medium text-foreground">
            Analysis Complete
          </p>
          <p className="text-xs text-muted-foreground">
            {completed.length} analyzed, {errors.length} error{errors.length !== 1 ? "s" : ""}
          </p>
        </div>
        {completed.length > 1 && settings?.tagStrategy === "keep" && (
          <Button 
            variant="default" 
            size="sm" 
            className="h-8 shadow-md"
            onClick={handleWriteAll}
            disabled={writingId !== null}
          >
            <Tag className="mr-2 h-3.5 w-3.5" />
            Write all tags
          </Button>
        )}
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-2 p-4 md:p-6">
          {files.map((file) => {
            const values = file.result ? getDisplayValues(file.result) : null;
            return (
              <div
                key={file.id}
                className="rounded-lg border border-border bg-secondary/30 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="truncate text-xs font-medium text-foreground flex-1">
                    {file.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {file.filePath && file.status === "completed" && settings?.tagStrategy === "keep" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => handleWriteTags(file)}
                        disabled={writingId === file.id || writingId === "all"}
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {writingId === file.id ? "Writing..." : "Write tags"}
                      </Button>
                    )}
                    <Badge
                      variant="secondary"
                      className={
                        file.status === "completed"
                          ? "bg-success/20 text-success text-[10px]"
                          : "bg-destructive/20 text-destructive text-[10px]"
                      }
                    >
                      {file.status === "completed" ? "Done" : "Error"}
                    </Badge>
                  </div>
                </div>

                {values ? (
                  <div className="text-[10px] text-muted-foreground italic leading-relaxed mt-1.5">
                    {values.summary}
                  </div>
                ) : file.error ? (
                  <p className="text-xs text-destructive">{file.error}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      </div>
    </div>
  );
}

