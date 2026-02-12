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
    genre: analysis.genres?.primary?.[0] ?? "-",
    subGenre: analysis.genres?.secondary?.[0] ?? "-",
    mood: analysis.moodsAndFeelings?.moods?.[0] ?? "-",
    bpm: analysis.mixing?.bpm ?? "-",
    key: analysis.mixing?.musicalKey ?? "-",
    energy: analysis.moodsAndFeelings?.energy ?? analysis.moodsAndFeelings?.energyScore ?? "-",
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
    <div className="flex flex-col gap-4 p-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Analysis Complete
          </p>
          <p className="text-xs text-muted-foreground">
            {completed.length} analyzed, {errors.length} error{errors.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onClear}>
          <RotateCcw className="mr-1.5 h-3 w-3" />
          New Batch
        </Button>
      </div>

      <ScrollArea className="max-h-[360px]">
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
                  <>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <TagItem icon={Music2} label="Genre" value={String(values.genre)} />
                      <TagItem icon={Layers} label="Sub-genre" value={String(values.subGenre)} />
                      <TagItem icon={Palette} label="Mood" value={String(values.mood)} />
                      <TagItem icon={Gauge} label="BPM" value={String(values.bpm)} />
                      <TagItem icon={KeyRound} label="Key" value={String(values.key)} />
                      <TagItem icon={Zap} label="Energy" value={String(values.energy)} />
                    </div>
                    {file.filePath && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleWriteTags(file)}
                        disabled={writingId === file.id}
                      >
                        <Tag className="mr-1.5 h-3 w-3" />
                        {writingId === file.id ? "Writing..." : "Write tags"}
                      </Button>
                    )}
                  </>
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

function TagItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground">{label}:</span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  );
}
