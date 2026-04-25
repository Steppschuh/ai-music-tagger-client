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
    genre: analysis.genres?.primary?.[0],
    bpm: analysis.mixing?.bpm,
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
  const completed = files.filter((f) => f.status === "completed");
  const errors = files.filter((f) => f.status === "error");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Analysis Complete
          </p>
          <p className="text-xs text-muted-foreground">
            {completed.length} analyzed, {errors.length} error{errors.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-2">
          {files.map((file) => {
            const values = file.result ? getDisplayValues(file.result) : null;
            return (
              <div
                key={file.id}
                className="rounded-lg border border-border bg-secondary/30 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="truncate text-xs font-medium text-foreground">
                    {file.name}
                  </span>
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

                {values ? (
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      {values.genre && <span>{values.genre}</span>}
                      {values.bpm && <span>{values.bpm} BPM</span>}
                    </div>
                    {file.filePath && settings?.tagStrategy === "keep" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => handleWriteTags(file)}
                        disabled={writingId === file.id}
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {writingId === file.id ? "Writing..." : "Write tags"}
                      </Button>
                    )}
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
  );
}

