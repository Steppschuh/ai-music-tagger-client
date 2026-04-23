import { Zap, Music2, Gauge, KeyRound, Palette, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { QueuedFile } from "@/types/tagger";

interface ResultsViewProps {
  files: QueuedFile[];
}

export function ResultsView({ files }: ResultsViewProps) {
  const completed = files.filter((f) => f.status === "completed");
  const errors = files.filter((f) => f.status === "error");

  return (
    <div className="flex flex-col gap-4 p-1">
      <div>
        <p className="text-sm font-medium text-foreground">
          Analysis Complete
        </p>
        <p className="text-xs text-muted-foreground">
          {completed.length} tagged, {errors.length} error{errors.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ScrollArea className="max-h-[360px]">
        <div className="space-y-2">
          {files.map((file) => (
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
                  {file.status === "completed" ? "Tagged" : "Error"}
                </Badge>
              </div>

              {file.result ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <TagItem icon={Music2} label="Genre" value={file.result.genre} />
                  <TagItem icon={Layers} label="Sub-genre" value={file.result.subGenre} />
                  <TagItem icon={Palette} label="Mood" value={file.result.mood} />
                  <TagItem icon={Gauge} label="BPM" value={String(file.result.bpm)} />
                  <TagItem icon={KeyRound} label="Key" value={file.result.key} />
                  <TagItem icon={Zap} label="Energy" value={`${file.result.energy}/10`} />
                </div>
              ) : file.error ? (
                <p className="text-xs text-destructive">{file.error}</p>
              ) : null}
            </div>
          ))}
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
