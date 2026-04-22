import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  percentage,
  estimatedTime,
  lastInsight,
  files,
  onStop,
}: ProcessingViewProps) {
  const [logOpen, setLogOpen] = useState(false);

  const processedFiles = files.filter(
    (f) => f.status === "completed" || f.status === "error"
  );
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

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={percentage} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{percentage}% complete</span>
          <span>{estimatedTime} remaining</span>
        </div>
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

      {/* Log collapsible */}
      <Collapsible open={logOpen} onOpenChange={setLogOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between text-xs text-muted-foreground"
          >
            Show Log ({processedFiles.length} processed)
            {logOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollArea className="mt-2 max-h-32">
            <div className="space-y-1">
              {processedFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded px-2 py-1 text-xs"
                >
                  <span className="truncate text-foreground/70">{f.name}</span>
                  <Badge
                    variant="secondary"
                    className={
                      f.status === "completed"
                        ? "bg-success/20 text-success text-[10px]"
                        : "bg-destructive/20 text-destructive text-[10px]"
                    }
                  >
                    {f.status === "completed" ? "Done" : "Error"}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Stop button */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={onStop}
      >
        Stop AI
      </Button>
    </div>
  );
}
